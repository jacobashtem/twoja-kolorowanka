// Warsztat fraz — zakladka „Frazy" w panelu.
//
// Dane sa TRWALE i nie maja historii: jeden dokument na kraj, dosypywany przy kolejnych
// kopaniach (patrz `netlify/functions/dfs-store.mjs`). Wahania wolumenu miedzy pomiarami
// nie niosa informacji, wiec ich nie trzymamy — pomiar robimy raz, powtarzamy na zadanie.
//
// Zamysl wizualny spina sie z zakladka indeksu: wypelniony kwadracik przy frazie znaczy
// „mamy juz pod to kategorie", sam kontur znaczy „biala plama". Ten sam idiom co pola
// na planszy indeksu, tylko odpowiada na inne pytanie.

import { getStore } from '@netlify/blobs'
import { sprawdzDostep, szkielet, komunikat, esc, data, liczba, NAGLOWKI_HTML } from '../wspolne/panel.mjs'

export const config = { path: ['/panel-delash/frazy', '/panel-delash/frazy.csv'] }

const RYNKI = [
  { kod: 'pl', flaga: '🇵🇱', nazwa: 'Polska' },
  { kod: 'nl', flaga: '🇳🇱', nazwa: 'Holandia' },
  { kod: 'de', flaga: '🇩🇪', nazwa: 'Niemcy' },
  { kod: 'it', flaga: '🇮🇹', nazwa: 'Włochy' },
  { kod: 'se', flaga: '🇸🇪', nazwa: 'Szwecja' }
]

// Prog „slodkiego punktu": fraza warta zachodu to taka, ktorej jeszcze nie pokrywamy,
// ma sensowny popyt i nie wymaga walki z calym internetem. Progi sa celowo wypisane
// jako stale, a nie wpisane w warunek — beda do przestawienia, gdy zobaczymy realne dane
// z kilku rynkow i okaze sie, gdzie naprawde lezy granica oplacalnosci.
const OKAZJA_MIN_WOLUMEN = 500
const OKAZJA_MAX_TRUDNOSC = 30

const jestPlama = w => !w.mamyKategorie
const jestOkazja = w =>
  jestPlama(w) &&
  (w.wolumen || 0) >= OKAZJA_MIN_WOLUMEN &&
  w.trudnoscSeo !== null && w.trudnoscSeo <= OKAZJA_MAX_TRUDNOSC

/** Piec stopni nacisku olowka. Liczba i tak jest zawsze widoczna obok. */
function stopienTrudnosci (t) {
  if (t === null || t === undefined) return 'brak'
  if (t <= 10) return '0'
  if (t <= 25) return '1'
  if (t <= 45) return '2'
  if (t <= 65) return '3'
  return '4'
}

async function wczytajRynki (store) {
  const { blobs } = await store.list({ prefix: 'frazy/' })
  const kody = new Set(blobs.map(b => b.key.replace('frazy/', '')))
  const dokumenty = {}
  for (const kod of kody) {
    dokumenty[kod] = await store.get(`frazy/${kod}`, { type: 'json' })
  }
  return dokumenty
}

// ------------------------------------------------------------------ widok

function mapaRynkow (dokumenty, aktywny) {
  return `<ul class="rynki">${RYNKI.map(r => {
    const d = dokumenty[r.kod]
    const ile = d?.wiersze?.length ?? 0
    const pusty = !ile
    return `<li><a class="rynek${pusty ? ' rynek--pusty' : ''}"
      href="/panel-delash/frazy?rynek=${r.kod}"${r.kod === aktywny ? ' aria-current="page"' : ''}>
      <span class="rynek__flaga">${r.flaga}</span>
      <span class="rynek__nazwa">${esc(r.nazwa)}</span>
      <span class="rynek__ile">${pusty ? 'brak danych' : liczba(ile) + ' fraz'}</span>
    </a></li>`
  }).join('')}</ul>`
}

