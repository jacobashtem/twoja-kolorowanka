// Tygodniowy health-check serwisu (Etap 8 roadmapy). Uruchom: node scripts/health-check.mjs [--remote]
//
// Sprawdza lokalnie (repo jako zrodlo prawdy):
//   1. canonical: kazdego pliku content/** wskazuje istniejaca strone (istnieje content/<path>/index.md)
//   2. pliki z frontmatter (image/pdf/heroImg*) istnieja w public/
//   3. kazdy SVG z frontmatter ma podglady -thumb.webp i -view.webp
//   4. kazdy leaf (content/**/<liczba>/index.md) ma komplet: image + pdf
//
// Z flaga --remote dodatkowo: pobiera sitemape z produkcji i sprawdza, czy kazdy URL zwraca 200.
//
// Exit code 1 przy jakimkolwiek bledzie -> nadaje sie do crona (GitHub Actions) z alertem.
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const CONTENT = join(ROOT, 'content')
const PUBLIC = join(ROOT, 'public')
const SITE = 'https://twoja-kolorowanka.pl'
const REMOTE = process.argv.includes('--remote')

const errors = []
const warnings = []

// --- zbierz wszystkie pliki .md z content/ ---
const mdFiles = []
;(function walk (dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.md')) mdFiles.push(p)
  }
})(CONTENT)

// Minimalny parser frontmattera: klucz: wartosc (bez zagniezdzen - faqs itp. pomijamy)
function frontmatter (file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  if (lines[0] !== '---') return {}
  const fm = {}
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') break
    const m = lines[i].match(/^([A-Za-z_][\w]*):\s*(.+?)\s*$/)
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return fm
}

const rel = p => p.slice(ROOT.length).replace(/\\/g, '/')

for (const file of mdFiles) {
  const fm = frontmatter(file)
  const where = rel(file)

  // 1. canonical -> istniejaca strona (blog jest z WordPressa, poza content/)
  if (fm.canonical && !fm.canonical.startsWith('/blog')) {
    if (!/^\/.*\/$/.test(fm.canonical)) {
      errors.push(`${where}: canonical bez ukosnika na poczatku/koncu: "${fm.canonical}"`)
    } else if (fm.canonical !== '/') {
      const target = join(CONTENT, ...fm.canonical.split('/').filter(Boolean), 'index.md')
      if (!existsSync(target)) errors.push(`${where}: canonical wskazuje nieistniejaca strone: ${fm.canonical}`)
    }
  }

  // 2. pliki z frontmatter istnieja w public/
  for (const key of Object.keys(fm)) {
    if (!/^(image|pdf|heroImg)/.test(key)) continue
    const val = fm[key]
    if (!val || !val.startsWith('/')) continue
    const asset = join(PUBLIC, ...val.split('/').filter(Boolean))
    if (!existsSync(asset)) {
      // heroImgDesktop/heroImgMobile to martwe pola (nieuzywane w kodzie) - tylko ostrzegamy
      if (/^heroImg(Desktop|Mobile)$/.test(key)) warnings.push(`${where}: brak pliku ${key}: ${val} (pole nieuzywane w kodzie)`)
      else errors.push(`${where}: brak pliku ${key}: ${val}`)
      continue
    }
    // 3. SVG musi miec podglady WebP (og:image i galerie licza na nie)
    if (key === 'image' && val.endsWith('.svg')) {
      for (const suffix of ['-thumb.webp', '-view.webp']) {
        const preview = asset.replace(/\.svg$/, suffix)
        if (!existsSync(preview)) errors.push(`${where}: brak podgladu ${rel(preview)} (uruchom scripts/generate-thumbnails.mjs)`)
      }
      // pusty SVG = biala kolorowanka na produkcji (male pliki bez <path> i ksztaltow)
      if (statSync(asset).size < 2048) {
        const src = readFileSync(asset, 'utf8')
        if (!/<(path|rect|circle|ellipse|polygon|polyline|line)[\s>]/.test(src)) {
          errors.push(`${where}: SVG jest pusty (brak elementow rysunku): ${val}`)
        }
      }
    }
  }

  // 4. leaf = katalog o nazwie liczbowej -> musi miec image + pdf
  const dirName = file.replace(/\\/g, '/').split('/').slice(-2, -1)[0]
  if (/^\d+$/.test(dirName)) {
    if (!fm.image) errors.push(`${where}: leaf bez pola image`)
    if (!fm.pdf) warnings.push(`${where}: leaf bez pola pdf`)
  }
}

console.log(`Przeskanowano ${mdFiles.length} plikow content/.`)

// --- opcjonalnie: sitemap na produkcji ---
async function checkRemote () {
  const res = await fetch(`${SITE}/sitemap.xml`)
  if (!res.ok) { errors.push(`sitemap.xml: HTTP ${res.status}`); return }
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  console.log(`Sitemap: ${urls.length} adresow, sprawdzam...`)
  let done = 0
  const queue = [...urls]
  await Promise.all(Array.from({ length: 10 }, async () => {
    while (queue.length) {
      const url = queue.pop()
      try {
        const r = await fetch(url, { method: 'HEAD', redirect: 'manual' })
        if (r.status !== 200) errors.push(`sitemap: ${url} -> HTTP ${r.status}`)
      } catch (e) {
        errors.push(`sitemap: ${url} -> ${e.message}`)
      }
      if (++done % 25 === 0) console.log(`  ${done}/${urls.length}...`)
    }
  }))
}

if (REMOTE) await checkRemote()

// --- raport ---
if (warnings.length) {
  console.log(`\nOSTRZEZENIA (${warnings.length}):`)
  for (const w of warnings.slice(0, 50)) console.log('  ' + w)
}
const LIMIT = process.argv.includes('--all') ? Infinity : 100
if (errors.length) {
  console.log(`\nBLEDY (${errors.length}):`)
  for (const e of errors.slice(0, LIMIT)) console.log('  ' + e)
  if (errors.length > LIMIT) console.log(`  ...i ${errors.length - LIMIT} kolejnych (pelna lista: --all)`)
  process.exitCode = 1
} else {
  console.log('\nWszystko OK - zero bledow.')
}
