// Sonda do API Recrafta: sprawdza, które kombinacje model + styl faktycznie działają,
// i zapisuje udane wyniki obok siebie do porównania wzrokiem.
//
// Kontekst (z dokumentacji Recrafta):
//   "Styles are not yet supported for V4 models" — cała rodzina V4/V4.1 ignoruje `style`.
//   Sterowanie stylem mają tylko V3 i V2, przez CZYTELNE NAZWY ("Line art"), nie snake_case.
//   Modele wektorowe (_vector) zwracają SVG, reszta raster.
//
// Odrzucone kombinacje kończą się błędem 400 i NIC NIE KOSZTUJĄ — płacisz wyłącznie
// za te, które wygenerują obrazek. Najcenniejszy jest efekt uboczny: komplet próbek
// na tym samym motywie, więc widzisz, który styl naprawdę wygląda jak kolorowanka.
//
// Użycie:
//   node scripts/recraft-probe.mjs
//   node scripts/recraft-probe.mjs --prompt="a chameleon with a curled tail"
//   node scripts/recraft-probe.mjs --tanio     # pomija drogie warianty Pro
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Klucz z .env (ten sam mechanizm co w lineart-generate.mjs)
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

const argv   = process.argv.slice(2)
const PROMPT = (argv.find(a => a.startsWith('--prompt=')) ?? '--prompt=a chameleon with a curled spiral tail, full body, white background')
  .split('=').slice(1).join('=')
const TANIO  = argv.includes('--tanio')

// styl pusty = pole `style` nie jest wysyłane (model użyje domyślnego)
const KOMBINACJE = [
  // V3 Vector — jedyna ścieżka z realną kontrolą nad kreską. Główny kandydat: "Line art".
  { model: 'recraftv3_vector', styl: 'Line art',       cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Vector art',     cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Engraving',      cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Linocut',        cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Bold stroke',    cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Thin',           cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Marker outline', cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Sharp contrast', cena: 0.08 },
  { model: 'recraftv3_vector', styl: 'Cutout',         cena: 0.08 },

  // V2 Vector — ma własne "Line art" oraz "Doodle Line art"
  { model: 'recraftv2_vector', styl: 'Line art',        cena: 0.04 },
  { model: 'recraftv2_vector', styl: 'Doodle Line art', cena: 0.04 },

  // RASTER V3 — modele rastrowe są o połowę tańsze (40 units zamiast 80). Jeśli któryś
  // styl da czystą kreskę, wektoryzację zrobi za darmo potrace i koszt projektu spada
  // dwukrotnie. "Line art" nie występuje w stylach rastrowych, więc szukamy zamienników.
  { model: 'recraftv3', styl: 'Outline details', cena: 0.04, raster: true },
  { model: 'recraftv3', styl: 'Bold Sketch',     cena: 0.04, raster: true },
  { model: 'recraftv3', styl: 'Child book',      cena: 0.04, raster: true },

  // V4/V4.1 — bez stylu, sprawdzamy jak wygląda ich domyślna kreska wektorowa.
  // Identyfikatory z PODKREŚLNIKAMI (recraftv4_1_*), zapis z kropką nie istnieje.
  { model: 'recraftv4_1_vector',         styl: '', cena: 0.08 },
  { model: 'recraftv4_1_utility_vector', styl: '', cena: 0.08 },
  { model: 'recraftv4_vector',           styl: '', cena: 0.08 },
  { model: 'recraftv4_1_pro_vector',     styl: '', cena: 0.30, drogi: true }
]

// --tylko=v4 ogranicza przebieg do modeli pasujących do wzorca — żeby nie płacić
// ponownie za kombinacje, które już przebadaliśmy.
const TYLKO = (argv.find(a => a.startsWith('--tylko=')) ?? '').split('=')[1]
const TYLKO_RASTER = argv.includes('--raster')
const doTestu = KOMBINACJE
  .filter(k => !(TANIO && k.drogi))
  .filter(k => !TYLKO || k.model.includes(TYLKO))
  .filter(k => !TYLKO_RASTER || k.raster)

// Format rozpoznajemy po ZAWARTOŚCI, nie po URL-u — adresy Recrafta bywają bez rozszerzenia
// (podpisane linki), a zgadywanie kończyło się plikami .bin, których nie czytał żaden skrypt.
function rozpoznajFormat (buf) {
  const glowa = buf.subarray(0, 200).toString('latin1').trimStart()
  if (glowa.startsWith('<svg') || glowa.startsWith('<?xml')) return 'svg'
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png'
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'jpg'
  if (glowa.startsWith('RIFF')) return 'webp'
  return 'bin'
}

const OUT = join('lineart-work', '_probe')
mkdirSync(OUT, { recursive: true })

const wyniki = []
let wydano = 0

for (const k of doTestu) {
  const etykieta = `${k.model}${k.styl ? ` + "${k.styl}"` : ' (bez stylu)'}`
  // Modele wektorowe przyjmują PROPORCJE, nie piksele. 10:14 ≈ A4 pionowo.
  const body = { prompt: PROMPT, model: k.model, size: '10:14', n: 1 }
  if (k.styl) body.style = k.styl

  try {
    const res = await fetch('https://external.api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (res.status === 429) {
      console.log(`LIMIT   ${etykieta} — pauza 10s, pozycja do powtórzenia`)
      await new Promise(r => setTimeout(r, 10000))
      wyniki.push({ etykieta, ok: false, info: '429 — powtórz sondę' })
      continue
    }

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const info = json?.message || `HTTP ${res.status}`
      console.log(`BŁĄD    ${etykieta}\n          → ${info}`)
      wyniki.push({ etykieta, ok: false, info })
      continue
    }

    const url = json?.data?.[0]?.url
    if (!url) {
      wyniki.push({ etykieta, ok: false, info: 'brak URL w odpowiedzi' })
      continue
    }

    const plik = await fetch(url)
    const buf = Buffer.from(await plik.arrayBuffer())
    const ext = rozpoznajFormat(buf)
    const nazwa = `${k.model}__${(k.styl || 'domyslny').replace(/\s+/g, '-')}.${ext}`
    writeFileSync(join(OUT, nazwa), buf)
    wydano += k.cena

    console.log(`OK      ${etykieta}  → ${nazwa}`)
    wyniki.push({ etykieta, ok: true, info: nazwa, wektor: ext === 'svg' })
  } catch (e) {
    console.log(`BŁĄD    ${etykieta}\n          → ${e.message}`)
    wyniki.push({ etykieta, ok: false, info: e.message })
  }

  await new Promise(r => setTimeout(r, 1500)) // Recraft odbija przy zapytaniach seriami
}

const dziala = wyniki.filter(w => w.ok)
console.log(`\n── Podsumowanie ─────────────────────────────`)
console.log(`Działających kombinacji: ${dziala.length} z ${wyniki.length}`)
for (const w of dziala) console.log(`  ${w.etykieta}${w.wektor ? '  [SVG]' : '  [raster]'}  → ${w.info}`)
console.log(`\nWydano: ~$${wydano.toFixed(2)}`)
console.log(`Próbki: ${OUT}`)
console.log(`\nObejrzyj je i wybierz tę, która najbardziej przypomina kolorowankę:`)
console.log(`  node scripts/contact-sheet.mjs ${OUT} --cols=4 --rows=4`)
