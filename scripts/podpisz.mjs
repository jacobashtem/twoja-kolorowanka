// Dopisuje podpisy do JUŻ zwektoryzowanych plików i odświeża ich PDF-y.
//
// Normalnie podpis wchodzi sam w `recraft-wektoryzuj.mjs`, między pobraniem SVG a PDF-em.
// Ten skrypt jest dla serii zwektoryzowanej, zanim jej podpisy trafiły do rejestru.
// Plik już podpisany pomija — poprawka nazwy wymaga więc ponownej wektoryzacji tej
// sztuki; świadomie nie zgadujemy, jak wyglądał rysunek przed dopisaniem paska.
//
// Użycie (te same flagi co wektoryzator i podmiana):
//   node scripts/podpisz.mjs --lista=lineart-work/wszystkich-swietych/_wybor.txt --baza=lineart-work/wszystkich-swietych
//   node scripts/podpisz.mjs --lista=... --baza=... --dry-run
//
// Lokalne i darmowe — nie dotyka API.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { podpisDla, dodajPodpis, maPodpis } from './lib/podpis.mjs'
import { doPdf } from './lib/pdf-a4.mjs'

const argv  = process.argv.slice(2)
const LISTA = (argv.find(a => a.startsWith('--lista=')) ?? '').split('=')[1] || ''
const BAZA  = (argv.find(a => a.startsWith('--baza=')) ?? '').split('=')[1] || ''
const DRY   = argv.includes('--dry-run')

if (!LISTA) {
  console.error('Użycie: node scripts/podpisz.mjs --lista=plik.txt --baza=katalog [--dry-run]')
  process.exit(2)
}

// Lista wskazuje pliki źródłowe (raw-*); gotowe SVG leżą w bliźniaczym out-*.
const wpisy = readFileSync(LISTA, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  .map(w => (BAZA ? join(BAZA, w) : w))

let podpisane = 0, juzByly = 0, bezPodpisu = 0
const brak = []

for (const raw of wpisy) {
  const tekst = podpisDla(raw)
  if (!tekst) { bezPodpisu++; continue }

  const kat = dirname(raw).replace(/(^|[\\/])raw-/, '$1out-')
  const nazwa = basename(raw, extname(raw))
  const plikSvg = join(kat, `${nazwa}.svg`)
  if (!existsSync(plikSvg)) { brak.push(plikSvg); continue }

  const svg = readFileSync(plikSvg, 'utf8')
  if (maPodpis(svg)) { juzByly++; continue }

  console.log(`  ${tekst.padEnd(32)} ${plikSvg}`)
  if (!DRY) {
    const nowy = dodajPodpis(svg, tekst)
    writeFileSync(plikSvg, nowy)
    await doPdf(nowy, join(kat, `${nazwa}.pdf`))
  }
  podpisane++
}

console.log(`\n${DRY ? 'Do podpisania' : 'Podpisano'}: ${podpisane}, już podpisane: ${juzByly}, bez podpisu w rejestrze: ${bezPodpisu}`)
if (brak.length) {
  console.log(`Brak ${brak.length} plików wynikowych (nie przeszły wektoryzacji?), np. ${brak[0]}`)
  process.exitCode = 1
}
if (DRY) console.log('(--dry-run: nic nie zapisano.)')
