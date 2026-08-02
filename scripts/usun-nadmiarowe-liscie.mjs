// Usuwa liście, które zostały po podmianie kategorii na własne grafiki.
//
// Po co osobny skrypt: `podmien-kategorie.mjs` celowo NIE rusza nadmiaru — wypisuje tylko
// "UWAGA: N liści zostanie ze STARĄ zawartością", bo to jest decyzja, a nie technikalium.
// Kiedy decyzja już zapadła (u nas: wychodzimy z Freepika całkowicie), usunięcie trzeba
// zrobić po obu stronach naraz — w `content/` i w `public/` — inaczej zostają albo strony
// bez plików, albo pliki bez stron. Health-check łapie jedno i drugie, ale po fakcie.
//
// Użycie:
//   node scripts/usun-nadmiarowe-liscie.mjs fantasy/wrozki --lista=lineart-work/wrozki/_wybor.txt
//   node scripts/usun-nadmiarowe-liscie.mjs fantasy/wrozki --zostaw=54 --zapisz
//
// Domyślnie dry-run. Wszystko jest w gicie, więc odwracalne — ale ilość plików jest taka,
// że warto najpierw zobaczyć plan.
import { readFileSync, readdirSync, existsSync, rmSync, statSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'

const argv = process.argv.slice(2)
const kategoria = argv.find(a => !a.startsWith('--'))
const LISTA = (argv.find(a => a.startsWith('--lista=')) ?? '').split('=')[1] || ''
const ZOSTAW_ARG = (argv.find(a => a.startsWith('--zostaw=')) ?? '').split('=')[1] || ''
const ZAPISZ = argv.includes('--zapisz')

// Furtka na wypadek świadomego zejścia poniżej progu copy. Osobna flaga, żeby zejście
// poniżej minimum nigdy nie wydarzyło się przez przeoczenie.
const MIMO_PROGU = argv.includes('--mimo-progu')

if (!kategoria || (!LISTA && !ZOSTAW_ARG)) {
  console.error('Użycie: node scripts/usun-nadmiarowe-liscie.mjs <kategoria> (--lista=plik.txt | --zostaw=N) [--zapisz]')
  console.error('Przykład: node scripts/usun-nadmiarowe-liscie.mjs fantasy/wrozki \\')
  console.error('            --lista=lineart-work/wrozki/_wybor.txt --zapisz')
  process.exit(2)
}

const KAT_CONTENT = join('content', kategoria)
if (!existsSync(KAT_CONTENT)) { console.error(`Brak kategorii w content: ${KAT_CONTENT}`); process.exit(2) }

// Ile liści zostaje. Z listy selekcji, bo to ona zdecydowała, ilu liściom podmieniono
// zawartość — ręczne przepisywanie tej liczby to okazja do pomyłki o jeden.
const ZOSTAW = LISTA
  ? readFileSync(LISTA, 'utf8').split(/\r?\n/).filter(s => s.trim()).length
  : Number(ZOSTAW_ARG)
if (!Number.isInteger(ZOSTAW) || ZOSTAW < 1) { console.error(`Bezsensowna liczba liści do zostawienia: ${ZOSTAW}`); process.exit(2) }

// ── Próg z copy ─────────────────────────────────────────────────────────────
// Ta sama zasada co w stat-kategorie.mjs: strona wplata po cztery kafelki pod każdą
// sekcją H2, więc kategoria poniżej `sekcje × 4` pokaże ostatnie sekcje z nagłówkiem
// i PUSTĄ galerią. MUSI się zgadzać z `KAFLI_NA_SEKCJE` w pages/[...slug].vue.
const KAFLI_NA_SEKCJE = 4
const body = readFileSync(join(KAT_CONTENT, 'index.md'), 'utf8').replace(/^---[\s\S]*?\n---\n/, '')
const h2 = (body.match(/^##\s+\S/gm) ?? []).length
const minimum = h2 * KAFLI_NA_SEKCJE

const liscie = readdirSync(KAT_CONTENT)
  .filter(d => /^[0-9]+$/.test(d))
  .sort((a, b) => Number(a) - Number(b))

const doUsuniecia = liscie.filter(n => Number(n) > ZOSTAW)

console.log(`Kategoria: ${kategoria}`)
console.log(`Liści teraz: ${liscie.length}, zostaje: ${ZOSTAW}, do usunięcia: ${doUsuniecia.length}`)
console.log(`Sekcje H2: ${h2} → minimum ${minimum} kolorowanek`)

if (ZOSTAW < minimum) {
  console.error(`\nSTOP: ${ZOSTAW} to mniej niż wymagane ${minimum}.`)
  console.error('Ostatnie sekcje SEO zostałyby z nagłówkiem i pustą galerią pod spodem.')
  if (!MIMO_PROGU) { console.error('Jeśli to jednak świadoma decyzja, dodaj --mimo-progu.'); process.exit(2) }
  console.error('--mimo-progu: lecimy dalej mimo progu.\n')
}

if (!doUsuniecia.length) { console.log('\nNic do usunięcia.'); process.exit(0) }

const pole = (tresc, nazwa) => tresc.match(new RegExp(`^${nazwa}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1]

// Ścieżki w public/ bierzemy z pola `image:` KAŻDEGO liścia, nigdy ze składania nazwy
// kategorii — cztery kategorie (koty, koniki, kroliczki, pieski) leżą w public/ płasko,
// bez przedrostka `zwierzeta/`, i zgadywanie już raz dało fałszywy alarm o 304 liściach.
const plan = []
for (const nr of doUsuniecia) {
  const tresc = readFileSync(join(KAT_CONTENT, nr, 'index.md'), 'utf8')
  const img = pole(tresc, 'image')
  if (!img) { console.error(`Liść ${nr} nie ma pola image: — przerywam, żeby nie zgadywać.`); process.exit(2) }

  const svg = join('public', ...img.split('/').filter(Boolean))
  const bezRozszerzenia = svg.slice(0, -extname(svg).length)
  const pdfPole = pole(tresc, 'pdf')

  // Miniatury nie są nigdzie zapisane we frontmatterze — generate-thumbnails.mjs kładzie
  // je obok źródła pod stałym sufiksem, więc tu odtwarzamy tę samą konwencję.
  const pliki = [svg, `${bezRozszerzenia}-thumb.webp`, `${bezRozszerzenia}-view.webp`]
  if (pdfPole) pliki.push(join('public', ...pdfPole.split('/').filter(Boolean)))

  // Jeśli katalog w public/ należy wyłącznie do tego liścia (kończy się jego numerem),
  // kasujemy cały katalog — inaczej zostałyby w nim sieroty spoza powyższej czwórki.
  // W przeciwnym razie ruszamy wyłącznie wyliczone pliki.
  const katalog = dirname(svg)
  const katalogLiscia = katalog.replace(/\\/g, '/').endsWith(`/${nr}`)

  plan.push({ nr, katalog, katalogLiscia, pliki: pliki.filter(existsSync) })
}

const wagaMB = plan.reduce((s, p) => s + p.pliki.reduce((t, f) => t + statSync(f).size, 0), 0) / 1024 / 1024
const plikow = plan.reduce((s, p) => s + p.pliki.length, 0)

console.log(`\nDo usunięcia: ${plan.length} liści = ${plan.length} katalogów w content/ + ${plikow} plików w public/ (${wagaMB.toFixed(1)} MB)`)
console.log(`Numery: ${doUsuniecia[0]}–${doUsuniecia[doUsuniecia.length - 1]}`)
for (const p of plan.slice(0, 3)) {
  console.log(`  ${kategoria}/${p.nr}  →  ${p.katalogLiscia ? p.katalog + '\\ (cały katalog)' : p.pliki.join(', ')}`)
}
if (plan.length > 3) console.log(`  … i ${plan.length - 3} kolejnych`)

if (!ZAPISZ) {
  console.log('\n(dry-run: nic nie usunięto. Dodaj --zapisz, żeby wykonać.)')
  process.exit(0)
}

let usunieteLiscie = 0, usunietePliki = 0
for (const p of plan) {
  if (p.katalogLiscia && existsSync(p.katalog)) {
    rmSync(p.katalog, { recursive: true, force: true })
    usunietePliki += p.pliki.length
  } else {
    for (const f of p.pliki) { rmSync(f, { force: true }); usunietePliki++ }
  }
  rmSync(join(KAT_CONTENT, p.nr), { recursive: true, force: true })
  usunieteLiscie++
}

console.log(`\nUsunięto ${usunieteLiscie} liści i ${usunietePliki} plików z public/.`)
console.log('Dalej:')
console.log('  node scripts/health-check.mjs      # czy nie zostały sieroty')
console.log('  pnpm build                         # odtworzy prerender-routes.json')
