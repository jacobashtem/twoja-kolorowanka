// Panel monitoringu indeksacji. Renderuje HTML po stronie serwera z danych w Netlify Blobs.
//
// Basic Auth siedzi w tej samej funkcji, celowo, a nie w Edge Function przed nia.
// Edge Functions nie da sie przypiac do `/.netlify/functions/*` — to obszar zastrzezony —
// wiec straznik postawiony tylko na `/panel-gsc` zostawialby otwarte drugie wejscie pod
// wlasnym adresem funkcji. Sprawdzenie w srodku zamyka oba naraz.
//
// Zmienne srodowiskowe: PANEL_USER, PANEL_PASS. Bez nich panel jest zamkniety dla
// wszystkich — brak konfiguracji nie moze oznaczac otwartych drzwi.
//
// Zamysl wizualny: panel jest kolorowanka. Kazdy adres z sitemapy to jedno pole, a stopien
// wypelnienia koduje, jak daleko adres zaszedl u Google — sam kontur (wykryty, nigdy
// nieodwiedzony), polowa (zeskanowany, niezaindeksowany), pelny kolor (w indeksie).
// Cel, czyli komplet sitemapy w indeksie, wyglada wtedy jak domalowany do konca obrazek.

import { getStore } from '@netlify/blobs'
import { timingSafeEqual } from 'node:crypto'

// ------------------------------------------------------------------ dostep

const ODMOWA = powod => new Response(powod, {
  status: 401,
  headers: {
    'www-authenticate': 'Basic realm="Panel monitoringu", charset="UTF-8"',
    'content-type': 'text/plain; charset=utf-8',
    'x-robots-tag': 'noindex, nofollow'
  }
})

/** Porownanie o stalym czasie — zwykle === wycieka dlugosc wspolnego prefiksu. */
function rowne (a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  if (x.length !== y.length) return false
  return timingSafeEqual(x, y)
}

/** Zwraca null gdy wpuszczamy, albo gotowa odpowiedz 401 gdy nie. */
function sprawdzDostep (request) {
  const uzytkownik = process.env.PANEL_USER
  const haslo = process.env.PANEL_PASS
  if (!uzytkownik || !haslo) return ODMOWA('Panel nie ma ustawionego loginu i hasla.')

  const naglowek = request.headers.get('authorization') || ''
  if (!naglowek.toLowerCase().startsWith('basic ')) return ODMOWA('Wymagane logowanie.')

  let podane
  try {
    podane = Buffer.from(naglowek.slice(6), 'base64').toString('utf8')
  } catch {
    return ODMOWA('Nieczytelny naglowek logowania.')
  }

  const i = podane.indexOf(':')
  if (i < 0) return ODMOWA('Nieczytelny naglowek logowania.')

  // Oba porownania wykonuja sie zawsze, bez skrotu na pierwszym niepowodzeniu.
  const ok = rowne(podane.slice(0, i), uzytkownik) & rowne(podane.slice(i + 1), haslo)
  return ok ? null : ODMOWA('Zly login lub haslo.')
}

// ------------------------------------------------------------------ dane

/** Stan adresu niezalezny od jezyka odpowiedzi API — po samych faktach, nie po opisie. */
function stan (w) {
  if (w.blad) return 'blad'
  if (w.verdict === 'PASS') return 'indeks'
  if (w.lastCrawlTime) return 'zeskanowany'
  return 'wykryty'
}

const rozjazdCanonical = w =>
  Boolean(w.googleCanonical && w.userCanonical && w.googleCanonical !== w.userCanonical)

const OPIS_STANU = {
  indeks: 'w indeksie',
  zeskanowany: 'zeskanowany, ale niezaindeksowany',
  wykryty: 'wykryty, nigdy nieodwiedzony',
  blad: 'blad odczytu'
}

