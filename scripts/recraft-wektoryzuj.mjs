// Zamienia rastry z Recrafta w gotowe SVG + PDF A4, korzystając z wektoryzatora Recrafta.
//
// Dlaczego przez API, a nie lokalnym potrace: przy identycznej jakości wizualnej pliki
// wychodzą prawie trzy razy lżejsze (260 KB wobec 693 KB na tym samym rysunku), a przy
// 2400 grafikach to około giga mniej w repo i w transferze Netlify. Koszt to 10 units,
// czyli grosz za sztukę. Lokalny potrace (lineart-postprocess.mjs) zostaje jako wariant
// offline i awaryjny.
//
// Użycie:
//   node scripts/recraft-wektoryzuj.mjs lineart-work/koniki/raw-v3-goly-rustic-line-art
//   node scripts/recraft-wektoryzuj.mjs <katalog> --bez-pdf
import { readdirSync, statSync, mkdirSync, writeFileSync, readFileSync, createWriteStream } from 'node:fs'
import { join, basename, extname, dirname } from 'node:path'
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'

// Klucz z .env (ten sam mechanizm co w pozostałych skryptach)
try {
  for (const linia of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = linia.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (m && !linia.trimStart().startsWith('#') && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
} catch { /* brak .env */ }

const TOKEN = process.env.RECRAFT_API_TOKEN
if (!TOKEN) { console.error('Brak RECRAFT_API_TOKEN w .env'); process.exit(2) }

const argv    = process.argv.slice(2)
const wejscie = argv.find(a => !a.startsWith('--'))
const BEZ_PDF = argv.includes('--bez-pdf')

// --lista=plik.txt bierze konkretne pliki zamiast całego katalogu. Tak wygląda wynik
// selekcji z galerii (--wybor): kilkadziesiąt ścieżek z różnych serii naraz. Wcześniej
// trzeba by było uruchamiać wektoryzator osobno na każdym katalogu i i tak przerabiałby
// wszystko, łącznie z odrzutami — czyli płacilibyśmy za pliki, których nikt nie chce.
// --baza= podaje katalog, względem którego zapisane są ścieżki w liście.
const LISTA = (argv.find(a => a.startsWith('--lista=')) ?? '').split('=')[1] || ''
const BAZA  = (argv.find(a => a.startsWith('--baza=')) ?? '').split('=')[1] || ''

if (!wejscie && !LISTA) {
  console.error('Podaj katalog z rastrami albo --lista=plik.txt z wybranymi ścieżkami.')
  console.error('Przykład: node scripts/recraft-wektoryzuj.mjs lineart-work/koniki/raw-v3-goly-rustic-line-art')
  console.error('          node scripts/recraft-wektoryzuj.mjs --lista=wybor.txt --baza=lineart-work/dinozaury')
  process.exit(2)
}

// A4 w punktach PDF (72 dpi) + margines na dziurkacz i chwyt dłoni
const A4_W = 595.28, A4_H = 841.89, MARGIN = 36

const RASTRY = new Set(['.png', '.jpg', '.jpeg', '.webp'])

let pliki
let pominietoSvg = 0
if (LISTA) {
  const wpisy = readFileSync(LISTA, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const pelne = wpisy.map(w => (BAZA ? join(BAZA, w) : w))
  // Pliki już wektorowe przepuszczamy bez ruszania — natywny SVG z modelu *_vector
  // nie ma czego wektoryzować, a wysłanie go do API byłoby wyrzuceniem 10 units.
  pominietoSvg = pelne.filter(f => extname(f).toLowerCase() === '.svg').length
  pliki = pelne.filter(f => RASTRY.has(extname(f).toLowerCase()))
  const brakujace = pliki.filter(f => { try { return !statSync(f).isFile() } catch { return true } })
  if (brakujace.length) {
    console.error(`Nie znaleziono ${brakujace.length} plików z listy, np.:`)
    for (const b of brakujace.slice(0, 3)) console.error(`  ${b}`)
    process.exit(2)
  }
} else {
  pliki = readdirSync(wejscie)
    .filter(f => RASTRY.has(extname(f).toLowerCase()) && !/-thumb\.|-view\./.test(f))
    .map(f => join(wejscie, f))
    .filter(f => statSync(f).isFile())
}

if (!pliki.length) {
  console.error(LISTA ? 'Lista nie zawiera żadnych rastrów do wektoryzacji.' : `Brak rastrów w ${wejscie}`)
  process.exit(2)
}

// Katalog wyjściowy liczony PER PLIK, bo lista potrafi obejmować kilkanaście serii naraz.
// raw-v3-goly-whimsy-playland → out-v3-goly-whimsy-playland, obok źródła.
const katalogWy = (plik) => {
  const zrodlo = dirname(plik)
  return join(dirname(zrodlo), basename(zrodlo).replace(/^raw-?/, 'out-'))
}

const typMime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }

async function saldo () {
  try {
    const r = await fetch('https://external.api.recraft.ai/v1/users/me', {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    return r.ok ? (await r.json())?.credits ?? null : null
  } catch { return null }
}

// Wektor trafia do PDF-a jako wektor, więc druk jest ostry niezależnie od skali.
function doPdf (svg, sciezka) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const ws = createWriteStream(sciezka)
    doc.pipe(ws)
    SVGtoPDF(doc, svg, MARGIN, MARGIN, {
      width: A4_W - 2 * MARGIN,
      height: A4_H - 2 * MARGIN,
      preserveAspectRatio: 'xMidYMid meet',
      assumePt: false
    })
    doc.end()
    ws.on('finish', resolve)
    ws.on('error', reject)
  })
}

const przed = await saldo()
if (przed !== null) console.log(`Saldo przed: ${przed} units ($${(przed / 1000).toFixed(2)})\n`)

let ok = 0, wagaSvg = 0
const bledy = []

for (const plik of pliki) {
  const nazwa = basename(plik, extname(plik))
  try {
    const fd = new FormData()
    fd.append('file', new Blob([readFileSync(plik)], { type: typMime[extname(plik).toLowerCase()] }),
      basename(plik))

    const res = await fetch('https://external.api.recraft.ai/v1/images/vectorize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: fd
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)

    const url = (await res.json())?.image?.url
    if (!url) throw new Error('brak URL w odpowiedzi')

    const svg = Buffer.from(await (await fetch(url)).arrayBuffer())
    const OUT = katalogWy(plik)
    mkdirSync(OUT, { recursive: true })
    writeFileSync(join(OUT, `${nazwa}.svg`), svg)
    wagaSvg += svg.length

    if (!BEZ_PDF) await doPdf(svg.toString('utf8'), join(OUT, `${nazwa}.pdf`))
    ok++
    if (ok % 10 === 0) console.log(`${ok}/${pliki.length}...`)
  } catch (e) {
    bledy.push(`${nazwa}: ${e.message}`)
  }
}

const po = await saldo()
console.log(`\nGotowe. Zwektoryzowano: ${ok}/${pliki.length}, błędy: ${bledy.length}`)
if (bledy.length) console.log(bledy.slice(0, 10).join('\n'))
if (ok) console.log(`Średnia waga SVG: ${Math.round(wagaSvg / ok / 1024)} KB`)
if (przed !== null && po !== null) {
  console.log(`Zużyto: ${przed - po} units = $${((przed - po) / 1000).toFixed(2)}   Zostało: ${po}`)
}
if (pominietoSvg) console.log(`Pominięto ${pominietoSvg} plików, które już są SVG (nic nie kosztowały).`)
const katalogi = [...new Set(pliki.map(katalogWy))]
console.log(katalogi.length === 1 ? `Katalog: ${katalogi[0]}` : `Katalogi (${katalogi.length}):\n  ${katalogi.join('\n  ')}`)
