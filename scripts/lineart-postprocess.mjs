// Doprowadza surowy materiał z generatora do postaci gotowej do publikacji: SVG + PDF A4.
//
// Dwie ścieżki, zależnie od tego, co dostał na wejściu:
//   RASTER (.png z Fluxa) → binaryzacja (usuwa półtony) → domknięcie szczelin → potrace → SVG → PDF
//   WEKTOR (.svg z Recrafta) → prosto do PDF, bez trasowania (po co psuć gotowy wektor)
//
// Gdyby Recraft zwrócił figury WYPEŁNIONE zamiast samych konturów, przepuść je przez
// pełną ścieżkę rastrową flagą --force-trace — binaryzacja sprowadzi je do czystej kreski.
//
// Wymaga:  pnpm add -D potrace pdfkit svg-to-pdfkit
//
// Użycie:
//   node scripts/lineart-postprocess.mjs lineart-work/kombajny/raw-recraft
//   node scripts/lineart-postprocess.mjs lineart-work/kombajny/raw-flux --threshold=175 --close=1.2
//   node scripts/lineart-postprocess.mjs lineart-work/kombajny/raw-recraft --force-trace
//
// Jeśli po obróbce kontury przeciekają, podnieś --close (grubsza kreska, szczelniej).
// Jeśli kreska wychodzi za gruba i gubi detale, zmniejsz --close i --threshold.
import { readdirSync, statSync, mkdirSync, writeFileSync, readFileSync, createWriteStream } from 'node:fs'
import { join, basename, extname, dirname } from 'node:path'
import sharp from 'sharp'
import potrace from 'potrace'
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'

const argv    = process.argv.slice(2)
const wejscie = argv.find(a => !a.startsWith('--'))
const THRESHOLD   = Number((argv.find(a => a.startsWith('--threshold=')) ?? '').split('=')[1]) || 170
const CLOSE       = Number((argv.find(a => a.startsWith('--close=')) ?? '').split('=')[1] ?? 1.0)
const FORCE_TRACE = argv.includes('--force-trace')
const TRACE_W     = 2000 // trasujemy w wysokiej rozdzielczości — krzywe wychodzą gładsze

if (!wejscie) {
  console.error('Podaj katalog z materiałem, np. lineart-work/kombajny/raw-recraft')
  process.exit(2)
}

// A4 w punktach PDF (72 dpi) + margines na dziurkacz i chwyt dłoni
const A4_W = 595.28, A4_H = 841.89, MARGIN = 36

const OUT = join(dirname(wejscie), `out-${basename(wejscie).replace(/^raw-?/, '') || 'default'}`)
mkdirSync(OUT, { recursive: true })

const pliki = readdirSync(wejscie)
  .filter(f => ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(extname(f).toLowerCase()))
  .map(f => join(wejscie, f))
  .filter(f => statSync(f).isFile())

if (!pliki.length) { console.error(`Brak plików w ${wejscie}`); process.exit(2) }

// ── Binaryzacja + domknięcie szczelin ───────────────────────────────────────
// Rozmycie przed progowaniem pogrubia ciemne linie i skleja jednopikselowe przerwy,
// przez które wypełnianie kolorem wylewałoby się na całą kartkę.
async function doBinarnego (plik) {
  let p = sharp(plik, { density: 200 })
    .flatten({ background: '#ffffff' })
    .greyscale()
    .resize({ width: TRACE_W, withoutEnlargement: false })
    .normalise()

  if (CLOSE > 0) p = p.blur(CLOSE)

  return p.threshold(THRESHOLD).png().toBuffer()
}

// ── Wektoryzacja ────────────────────────────────────────────────────────────
function doWektora (buf) {
  return new Promise((resolve, reject) => {
    potrace.trace(buf, {
      threshold: 128,
      turdSize: 4,        // wycina drobne śmieci i pojedyncze piksele
      optCurve: true,
      alphaMax: 1.0,
      color: '#000000',
      background: '#ffffff'
    }, (err, svg) => err ? reject(err) : resolve(svg))
  })
}

// ── PDF A4 ──────────────────────────────────────────────────────────────────
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

// ── Przebieg ────────────────────────────────────────────────────────────────
let ok = 0, przepisane = 0, przetrasowane = 0
const bledy = []

for (const plik of pliki) {
  const nazwa = basename(plik, extname(plik))
  const jestSvg = extname(plik).toLowerCase() === '.svg'
  try {
    let svg
    if (jestSvg && !FORCE_TRACE) {
      svg = readFileSync(plik, 'utf8')   // gotowy wektor — nie ruszamy
      przepisane++
    } else {
      svg = await doWektora(await doBinarnego(plik))
      przetrasowane++
    }
    writeFileSync(join(OUT, `${nazwa}.svg`), svg)
    await doPdf(svg, join(OUT, `${nazwa}.pdf`))
    ok++
    if (ok % 10 === 0) console.log(`${ok}/${pliki.length}...`)
  } catch (e) {
    bledy.push(`${nazwa}: ${e.message}`)
  }
}

console.log(`\nGotowe. Przetworzono: ${ok}/${pliki.length} (wektor przepisany: ${przepisane}, zwektoryzowany: ${przetrasowane}), błędy: ${bledy.length}`)
if (bledy.length) console.log(bledy.slice(0, 20).join('\n'))
console.log(`Katalog: ${OUT}`)
console.log(`Dalej:   node scripts/validate-lineart.mjs ${OUT}`)
console.log(`         node scripts/contact-sheet.mjs ${OUT}`)
