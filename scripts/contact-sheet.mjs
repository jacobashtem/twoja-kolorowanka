// Składa arkusze stykowe: siatkę miniatur z numerami, do szybkiego przeglądu oczami.
//
// Po co: przy wymianie biblioteki wąskim gardłem nie jest generowanie, tylko decyzja
// „to zostaje, tego nie chcę". Klikanie po pojedynczych plikach zabija tempo — na jednym
// arkuszu ocenisz 30 sztuk w kilkanaście sekund i zapiszesz numery odrzutów na kartce.
//
// Użycie:
//   node scripts/contact-sheet.mjs lineart-work/kombajny/out
//   node scripts/contact-sheet.mjs lineart-work/koty/out --cols=8 --rows=6
//
// Obok arkuszy powstaje index.txt z mapowaniem numer → plik, więc odrzuty da się
// potem usunąć hurtem po numerach, nawet gdyby podpisy na obrazku się nie wyrenderowały.
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import sharp from 'sharp'

const argv    = process.argv.slice(2)
const wejscie = argv.find(a => !a.startsWith('--'))
const COLS    = Number((argv.find(a => a.startsWith('--cols=')) ?? '').split('=')[1]) || 6
const ROWS    = Number((argv.find(a => a.startsWith('--rows=')) ?? '').split('=')[1]) || 5
// --cell= podnosi rozdzielczość komórki, gdy trzeba obejrzeć szczegóły (np. odrzuty)
const CELL    = Number((argv.find(a => a.startsWith('--cell=')) ?? '').split('=')[1]) || 300
const LABEL   = 28

if (!wejscie) {
  console.error('Podaj katalog z obrazkami, np. lineart-work/kombajny/out')
  process.exit(2)
}

const EXTS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp'])
const pliki = readdirSync(wejscie)
  .filter(f => EXTS.has(extname(f).toLowerCase()))
  .map(f => join(wejscie, f))
  .filter(f => statSync(f).isFile())
  .sort()

if (!pliki.length) { console.error(`Brak obrazków w ${wejscie}`); process.exit(2) }

const OUT = join(wejscie, '_arkusze')
mkdirSync(OUT, { recursive: true })

const NA_ARKUSZ = COLS * ROWS
const SZER = COLS * CELL
const WYS  = ROWS * (CELL + LABEL)

// Miniatura wpasowana w kwadrat komórki, z numerem pod spodem.
async function komorka (plik, numer) {
  const obraz = await sharp(plik, { density: 150 })
    .flatten({ background: '#ffffff' })
    .resize(CELL - 8, CELL - 8, { fit: 'contain', background: '#ffffff' })
    .toBuffer()

  const podpis = Buffer.from(
    `<svg width="${CELL}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
       <rect width="${CELL}" height="${LABEL}" fill="#f1f5f9"/>
       <text x="6" y="20" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${numer}</text>
       <text x="${CELL - 6}" y="20" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="end">${basename(plik).slice(-22)}</text>
     </svg>`
  )

  return sharp({ create: { width: CELL, height: CELL + LABEL, channels: 3, background: '#ffffff' } })
    .composite([
      { input: obraz, top: 4, left: 4 },
      { input: podpis, top: CELL, left: 0 }
    ])
    .png()
    .toBuffer()
}

const indeks = []
let arkusz = 0

for (let start = 0; start < pliki.length; start += NA_ARKUSZ) {
  const partia = pliki.slice(start, start + NA_ARKUSZ)
  const warstwy = []

  for (let i = 0; i < partia.length; i++) {
    const numer = start + i + 1
    indeks.push(`${String(numer).padStart(4, ' ')}  ${basename(partia[i])}`)
    try {
      warstwy.push({
        input: await komorka(partia[i], numer),
        top: Math.floor(i / COLS) * (CELL + LABEL),
        left: (i % COLS) * CELL
      })
    } catch (e) {
      console.error(`  pominięto ${basename(partia[i])}: ${e.message}`)
    }
  }

  arkusz++
  const sciezka = join(OUT, `arkusz-${String(arkusz).padStart(2, '0')}.png`)
  await sharp({ create: { width: SZER, height: WYS, channels: 3, background: '#ffffff' } })
    .composite(warstwy)
    .png()
    .toFile(sciezka)
  console.log(`${sciezka}  (pozycje ${start + 1}–${start + partia.length})`)
}

writeFileSync(join(OUT, 'index.txt'), indeks.join('\n') + '\n')

console.log(`\nGotowe. Arkuszy: ${arkusz}, obrazków: ${pliki.length}`)
console.log(`Mapowanie numerów: ${join(OUT, 'index.txt')}`)
