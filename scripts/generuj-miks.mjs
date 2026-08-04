// GENEROWANIE KATEGORII W MIKSIE STYLÓW — jedno polecenie zamiast trzech.
//
//   node scripts/generuj-miks.mjs fantasy/syrenki --count=48 --dry-run
//   node scripts/generuj-miks.mjs fantasy/syrenki --count=48
//
// Po co: seria kategorii to nie jeden styl, tylko ustalony miks (patrz `prompty/style.mjs`).
// Odpalanie go z ręki wymagało trzech wywołań `lineart-generate.mjs`, w każdym trzeba było
// pamiętać UUID stylu, dopasować `--model-id` do rastra i — najłatwiejsze do pomylenia —
// wyliczyć `--od` tak, żeby serie nie dostały tych samych kombinacji wariant×scena.
// Przy 60 kategoriach, które jeszcze przed nami, to sześćdziesiąt okazji na cichy błąd.
//
// JAK DZIELIMY PRZESTRZEŃ KOMBINACJI. `lineart-generate.mjs` liczy indeks jako
// `idx = OD + i*KROK`, a z niego wariant (`idx % 12`) i scenę (`idx / 12 % 12`).
// Zamiast szukać dla każdego stylu osobnego `--od` i sprawdzać kolizje, traktujemy cały
// miks jako JEDEN ciągły przebieg 0, 13, 26, ... i kroimy go na kawałki: stylowi n-temu
// dajemy `--od` równe (liczba sztuk przed nim) × KROK. Kombinacje nie mogą się wtedy
// powtórzyć z definicji, bo to wciąż ten sam nieprzerwany ciąg. Warunek: suma sztuk
// nie większa niż 12×12 = 144 (przy 48 mamy trzykrotny zapas).
//
// Kolejność stylów w miksie ma znaczenie dla `--od`, więc jest stała — zmiana kolejności
// przesuwa przydział scen, ale nadal nie powoduje kolizji.

import { spawnSync } from 'node:child_process'
import { STYLE, MIKS, podzialMiksu, SERIA_DOMYSLNA } from '../prompty/style.mjs'

const argv = process.argv.slice(2)
const kategoria = argv.find(a => !a.startsWith('--'))
const flaga = (n, d) => (argv.find(a => a.startsWith(`--${n}=`)) ?? `--${n}=${d}`).split('=').slice(1).join('=')

const COUNT = Number(flaga('count', SERIA_DOMYSLNA))
const KROK = Number(flaga('krok', 13))
const DRY = argv.includes('--dry-run')
const KLUCZE = flaga('miks', MIKS.join(',')).split(',').filter(Boolean)
// --od-start=N przesuwa CAŁY miks w przestrzeni kombinacji. Potrzebne przy dogrywce:
// jeśli kategoria ma już serię na sztukach 0..47, to uzupełnienie musi zacząć od 48×KROK,
// inaczej dostanie te same pary wariant×scena co materiał, który już leży na dysku.
const OD_START = Number(flaga('od-start', 0))

if (!kategoria) {
  console.error('Podaj kategorię, np. node scripts/generuj-miks.mjs fantasy/syrenki --count=48')
  process.exit(2)
}
for (const k of KLUCZE) {
  if (!STYLE[k]) {
    console.error(`Nieznany styl: ${k}. Dostępne: ${Object.keys(STYLE).join(', ')}`)
    process.exit(2)
  }
}
// Przestrzeń ma 12 wariantów × 12 scen = 144 pary, a ciąg idx = OD + i×KROK przechodzi
// przez nie bez powtórki dopiero do 144. Liczy się pozycja startowa RAZEM z dogrywkami.
const pozycjaStartu = OD_START / KROK
if (pozycjaStartu + COUNT > 144) {
  console.error(`Start na pozycji ${pozycjaStartu} + ${COUNT} sztuk przekracza 144 kombinacje (12 wariantów × 12 scen).`)
  console.error('Powyżej tego progu serie zaczęłyby dostawać powtórzone pary wariant×scena.')
  process.exit(2)
}

// Flagi, których wrapper nie interpretuje, lecą do generatora bez zmian (--goly, --zestaw=...).
const wlasne = ['--count=', '--krok=', '--miks=', '--od-start=', '--dry-run']
const przekazane = argv.filter(a => a.startsWith('--') && !wlasne.some(w => a.startsWith(w)))

