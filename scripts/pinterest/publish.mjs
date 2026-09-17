// Automatyczna publikacja pinow przez Pinterest API v5 (Etap 5 roadmapy).
//
// Uzycie: node scripts/pinterest/publish.mjs [--count N] [--dry-run] [--sandbox]
//   --count N   ile pinow opublikowac (domyslnie 4)
//   --dry-run   pokaz co by poszlo, bez wywolan API i bez zmiany stanu
//   --sandbox   boardy i piny przez api-sandbox.pinterest.com (widoczne tylko dla wlasciciela konta);
//               jedyne, co wolno aplikacji z dostepem Trial. Stan kolejki NIE jest zapisywany,
//               bo to nie sa prawdziwe piny. Sluzy do nagrania wideo do wniosku o Standard access.
//
// Autoryzacja (jedno z dwoch):
//   - lokalnie: .pinterest-token.json z scripts/pinterest/auth.mjs
//   - CI: env PINTEREST_APP_ID + PINTEREST_APP_SECRET + PINTEREST_REFRESH_TOKEN
//
// Kolejka: leafy content/ z kategorii W CALOSCI z wlasnych grafik (ownCategories w lib.mjs)
// minus data/pinterest-state.json (published). Kategorie ze stocka nie dostaja pinow - decyzja
// z 2026-09-17; filtr jest mierzony po plikach, wiec nowo podmieniona kategoria wchodzi sama.
// Wybor round-robin po kategoriach (roznorodnosc dzienna). Boardy wg data/pinterest-boards.json,
// brakujace tworzy przez API. Grafika pinu komponowana in-memory (image_base64) - zero hostingu.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, walkLeafs, pinMeta, composePin, loadEnv, categoryOf, ownCategories } from './lib.mjs'

loadEnv()

const SANDBOX = process.argv.includes('--sandbox')
// Sandbox ma osobne tokeny (auth.mjs --sandbox) - produkcyjny access token dostaje tam 401.
const API = SANDBOX ? 'https://api-sandbox.pinterest.com/v5' : 'https://api.pinterest.com/v5'
const TOKEN_FILE = SANDBOX ? '.pinterest-token-sandbox.json' : '.pinterest-token.json'
const COUNT = (() => { const i = process.argv.indexOf('--count'); return i > -1 ? Number(process.argv[i + 1]) || 4 : 4 })()
const DRY = process.argv.includes('--dry-run')
const STATE_FILE = join(ROOT, 'data', 'pinterest-state.json')
const BOARDS_FILE = join(ROOT, 'data', 'pinterest-boards.json')

// --- token ---
async function accessToken () {
  const id = process.env.PINTEREST_APP_ID
  const secret = process.env.PINTEREST_APP_SECRET
  let refresh = SANDBOX ? null : process.env.PINTEREST_REFRESH_TOKEN
  if (!refresh) {
    const f = join(ROOT, TOKEN_FILE)
    if (!existsSync(f)) throw new Error(`Brak ${TOKEN_FILE}${SANDBOX ? '' : ' i env PINTEREST_REFRESH_TOKEN'} - odpal scripts/pinterest/auth.mjs${SANDBOX ? ' --sandbox' : ''}`)
    refresh = JSON.parse(readFileSync(f, 'utf8')).refresh_token
  }
  if (!id || !secret) throw new Error('Ustaw PINTEREST_APP_ID i PINTEREST_APP_SECRET')
  const r = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  })
  const tok = await r.json()
  if (!tok.access_token) throw new Error('Refresh nieudany: ' + JSON.stringify(tok))
  return tok.access_token
}