function tabela (wiersze) {
  const maxWolumen = Math.max(...wiersze.map(w => w.wolumen || 0), 1)

  const rzedy = wiersze.map(w => {
    const plama = jestPlama(w)
    const ogolna = w.mamyKategorie === 'ogolna'
    const klasaPokrycia = ogolna ? ' fraza__pokrycie--ogolna' : (plama ? '' : ' fraza__pokrycie--mamy')
    const tytul = ogolna ? 'fraza ogólna, celuje w stronę główną'
      : (plama ? 'biała plama — nie mamy pod to kategorii' : `mamy kategorię: ${w.mamyKategorie}`)
    const szer = Math.max(2, Math.round((w.wolumen || 0) / maxWolumen * 100))
    const st = stopienTrudnosci(w.trudnoscSeo)

    return `<tr data-f="${esc((w.fraza || '').toLowerCase())}" data-w="${w.wolumen || 0}" data-t="${w.trudnoscSeo ?? -1}" data-p="${plama ? 1 : 0}">
      <td class="fraza"><span class="fraza__pokrycie${klasaPokrycia}" title="${esc(tytul)}"></span>${esc(w.fraza)}</td>
      <td><div class="wolumen"><span class="wolumen__liczba">${liczba(w.wolumen)}</span><span class="wolumen__pasek"><i style="width:${szer}%"></i></span></div></td>
      <td style="text-align:center"><span class="trud trud--${st}">${w.trudnoscSeo ?? '—'}</span></td>
      <td style="color:var(--grafit);font-size:13px;white-space:nowrap">${ogolna ? 'ogólna' : (plama ? 'biała plama' : esc(w.mamyKategorie))}</td>
    </tr>`
  }).join('')

  return `<div class="przewijak"><table class="frazy">
    <thead><tr>
      <th>Fraza</th>
      <th class="num" style="text-align:right">Wolumen / mies.</th>
      <th style="text-align:center">Trudność SEO</th>
      <th>Pokrycie</th>
    </tr></thead>
    <tbody id="ciało">${rzedy}</tbody>
  </table></div>`
}

function widok (dokumenty, aktywny) {
  const dok = dokumenty[aktywny]
  const rynek = RYNKI.find(r => r.kod === aktywny)

  if (!dok?.wiersze?.length) {
    return szkielet({
      tytul: 'Frazy — panel',
      aktywna: 'frazy',
      tresc: `${mapaRynkow(dokumenty, aktywny)}
        <p class="brew">Frazy<span class="brew__kropka">/</span>${esc(rynek?.nazwa || aktywny)}</p>
        <h1 style="font-size:22px;margin:0 0 12px">Ten rynek jest jeszcze nietknięty</h1>
        <p class="spokoj" style="max-width:60ch">Żeby go zapełnić, uruchom kopanie:</p>
        <pre style="background:var(--papier-cien);padding:14px 16px;border-radius:var(--promien);overflow-x:auto;font-size:13px"><code>node scripts/dfs/frazy.mjs --rynek ${esc(aktywny)} --zestaw &lt;nazwa&gt; --seed "&lt;fraza&gt;" \\
  --magazyn https://twoja-kolorowanka.pl/.netlify/functions/dfs-store</code></pre>
        <p class="spokoj">Wyniki pojawią się tutaj na stałe. Kopanie nie chodzi z harmonogramu — uruchamiasz je, kiedy chcesz.</p>`
    })
  }

  const wiersze = dok.wiersze
  const plamy = wiersze.filter(jestPlama)
  const okazje = wiersze.filter(jestOkazja)
  const wolumenPlam = plamy.reduce((s, w) => s + (w.wolumen || 0), 0)
  const zestawy = Object.keys(dok.zestawy || {})

  const tresc = `
    ${mapaRynkow(dokumenty, aktywny)}

    <p class="brew">Frazy<span class="brew__kropka">/</span>${esc(rynek?.nazwa || aktywny)}<span class="brew__kropka">/</span>zaktualizowano ${esc(data(dok.zaktualizowano))}</p>

    <div class="kafle">
      <div class="kafel">
        <div class="kafel__liczba">${liczba(wiersze.length)}</div>
        <div class="kafel__opis">fraz w zbiorze, z ${zestawy.length} ${zestawy.length === 1 ? 'kopania' : 'kopań'}</div>
      </div>
      <div class="kafel">
        <div class="kafel__liczba">${liczba(wolumenPlam)}</div>
        <div class="kafel__opis">wyszukań miesięcznie na frazach, których nie pokrywacie</div>
      </div>
      <div class="kafel kafel--okazja">
        <div class="kafel__liczba">${liczba(okazje.length)}</div>
        <div class="kafel__opis">fraz w słodkim punkcie: biała plama, min. ${liczba(OKAZJA_MIN_WOLUMEN)} wyszukań, trudność do ${OKAZJA_MAX_TRUDNOSC}</div>
      </div>
    </div>

    <div class="filtry">
      <input type="search" id="szukaj" placeholder="Szukaj we frazach…" aria-label="Szukaj we frazach">
      <input type="number" id="minW" placeholder="min. wol." aria-label="Minimalny wolumen" min="0" step="100">
      <input type="number" id="maxT" placeholder="maks. trud." aria-label="Maksymalna trudność" min="0" max="100" step="5">
      <label class="przelacznik"><input type="checkbox" id="tylkoPlamy"> tylko białe plamy</label>
      <a class="zglos" href="/panel-delash/frazy.csv?rynek=${esc(aktywny)}">Pobierz CSV</a>
      <span class="licznik-wynikow" id="licznik"></span>
    </div>

    ${tabela(wiersze)}
    <p class="pusto" id="pusto" hidden>Żadna fraza nie spełnia tych warunków.</p>

    <p class="stopka">
      <strong>Trudność SEO</strong> (0–100) mówi, jak trudno wejść na pierwszą stronę wyników organicznych.
      To nie to samo, co konkurencja reklamowa z Google Ads, która mówi tylko, ilu reklamodawców licytuje o frazę —
      tę drugą znajdziesz w CSV, tutaj by tylko myliła.<br>
      Zbiór rośnie przy każdym kopaniu i nic z niego nie znika. Pomiary z ${esc(zestawy.join(', ') || '—')}.
    </p>

    <script>
      const wiersze = [...document.querySelectorAll('#ciało tr')]
      const pola = {
        szukaj: document.getElementById('szukaj'),
        minW: document.getElementById('minW'),
        maxT: document.getElementById('maxT'),
        plamy: document.getElementById('tylkoPlamy')
      }
      const licznik = document.getElementById('licznik')
      const pusto = document.getElementById('pusto')

      function filtruj () {
        const q = pola.szukaj.value.trim().toLowerCase()
        const minW = Number(pola.minW.value) || 0
        const maxT = pola.maxT.value === '' ? 100 : Number(pola.maxT.value)
        const tylkoPlamy = pola.plamy.checked
        let widocznych = 0

        for (const tr of wiersze) {
          const t = Number(tr.dataset.t)
          const ok = (!q || tr.dataset.f.includes(q))
            && Number(tr.dataset.w) >= minW
            // Frazy bez zmierzonej trudnosci (-1) przepuszczamy — brak pomiaru to nie to
            // samo co trudnosc wysoka, a ukrycie ich po cichu gubiloby dane.
            && (t < 0 || t <= maxT)
            && (!tylkoPlamy || tr.dataset.p === '1')
          tr.classList.toggle('ukryty', !ok)
          if (ok) widocznych++
        }

        licznik.textContent = widocznych === wiersze.length
          ? wiersze.length + ' fraz'
          : widocznych + ' z ' + wiersze.length
        pusto.hidden = widocznych > 0
      }

      for (const p of Object.values(pola)) p.addEventListener('input', filtruj)
      filtruj()
    </script>`

  return szkielet({ tytul: `Frazy ${rynek?.nazwa || aktywny} — panel`, aktywna: 'frazy', tresc })
}