const podzial = podzialMiksu(COUNT, KLUCZE).filter(p => p.ile > 0)

// Sufit 48 nie jest twardy — czasem trzeba dograć odrzuty — ale przekroczenie go bez
// świadomej decyzji oznacza zwykle, że ktoś (ja) podał `--count` na oko. Ostrzegamy,
// bo kosztem nie są tu kredyty, tylko czas selekcji okiem.
if (COUNT > SERIA_DOMYSLNA) {
  console.warn(`⚠ --count=${COUNT} przekracza ustaloną serię ${SERIA_DOMYSLNA}. `
    + 'Selekcja okiem jest wąskim gardłem — upewnij się, że to celowe.\n')
}

console.log(`Kategoria: ${kategoria}`)
console.log(`Miks na ${COUNT} sztuk (podział z prompty/style.mjs):\n`)
let od = OD_START
const plan = podzial.map(({ styl, ile }) => {
  const s = STYLE[styl]
  const wpis = { styl, ile, od, s }
  console.log(`  ${String(ile).padStart(3)} × ${s.nazwa.padEnd(28)} --od=${String(od).padEnd(5)} ${s.uwaga ? '· ' + s.uwaga : ''}`)
  od += ile * KROK
  return wpis
})

// Cena liczona PER STYL: panelowe to raster za $0.04, wbudowany „Line art" ma cenę
// swojego modelu wektorowego ($0.08 dla V3, $0.04 dla V2). `lineart-generate.mjs --dry-run`
// pokazuje zawsze cenę z `--model=`, więc przy stylach panelowych zawyża dwukrotnie.
const koszt = plan.reduce((s, { ile, s: st }) => s + ile * (st.cena ?? 0.04), 0)
console.log(`\nKoszt generacji: $${koszt.toFixed(2)} (~${(koszt * 4).toFixed(0)} zł)`)
const doWektoryzacji = plan.filter(p => !p.s.wbudowany).reduce((s, p) => s + p.ile, 0)
console.log(`Wektoryzacja doliczy się po selekcji ($0.01/szt.), ale tylko dla stylów rastrowych`)
console.log(`— ${COUNT - doWektoryzacji} szt. wraca już jako natywny SVG.`)

if (DRY) {
  console.log('\n--dry-run: pokazuję prompty każdej serii, nic nie wysyłam.\n')
}

for (const { styl, ile, od, s } of plan) {
  // Dwa różne kształty wywołania. Styl panelowy identyfikuje się UUID-em i MUSI dostać
  // rastrowy `--model-id`, inaczej API po cichu zwraca zdegradowaną kreskę. Wbudowany
  // „Line art" nie ma UUID-a — jego nazwę generator bierze sam z tablicy MODELE, gdy
  // podamy `--model=v3` albo `--model=v2`, więc nie wolno mu dokładać `--style-id`
  // ani `--model-id` (te dwa pola wykluczają się z `style` po stronie API).
  const styloweFlagi = s.wbudowany
    ? [`--model=${s.model}`]
    : [`--style-id=${s.id}`, `--model-id=${s.modelId}`]
  const args = [
    'scripts/lineart-generate.mjs', kategoria,
    `--count=${ile}`, `--krok=${KROK}`, `--od=${od}`,
    ...styloweFlagi, `--nazwa=${styl}`,
    ...przekazane, ...(DRY ? ['--dry-run'] : [])
  ]
  console.log(`\n${'─'.repeat(70)}\n▶ ${s.nazwa} — ${ile} szt.\n${'─'.repeat(70)}`)
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' })
  if (r.status !== 0) {
    console.error(`\nSeria "${s.nazwa}" zakończyła się kodem ${r.status}. Przerywam miks.`)
    console.error('Serie wcześniejsze zostały wygenerowane — po naprawie dogeneruj tylko brakujące style przez --miks=.')
    process.exit(r.status ?? 1)
  }
}

console.log(`\n${'═'.repeat(70)}`)
console.log('Miks gotowy. Dalej:')
console.log(`  node scripts/validate-lineart.mjs lineart-work/${kategoria.split('/').pop()}`)
console.log(`  node scripts/galeria.mjs lineart-work/${kategoria.split('/').pop()} --wybor --sort=trudnosc --kolumny=5 --serwer`)
