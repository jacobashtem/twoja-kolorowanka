// Składa wybrane kolorowanki w JEDEN wielostronicowy PDF A4 — pakiet powitalny newslettera.
//
// Czym się różni od `lineart-postprocess.mjs`: tamten robi jeden PDF NA KOLOROWANKĘ
// (tak leżą pliki w public/ dla całej biblioteki), tu potrzebny jest jeden plik do
// pobrania z linku w mailu — jeden przycisk, jedno pobranie.
//
// Marginesy i rozmiar strony są celowo TE SAME co w lineart-postprocess.mjs (A4, 36 pt),
// żeby kartka z pakietu drukowała się identycznie jak kartka pobrana ze strony.
//
// Użycie:
//   node scripts/zloz-pakiet.mjs --baza=lineart-work/pakiet-zawody --out=public/pakiet/nazwa.pdf \
//     --tytul="Kim chcę zostać?" --podtytul="50 kolorowanek do druku"

import { readdirSync, statSync, createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { join, extname, dirname, basename } from 'node:path'
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import { readFileSync } from 'node:fs'
import { svgScore } from './lib/trudnosc.mjs'

const argv = process.argv.slice(2)
const arg = (n, d) => (argv.find(a => a.startsWith(`--${n}=`)) ?? '').split('=').slice(1).join('=') || d

const BAZA     = arg('baza', 'lineart-work/pakiet-zawody')
const OUT      = arg('out', 'public/pakiet/pakiet.pdf')
const TYTUL    = arg('tytul', 'Kim chcę zostać?')
const PODTYTUL = arg('podtytul', '')

const A4_W = 595.28, A4_H = 841.89, MARGIN = 36

// Font systemowy z polskimi znakami. Wbudowana Helvetica ma WinAnsi (CP1252),
// w którym NIE ma ą, ę, ł, ń, ś, ź, ż — tytuł wyszedłby z krzakami.
const FONT_R = 'C:/Windows/Fonts/arial.ttf'
const FONT_B = 'C:/Windows/Fonts/arialbd.ttf'

// ── Zbieranie plików ────────────────────────────────────────────────────────
// Bierzemy WYŁĄCZNIE katalogi `out-*`, czyli wynik wektoryzacji wybranych sztuk.
// `raw-*` obok nich zawiera cały materiał łącznie z odrzutami — wciągnięcie go
// wsadziłoby do pakietu rzeczy, których użytkownik nie wybrał.
function zbierzSvg (baza) {
  const pliki = []
  for (const wpis of readdirSync(baza)) {
    const kat = join(baza, wpis)
    if (!statSync(kat).isDirectory() || !wpis.startsWith('out-')) continue
    for (const f of readdirSync(kat)) {
      if (extname(f).toLowerCase() === '.svg') pliki.push(join(kat, f))
    }
  }
  return pliki
}

const svgi = zbierzSvg(BAZA)
if (!svgi.length) {
  console.error(`Brak plików .svg w katalogach out-* wewnątrz ${BAZA}`)
  process.exit(2)
}

// Rosnąco po złożoności — dziecko zaczyna od najprostszych, tak jak w galerii kategorii.
const posortowane = svgi
  .map(p => ({ p, score: svgScore(p) }))
  .sort((a, b) => a.score - b.score)
  .map(x => x.p)

mkdirSync(dirname(OUT), { recursive: true })

const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false })
const ws = createWriteStream(OUT)
doc.pipe(ws)

const maPolskieFonty = existsSync(FONT_R) && existsSync(FONT_B)
if (maPolskieFonty) {
  doc.registerFont('pl', FONT_R)
  doc.registerFont('pl-b', FONT_B)
} else {
  console.warn('UWAGA: brak arial.ttf/arialbd.ttf — polskie znaki na okładce mogą wyjść źle.')
}
const fR = maPolskieFonty ? 'pl' : 'Helvetica'
const fB = maPolskieFonty ? 'pl-b' : 'Helvetica-Bold'

// ── Okładka ─────────────────────────────────────────────────────────────────
// Logo jest OBRAZKIEM, więc nie zależy od fontu. Nota o zasadach korzystania
// powtarza to, co mówi regulamin (sekcja V, pkt „Pakiet powitalny") — plik krąży
// bez kontekstu strony, więc zasady muszą jechać razem z nim.
doc.addPage()
const logo = 'public/logo-email-white.png'
let y = 150
if (existsSync(logo)) {
  const szer = 300
  doc.image(logo, (A4_W - szer) / 2, y, { width: szer })
  y += 110
}
doc.font(fB).fontSize(30).fillColor('#2A1B3D')
   .text(TYTUL, MARGIN, y, { width: A4_W - 2 * MARGIN, align: 'center' })
y += 46
if (PODTYTUL) {
  doc.font(fR).fontSize(15).fillColor('#6B7280')
     .text(PODTYTUL, MARGIN, y, { width: A4_W - 2 * MARGIN, align: 'center' })
}
doc.font(fR).fontSize(10).fillColor('#9CA3AF')
   .text(
     'Do użytku własnego, domowego i edukacyjnego. Drukuj, ile chcesz.\n' +
     'Nie odsprzedawaj i nie publikuj jako własne.\n\ntwoja-kolorowanka.pl',
     MARGIN, A4_H - 150, { width: A4_W - 2 * MARGIN, align: 'center', lineGap: 3 }
   )

// ── Strony z kolorowankami ──────────────────────────────────────────────────
let dodane = 0, bledy = 0
for (const sciezka of posortowane) {
  try {
    const svg = readFileSync(sciezka, 'utf8')
    doc.addPage()
    SVGtoPDF(doc, svg, MARGIN, MARGIN, {
      width: A4_W - 2 * MARGIN,
      height: A4_H - 2 * MARGIN,
      preserveAspectRatio: 'xMidYMid meet',
      assumePt: false
    })
    dodane++
  } catch (e) {
    bledy++
    console.error(`  BŁĄD: ${basename(sciezka)} — ${e.message}`)
  }
}

doc.end()
ws.on('finish', () => {
  const kb = statSync(OUT).size / 1024
  console.log(`Gotowe: ${OUT}`)
  console.log(`  stron: ${dodane + 1} (okładka + ${dodane} kolorowanek), błędy: ${bledy}`)
  console.log(`  rozmiar: ${kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(0) + ' KB'}`)
})
ws.on('error', e => { console.error(e); process.exit(1) })
