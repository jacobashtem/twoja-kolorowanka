// Jeden adres, pod którym widać WSZYSTKIE kategorie w robocie i ich stan — i z którego
// wchodzi się prosto w galerię wyboru każdej z nich.
//
// Po co: selekcja to jedyny krok pipeline'u, którego nie da się zautomatyzować, i przy
// 75 kategoriach będzie się powtarzać dziesiątki razy. Dotąd wymagała pamiętania, która
// kategoria czeka, wpisania ścieżki do `galeria.mjs`, otwarcia pliku z dysku i wklejenia
// listy ze schowka. Tutaj klikasz `start.cmd`, widzisz listę i wchodzisz w kategorię.
//
// Uruchamianie: `start.cmd` w katalogu głównym (podwójne kliknięcie) albo
//   node scripts/panel-selekcji.mjs [--port=4321] [--bez-sprzatania]
//
// SPRZĄTANIE: kategorie, które są już na produkcji, tracą materiał roboczy przy starcie
// panelu — patrz komentarz przy `czyNaProdzie` niżej. `_wybor.txt` zostaje ZAWSZE.
import { readdirSync, existsSync, statSync, rmSync, readFileSync } from 'node:fs'
import { execFileSync, spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { join, resolve, extname, dirname } from 'node:path'
import { KATEGORIE } from '../prompty/kategorie.mjs'
import { zbudujGalerie, zapiszWybor, wczytajWybor, esc } from './lib/galeria-html.mjs'

const argv = process.argv.slice(2)
const PORT = Number((argv.find(a => a.startsWith('--port=')) ?? '').split('=')[1]) || 4321
const BEZ_SPRZATANIA = argv.includes('--bez-sprzatania')
const ROBOCZY = 'lineart-work'

const OBRAZKI = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp'])

// ── Mapowanie katalog roboczy → kategoria w content ─────────────────────────
// `lineart-work/kroliczki` odpowiada `content/zwierzeta/kroliczki`: katalog roboczy to
// ostatni segment klucza z księgi promptów (generator tak je skraca, odkąd klucz ze slashem
// gubił całą serię).
//
// UWAGA — TEN SEGMENT NIE JEST UNIKALNY. Dwie pary kluczy kończą się tak samo:
//   fantasy/jednorozce  i  dla-doroslych/jednorozce
//   zwierzeta/myszki    i  myszki
// Mapa „segment → jeden klucz" cicho brała ostatni z brzegu i pokazywała stan zupełnie
// innej kategorii (jednorożce fantasy wyszły jako niepodmienione, bo liczby porównywały się
// z 50 liśćmi wersji dla dorosłych). Dlatego trzymamy WSZYSTKICH kandydatów i rozstrzygamy
// niżej po tym, który z nich faktycznie wygląda na podmieniony.
const KAT_PO_KATALOGU = new Map()
for (const klucz of Object.keys(KATEGORIE)) {
  const segment = klucz.split('/').pop()
  if (!KAT_PO_KATALOGU.has(segment)) KAT_PO_KATALOGU.set(segment, [])
  KAT_PO_KATALOGU.get(segment).push(klucz)
}

const pole = (tresc, nazwa) => tresc.match(new RegExp(`^${nazwa}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1]

function liscie (sciezkaContent) {
  const dir = join('content', sciezkaContent)
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(d => /^[0-9]+$/.test(d))
}

// Katalog w public/ czytamy z pola `image:` pierwszego liścia, nigdy ze składania nazwy
// kategorii — koty, koniki, kroliczki i pieski leżą w public/ płasko, bez `zwierzeta/`.
function katalogPublic (sciezkaContent) {
  const index = join('content', sciezkaContent, '1', 'index.md')
  if (!existsSync(index)) return null
  const img = pole(readFileSync(index, 'utf8'), 'image')
  if (!img) return null
  return dirname(dirname(join('public', ...img.split('/').filter(Boolean))))
}

function git (...args) {
  try { return execFileSync('git', args, { encoding: 'utf8' }).trim() }
  catch { return null }
}

// ── Czy kategoria jest już na produkcji ─────────────────────────────────────
// Produkcja to Netlify budowane z `origin/main`, więc pytanie „czy wgrane" sprowadza się
// do dwóch sprawdzalnych faktów: czy w public/ nie ma niezacommitowanych zmian i czy
// commit, który je tam wstawił, jest już przodkiem `origin/main`. Dopóki oba nie są
// prawdziwe, materiału roboczego NIE RUSZAMY — jest jeszcze czym cofnąć podmianę.
const maOrigin = git('rev-parse', '--verify', '--quiet', 'origin/main') !== null
function czyNaProdzie (katPublic) {
  if (!maOrigin || !katPublic || !existsSync(katPublic)) return false
  if (git('status', '--porcelain', '--', katPublic)) return false
  const commit = git('log', '-1', '--format=%H', '--', katPublic)
  if (!commit) return false
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', commit, 'origin/main'], { stdio: 'ignore' })
    return true
  } catch { return false }
}

function policzKatalog (dir) {
  let plikow = 0, bajtow = 0
  ;(function walk (d) {
    for (const nazwa of readdirSync(d)) {
      const p = join(d, nazwa)
      const st = statSync(p)
      if (st.isDirectory()) walk(p)
      else if (OBRAZKI.has(extname(nazwa).toLowerCase())) { plikow++; bajtow += st.size }
    }
  })(dir)
  return { plikow, bajtow }
}

function stanKategorii (nazwa) {
  const baza = join(ROBOCZY, nazwa)
  const serie = readdirSync(baza).filter(d => /^(raw|out)-/.test(d) && statSync(join(baza, d)).isDirectory())
  let plikow = 0, bajtow = 0
  for (const s of serie) { const r = policzKatalog(join(baza, s)); plikow += r.plikow; bajtow += r.bajtow }

  const { wpisy } = wczytajWybor(baza, true)

  // Podmieniona = liczba liści zrównała się z liczbą wybranych sztuk. Po podmianie
  // i usunięciu nadmiaru kategoria ma dokładnie tyle liści, ile pozycji ma `_wybor.txt`.
  const kandydaci = (KAT_PO_KATALOGU.get(nazwa) ?? []).map(sciezka => {
    const katPublic = katalogPublic(sciezka)
    const lisci = liscie(sciezka).length
    const podmieniona = wpisy.length > 0 && lisci === wpisy.length
    return { sciezka, lisci, katPublic, podmieniona, naProdzie: podmieniona && czyNaProdzie(katPublic) }
  })

  // Przy kolizji nazw bierzemy kandydata NAJDALEJ POSUNIĘTEGO. To nie jest zgadywanie:
  // podmieniony jest dokładnie ten, w który wcelowała ręczna komenda `podmien-kategorie`,
  // a pozostałe zostały nietknięte i wyglądają jak przed migracją.
  const ranga = (k) => (k.naProdzie ? 2 : k.podmieniona ? 1 : 0)
  const wybrany = [...kandydaci].sort((a, b) => ranga(b) - ranga(a))[0] ?? null

  const status = wybrany?.naProdzie ? 'na-prodzie'
    : wybrany?.podmieniona ? 'wdrozona'
    : wpisy.length ? 'wybrane'
    : plikow ? 'do-selekcji'
    : 'pusta'

  return {
    nazwa, serie, plikow, bajtow, wybranych: wpisy.length, status,
    sciezkaContent: wybrany?.sciezka ?? null,
    lisci: wybrany?.lisci ?? 0,
    katPublic: wybrany?.katPublic ?? null,
    // Do pokazania na kafelku — przy kolizji trzeba widzieć, którą kategorię panel wziął.
    inneKandydatury: kandydaci.filter(k => k !== wybrany).map(k => k.sciezka)
  }
}

function zbierzStany () {
  if (!existsSync(ROBOCZY)) return []
  return readdirSync(ROBOCZY)
    .filter(d => !d.startsWith('_') && statSync(join(ROBOCZY, d)).isDirectory())
    .map(stanKategorii)
    .sort((a, b) => KOLEJNOSC[a.status] - KOLEJNOSC[b.status] || a.nazwa.localeCompare(b.nazwa, 'pl'))
}
// Na górze to, co czeka na CIEBIE; na dole to, co już zamknięte.
const KOLEJNOSC = { 'do-selekcji': 0, wybrane: 1, wdrozona: 2, 'na-prodzie': 3, pusta: 4 }

// ── Sprzątanie po wgraniu na produkcję ──────────────────────────────────────
// Kasujemy `raw-*` i `out-*`, czyli materiał, który po wgraniu kategorii nie jest już
// do niczego potrzebny. `_wybor.txt` zostaje ZAWSZE — to jedyny plik w tym katalogu,
// którego nie da się odtworzyć ani kupić ponownie.
//
// PRZED KASOWANIEM PYTAMY GITA. Wyjątek `!lineart-work/*/*/ok/*.svg` w .gitignore sprawia,
// że część katalogów `raw-*` ma w środku podkatalog `ok/` z WERSJONOWANYMI SVG (koty,
// jaszczurki). Ślepe `rm -rf` skasowałoby pliki śledzone i podłożyło do commita usunięcie,
// którego nikt nie zamawiał. Katalog z czymkolwiek w indeksie zostaje nietknięty.
function posprzataj (stany) {
  const zrobione = []
  for (const s of stany) {
    if (s.status !== 'na-prodzie' || !s.serie.length) continue
    const baza = join(ROBOCZY, s.nazwa)
    let plikow = 0, bajtow = 0
    const pominiete = []
    for (const seria of s.serie) {
      const dir = join(baza, seria)
      if (git('ls-files', '--', dir)) { pominiete.push(seria); continue }
      const r = policzKatalog(dir)
      rmSync(dir, { recursive: true, force: true })
      plikow += r.plikow; bajtow += r.bajtow
    }
    rmSync(join(baza, 'galeria.html'), { force: true })
    if (plikow || pominiete.length) zrobione.push({ nazwa: s.nazwa, plikow, bajtow, pominiete })
  }
  return zrobione
}

const mb = (b) => (b / 1024 / 1024).toFixed(0)

const ETYKIETY = {
  'do-selekcji': { tekst: 'do selekcji', klasa: 'pilne' },
  wybrane: { tekst: 'wybrane — do wektoryzacji i podmiany', klasa: 'wtoku' },
  wdrozona: { tekst: 'podmieniona — do commita i wgrania', klasa: 'wtoku' },
  'na-prodzie': { tekst: 'na produkcji', klasa: 'gotowe' },
  pusta: { tekst: 'brak materiału', klasa: 'pusta' }
}

function stronaGlowna (stany, posprzatane) {
  const karty = stany.map(s => {
    const e = ETYKIETY[s.status]
    const doKliku = s.plikow > 0
    const tresc = `
      <div class="naglowek">
        <h2>${esc(s.nazwa)}</h2>
        <span class="plakietka ${e.klasa}">${e.tekst}</span>
      </div>
      <dl>
        <div><dt>materiał</dt><dd>${s.plikow ? `${s.plikow} szt. · ${mb(s.bajtow)} MB · ${s.serie.length} serii` : '—'}</dd></div>
        <div><dt>wybrane</dt><dd>${s.wybranych || '—'}</dd></div>
        <div><dt>liści w serwisie</dt><dd>${s.sciezkaContent ? `${s.lisci} <span class="scieżka">${esc(s.sciezkaContent)}</span>` : 'kategoria nieznana'}</dd></div>
        ${s.inneKandydatury.length ? `<div><dt>uwaga</dt><dd class="kolizja">ta sama nazwa co ${s.inneKandydatury.map(k => esc(k)).join(', ')}</dd></div>` : ''}
      </dl>`
    return doKliku
      ? `<a class="karta ${e.klasa}" href="/k/${encodeURIComponent(s.nazwa)}/">${tresc}<span class="wejdz">Otwórz galerię →</span></a>`
      : `<div class="karta ${e.klasa}">${tresc}</div>`
  }).join('')

  const doZrobienia = stany.filter(s => s.status === 'do-selekcji').length

  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel selekcji (${doZrobienia} do zrobienia)</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font:15px/1.5 system-ui,sans-serif; background:#f5f5f4; color:#1c1917 }
  @media (prefers-color-scheme: dark){
    body{ background:#1c1917; color:#e7e5e4 }
    .karta{ background:#292524 !important; border-color:#44403c !important }
    dt{ color:#a8a29e !important }
  }
  header { padding:20px 24px; background:#10B981; color:#fff; box-shadow:0 2px 8px rgba(0,0,0,.2) }
  header h1 { margin:0 0 4px; font-size:20px }
  header p { margin:0; opacity:.9; font-size:14px }
  .sprzatanie { margin:16px 24px 0; padding:10px 14px; border-radius:10px; font-size:14px;
                background:#e0e7ff; color:#3730a3 }
  @media (prefers-color-scheme: dark){ .sprzatanie{ background:#312e81; color:#c7d2fe } }
  .siatka { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
            gap:16px; padding:24px }
  .karta { display:block; background:#fff; border:1px solid #e7e5e4; border-left-width:5px;
           border-radius:12px; padding:16px; text-decoration:none; color:inherit }
  a.karta:hover { border-color:#10B981; transform:translateY(-2px); transition:.12s }
  .karta.pilne { border-left-color:#10B981 }
  .karta.wtoku { border-left-color:#f59e0b }
  .karta.gotowe { border-left-color:#a8a29e; opacity:.65 }
  .karta.pusta  { border-left-color:#d6d3d1; opacity:.5 }
  .naglowek { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px }
  .naglowek h2 { margin:0; font-size:17px }
  .plakietka { font-size:12px; padding:2px 8px; border-radius:999px; background:#e7e5e4; color:#57534e }
  .plakietka.pilne { background:#d1fae5; color:#065f46 }
  .plakietka.wtoku { background:#fef3c7; color:#92400e }
  dl { margin:0; font-size:13px }
  dl div { display:flex; gap:8px; padding:2px 0 }
  dt { width:110px; flex:none; color:#78716c }
  dd { margin:0 }
  .scieżka { color:#a8a29e; font-size:12px }
  .kolizja { color:#b45309; font-size:12px }
  .wejdz { display:inline-block; margin-top:12px; font-size:14px; font-weight:600; color:#10B981 }
</style></head><body>
<header>
  <h1>Panel selekcji kolorowanek</h1>
  <p>${stany.length} kategorii w katalogu roboczym · ${doZrobienia} czeka na Twój wybór</p>
</header>
${posprzatane.length ? `<div class="sprzatanie">Posprzątano materiał roboczy kategorii, które są już na produkcji:
  ${posprzatane.map(p => `<b>${esc(p.nazwa)}</b> (${p.plikow} plików, ${mb(p.bajtow)} MB)`).join(', ')}.
  Listy <code>_wybor.txt</code> zostały nietknięte.${
  posprzatane.some(p => p.pominiete.length)
    ? ` Pominięto katalogi z plikami w gicie: ${posprzatane.flatMap(p => p.pominiete.map(s => `${p.nazwa}/${s}`)).join(', ')}.`
    : ''}</div>` : ''}
<div class="siatka">${karty}</div>
</body></html>`
}

// ── Serwer ──────────────────────────────────────────────────────────────────
const MIME = {
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf'
}

let stany = zbierzStany()
const posprzatane = BEZ_SPRZATANIA ? [] : posprzataj(stany)
if (posprzatane.length) {
  for (const p of posprzatane) {
    console.log(`Posprzątano ${p.nazwa}: ${p.plikow} plików, ${mb(p.bajtow)} MB (na produkcji)`)
    if (p.pominiete.length) console.log(`  pominięto (pliki w gicie): ${p.pominiete.join(', ')}`)
  }
  stany = zbierzStany()   // po sprzątaniu liczby są inne
}

// Galerie budujemy raz na kategorię i trzymamy — złożenie strony liczy trudność każdego
// SVG, więc przy powrocie z podglądu nie ma powodu robić tego drugi raz.
const galerie = new Map()
function galeria (nazwa) {
  if (!galerie.has(nazwa)) {
    galerie.set(nazwa, zbudujGalerie(join(ROBOCZY, nazwa), {
      kolumny: 5, sort: 'trudnosc', wybor: true, zapisNaSerwerze: true,
      powrot: { url: '/', etykieta: 'wszystkie kategorie' }
    }))
  }
  return galerie.get(nazwa)
}

createServer((req, res) => {
  let url
  try { url = decodeURIComponent((req.url || '/').split('?')[0]) }
  catch { res.writeHead(400); res.end('zly adres'); return }

  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(stronaGlowna(stany, posprzatane))
    return
  }

  const m = url.match(/^\/k\/([^/]+)\/(.*)$/)
  if (!m) { res.writeHead(404); res.end('nie ma'); return }
  const [, nazwa, reszta] = m
  if (!stany.some(s => s.nazwa === nazwa)) { res.writeHead(404); res.end('nieznana kategoria'); return }
  const baza = join(ROBOCZY, nazwa)

  if (req.method === 'POST' && reszta === '_zapisz') {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      try {
        const ile = zapiszWybor(galeria(nazwa).sciezkaWyboru, body)
        console.log(`  ${nazwa}: zapisano ${ile} poz.`)
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); res.end(String(ile))
      } catch (e) {
        console.error(`  ${nazwa}: BŁĄD ZAPISU: ${e.message}`)
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }); res.end(e.message)
      }
    })
    return
  }

  if (reszta === '') {
    const g = galeria(nazwa)
    if (!g.pliki.length) { res.writeHead(404); res.end('brak obrazków w tej kategorii'); return }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(g.html)
    return
  }

  // Obrazki wyłącznie z katalogu tej kategorii — `resolve` plus sprawdzenie przedrostka
  // ucina wyjście w górę drzewa przez `..` w adresie.
  const korzen = resolve(baza)
  const cel = resolve(korzen, './' + reszta)
  if (!cel.startsWith(korzen + (process.platform === 'win32' ? '\\' : '/'))) {
    res.writeHead(403); res.end('poza katalogiem kategorii'); return
  }
  // Plik czytamy PRZED wysłaniem nagłówka — inaczej brakujący plik leci wyjątkiem już
  // po `writeHead(200)` i ubija cały serwer, czyli w środku selekcji przestaje działać zapis.
  let dane
  try { dane = readFileSync(cel) } catch { res.writeHead(404); res.end('nie ma takiego pliku'); return }
  res.writeHead(200, { 'content-type': MIME[extname(cel).toLowerCase()] ?? 'application/octet-stream' })
  res.end(dane)
}).on('clientError', (_e, gniazdo) => gniazdo.destroy())
  // Panel odpala się podwójnym kliknięciem, więc uruchomienie go drugi raz jest normalną
  // pomyłką, a nie sytuacją wyjątkową — zasługuje na zdanie po polsku, nie na stos wywołań.
  .on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`\nPort ${PORT} jest zajęty — panel prawdopodobnie już działa.`)
      console.error(`Otwórz http://localhost:${PORT} albo zamknij tamto okno konsoli.`)
      console.error('Możesz też podać inny port: start.cmd --port=4322')
    } else {
      console.error(`\nNie udało się uruchomić panelu: ${e.message}`)
    }
    process.exit(1)
  })
  .listen(PORT, () => {
    const adres = `http://localhost:${PORT}`
    console.log(`\nPanel selekcji: ${adres}`)
    for (const s of stany.filter(s => s.status === 'do-selekcji')) {
      console.log(`  do selekcji: ${s.nazwa} (${s.plikow} szt.)`)
    }
    console.log('Ctrl+C kończy panel.')
    const [cmd, args] = process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', adres]]
      : process.platform === 'darwin' ? ['open', [adres]] : ['xdg-open', [adres]]
    try { spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref() } catch { /* otwórz ręcznie */ }
  })
