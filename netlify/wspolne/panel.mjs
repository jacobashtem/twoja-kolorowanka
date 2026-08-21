// Wspolna warstwa panelu: dostep, style i szkielet strony z zakladkami.
//
// Lezy POZA `netlify/functions/`, bo wszystko, co jest w tamtym katalogu, Netlify traktuje
// jako osobna funkcje do wystawienia. Modul wspolny nie ma byc wystawiony — ma byc wciagniety
// przez te funkcje, ktore go importuja.
//
// Zamysl wizualny, wspolny dla obu zakladek: wypelnione pole znaczy „pokryte", sam kontur
// znaczy „jeszcze nie". W zakladce indeksu chodzi o obecnosc w Google, w zakladce fraz
// o to, czy mamy juz pod nia kategorie. Ten sam idiom, dwa rozne pytania.

import { timingSafeEqual } from 'node:crypto'

// ------------------------------------------------------------------ dostep

export const ODMOWA = powod => new Response(powod, {
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
export function sprawdzDostep (request) {
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

// ------------------------------------------------------------------ pomocnicze

export const esc = s => String(s ?? '').replace(/[&<>"']/g, z => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z]
))

export function data (iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw'
  }).format(new Date(iso))
}

export const liczba = n => Number(n || 0).toLocaleString('pl-PL')

export const NAGLOWKI_HTML = {
  'content-type': 'text/html; charset=utf-8',
  'x-robots-tag': 'noindex, nofollow'
}

// ------------------------------------------------------------------ styl

export const STYL = `
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
  .strona { max-width: 1040px; margin: 0 auto; padding: 32px 24px 96px; }

  /* --- zakladki panelu --- */
  .zakladki { display: flex; gap: 6px; margin: 0 0 32px; border-bottom: 2px solid var(--tusz); }
  .zakladka {
    padding: 9px 16px; font-size: 14px; font-weight: 600; text-decoration: none;
    color: var(--grafit); border: 2px solid transparent; border-bottom: none;
    border-radius: 10px 9px 0 0; margin-bottom: -2px;
  }
  .zakladka:hover { color: var(--tusz); }
  .zakladka[aria-current] {
    color: var(--tusz); border-color: var(--tusz); background: var(--papier);
  }
  .zakladka:focus-visible { outline: 2px solid var(--tusz); outline-offset: 2px; }

  .brew {
    font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
    color: var(--grafit); margin: 0 0 24px;
  }
  .brew__kropka { color: var(--kreska); margin: 0 8px; }

  .wynik { display: flex; align-items: baseline; gap: 6px; margin: 0; }
  .wynik__licznik {
    font-size: clamp(64px, 14vw, 116px); font-weight: 800; letter-spacing: -.045em;
    line-height: .85; font-variant-numeric: tabular-nums;
  }
  .wynik__kreska { font-size: clamp(36px, 7vw, 56px); font-weight: 300; color: var(--kreska); line-height: 1; }
  .wynik__mianownik {
    font-size: clamp(28px, 5vw, 44px); font-weight: 500; color: var(--grafit);
    font-variant-numeric: tabular-nums; line-height: 1;
  }
  .zdanie { font-size: 19px; margin: 14px 0 0; max-width: 46ch; }
  .zdanie--komplet { color: var(--zielony); font-weight: 600; }

  .plansza {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(26px, 1fr));
    gap: 7px; margin: 40px 0 18px;
  }
  .komorka { display: block; text-decoration: none; }
  .pole {
    display: block; aspect-ratio: 1; width: 100%;
    border: 2px solid var(--tusz); border-radius: var(--promien);
    background: transparent; transition: transform .12s ease;
  }
  .komorka:hover .pole, .komorka:focus-visible .pole { transform: scale(1.18); }
  .komorka:focus-visible { outline: 2px solid var(--tusz); outline-offset: 3px; border-radius: var(--promien); }
  .pole--indeks { background: var(--zielony); border-color: var(--zielony); }
  .pole--zeskanowany { background: linear-gradient(to top, var(--bursztyn) 50%, transparent 50%); }
  .pole--wykryty { background: transparent; }
  .pole--blad { border-style: dashed; border-color: var(--grafit); }
  .pole--rozjazd { box-shadow: inset 0 0 0 2px var(--czerwony); border-color: var(--czerwony); }
  .pole--duze { width: 18px; flex: 0 0 18px; margin-top: 4px; }

  @media (prefers-reduced-motion: no-preference) {
    .plansza .pole { animation: wypelnij .5s ease both; animation-delay: calc(var(--i, 0) * 6ms); }
    @keyframes wypelnij { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
  }

  .legenda { display: flex; flex-wrap: wrap; gap: 18px; padding: 0; margin: 0 0 48px; list-style: none; font-size: 13px; color: var(--grafit); }
  .legenda li { display: flex; align-items: center; gap: 8px; }
  .legenda .pole { width: 14px; flex: 0 0 14px; animation: none; }

  .sekcja { margin: 0 0 48px; }
  .naglowek {
    font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
    margin: 0 0 4px; padding-bottom: 12px; border-bottom: 2px solid var(--tusz);
  }
  .naglowek__meta { float: right; font-weight: 500; letter-spacing: .02em; text-transform: none; color: var(--grafit); }

  .lista { list-style: none; margin: 0; padding: 0; }
  .wiersz { display: flex; gap: 14px; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid var(--kreska); }
  .wiersz--zwiezly { padding: 8px 0; align-items: center; }
  .wiersz--zwiezly .pole { width: 12px; flex: 0 0 12px; animation: none; }
  .wiersz__tresc { flex: 1; min-width: 0; }
  .wiersz__adres { display: block; font-family: ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace; font-size: 14px; word-break: break-all; }
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
  .stopka { font-size: 13px; color: var(--grafit); border-top: 1px solid var(--kreska); padding-top: 20px; margin-top: 40px; }
  .stopka code { font-family: ui-monospace, "Cascadia Mono", Menlo, monospace; font-size: 12px; }

  /* --- mapa rynkow: flagi niosa dane, nie same etykiety --- */
  .rynki { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 32px; padding: 0; list-style: none; }
  .rynek {
    display: block; text-decoration: none; color: inherit; min-width: 124px;
    border: 2px solid var(--kreska); border-radius: var(--promien); padding: 12px 14px;
    transition: border-color .12s ease;
  }
  .rynek:hover { border-color: var(--grafit); }
  .rynek[aria-current] { border-color: var(--tusz); }
  .rynek--pusty { opacity: .5; }
  .rynek__flaga { font-size: 24px; line-height: 1; }
  .rynek__nazwa { display: block; font-size: 14px; font-weight: 600; margin-top: 6px; }
  .rynek__ile { display: block; font-size: 12px; color: var(--grafit); font-variant-numeric: tabular-nums; }

  /* --- kafle liczbowe --- */
  .kafle { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin: 0 0 32px; }
  .kafel { border: 2px solid var(--kreska); border-radius: var(--promien); padding: 16px 18px; }
  .kafel__liczba { font-size: 32px; font-weight: 800; letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .kafel__opis { font-size: 13px; color: var(--grafit); margin-top: 4px; }
  .kafel--okazja { border-color: var(--zielony); }
  .kafel--okazja .kafel__liczba { color: var(--zielony); }

  /* --- filtry --- */
  .filtry { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 0 0 20px; }
  .filtry input[type="search"], .filtry input[type="number"] {
    font: inherit; font-size: 14px; padding: 8px 12px; color: var(--tusz);
    background: var(--papier); border: 2px solid var(--kreska); border-radius: var(--promien);
  }
  .filtry input[type="search"] { flex: 1; min-width: 200px; }
  .filtry input[type="number"] { width: 108px; }
  .filtry input:focus-visible { outline: none; border-color: var(--tusz); }
  .przelacznik { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
  .licznik-wynikow { font-size: 13px; color: var(--grafit); margin-left: auto; font-variant-numeric: tabular-nums; }

  /* --- tabela fraz --- */
  .przewijak { overflow-x: auto; }
  table.frazy { width: 100%; border-collapse: collapse; font-size: 14px; }
  table.frazy th {
    text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; color: var(--grafit);
    padding: 0 10px 10px 0; border-bottom: 2px solid var(--tusz); white-space: nowrap;
  }
  table.frazy th[data-sort] { cursor: pointer; user-select: none; }
  table.frazy th[data-sort]:hover { color: var(--tusz); }
  table.frazy th[data-sort]:focus-visible { outline: 2px solid var(--tusz); outline-offset: 2px; }
  table.frazy th[aria-sort]:not([aria-sort="none"]) { color: var(--tusz); }
  .strzalka { font-size: 10px; }
  .koszyk { color: var(--grafit); text-decoration: none; cursor: help; margin-left: 3px; font-size: 12px; }

  /* Ocena operatora — zapisuje sie od razu, wiec potrzebuje widocznego potwierdzenia. */
  .ocena-kom { white-space: nowrap; }
  select.ocena {
    font: inherit; font-size: 13px; padding: 3px 5px; color: var(--tusz);
    background: var(--papier); border: 2px solid var(--kreska); border-radius: 7px 6px 8px 6px;
  }
  select.ocena:focus-visible { outline: none; border-color: var(--tusz); }
  tr.oceniona select.ocena { border-color: var(--tusz); font-weight: 700; }
  tr.zapisano td { background: color-mix(in oklab, var(--zielony) 12%, transparent); transition: background .6s ease; }
  tr.zrobiona .fraza { text-decoration: line-through; color: var(--grafit); }
  .zrobione-etyk { margin-left: 6px; }
  .widoki { display: flex; gap: 6px; margin: 0 0 18px; }
  .widok-btn {
    font-size: 13px; font-weight: 600; text-decoration: none; color: var(--grafit);
    border: 2px solid var(--kreska); border-radius: var(--promien); padding: 6px 13px;
  }
  .widok-btn[aria-current] { color: var(--tusz); border-color: var(--tusz); }

  /* Obsluzona fraza — caly wiersz na zielono, zeby bylo widac jednym rzutem oka. */
  tr.zrobiona td { background: color-mix(in oklab, var(--zielony) 14%, transparent); }
  tr.zrobiona .fraza { color: var(--grafit); }

  .szczegoly-btn {
    font: inherit; font-size: 15px; line-height: 1; margin-left: 6px; padding: 2px 7px;
    color: var(--grafit); background: transparent; cursor: pointer;
    border: 2px solid var(--kreska); border-radius: 7px 6px 8px 6px;
  }
  .szczegoly-btn:hover, .szczegoly-btn:focus-visible { color: var(--tusz); border-color: var(--tusz); }
  tr.szczegoly td { background: var(--papier-cien); padding: 0; border-bottom: 2px solid var(--tusz); }
  .szczegoly__tresc { padding: 18px 20px; }
  dl.szcz { margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px 28px; }
  .szcz-poz dt { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--grafit); }
  .szcz-poz dd { margin: 2px 0 0; font-size: 14px; }
  .szcz-poz dd strong { font-size: 17px; font-variant-numeric: tabular-nums; }
  .szcz-poz dd span { display: block; color: var(--grafit); font-size: 13px; line-height: 1.45; margin-top: 3px; }
  table.frazy td { padding: 9px 10px 9px 0; border-bottom: 1px solid var(--kreska); vertical-align: middle; }
  table.frazy tr.ukryty { display: none; }
  .fraza { font-weight: 500; }
  .fraza__pokrycie { display: inline-block; width: 11px; height: 11px; margin-right: 9px; vertical-align: baseline;
    border: 2px solid var(--tusz); border-radius: 4px 3px 4px 3px; }
  .fraza__pokrycie--mamy { background: var(--zielony); border-color: var(--zielony); }
  .fraza__pokrycie--ogolna { border-color: var(--kreska); background: var(--kreska); }

  /* Wolumen: dlugosc paska jest calym kodowaniem, kolor nic nie dodaje. */
  .wolumen { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
  .wolumen__liczba { font-variant-numeric: tabular-nums; min-width: 66px; text-align: right; }
  .wolumen__pasek { width: 96px; height: 8px; background: var(--papier-cien); border-radius: 4px; overflow: hidden; }
  .wolumen__pasek i { display: block; height: 100%; background: var(--tusz); opacity: .55; border-radius: 4px; }

  /* Trudnosc: skala neutralna, jasne = latwe, ciemne = trudne. Liczba jest zawsze
     widoczna, wiec odczyt nie zalezy od rozroznienia odcieni. */
  .trud { display: inline-block; min-width: 34px; text-align: center; padding: 3px 7px;
    border-radius: 6px 5px 7px 5px; font-size: 13px; font-variant-numeric: tabular-nums; }
  .trud--0 { background: var(--papier-cien); color: var(--grafit); }
  .trud--1 { background: #d8dde4; color: #14161a; }
  .trud--2 { background: #aab3bf; color: #14161a; }
  .trud--3 { background: #6b7280; color: #ffffff; }
  .trud--4 { background: #383e47; color: #ffffff; }
  .trud--brak { color: var(--kreska); }

  .pusto { color: var(--grafit); padding: 40px 0; text-align: center; }

  @media (max-width: 640px) {
    .strona { padding: 24px 16px 72px; }
    .plansza { grid-template-columns: repeat(auto-fill, minmax(22px, 1fr)); gap: 6px; }
    .wiersz { flex-wrap: wrap; }
    .zglos { align-self: flex-start; margin-left: 32px; }
    .naglowek__meta { float: none; display: block; margin-top: 4px; }
    .wolumen__pasek { display: none; }
    .zakladki { overflow-x: auto; }
  }
`

// ------------------------------------------------------------------ szkielet

const ZAKLADKI = [
  { klucz: 'indeks', etykieta: 'Stan indeksu', adres: '/panel-delash/indeks' },
  { klucz: 'frazy',  etykieta: 'Frazy',        adres: '/panel-delash/frazy' }
]

export function szkielet ({ tytul, aktywna, tresc }) {
  const zakladki = ZAKLADKI.map(z =>
    `<a class="zakladka" href="${z.adres}"${z.klucz === aktywna ? ' aria-current="page"' : ''}>${z.etykieta}</a>`
  ).join('')

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(tytul)}</title>
<style>${STYL}</style>
</head>
<body>
<main class="strona">
  <nav class="zakladki">${zakladki}</nav>
  ${tresc}
</main>
</body>
</html>`
}

/** Prosta strona komunikatu — dla braku danych i bledow. */
export function komunikat ({ tytul, aktywna, naglowek, tresc }) {
  return szkielet({
    tytul,
    aktywna,
    tresc: `<h1 style="font-size:22px;margin:8px 0 12px">${esc(naglowek)}</h1><p class="spokoj" style="max-width:56ch">${tresc}</p>`
  })
}
