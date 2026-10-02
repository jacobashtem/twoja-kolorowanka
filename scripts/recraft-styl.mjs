// Tworzy WŁASNY styl Recrafta z obrazków referencyjnych (linia V4 Styles).
//
//   node scripts/recraft-styl.mjs --model=recraftv4_styles_vector --match=precise \
//     --nazwa="whimsy-ref" lineart-work/pieski/raw-v3-goly-whimsy/pieski-001-s1.webp ...
//   node scripts/recraft-styl.mjs --lista=lineart-work/halloween/_referencje.txt
//
// Po co: od sierpnia 2026 Recraft ma linię `recraftv4_styles*`, w której styl nie jest
// nazwą z listy ani UUID-em z panelu, tylko czymś, co budujesz sam z 1–10 własnych
// obrazków (PNG/JPG/WEBP, bez treningu, $0.005 raz). Dostajesz `style_id` i generujesz
// z nim na `recraftv4_styles` (raster $0.035) albo `recraftv4_styles_vector` (natywny
// SVG $0.05). Pierwszy taki styl powstał doraźnie w scratchpadzie przy pilocie mandal
// (2026-09-11) i przepadł razem z sesją — stąd ten plik.
//
// Co warto wiedzieć, zanim wyślesz referencje:
//   • Styl ZAPISUJE model, z którym go stworzono, i trzeba go używać z TYM SAMYM modelem.
//     Styl pod `recraftv4_styles_vector` nie zadziała na rastrze i odwrotnie.
//   • `match` jest zapisywany w stylu (`flexible` domyślnie dla V4), ale generator może go
//     nadpisać per żądanie flagą `--style-match=`. Jeden styl wystarczy na A/B obu trybów.
//   • `precise` kopiuje też KOMPOZYCJĘ referencji — przy mandalach sześć okrągłych
//     referencji zjadło temat (motyl wyszedł jako rozeta). Referencje mają być różne
//     tematycznie, a wspólne tylko SPOSOBEM RYSOWANIA.
//   • Styl odtwarza grubość kreski z referencji. Chcesz grubą kreskę — daj grube referencje.
//   • Nie ma endpointu do listowania stylów. ID z odpowiedzi trzeba od razu wpisać do
//     `prompty/style.mjs`, inaczej przepada.
import { readFileSync, existsSync } from 'node:fs'
import { basename, extname } from 'node:path'

function wczytajEnv () {
  try {
    for (const linia of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const m = linia.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (!m || linia.trimStart().startsWith('#')) continue
      if (!process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch { /* brak .env — klucz może być w środowisku */ }
}
wczytajEnv()

const argv = process.argv.slice(2)
const flaga = (n, d) => (argv.find(a => a.startsWith(`--${n}=`)) ?? `--${n}=${d}`).split('=').slice(1).join('=')
const MODEL = flaga('model', 'recraftv4_styles_vector')
const MATCH = flaga('match', '')          // '' = domyślny modelu (flexible dla V4)
const NAZWA = flaga('nazwa', '')
const LISTA = flaga('lista', '')
const DRY   = argv.includes('--dry-run')

let pliki = argv.filter(a => !a.startsWith('--'))
if (LISTA) {
  pliki.push(...readFileSync(LISTA, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#')))
}
pliki = [...new Set(pliki)]

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }
if (!pliki.length || pliki.length > 10) {
  console.error('Podaj od 1 do 10 obrazków referencyjnych (PNG/JPG/WEBP), jako argumenty albo przez --lista=plik.txt')
  process.exit(2)
}
for (const p of pliki) {
  if (!existsSync(p)) { console.error(`Nie ma pliku: ${p}`); process.exit(2) }
  if (!MIME[extname(p).toLowerCase()]) { console.error(`Nieobsługiwany format (tylko PNG/JPG/WEBP): ${p}`); process.exit(2) }
}
if (MATCH && !['flexible', 'precise', 'regular'].includes(MATCH)) {
  console.error('--match= przyjmuje flexible | precise (V4) albo regular (V2/V3)')
  process.exit(2)
}

console.log(`Model stylu: ${MODEL}${MATCH ? `, match: ${MATCH}` : ' (match domyślny)'}`)
console.log(`Referencje (${pliki.length}):`)
for (const p of pliki) console.log(`  ${p}`)

if (DRY) { console.log('\n--dry-run: nic nie wysłano (koszt byłby $0.005).'); process.exit(0) }

const token = process.env.RECRAFT_API_TOKEN
if (!token) { console.error('Brak RECRAFT_API_TOKEN (plik .env)'); process.exit(2) }

// Multipart: nazwy pól plików są dowolne, liczy się tylko to, że są częściami plikowymi.
const form = new FormData()
form.append('model', MODEL)
if (MATCH) form.append('match', MATCH)
pliki.forEach((p, i) => {
  const buf = readFileSync(p)
  form.append(`file${i + 1}`, new Blob([buf], { type: MIME[extname(p).toLowerCase()] }), basename(p))
})

const res = await fetch('https://external.api.recraft.ai/v1/styles', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form
})
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`)
  process.exit(1)
}
const json = await res.json()
console.log('\nOdpowiedź API:', JSON.stringify(json))
console.log(`\nSTYLE ID: ${json.id}   (zużyto ${json.credits ?? '?'} units)`)

// Gotowy rekord do wklejenia — bo ID, którego nie zapiszesz od razu, przepada.
const klucz = (NAZWA || 'wlasny').replace(/[^a-z0-9]+/gi, '_')
const wektor = /_vector$/.test(MODEL)
console.log(`\nDo prompty/style.mjs:\n`)
console.log(`  ${klucz}: {
    id: '${json.id}',
    nazwa: '${NAZWA || 'Własny styl V4'}',
    modelId: '${MODEL}',
    model: '${wektor ? 'v4s-vector' : 'v4s'}',
    cena: ${wektor ? 0.05 : 0.035},${wektor ? '\n    natywnySvg: true,' : ''}
    // referencje: ${pliki.map(p => basename(p)).join(', ')}${MATCH ? `; match zapisany: ${MATCH}` : ''}
    uwaga: 'nowy — bez werdyktu'
  },`)