/** Roznice miedzy dwoma zrzutami — osobno straty i osobno zdobycze. */
function zmiany (teraz, wczesniej) {
  if (!wczesniej) return null
  const stary = new Map(wczesniej.wyniki.map(w => [w.adres, w]))
  const stracone = []
  const zyskane = []
  for (const w of teraz.wyniki) {
    const p = stary.get(w.adres)
    if (!p) continue
    const bylo = stan(p)
    const jest = stan(w)
    if (bylo === 'indeks' && jest !== 'indeks') stracone.push({ w, bylo, jest })
    if (bylo !== 'indeks' && jest === 'indeks') zyskane.push({ w, bylo, jest })
  }
  return { stracone, zyskane, data: wczesniej.pobrano }
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, z => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z]
))

/** „21 sierpnia 2026, 17:39" — bez bibliotek, w strefie warszawskiej. */
function data (iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw'
  }).format(new Date(iso))
}

const sciezka = adres => {
  try { return new URL(adres).pathname } catch { return adres }
}

// ------------------------------------------------------------------ widok

function stronaHtml (zrzut, roznice) {
  const wyniki = zrzut.wyniki
  const wIndeksie = wyniki.filter(w => stan(w) === 'indeks').length
  const razem = wyniki.length
  const komplet = wIndeksie === razem

  const doZrobienia = wyniki
    .filter(w => stan(w) !== 'indeks' || rozjazdCanonical(w))
    // Najpierw to, czego Google nigdy nie odwiedzil — tam reczne zgloszenie realnie pomaga.
    .sort((a, b) => {
      const waga = { wykryty: 0, blad: 1, zeskanowany: 2, indeks: 3 }
      return waga[stan(a)] - waga[stan(b)]
    })

  const komorki = wyniki.map((w, i) => {
    const s = stan(w)
    const rozjazd = rozjazdCanonical(w)
    const opis = `${sciezka(w.adres)} — ${OPIS_STANU[s]}${rozjazd ? ', rozjazd canonical' : ''}`
    const tresc = `<span class="pole pole--${s}${rozjazd ? ' pole--rozjazd' : ''}" style="--i:${i}"></span>`
    return w.linkDoInspekcji
      ? `<a class="komorka" href="${esc(w.linkDoInspekcji)}" target="_blank" rel="noopener" title="${esc(opis)}" aria-label="${esc(opis)}">${tresc}</a>`
      : `<span class="komorka" title="${esc(opis)}" aria-label="${esc(opis)}">${tresc}</span>`
  }).join('')

  const wiersz = w => {
    const s = stan(w)
    const rozjazd = rozjazdCanonical(w)
    return `<li class="wiersz">
      <span class="pole pole--${s}${rozjazd ? ' pole--rozjazd' : ''} pole--duze"></span>
      <span class="wiersz__tresc">
        <span class="wiersz__adres">${esc(sciezka(w.adres))}</span>
        <span class="wiersz__stan">${esc(w.coverageState || OPIS_STANU[s])}${
          w.lastCrawlTime ? ` · ostatnia wizyta Google ${esc(data(w.lastCrawlTime))}` : ''
        }</span>
        ${rozjazd ? `<span class="wiersz__ostrzezenie">Google wybral inny adres kanoniczny: ${esc(sciezka(w.googleCanonical))}</span>` : ''}
        ${w.blad ? `<span class="wiersz__ostrzezenie">${esc(w.blad)}</span>` : ''}
      </span>
      ${w.linkDoInspekcji
        ? `<a class="zglos" href="${esc(w.linkDoInspekcji)}" target="_blank" rel="noopener">Otworz w Search Console</a>`
        : ''}
    </li>`
  }

  const sekcjaZmian = () => {
    if (!roznice) return ''
    const { stracone, zyskane } = roznice
    if (!stracone.length && !zyskane.length) {
      return `<section class="sekcja">
        <h2 class="naglowek">Od poprzedniego sprawdzenia</h2>
        <p class="spokoj">Bez zmian od ${esc(data(roznice.data))}.</p>
      </section>`
    }
    return `<section class="sekcja">
      <h2 class="naglowek">Od poprzedniego sprawdzenia <span class="naglowek__meta">${esc(data(roznice.data))}</span></h2>
      ${stracone.length ? `<p class="zmiana zmiana--strata"><strong>${stracone.length}</strong> ${stracone.length === 1 ? 'strona wypadla' : 'strony wypadly'} z indeksu</p>
        <ul class="lista">${stracone.map(z => wiersz(z.w)).join('')}</ul>` : ''}
      ${zyskane.length ? `<p class="zmiana zmiana--zysk"><strong>${zyskane.length}</strong> ${zyskane.length === 1 ? 'strona weszla' : 'strony weszly'} do indeksu</p>
        <ul class="lista lista--zwiezla">${zyskane.map(z => `<li class="wiersz wiersz--zwiezly"><span class="pole pole--indeks"></span><span class="wiersz__adres">${esc(sciezka(z.w.adres))}</span></li>`).join('')}</ul>` : ''}
    </section>`
  }

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Stan indeksu — twoja-kolorowanka.pl</title>
<style>
  :root {
    --papier: #ffffff;
    --papier-cien: #f3f5f8;
    --tusz: #14161a;
    --grafit: #6b7280;
    --kreska: #d5dae1;
    --zielony: #1f9d55;
    --bursztyn: #e39a1c;
    --czerwony: #d6453d;
    --promien: 10px 8px 11px 9px;   /* lekko nierowny, jak rysowany reka */
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --papier: #14161a;
      --papier-cien: #1c1f25;
      --tusz: #e8eaed;
      --grafit: #9aa3af;
      --kreska: #333941;
      --zielony: #34c77b;
      --bursztyn: #f0b13f;
      --czerwony: #f0655c;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--papier);
    color: var(--tusz);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .strona { max-width: 860px; margin: 0 auto; padding: 40px 24px 96px; }

  .brew {
    font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
    color: var(--grafit); margin: 0 0 28px;
  }
  .brew__kropka { color: var(--kreska); margin: 0 8px; }

  /* Wynik jako ulamek — licznik niesie informacje, mianownik jest tlem. */
  .wynik { display: flex; align-items: baseline; gap: 6px; margin: 0; }
  .wynik__licznik {
    font-size: clamp(72px, 16vw, 132px); font-weight: 800; letter-spacing: -.045em;
    line-height: .85; font-variant-numeric: tabular-nums;
  }
  .wynik__kreska { font-size: clamp(40px, 8vw, 64px); font-weight: 300; color: var(--kreska); line-height: 1; }
  .wynik__mianownik {
    font-size: clamp(30px, 6vw, 48px); font-weight: 500; color: var(--grafit);
    font-variant-numeric: tabular-nums; line-height: 1;
  }
  .zdanie { font-size: 19px; color: var(--tusz); margin: 14px 0 0; max-width: 44ch; }
  .zdanie--komplet { color: var(--zielony); font-weight: 600; }

  /* Kolorowanka: jedno pole na adres. */
  .plansza {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(26px, 1fr));
    gap: 7px; margin: 40px 0 18px;
  }
  .komorka { display: block; text-decoration: none; }
  .pole {
    display: block; aspect-ratio: 1; width: 100%;
    border: 2px solid var(--tusz); border-radius: var(--promien);
    background: transparent;
    transition: transform .12s ease;
  }
  .komorka:hover .pole, .komorka:focus-visible .pole { transform: scale(1.18); }
  .komorka:focus-visible { outline: 2px solid var(--tusz); outline-offset: 3px; border-radius: var(--promien); }

  .pole--indeks { background: var(--zielony); border-color: var(--zielony); }
  /* Polowa wypelnienia = zeskanowany, ale jeszcze niezaindeksowany. */
  .pole--zeskanowany { background: linear-gradient(to top, var(--bursztyn) 50%, transparent 50%); }
  .pole--wykryty { background: transparent; }
  .pole--blad { border-style: dashed; border-color: var(--grafit); }
  .pole--rozjazd { box-shadow: inset 0 0 0 2px var(--czerwony); border-color: var(--czerwony); }
  .pole--duze { width: 18px; flex: 0 0 18px; border-width: 2px; margin-top: 4px; }

  @media (prefers-reduced-motion: no-preference) {
    .pole { animation: wypelnij .5s ease both; animation-delay: calc(var(--i, 0) * 6ms); }
    @keyframes wypelnij { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
  }

  .legenda { display: flex; flex-wrap: wrap; gap: 18px; padding: 0; margin: 0 0 56px; list-style: none; font-size: 13px; color: var(--grafit); }
  .legenda li { display: flex; align-items: center; gap: 8px; }
  .legenda .pole { width: 14px; flex: 0 0 14px; border-width: 2px; animation: none; }

  .sekcja { margin: 0 0 52px; }
  .naglowek {
    font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
    color: var(--tusz); margin: 0 0 4px; padding-bottom: 12px; border-bottom: 2px solid var(--tusz);
  }
  .naglowek__meta { float: right; font-weight: 500; letter-spacing: .02em; text-transform: none; color: var(--grafit); }

  .lista { list-style: none; margin: 0; padding: 0; }
  .wiersz {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 16px 0; border-bottom: 1px solid var(--kreska);
  }
  .wiersz--zwiezly { padding: 8px 0; align-items: center; }
  .wiersz--zwiezly .pole { width: 12px; flex: 0 0 12px; animation: none; }
  .wiersz__tresc { flex: 1; min-width: 0; }
  .wiersz__adres {
    display: block; font-family: ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace;
    font-size: 14px; word-break: break-all;
  }
  .wiersz__stan { display: block; font-size: 13px; color: var(--grafit); margin-top: 3px; }
  .wiersz__ostrzezenie { display: block; font-size: 13px; color: var(--czerwony); margin-top: 3px; }
  .zglos {
    flex: 0 0 auto; align-self: center; font-size: 13px; font-weight: 600;
    color: var(--tusz); text-decoration: none;
    border: 2px solid var(--tusz); border-radius: var(--promien); padding: 7px 13px;
    white-space: nowrap; transition: background .12s ease, color .12s ease;
  }
  .zglos:hover, .zglos:focus-visible { background: var(--tusz); color: var(--papier); }

  .zmiana { font-size: 15px; margin: 20px 0 6px; }
  .zmiana--strata strong { color: var(--czerwony); }
  .zmiana--zysk strong { color: var(--zielony); }
  .spokoj { color: var(--grafit); margin: 16px 0 0; }

  .stopka { font-size: 13px; color: var(--grafit); border-top: 1px solid var(--kreska); padding-top: 20px; }
  .stopka code { font-family: ui-monospace, "Cascadia Mono", Menlo, monospace; font-size: 12px; }

  @media (max-width: 560px) {
    .strona { padding: 28px 18px 72px; }
    .plansza { grid-template-columns: repeat(auto-fill, minmax(22px, 1fr)); gap: 6px; }
    .wiersz { flex-wrap: wrap; }
    .zglos { align-self: flex-start; margin-left: 32px; }
    .naglowek__meta { float: none; display: block; margin-top: 4px; }
  }
</style>
</head>
<body>
<main class="strona">

  <p class="brew">Stan indeksu<span class="brew__kropka">/</span>${esc(zrzut.site.replace('sc-domain:', ''))}<span class="brew__kropka">/</span>sprawdzono ${esc(data(zrzut.pobrano))}</p>

  <p class="wynik">
    <span class="wynik__licznik">${wIndeksie}</span>
    <span class="wynik__kreska">/</span>
    <span class="wynik__mianownik">${razem}</span>
  </p>
  <p class="zdanie${komplet ? ' zdanie--komplet' : ''}">${
    komplet
      ? 'Wszystko, co jest w sitemapie, jest w indeksie Google.'
      : `Adresow z sitemapy w indeksie Google. Pozostale ${razem - wIndeksie} czekaja ponizej.`
  }</p>

  <div class="plansza" role="img" aria-label="Kazde pole to jeden adres z sitemapy. Wypelnione pole oznacza strone w indeksie.">${komorki}</div>

  <ul class="legenda">
    <li><span class="pole pole--indeks"></span>w indeksie</li>
    <li><span class="pole pole--zeskanowany"></span>zeskanowany, niezaindeksowany</li>
    <li><span class="pole pole--wykryty"></span>wykryty, nigdy nieodwiedzony</li>
    <li><span class="pole pole--wykryty pole--rozjazd"></span>rozjazd canonical</li>
  </ul>

  ${doZrobienia.length ? `<section class="sekcja">
    <h2 class="naglowek">Do zrobienia <span class="naglowek__meta">${doZrobienia.length} ${doZrobienia.length === 1 ? 'adres' : 'adresow'}</span></h2>
    <ul class="lista">${doZrobienia.map(wiersz).join('')}</ul>
  </section>` : ''}

  ${sekcjaZmian()}

  <p class="stopka">
    Sprawdzane co tydzien w poniedzialek przez <code>gsc-index-check</code>.
    Zrodlo listy adresow: <code>${esc(zrzut.sitemap)}</code>.
    Zgloszenie do ponownej indeksacji klika sie recznie w Search Console — Google nie
    udostepnia na to API dla zwyklych stron.
  </p>

</main>
</body>
</html>`
}

// ------------------------------------------------------------------ handler

export default async (request) => {
  const odmowa = sprawdzDostep(request)
  if (odmowa) return odmowa

  const naglowki = { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' }

  try {
    const store = getStore('gsc')
    const zrzut = await store.get('ostatni', { type: 'json' })

    if (!zrzut) {
      return new Response(
        `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Stan indeksu</title></head>
         <body style="font-family:system-ui;max-width:52ch;margin:15vh auto;padding:0 24px;line-height:1.6">
         <h1 style="font-size:22px">Nie ma jeszcze zadnego sprawdzenia</h1>
         <p>Monitoring nie zapisal dotad ani jednego zrzutu. Uruchom workflow
         <code>gsc-index-check</code> w GitHub Actions — po jego zakonczeniu ta strona pokaze wynik.</p>
         </body></html>`,
        { status: 200, headers: naglowki }
      )
    }

    // Przedostatni wpis historii daje porownanie „od poprzedniego sprawdzenia".
    let poprzedni = null
    try {
      const { blobs } = await store.list({ prefix: 'historia/' })
      const klucze = blobs.map(b => b.key).sort().reverse()
      const dzisiejszy = `historia/${(zrzut.pobrano || '').slice(0, 10)}`
      const wczesniejszy = klucze.find(k => k !== dzisiejszy)
      if (wczesniejszy) poprzedni = await store.get(wczesniejszy, { type: 'json' })
    } catch (e) {
      console.error('Nie udalo sie odczytac historii:', e)
    }

    return new Response(stronaHtml(zrzut, zmiany(zrzut, poprzedni)), { status: 200, headers: naglowki })
  } catch (e) {
    console.error('Panel:', e)
    return new Response(
      `<!doctype html><html lang="pl"><head><meta charset="utf-8"></head><body
       style="font-family:system-ui;max-width:52ch;margin:15vh auto;padding:0 24px;line-height:1.6">
       <h1 style="font-size:22px">Panel nie odczytal danych</h1>
       <p>Szczegoly sa w logach funkcji w panelu Netlify.</p></body></html>`,
      { status: 500, headers: naglowki }
    )
  }
}
