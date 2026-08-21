// Warsztat fraz — zakladka „Frazy" w panelu.
//
// Dane sa TRWALE i nie maja historii: jeden dokument na kraj, dosypywany przy kolejnych
// kopaniach (patrz `netlify/functions/dfs-store.mjs`). Wahania wolumenu miedzy pomiarami
// nie niosa informacji, wiec ich nie trzymamy — pomiar robimy raz, powtarzamy na zadanie.
//
// NARZEDZIE NIE WYROKUJE. Pierwsza wersja miala kafel „slodki punkt" z progami wpisanymi
// na sztywno (min. 500 wyszukan, trudnosc do 30) i to bylo zle z dwoch powodow. Po pierwsze,
// przy strategii dlugiego ogona fraza o 80 wyszukaniach jest warta tyle samo co czesc setki
// takich — sto niszowych fraz to dziesiec tysiecy uzytkownikow. Po drugie, serwis rankuje
// juz dzis na frazach duzo trudniejszych niz 30, wiec taki prog odcinalby rzeczy osiagalne.
// Dlatego kafle licza to, co operator ma aktualnie w widoku: to on filtrem definiuje, czego
// szuka, a panel tylko podsumowuje jego wybor.

import { getStore } from '@netlify/blobs'
import { sprawdzDostep, szkielet, komunikat, esc, data, liczba, NAGLOWKI_HTML } from '../wspolne/panel.mjs'

export const config = { path: ['/panel-delash/frazy', '/panel-delash/frazy.csv', '/panel-delash/frazy/ocena'] }

// Oceny operatora leza w OSOBNYM dokumencie (`oceny/<rynek>`), nie w wierszach fraz.
// Powod jest prosty i kosztowalby nas dane: ponowne kopanie tej samej kategorii nadpisuje
// wiersze w calosci, wiec ocena wpisana w wiersz zniknelaby po cichu. Sklejamy je dopiero
// przy wyswietlaniu.
const kluczOcen = rynek => `oceny/${rynek}`

const RYNKI = [
  { kod: 'pl', flaga: '🇵🇱', nazwa: 'Polska' },
  { kod: 'nl', flaga: '🇳🇱', nazwa: 'Holandia' },
  { kod: 'de', flaga: '🇩🇪', nazwa: 'Niemcy' },
  { kod: 'it', flaga: '🇮🇹', nazwa: 'Włochy' },
  { kod: 'se', flaga: '🇸🇪', nazwa: 'Szwecja' }
]

const MIESIACE = ['', 'sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']

// Powyzej tego stosunku szczytu do sredniej fraza ma wyrazny sezon. Ponizej krzywa jest
// plaska i wskazywanie „szczytu" byloby czytaniem szumu.
const PROG_SEZONOWOSCI = 1.6

const SKROT_INTENCJI = {
  informational: 'info',
  commercial: 'komerc.',
  transactional: 'trans.',
  navigational: 'nawig.'
}

const jestPlama = w => !w.mamyKategorie

/** Piec stopni nacisku olowka. Liczba i tak jest zawsze widoczna obok. */
function stopienTrudnosci (t) {
  if (t === null || t === undefined) return 'brak'
  if (t <= 10) return '0'
  if (t <= 25) return '1'
  if (t <= 45) return '2'
  if (t <= 65) return '3'
  return '4'
}

async function wczytajOceny (store, rynek) {
  return await store.get(kluczOcen(rynek), { type: 'json' }) ?? {}
}

async function zapiszOcene (store, rynek, fraza, zmiana) {
  const oceny = await wczytajOceny(store, rynek)
  const wpis = { ...(oceny[fraza] || {}), ...zmiana, zaktualizowano: new Date().toISOString() }
  // Ocena 0 i „niezrobione" to brak wpisu, a nie wpis z zerem — inaczej dokument puchlby
  // od pustych rekordow po kazdym przypadkowym kliknieciu.
  if (!wpis.ocena && !wpis.zrobione) delete oceny[fraza]
  else oceny[fraza] = wpis
  await store.setJSON(kluczOcen(rynek), oceny)
  return oceny[fraza] ?? null
}

