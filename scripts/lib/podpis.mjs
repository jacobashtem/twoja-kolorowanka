// Podpis pod kolorowanką: biały pasek dopisany POD kadrem i nazwa narysowana ścieżkami.
//
// Powstało dla świętych z `okolicznosciowe/wszystkich-swietych` — to jedyny temat, w którym
// rysunek bez nazwy traci połowę sensu (kto to jest?). Dlaczego dopiero na SVG, a nie
// w prompcie: model dorysowuje śmieciowe litery (mandala-019), polskich znaków nie
// gwarantuje, a napis w rastrze przeszedłby przez wektoryzator jako postrzępiony kształt.
//
// Trzy decyzje, które łatwo odkręcić przez pomyłkę:
//   • ŚCIEŻKI, nie <text>. Ten sam plik idzie do PDF-a, do miniatur (sharp) i do edytora
//     /koloruj/ — każde z nich ma inne czcionki albo żadnych. Ścieżka wygląda wszędzie tak samo.
//   • PASEK POD rysunkiem, nie napis w rogu: kadr bywa pełny (witraż do krawędzi) i napis
//     nachodziłby na scenę. Kartka robi się o ~6% wyższa, w PDF-ie zostaje wąski margines.
//   • BEZ <g>. Brak grup to w tym projekcie znak „plik nasz, nie ze stocka" (patrz skill
//     kategoria-kolorowanek), więc pasek i napis to dwa luźne elementy z `data-podpis`.
//     Po tym samym atrybucie `svgScore` wyłącza je z miary trudności — litery to kilkaset
//     komend, które podbiłyby prosty rysunek o stopień, a kolorować ich nikt nie będzie.
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, dirname, basename, extname } from 'node:path'
import { KATEGORIE } from '../../prompty/kategorie.mjs'

// fontkit jest w projekcie tylko jako zależność pdfkit, a pnpm nie wystawia zależności
// pośrednich w node_modules/ — bierzemy go więc stamtąd, skąd bierze go pdfkit.
const require = createRequire(import.meta.url)
const fontkit = createRequire(require.resolve('pdfkit'))('fontkit')

// Arial Bold: ma komplet polskich znaków i jest na każdym Windowsie. Inną czcionkę
// (np. zaokrągloną, bardziej dziecięcą) podaje się zmienną PODPIS_FONT — plik .ttf/.otf.
const CZCIONKA = process.env.PODPIS_FONT || 'C:/Windows/Fonts/arialbd.ttf'

const PASEK = 0.065       // wysokość paska jako ułamek wysokości rysunku
const PISMO = 0.5         // wysokość pisma jako ułamek paska
const MAKS_SZER = 0.9     // najdłuższe podpisy zmniejszamy, żeby zostawić margines

export const MANIFEST = '_manifest.json'

let font = null
function czcionka () {
  if (font) return font
  if (!existsSync(CZCIONKA)) {
    throw new Error(`Brak czcionki do podpisów: ${CZCIONKA}. Podaj inną przez zmienną PODPIS_FONT.`)
  }
  return (font = fontkit.openSync(CZCIONKA))
}

const f1 = n => String(Math.round(n * 10) / 10)

// Podpis dla pliku z serii (raw-* albo out-*), albo null, gdy seria go nie przewiduje.
// Manifest zapisuje generator obok rastrów: plik → indeks wariantu. Nazwa siedzi
// w rejestrze promptów jako `podpisy`, lista równoległa do `warianty`. Wpis w manifeście
// może ją nadpisać (`podpis: "..."`) albo wyłączyć (`podpis: false`) — to drugie jest
// dla sztuk, na których model zgubił atrybut i nazwa wprowadzałaby w błąd.
export function podpisDla (plik) {
  const kat = dirname(plik)
  const sciezka = join(dirname(kat), basename(kat).replace(/^out-/, 'raw-'), MANIFEST)
  if (!existsSync(sciezka)) return null
  const m = JSON.parse(readFileSync(sciezka, 'utf8'))
  const wpis = m.pliki?.[basename(plik, extname(plik))]
  if (!wpis || wpis.podpis === false) return null
  if (typeof wpis.podpis === 'string') return wpis.podpis
  const cfg = KATEGORIE[m.kategoria]
  const zrodlo = m.zestaw ? cfg?.zestawy?.[m.zestaw] : cfg
  return zrodlo?.podpisy?.[wpis.wariant] ?? null
}

export const maPodpis = svg => svg.includes('data-podpis')

// Zwraca SVG z dopisanym paskiem. Plik już podpisany wraca bez zmian, więc funkcję
// można puszczać wielokrotnie na tym samym katalogu.
export function dodajPodpis (svg, tekst) {
  if (maPodpis(svg)) return svg
  const vb = svg.match(/viewBox="\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)[\s,]+([-\d.]+)\s*"/)
  if (!vb) throw new Error('SVG bez viewBox — nie wiadomo, gdzie dopisać pasek')
  const [x0, y0, w, h] = vb.slice(1).map(Number)
  const pasek = h * PASEK
  const nowaH = h + pasek

  const f = czcionka()
  const run = f.layout(tekst)
  const szerEm = run.positions.reduce((s, p) => s + p.xAdvance, 0)
  const skala = Math.min(pasek * PISMO / f.unitsPerEm, w * MAKS_SZER / szerEm)
  // Wyśrodkowanie w pionie po wysokości wersalików — po całym em napis siedziałby za nisko.
  const bazowa = y0 + h + pasek / 2 + f.capHeight * skala / 2
  let x = x0 + (w - szerEm * skala) / 2

  // Czcionka ma oś Y w górę, SVG w dół. Przeliczamy punkty sami, zamiast dawać
  // `transform` — jeden atrybut mniej do zgubienia przez kolejne narzędzie w łańcuchu.
  const LITERA = { moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C', closePath: 'Z' }
  let d = ''
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i]
    for (const { command, args } of g.path.commands) {
      d += LITERA[command]
      for (let k = 0; k < args.length; k += 2) {
        d += ` ${f1(x + (args[k] + p.xOffset) * skala)} ${f1(bazowa - (args[k + 1] + p.yOffset) * skala)}`
      }
      d += ' '
    }
    x += p.xAdvance * skala
  })

  const dopisek =
    `<rect data-podpis="tlo" x="${f1(x0)}" y="${f1(y0 + h)}" width="${f1(w)}" height="${f1(pasek)}" fill="rgb(255,255,255)"/>\n` +
    `<path data-podpis="tekst" fill="rgb(0,0,0)" d="${d.trim()}"/>\n`

  return svg
    .replace(vb[0], `viewBox="${x0} ${y0} ${w} ${f1(nowaH)}"`)
    // `height` w pikselach musi urosnąć razem z viewBox, inaczej rysunek się spłaszczy
    // (wektoryzator Recrafta daje preserveAspectRatio="none").
    .replace(/(<svg[^>]*?\sheight=")([\d.]+)/, (_, a, v) => `${a}${f1(Number(v) * nowaH / h)}`)
    .replace(/<\/svg>\s*$/, `${dopisek}</svg>\n`)
}