async function api (token, method, path, body) {
  const r = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${JSON.stringify(data).slice(0, 300)}`)
  return data
}

// --- kolejka: round-robin po kategoriach ---
const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
const publishedSet = new Set(state.published.map(p => p.path))
const boardsMap = JSON.parse(readFileSync(BOARDS_FILE, 'utf8'))

const allLeafs = walkLeafs()
const own = ownCategories(allLeafs)
const eligible = allLeafs
  .map(dir => ({ dir, cat: categoryOf(dir), rel: dir.replace(/\\/g, '/').split('/content/')[1] }))
  .filter(x => x.rel && own.has(x.cat))
const pending = eligible.filter(x => !publishedSet.has(x.rel))
console.log(`Kategorie wlasne (Recraft): ${own.size} z ${new Set(allLeafs.map(categoryOf)).size}, ` +
  `lisci do pinowania: ${eligible.length} (pominietych ze stocka: ${allLeafs.length - eligible.length}), ` +
  `opublikowanych: ${eligible.length - pending.length}`)

const byCat = new Map()
for (const x of pending) {
  if (!byCat.has(x.cat)) byCat.set(x.cat, [])
  byCat.get(x.cat).push(x)
}
const cats = [...byCat.keys()]
const offset = state.published.length   // przesuwa start rotacji miedzy uruchomieniami
const picked = []
for (let i = 0; picked.length < COUNT && pending.length; i++) {
  const cat = cats[(offset + i) % cats.length]
  const list = byCat.get(cat)
  if (list && list.length) picked.push(list.shift())
  if (i > cats.length * (COUNT + 2)) break
}

if (!picked.length) { console.log('Kolejka pusta - wszystko opublikowane.'); process.exit(0) }
console.log(`Do publikacji (${picked.length})${SANDBOX ? ' [SANDBOX]' : ''}:\n` + picked.map(p => '  ' + p.rel).join('\n'))
if (DRY) { console.log('DRY RUN - koniec.'); process.exit(0) }

// --- publikacja ---
const token = await accessToken()

// boardy: nazwa -> id (tworzenie brakujacych). Klucz w JSON: pelna sciezka kategorii
// ("zwierzeta/koty"), potem pierwszy segment ("zwierzeta"), na koncu _default.
const existing = new Map()
let bookmark
do {
  const page = await api(token, 'GET', '/boards?page_size=100' + (bookmark ? `&bookmark=${bookmark}` : ''))
  for (const b of page.items || []) existing.set(b.name.toLowerCase(), b.id)
  bookmark = page.bookmark
} while (bookmark)

async function boardId (cat) {
  const name = boardsMap[cat] || boardsMap[cat.split('/')[0]] || boardsMap._default
  const key = name.toLowerCase()
  if (!existing.has(key)) {
    const temat = name.replace(/^Kolorowanki\s+/i, '')
    const b = await api(token, 'POST', '/boards', {
      name,
      description: `Darmowe kolorowanki ${temat} do druku (PDF) i do kolorowania online – twoja-kolorowanka.pl`,
    })
    existing.set(key, b.id)
    console.log(`Utworzono board: ${name}`)
  }
  return existing.get(key)
}

let ok = 0
const errors = []
for (const { dir, rel, cat } of picked) {
  const meta = pinMeta(dir)
  if (!meta) { errors.push(`${rel}: brak zrodla obrazka`); continue }
  try {
    const jpg = await composePin(meta)
    const pin = await api(token, 'POST', '/pins', {
      board_id: await boardId(cat),
      title: meta.titleLines.join(' ').slice(0, 100),
      description: meta.description.slice(0, 500),
      link: meta.link,
      media_source: { source_type: 'image_base64', content_type: 'image/jpeg', data: jpg.toString('base64') },
    })
    state.published.push({ path: rel, pin_id: pin.id, at: new Date().toISOString() })
    ok++
    console.log(`OK ${rel} -> pin ${pin.id}`)
  } catch (e) {
    errors.push(`${rel}: ${e.message}`)
  }
}

if (SANDBOX) console.log('SANDBOX: stan kolejki nie zapisany, te piny nie liczą się jako opublikowane.')
else writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n')
console.log(`Opublikowano ${ok}/${picked.length}. W kolejce zostalo: ${pending.length - ok}.`)
if (errors.length) { console.log('BLEDY:\n' + errors.join('\n')); process.exitCode = 1 }
