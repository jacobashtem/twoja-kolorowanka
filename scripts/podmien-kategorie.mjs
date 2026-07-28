// Wstawia wybrane kolorowanki z lineart-work/ do public/, podmieniając dotychczasowe pliki
// kategorii. To ostatni krok migracji: generuj → galeria --wybor → wektoryzuj --lista → TO.
//
// Użycie:
//   node scripts/podmien-kategorie.mjs zwierzeta/dinozaury --lista=lineart-work/dinozaury/_wybor.txt --baza=lineart-work/dinozaury --dry-run
//   node scripts/podmien-kategorie.mjs zwierzeta/dinozaury --lista=... --baza=... --zapisz
//
// Ścieżkę docelową bierzemy z pola `image:` w index.md KAŻDEGO liścia, a nie składamy jej
// z nazwy kategorii. Powód jest konkretny: cztery kategorie (koty, koniki, kroliczki, pieski)
// leżą w public/ na pierwszym poziomie, bez "zwierzeta/", i zgadywanie ścieżki już raz
// wyprodukowało fałszywy alarm o 304 martwych liściach. Frontmatter jest jedynym źródłem prawdy.
//
// Kolejność: pliki układamy rosnąco po trudności, więc liść 1 dostaje najprostszy rysunek.
// Strona i tak sortuje galerię po tagu `trudnosc-N`, ale dzięki temu numer w URL-u mniej
// więcej odpowiada złożoności, co ułatwia późniejsze ręczne grzebanie.
import { readFileSync, readdirSync, existsSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { svgScore, difficulty } from './lib/trudnosc.mjs'

const argv = process.argv.slice(2)
const kategoria = argv.find(a => !a.startsWith('--'))
const LISTA = (argv.find(a => a.startsWith('--lista=')) ?? '').split('=')[1] || ''
const BAZA  = (argv.find(a => a.startsWith('--baza=')) ?? '').split('=')[1] || ''
const ZAPISZ = argv.includes('--zapisz')

// --dopisz-liscie tworzy brakujące strony, gdy wybór jest większy niż dotychczasowa kategoria.
// To normalna sytuacja: kombajny miały 31 liści, a wybór wypadł na 46. Nowe index.md
// klonują wzorzec z liścia numer 1 tej samej kategorii, więc konwencja ścieżek, tagów
// i pola `variant_of` zostaje ta sama — niczego nie zgadujemy.
const DOPISZ = argv.includes('--dopisz-liscie')

if (!kategoria || !LISTA) {
  console.error('Użycie: node scripts/podmien-kategorie.mjs <kategoria> --lista=plik.txt --baza=katalog [--zapisz]')
  console.error('Przykład: node scripts/podmien-kategorie.mjs zwierzeta/dinozaury \\')
  console.error('            --lista=lineart-work/dinozaury/_wybor.txt --baza=lineart-work/dinozaury')
  process.exit(2)
}

const KAT_CONTENT = join('content', kategoria)
if (!existsSync(KAT_CONTENT)) { console.error(`Brak kategorii w content: ${KAT_CONTENT}`); process.exit(2) }

// ── Skąd bierzemy gotowe pliki ──────────────────────────────────────────────
// Lista pochodzi z galerii i wskazuje pliki ŹRÓDŁOWE (raw-*). Gotowe SVG i PDF leżą
// w bliźniaczym katalogu out-*, pod tą samą nazwą bazową.
const zrodla = readFileSync(LISTA, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  .map(w => (BAZA ? join(BAZA, w) : w))
  .map(raw => {
    const kat = dirname(raw).replace(/(^|[\\/])raw-/, '$1out-')
    const nazwa = basename(raw, extname(raw))
    return { svg: join(kat, `${nazwa}.svg`), pdf: join(kat, `${nazwa}.pdf`) }
  })

const brakujace = zrodla.filter(z => !existsSync(z.svg))
if (brakujace.length) {
  console.error(`Brak ${brakujace.length} plików wynikowych — czy na pewno przeszły przez wektoryzację?`)
  for (const b of brakujace.slice(0, 5)) console.error(`  ${b.svg}`)
  process.exit(2)
}

// Rosnąco po trudności; przy remisie alfabetycznie, żeby przebieg był powtarzalny.
for (const z of zrodla) z.trudnosc = difficulty(svgScore(z.svg))
zrodla.sort((a, b) => a.trudnosc - b.trudnosc || a.svg.localeCompare(b.svg))

// ── Dokąd trafiają ──────────────────────────────────────────────────────────
const pole = (tresc, nazwa) => tresc.match(new RegExp(`^${nazwa}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1]

// Tworzy nowy liść na wzór liścia numer 1 tej samej kategorii: podmienia tylko numer
// w tytule, opisie i ścieżkach. Tag trudności zostawiamy taki jak we wzorcu — i tak
// nadpisze go `tag-difficulty.mjs --write`, uruchamiany zawsze po podmianie.
function utworzLisc (nr) {
  const wzorzec = join(KAT_CONTENT, '1', 'index.md')
  if (!existsSync(wzorzec)) {
    console.error(`Nie ma z czego sklonować liścia — brak ${wzorzec}`)
    process.exit(2)
  }
  const tresc = readFileSync(wzorzec, 'utf8')
    .replace(/^(title|description):(.*)\b1\b(.*)$/gm, (_, k, a, b) => `${k}:${a}${nr}${b}`)
    .replace(/^(image|pdf):(.*)$/gm, (m, k, v) => `${k}:${v.replace(/\/1\//, `/${nr}/`).replace(/-1\.(svg|pdf)$/, `-${nr}.$1`)}`)
  mkdirSync(join(KAT_CONTENT, nr), { recursive: true })
  writeFileSync(join(KAT_CONTENT, nr, 'index.md'), tresc, 'utf8')
}

const nowe = []
const plan = []
for (let i = 0; i < zrodla.length; i++) {
  const nr = String(i + 1)
  const index = join(KAT_CONTENT, nr, 'index.md')
  if (!existsSync(index)) {
    if (!DOPISZ) {
      console.error(`Brak liścia ${nr} w ${KAT_CONTENT} — kategoria ma mniej liści niż wybranych plików.`)
      console.error('Dodaj --dopisz-liscie, żeby utworzyć brakujące, albo zmniejsz wybór.')
      process.exit(2)
    }
    nowe.push(nr)
    if (ZAPISZ) utworzLisc(nr)
  }
  // W dry-runie brakujący liść jeszcze nie istnieje, więc jego ścieżki wyliczamy
  // z tego samego wzorca, z którego zostałby utworzony — inaczej podgląd by się wysypał.
  const tresc = existsSync(index)
    ? readFileSync(index, 'utf8')
    : readFileSync(join(KAT_CONTENT, '1', 'index.md'), 'utf8')
        .replace(/^(image|pdf):(.*)$/gm, (m, k, v) => `${k}:${v.replace(/\/1\//, `/${nr}/`).replace(/-1\.(svg|pdf)$/, `-${nr}.$1`)}`)
  const img = pole(tresc, 'image')
  const pdf = pole(tresc, 'pdf')
  if (!img) { console.error(`Liść ${nr} nie ma pola image: w ${index}`); process.exit(2) }
  plan.push({
    nr,
    zrodlo: zrodla[i],
    docelowySvg: join('public', ...img.split('/').filter(Boolean)),
    docelowyPdf: pdf ? join('public', ...pdf.split('/').filter(Boolean)) : null
  })
}

// Ile liści zostaje ze starą zawartością — to jest decyzja do podjęcia osobno,
// skrypt jej nie podejmuje, tylko o niej mówi.
const liscie = readdirSync(KAT_CONTENT).filter(d => /^[0-9]+$/.test(d))
const nietkniete = liscie.length - plan.length

console.log(`Kategoria: ${kategoria}`)
console.log(`Wybranych plików: ${plan.length}, liści w kategorii: ${liscie.length}`)
console.log(`Rozkład trudności: ${plan.map(p => p.zrodlo.trudnosc).join(', ')}`)
console.log('')
for (const p of plan.slice(0, 5)) {
  console.log(`  T${String(p.zrodlo.trudnosc).padStart(2)}  ${p.zrodlo.svg}`)
  console.log(`        → ${p.docelowySvg}`)
}
if (plan.length > 5) console.log(`  … i ${plan.length - 5} kolejnych`)

if (nowe.length) {
  console.log('')
  console.log(`Nowe liście do utworzenia: ${nowe.length} (${nowe[0]}–${nowe[nowe.length - 1]})`)
  console.log('Klonowane z wzorca liścia 1; tag trudności i tak nadpisze tag-difficulty.mjs.')
}

if (nietkniete > 0) {
  console.log('')
  console.log(`UWAGA: ${nietkniete} liści (${plan.length + 1}–${liscie.length}) zostanie ze STARĄ zawartością.`)
  console.log('Skrypt ich nie rusza — usunięcie kategorii z Freepika to osobna decyzja.')
}

if (!ZAPISZ) {
  console.log('\n(--dry-run domyślnie: nic nie zapisano. Dodaj --zapisz, żeby wykonać.)')
  process.exit(0)
}

let ile = 0
for (const p of plan) {
  // Nowe liście nie mają jeszcze katalogu w public/ — istniejące mają, ale mkdir
  // z `recursive` jest bezpieczny w obu przypadkach.
  mkdirSync(dirname(p.docelowySvg), { recursive: true })
  copyFileSync(p.zrodlo.svg, p.docelowySvg)
  if (p.docelowyPdf && existsSync(p.zrodlo.pdf)) copyFileSync(p.zrodlo.pdf, p.docelowyPdf)
  ile++
}
console.log(`\nPodmieniono ${ile} kolorowanek.`)
console.log('Dalej:')
console.log('  node scripts/generate-thumbnails.mjs      # przegeneruj -thumb.webp i -view.webp')
console.log('  node scripts/tag-difficulty.mjs --write   # tagi trudnosc-N pod nowe rysunki')
console.log('  node scripts/health-check.mjs')
