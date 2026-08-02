// Buduje lokalną stronę HTML do przeglądu wygenerowanych kolorowanek.
//
// Po co, skoro jest Eksplorator Windows: Eksplorator NIE renderuje miniatur SVG —
// pokazuje generyczne ikony, więc w dużych kafelkach nic nie zobaczysz. Przeglądarka
// renderuje SVG natywnie, w dowolnej skali i bez instalowania czegokolwiek.
//
// Klikasz kafelek, żeby oznaczyć odrzut (albo wybór, patrz --wybor).
//
// Użycie:
//   node scripts/galeria.mjs lineart-work/jaszczurki/raw-v3-krotki
//   node scripts/galeria.mjs lineart-work/jaszczurki/raw-v3-krotki --kolumny=4
//   node scripts/galeria.mjs lineart-work/kroliczki --wybor --serwer
//
// Do przejścia WSZYSTKICH kategorii naraz jest `panel-selekcji.mjs` (albo start.cmd
// w katalogu głównym) — ten skrypt zostaje do pojedynczego katalogu i do file://.
//
// Sam HTML powstaje w `lib/galeria-html.mjs`, wspólnym z panelem.
import { writeFileSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { join, extname, basename, resolve } from 'node:path'
import { zbudujGalerie, zapiszWybor } from './lib/galeria-html.mjs'

const argv    = process.argv.slice(2)
const katalog = argv.find(a => !a.startsWith('--'))
const KOLUMNY = Number((argv.find(a => a.startsWith('--kolumny=')) ?? '').split('=')[1]) || 5

// --filtr=fragment zostawia tylko pliki, których ścieżka zawiera podany fragment.
// Po to, żeby jedna galeria mogła zestawić kilka serii z tego samego katalogu kategorii:
// wskazujesz `lineart-work/koniki` i filtrem `out-` odsiewasz surowe rastry, zostawiając
// same wyniki. Bez tego trzeba było robić osobną stronę na każdą serię i przeklikiwać się
// między nimi, co przy porównywaniu stylów nie ma sensu.
// Po przecinku można podać kilka fragmentów naraz — plik wchodzi, jeśli pasuje do
// któregokolwiek. Potrzebne, bo porównanie idzie zwykle po katalogach o różnych nazwach
// (wyniki wektoryzacji obok serii, które przyszły z API od razu jako SVG).
const FILTR = ((argv.find(a => a.startsWith('--filtr=')) ?? '').split('=')[1] || '')
  .split(',').map(f => f.trim()).filter(Boolean)

// --wybor odwraca sens klikania: zaznaczasz to, co ZOSTAJE, a nie to, co odpada.
// Przy przeglądaniu jednej serii naturalne jest odrzucanie wpadek, ale przy zestawieniu
// kilkunastu stylów obok siebie odrzuca się prawie wszystko — wtedy szybciej i bezpieczniej
// jest wskazać garść zwycięzców. Lista z tego trybu idzie prosto do wektoryzacji.
const WYBOR = argv.includes('--wybor')

// --serwer podaje galerię przez http://localhost zamiast otwierać ją z dysku jako file://.
// Jedyny powód: strona z file:// NIE MOŻE nic zapisać na dysku, więc wybór trzeba było
// kopiować do schowka i wklejać ręcznie do pliku — a to jest kilkadziesiąt ścieżek i jedna
// z realnych okazji, żeby coś zgubić po drodze. Pod serwerem zaznaczenia lecą fetchem
// z powrotem do Node'a i lądują od razu w `_wybor.txt` obok obrazków, czyli dokładnie tam,
// skąd czyta je wektoryzator i podmieniacz. Zero przenoszenia plików między krokami.
const SERWER_ARG = argv.find(a => a === '--serwer' || a.startsWith('--serwer='))
const PORT = SERWER_ARG ? (Number(SERWER_ARG.split('=')[1]) || 4321) : 0

// --sort=trudnosc układa kafelki od najprostszych do najbardziej złożonych, zamiast
// grupować po serii. Pomysł Jakuba: przewijając galerię w dół widzisz rysunki narastająco
// trudniejsze, więc od razu czujesz, gdzie kończy się materiał dla malucha, a zaczyna
// dla starszego dziecka. Skala jest ta sama, która nadaje tagi `trudnosc-N` na stronie.
const SORT = (argv.find(a => a.startsWith('--sort=')) ?? '').split('=')[1] || 'seria'

if (!katalog) {
  console.error('Podaj katalog, np. lineart-work/jaszczurki/raw-v3-krotki')
  process.exit(2)
}

const { html, pliki, plikWyboru, sciezkaWyboru, wyborZDysku } = zbudujGalerie(katalog, {
  kolumny: KOLUMNY, filtr: FILTR, sort: SORT, wybor: WYBOR, zapisNaSerwerze: !!PORT
})

if (!pliki.length) { console.error(`Brak obrazków w ${katalog}`); process.exit(2) }

// W trybie serwerowym strona żyje pod adresem, a NIE na dysku. Gdyby lądowała też
// w galeria.html, ktoś otworzyłby ją kiedyś z file:// — z przyciskiem zapisu, który
// nie ma dokąd wysłać fetcha, czyli z cichym kłamstwem, że wybór się zapisuje.
if (!PORT) writeFileSync(join(katalog, 'galeria.html'), html, 'utf8')

const ok = pliki.filter(p => p.werdykt === 'ok').length
const odrzut = pliki.filter(p => p.werdykt === 'odrzut').length
console.log(PORT ? `Galeria: ${basename(katalog)}` : `Galeria: ${join(katalog, 'galeria.html')}`)
console.log(`Obrazków: ${pliki.length}${ok || odrzut ? `  (ok: ${ok}, odrzut: ${odrzut})` : ''}`)
if (wyborZDysku.length) console.log(`Wczytano poprzedni wybór: ${wyborZDysku.length} poz. z ${sciezkaWyboru}`)

if (!PORT) {
  console.log(WYBOR
    ? `Otwórz w przeglądarce, klikaj kafelki, które ZOSTAJĄ, i skopiuj listę wybranych.`
    : `Otwórz plik w przeglądarce i klikaj kafelki, żeby oznaczać odrzuty.`)
  console.log(`Wskazówka: --serwer zapisuje wybór prosto do ${plikWyboru}, bez schowka.`)
  process.exit(0)
}

// ── Tryb --serwer ───────────────────────────────────────────────────────────
// Minimalny serwer plików + jeden endpoint zapisu. Bez zależności, bo jedyne, czego
// potrzeba ponad `file://`, to możliwość odesłania listy z powrotem do Node'a.
const MIME = {
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf'
}
const KORZEN = resolve(katalog)

createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/_zapisz') {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      try {
        const ile = zapiszWybor(sciezkaWyboru, body)
        console.log(`  zapisano ${String(ile).padStart(3)} poz. → ${sciezkaWyboru}`)
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
        res.end(String(ile))
      } catch (e) {
        console.error(`  BŁĄD ZAPISU: ${e.message}`)
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
        res.end(e.message)
      }
    })
    return
  }

  let url
  try { url = decodeURIComponent((req.url || '/').split('?')[0]) }
  catch { res.writeHead(400); res.end('zly adres'); return }
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  // Obrazki serwujemy wyłącznie z katalogu galerii — `resolve` + sprawdzenie przedrostka
  // ucina próby wyjścia w górę drzewa przez `..` w adresie.
  const cel = resolve(KORZEN, '.' + url)
  if (cel !== KORZEN && !cel.startsWith(KORZEN + (process.platform === 'win32' ? '\\' : '/'))) {
    res.writeHead(403); res.end('poza katalogiem galerii'); return
  }
  // Plik CZYTAMY PRZED wysłaniem nagłówka. Odwrotna kolejność wygląda naturalniej, ale
  // `readFileSync` jako argument `end()` wykonuje się już po `writeHead(200)` — brakujący
  // plik leciał więc wyjątkiem do gałęzi 404, która nie mogła nadpisać wysłanych nagłówków
  // i ubijała cały serwer. Akurat tu jest to groźne: selekcja trwa kilkadziesiąt minut,
  // a padnięty serwer oznacza, że dalsze kliknięcia nie mają już czego zapisywać.
  let dane
  try { dane = readFileSync(cel) } catch { res.writeHead(404); res.end('nie ma takiego pliku'); return }
  res.writeHead(200, { 'content-type': MIME[extname(cel).toLowerCase()] ?? 'application/octet-stream' })
  res.end(dane)
}).on('clientError', (_e, gniazdo) => gniazdo.destroy())
  .listen(PORT, () => {
    const adres = `http://localhost:${PORT}`
    console.log(`\nSerwer: ${adres}`)
    console.log(`Zaznaczenia zapisują się same do ${sciezkaWyboru} — po skończeniu po prostu zamknij kartę.`)
    console.log('Ctrl+C kończy serwer.')
    const [cmd, args] = process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', adres]]
      : process.platform === 'darwin' ? ['open', [adres]] : ['xdg-open', [adres]]
    try { spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref() } catch { /* otwórz ręcznie */ }
  })