// ------------------------------------------------------------------ CSV

function csv (dok) {
  const pole = w => {
    const s = String(w ?? '')
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const naglowek = ['fraza', 'wolumen', 'trudnosc SEO', 'konkurencja reklamowa', 'poziom reklamowy', 'CPC', 'pokrycie', 'zestaw']
  const linie = dok.wiersze.map(w => [
    w.fraza, w.wolumen, w.trudnoscSeo ?? '', w.konkurencjaReklamowa ?? '',
    w.poziomReklamowy ?? '', w.cpc ?? '', w.mamyKategorie ?? 'biala plama', w.zestaw ?? ''
  ].map(pole).join(';'))
  // Srednik i BOM — bez nich Excel w polskiej lokalizacji wrzuca wiersz do jednej komorki
  // i lamie ogonki.
  return '﻿' + [naglowek.join(';'), ...linie].join('\r\n')
}

// ------------------------------------------------------------------ handler

export default async (request) => {
  const odmowa = sprawdzDostep(request)
  if (odmowa) return odmowa

  const url = new URL(request.url)
  const aktywny = url.searchParams.get('rynek') || 'pl'

  try {
    const store = getStore('dfs')
    const dokumenty = await wczytajRynki(store)

    if (url.pathname.endsWith('.csv')) {
      const dok = dokumenty[aktywny]
      if (!dok?.wiersze?.length) return new Response('Brak danych dla tego rynku.', { status: 404 })
      return new Response(csv(dok), {
        status: 200,
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="frazy-${aktywny}.csv"`,
          'x-robots-tag': 'noindex, nofollow'
        }
      })
    }

    return new Response(widok(dokumenty, aktywny), { status: 200, headers: NAGLOWKI_HTML })
  } catch (e) {
    console.error('Panel fraz:', e)
    return new Response(
      komunikat({
        tytul: 'Frazy — panel', aktywna: 'frazy',
        naglowek: 'Nie udało się odczytać danych',
        tresc: 'Szczegóły są w logach funkcji w panelu Netlify.'
      }),
      { status: 500, headers: NAGLOWKI_HTML }
    )
  }
}