async function wczytajRynki (store) {
  const { blobs } = await store.list({ prefix: 'frazy/' })
  const dokumenty = {}
  for (const b of blobs) {
    const kod = b.key.replace('frazy/', '')
    dokumenty[kod] = await store.get(b.key, { type: 'json' })
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

    // Szczyt pokazujemy tylko dla fraz faktycznie sezonowych — przy plaskiej krzywej
    // „najwyzszy miesiac" to przypadkowe wahniecie, nie informacja.
    const sezonowa = w.sezonowosc !== null && w.sezonowosc >= PROG_SEZONOWOSCI && w.szczytMiesiac
    const szczyt = sezonowa
      ? `<span title="szczyt ${liczba(w.szczytWolumen)} wyszukań, ${w.sezonowosc}× średnia">${MIESIACE[w.szczytMiesiac]}</span>`
      : '<span style="color:var(--kreska)">—</span>'

    // Kierunek niesie strzalka, nie kolor — czytelne takze dla daltonisty i w druku.
    const tr = w.trendRoczny
    const trend = (tr === null || tr === undefined)
      ? '<span style="color:var(--kreska)">—</span>'
      : `${tr > 0 ? '▲' : tr < 0 ? '▼' : '·'} ${tr > 0 ? '+' : ''}${tr}%`

    const dom = w.domenyTop10
    const domeny = (dom === null || dom === undefined)
      ? '<span style="color:var(--kreska)">—</span>'
      : (dom < 1 ? dom.toFixed(1) : liczba(Math.round(dom)))

    return `<tr data-f="${esc((w.fraza || '').toLowerCase())}" data-w="${w.wolumen || 0}"
      data-t="${w.trudnoscSeo ?? -1}" data-d="${dom ?? -1}" data-p="${plama ? 1 : 0}"
      data-tr="${tr ?? -9999}" data-s="${w.sezonowosc ?? 0}" data-o="${w.ocena ?? 0}" data-z="${w.zrobione ? 1 : 0}">
      <td class="fraza"><span class="fraza__pokrycie${klasaPokrycia}" title="${esc(tytul)}"></span>${esc(w.fraza)}</td>
      <td><div class="wolumen"><span class="wolumen__liczba">${liczba(w.wolumen)}${
        w.zrodloWolumenu === 'ads'
          ? `<abbr class="koszyk" title="Brak danych ze strumienia kliknięć — to wartość z koszyka Google Ads, która zawyża pojedynczą frazę o wielkość całej grupy wariantów. Traktuj jako górną granicę.">~</abbr>`
          : ''
      }</span><span class="wolumen__pasek"><i style="width:${szer}%"></i></span></div></td>
      <td style="text-align:center"><span class="trud trud--${st}">${w.trudnoscSeo ?? '—'}</span></td>
      <td style="text-align:right;font-variant-numeric:tabular-nums">${domeny}</td>
      <td style="text-align:center">${szczyt}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap">${trend}</td>
      <td style="color:var(--grafit);font-size:13px">${esc(SKROT_INTENCJI[w.intencja] || '—')}</td>
      <td style="color:var(--grafit);font-size:13px;white-space:nowrap">${ogolna ? 'ogólna' : (plama ? 'biała plama' : esc(w.mamyKategorie))}</td>
      <td class="ocena-kom">
        <select class="ocena" data-fraza="${esc(w.fraza)}" aria-label="Potencjał frazy ${esc(w.fraza)} w skali 1–10">
          <option value="">—</option>
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}"${w.ocena === n ? ' selected' : ''}>${n}</option>`).join('')}
        </select>
        <label class="zrobione-etyk" title="Zrobione — znika z planu">
          <input type="checkbox" class="zrobione" data-fraza="${esc(w.fraza)}"${w.zrobione ? ' checked' : ''}>
        </label>
      </td>
    </tr>`
  }).join('')

  const th = (etykieta, klucz, tytul, styl = '') =>
    `<th data-sort="${klucz}" title="${esc(tytul)}" tabindex="0" role="button"${styl ? ` style="${styl}"` : ''}>${etykieta}<span class="strzalka"></span></th>`

  return `<div class="przewijak"><table class="frazy">
    <thead><tr>
      ${th('Fraza', 'f', 'Kliknij, żeby posortować alfabetycznie')}
      ${th('Wolumen / mies.', 'w', 'Średnia liczba wyszukań miesięcznie', 'text-align:right')}
      ${th('Trudność', 't', 'Trudność SEO 0–100: jak trudno wejść na pierwszą stronę wyników organicznych', 'text-align:center')}
      ${th('Domeny top-10', 'd', 'Ile domen linkuje średnio do pierwszej dziesiątki. Wartość bliska zera znaczy, że czołówka nie ma zaplecza linkowego', 'text-align:right')}
      ${th('Szczyt', 's', 'Miesiąc największego popytu — pokazany tylko dla fraz wyraźnie sezonowych', 'text-align:center')}
      ${th('Trend r/r', 'tr', 'Zmiana liczby wyszukań rok do roku', 'text-align:right')}
      <th>Intencja</th>
      ${th('Pokrycie', 'p', 'Czy macie już kategorię pod tę frazę')}
      ${th('Potencjał', 'o', 'Twoja ocena 1–10. Zapisuje się od razu i przeżywa kolejne kopania. Kolejność w Planie idzie po tej liczbie')}
    </tr></thead>
    <tbody id="cialo">${rzedy}</tbody>
  </table></div>`
}

function widok (dokumenty, aktywny, oceny = {}, tryb = 'wykopaliska') {
  const dok = dokumenty[aktywny]
  const rynek = RYNKI.find(r => r.kod === aktywny)
  // Sklejenie ocen z wierszami dzieje sie tutaj, przy wyswietlaniu — w magazynie te dwie
  // rzeczy zyja osobno, zeby kopanie nie kasowalo pracy operatora.
  if (dok?.wiersze) {
    dok.wiersze = dok.wiersze.map(w => ({ ...w, ...(oceny[w.fraza] || {}) }))
  }

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

  const zestawy = Object.keys(dok.zestawy || {})
  const wPlanie = dok.wiersze.filter(w => w.ocena >= 1 && !w.zrobione)

  // Plan to ta sama tabela, tylko zawezona do tego, co operator sam oznaczyl, i ulozona
  // po jego ocenie. Zadnego osobnego widoku ani innych regul — kolejnosc robienia wynika
  // wprost z liczb, ktore wpisal.
  const wiersze = tryb === 'plan'
    ? [...wPlanie].sort((a, b) => (b.ocena || 0) - (a.ocena || 0) || (b.wolumen || 0) - (a.wolumen || 0))
    : dok.wiersze

  const przelacznikWidoku = `<div class="widoki">
    <a class="widok-btn" href="/panel-delash/frazy?rynek=${esc(aktywny)}"${tryb !== 'plan' ? ' aria-current="page"' : ''}>Wykopaliska</a>
    <a class="widok-btn" href="/panel-delash/frazy?rynek=${esc(aktywny)}&widok=plan"${tryb === 'plan' ? ' aria-current="page"' : ''}>Plan${wPlanie.length ? ` (${wPlanie.length})` : ''}</a>
  </div>`

  if (tryb === 'plan' && !wiersze.length) {
    return szkielet({
      tytul: `Plan ${rynek?.nazwa || aktywny} — panel`,
      aktywna: 'frazy',
      tresc: `${mapaRynkow(dokumenty, aktywny)}${przelacznikWidoku}
        <h1 style="font-size:22px;margin:8px 0 12px">Plan jest pusty</h1>
        <p class="spokoj" style="max-width:60ch">Wróć do Wykopalisk i wpisz w kolumnie <strong>Potencjał</strong> ocenę od 1 do 10 przy frazach, które chcesz zrobić. Pojawią się tutaj, ułożone od najwyższej oceny.</p>`
    })
  }

  const tresc = `
    ${mapaRynkow(dokumenty, aktywny)}
    ${przelacznikWidoku}

    <p class="brew">Frazy<span class="brew__kropka">/</span>${esc(rynek?.nazwa || aktywny)}<span class="brew__kropka">/</span>zaktualizowano ${esc(data(dok.zaktualizowano))}</p>

    <div class="kafle">
      <div class="kafel"><div class="kafel__liczba" id="kafelFraz">—</div><div class="kafel__opis">fraz w widoku, z ${liczba(wiersze.length)} w zbiorze</div></div>
      <div class="kafel"><div class="kafel__liczba" id="kafelWolumen">—</div><div class="kafel__opis">wyszukań miesięcznie łącznie w tym, co widzisz</div></div>
      <div class="kafel kafel--okazja"><div class="kafel__liczba" id="kafelPlam">—</div><div class="kafel__opis">z tego białych plam — bez własnej kategorii</div></div>
    </div>

    <div class="filtry">
      <input type="search" id="szukaj" placeholder="Szukaj we frazach…" aria-label="Szukaj we frazach">
      <input type="number" id="minW" placeholder="min. wol." aria-label="Minimalny wolumen" min="0" step="10">
      <input type="number" id="maxT" placeholder="maks. trud." aria-label="Maksymalna trudność SEO" min="0" max="100" step="5">
      <input type="number" id="maxD" placeholder="maks. domen" aria-label="Maksymalnie domen linkujących do top 10" min="0" step="1">
      <label class="przelacznik"><input type="checkbox" id="tylkoPlamy"> tylko białe plamy</label>
      <a class="zglos" href="/panel-delash/frazy.csv?rynek=${esc(aktywny)}">Pobierz CSV</a>
    </div>

    ${tabela(wiersze)}
    <p class="pusto" id="pusto" hidden>Żadna fraza nie spełnia tych warunków.</p>

    <p class="stopka">
      <strong>Trudność SEO</strong> (0–100) mówi, jak trudno wejść na pierwszą stronę wyników organicznych.
      <strong>Domeny top-10</strong> to jej uzupełnienie od drugiej strony: ile domen linkuje średnio do obecnej
      czołówki. Wartość bliska zera znaczy, że nikt tam nie ma zaplecza linkowego i da się ją wyprzedzić samą treścią.<br>
      <strong>Szczyt</strong> pojawia się tylko przy frazach wyraźnie sezonowych — przy płaskiej krzywej najwyższy
      miesiąc to przypadkowe wahnięcie, nie informacja.<br>
      Konkurencja reklamowa z Google Ads i CPC są w CSV; tutaj by myliły, bo mówią o licytacji reklamodawców, a nie o pozycjonowaniu.
      Zbiór rośnie przy każdym kopaniu i nic z niego nie znika. Pomiary z: ${esc(zestawy.join(', ') || '—')}.
    </p>

    <script>
      const cialo = document.getElementById('cialo')
      const wiersze = [...cialo.querySelectorAll('tr')]
      const pola = {
        szukaj: document.getElementById('szukaj'),
        minW: document.getElementById('minW'),
        maxT: document.getElementById('maxT'),
        maxD: document.getElementById('maxD'),
        plamy: document.getElementById('tylkoPlamy')
      }
      const kafle = {
        fraz: document.getElementById('kafelFraz'),
        wolumen: document.getElementById('kafelWolumen'),
        plam: document.getElementById('kafelPlam')
      }
      const pusto = document.getElementById('pusto')
      const fmt = n => n.toLocaleString('pl-PL')

      function filtruj () {
        const q = pola.szukaj.value.trim().toLowerCase()
        const minW = Number(pola.minW.value) || 0
        const maxT = pola.maxT.value === '' ? Infinity : Number(pola.maxT.value)
        const maxD = pola.maxD.value === '' ? Infinity : Number(pola.maxD.value)
        const tylkoPlamy = pola.plamy.checked
        let ile = 0, suma = 0, plam = 0

        for (const tr of wiersze) {
          const t = Number(tr.dataset.t)
          const d = Number(tr.dataset.d)
          // Brak pomiaru (-1) przepuszczamy zawsze: „nie zmierzono" to nie to samo co
          // „duzo", a ciche ukrywanie takich wierszy gubiloby dane bez sladu.
          const ok = (!q || tr.dataset.f.includes(q))
            && Number(tr.dataset.w) >= minW
            && (t < 0 || t <= maxT)
            && (d < 0 || d <= maxD)
            && (!tylkoPlamy || tr.dataset.p === '1')
          tr.classList.toggle('ukryty', !ok)
          if (ok) { ile++; suma += Number(tr.dataset.w); if (tr.dataset.p === '1') plam++ }
        }

        kafle.fraz.textContent = fmt(ile)
        kafle.wolumen.textContent = fmt(suma)
        kafle.plam.textContent = fmt(plam)
        pusto.hidden = ile > 0
      }

      // Sortowanie. Kierunek przelacza sie przy powtornym kliknieciu w te sama kolumne;
      // kolumny liczbowe startuja malejaco, bo tak sie ich szuka.
      let sortKlucz = null, malejaco = true
      function sortuj (klucz) {
        if (sortKlucz === klucz) malejaco = !malejaco
        else { sortKlucz = klucz; malejaco = klucz !== 'f' }

        const tekstowa = klucz === 'f' || klucz === 'p'
        wiersze.sort((a, b) => {
          const x = tekstowa ? a.dataset[klucz] : Number(a.dataset[klucz])
          const y = tekstowa ? b.dataset[klucz] : Number(b.dataset[klucz])
          const r = tekstowa ? String(x).localeCompare(String(y), 'pl') : x - y
          return malejaco ? -r : r
        })
        for (const tr of wiersze) cialo.appendChild(tr)

        for (const th of document.querySelectorAll('th[data-sort]')) {
          const czy = th.dataset.sort === klucz
          th.setAttribute('aria-sort', czy ? (malejaco ? 'descending' : 'ascending') : 'none')
          th.querySelector('.strzalka').textContent = czy ? (malejaco ? ' ▼' : ' ▲') : ''
        }
      }

      for (const th of document.querySelectorAll('th[data-sort]')) {
        th.addEventListener('click', () => sortuj(th.dataset.sort))
        th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortuj(th.dataset.sort) } })
      }
      for (const p of Object.values(pola)) p.addEventListener('input', filtruj)
      filtruj()

      // --- zapis ocen ---
      // Zadanie idzie na ten sam adres, wiec przegladarka dokłada naglowek Basic Auth sama
      // i nie trzeba zadnego drugiego sekretu. Zapis jest natychmiastowy, bez przycisku
      // „zapisz" — dlatego kazdy udany zapis musi byc widoczny, inaczej nie wiadomo,
      // czy klikniecie w ogole doszlo.
      const RYNEK = ${JSON.stringify(aktywny)}

      async function zapisz (tr, zmiana) {
        const fraza = tr.querySelector('.ocena').dataset.fraza
        try {
          const odp = await fetch('/panel-delash/frazy/ocena', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ rynek: RYNEK, fraza, ...zmiana })
          })
          if (!odp.ok) throw new Error('HTTP ' + odp.status)
          tr.classList.add('zapisano')
          setTimeout(() => tr.classList.remove('zapisano'), 900)
        } catch (e) {
          tr.classList.add('blad')
          alert('Nie udało się zapisać oceny frazy „' + fraza + '". ' + e.message)
        }
      }

      for (const sel of document.querySelectorAll('select.ocena')) {
        sel.addEventListener('change', () => {
          const tr = sel.closest('tr')
          const ocena = sel.value === '' ? 0 : Number(sel.value)
          tr.dataset.o = ocena
          tr.classList.toggle('oceniona', ocena >= 1)
          zapisz(tr, { ocena })
        })
        if (Number(sel.closest('tr').dataset.o) >= 1) sel.closest('tr').classList.add('oceniona')
      }

      for (const box of document.querySelectorAll('input.zrobione')) {
        box.addEventListener('change', () => {
          const tr = box.closest('tr')
          tr.dataset.z = box.checked ? 1 : 0
          tr.classList.toggle('zrobiona', box.checked)
          zapisz(tr, { zrobione: box.checked })
        })
        if (box.checked) box.closest('tr').classList.add('zrobiona')
      }
    </script>`

  return szkielet({ tytul: `Frazy ${rynek?.nazwa || aktywny} — panel`, aktywna: 'frazy', tresc })
}

// ------------------------------------------------------------------ CSV

function csv (dok) {
  const pole = w => {
    const s = String(w ?? '')
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const naglowek = ['fraza', 'wolumen', 'zrodlo wolumenu', 'wolumen Google Ads (koszyk)',
    'trudnosc SEO', 'domeny do top10', 'sila top10',
    'intencja', 'trend r/r %', 'szczyt (miesiac)', 'szczyt (wolumen)', 'sezonowosc', 'slow',
    'konkurencja reklamowa', 'poziom reklamowy', 'CPC', 'pokrycie', 'zestaw',
    'potencjal (ocena)', 'zrobione']
  const linie = dok.wiersze.map(w => [
    w.fraza, w.wolumen, w.zrodloWolumenu ?? '', w.wolumenAds ?? '',
    w.trudnoscSeo ?? '', w.domenyTop10 ?? '', w.silaTop10 ?? '',
    w.intencja ?? '', w.trendRoczny ?? '', w.szczytMiesiac ?? '', w.szczytWolumen ?? '',
    w.sezonowosc ?? '', w.slow ?? '', w.konkurencjaReklamowa ?? '', w.poziomReklamowy ?? '',
    w.cpc ?? '', w.mamyKategorie ?? 'biala plama', w.zestaw ?? '',
    w.ocena ?? '', w.zrobione ? 'tak' : ''
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
  const tryb = url.searchParams.get('widok') === 'plan' ? 'plan' : 'wykopaliska'

  try {
    const store = getStore('dfs')

    if (url.pathname.endsWith('/ocena')) {
      if (request.method !== 'POST') return new Response('Tylko POST.', { status: 405 })
      let dane
      try { dane = await request.json() } catch { return new Response('Zły JSON.', { status: 400 }) }
      if (!dane?.rynek || !dane?.fraza) return new Response('Wymagane: rynek, fraza.', { status: 400 })

      const zmiana = {}
      if ('ocena' in dane) {
        const o = Number(dane.ocena)
        if (!Number.isInteger(o) || o < 0 || o > 10) return new Response('Ocena musi być liczbą 0–10.', { status: 400 })
        zmiana.ocena = o || undefined
      }
      if ('zrobione' in dane) zmiana.zrobione = Boolean(dane.zrobione) || undefined

      const wpis = await zapiszOcene(store, dane.rynek, dane.fraza, zmiana)
      return new Response(JSON.stringify({ zapisano: true, wpis }), {
        status: 200, headers: { 'content-type': 'application/json; charset=utf-8' }
      })
    }

    const dokumenty = await wczytajRynki(store)
    const oceny = await wczytajOceny(store, aktywny)

    if (url.pathname.endsWith('.csv')) {
      const dok = dokumenty[aktywny]
      if (!dok?.wiersze?.length) return new Response('Brak danych dla tego rynku.', { status: 404 })
      // Oceny doklejamy takze do eksportu — bez nich CSV byloby uboższe niz ekran,
      // a to wlasnie w arkuszu Jakub uklada kolejnosc.
      const zOcenami = { ...dok, wiersze: dok.wiersze.map(w => ({ ...w, ...(oceny[w.fraza] || {}) })) }
      return new Response(csv(zOcenami), {
        status: 200,
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="frazy-${aktywny}.csv"`,
          'x-robots-tag': 'noindex, nofollow'
        }
      })
    }

    return new Response(widok(dokumenty, aktywny, oceny, tryb), { status: 200, headers: NAGLOWKI_HTML })
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
