// Generator grafik pinow Pinterest (Etap 5 roadmapy): pion 1000x1500 (2:3),
// biala ramka, podglad kolorowanki, pasek z tytulem i domena.
// Zrodlo: content/**/<liczba>/index.md (title + image -> -view.webp z Etapu 2).
//
// Uzycie: node scripts/generate-pins.mjs [--limit N] [--only kategoria]
// Wyjscie: pins-output/<kategoria>-<wariant>.jpg (poza public/, katalog w .gitignore).
// Masowe uruchomienie planowane po zalozeniu konta firmowego Pinterest.
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const SITE = 'https://twoja-kolorowanka.pl'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const CONTENT = join(ROOT, 'content')
const PUBLIC = join(ROOT, 'public')
const OUT = join(ROOT, 'pins-output')
const W = 1000, H = 1500
const BAR_H = 260
const IMG_BOX = { x: 60, y: 60, w: W - 120, h: H - BAR_H - 120 }

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity
const onlyArg = process.argv.indexOf('--only')
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1] : null

mkdirSync(OUT, { recursive: true })

const leafs = []
;(function walk (dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (!statSync(p).isDirectory()) continue
    if (/^\d+$/.test(name) && existsSync(join(p, 'index.md'))) leafs.push(p)
    else walk(p)
  }
})(CONTENT)

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

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Tytul pinu: "Kolorowanki Koty - wariant 1" -> "Kolorowanka koty"; lamiemy na max 2 linie.
function pinTitle (fm, categorySlug) {
  const base = (fm.alt || fm.title || `Kolorowanka ${categorySlug}`)
    .replace(/\s*[-–]\s*wariant\s*\d+/i, '')
    .replace(/^Kolorowanki/i, 'Kolorowanka')
    .trim()
  const words = base.split(/\s+/)
  const lines = ['']
  for (const w of words) {
    const cur = lines[lines.length - 1]
    if ((cur + ' ' + w).trim().length > 22 && cur) lines.push(w)
    else lines[lines.length - 1] = (cur + ' ' + w).trim()
  }
  return lines.slice(0, 2)
}

function overlaySvg (titleLines) {
  const lineY = titleLines.length === 2 ? [H - BAR_H + 92, H - BAR_H + 162] : [H - BAR_H + 125]
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="${H - BAR_H}" width="${W}" height="${BAR_H}" fill="#10B981"/>
    <rect x="30" y="30" width="${W - 60}" height="${H - BAR_H - 60}" fill="none" stroke="#10B981" stroke-width="6" rx="24"/>
    ${titleLines.map((l, i) => `<text x="${W / 2}" y="${lineY[i]}" text-anchor="middle" font-family="Verdana, DejaVu Sans, sans-serif" font-size="56" font-weight="bold" fill="#ffffff">${esc(l)}</text>`).join('\n')}
    <text x="${W / 2}" y="${H - 42}" text-anchor="middle" font-family="Verdana, DejaVu Sans, sans-serif" font-size="34" fill="#d1fae5">twoja-kolorowanka.pl</text>
  </svg>`)
}

let done = 0, skipped = 0
const errors = []
const manifest = []   // wiersze CSV do recznej/API publikacji: plik, link, tytul, opis
const queue = leafs.filter(dir => !ONLY || dir.replace(/\\/g, '/').includes(`/${ONLY}/`)).slice(0, LIMIT)
console.log(`Leafow do przetworzenia: ${queue.length}`)

await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const dir = queue.pop()
    const fm = frontmatter(join(dir, 'index.md'))
    if (!fm.image) { skipped++; continue }
    const view = join(PUBLIC, ...fm.image.replace(/\.svg$/, '-view.webp').split('/').filter(Boolean))
    if (!existsSync(view)) { skipped++; continue }
    const relParts = dir.slice(CONTENT.length).replace(/\\/g, '/').split('/').filter(Boolean)
    const outName = relParts.join('-') + '.jpg'   // np. zwierzeta-koty-1.jpg
    const outFile = join(OUT, outName)
    if (existsSync(outFile)) { skipped++; continue }
    try {
      const img = await sharp(view)
        .resize({ width: IMG_BOX.w, height: IMG_BOX.h, fit: 'inside' })
        .toBuffer({ resolveWithObject: true })
      await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
        .composite([
          {
            input: img.data,
            left: IMG_BOX.x + Math.round((IMG_BOX.w - img.info.width) / 2),
            top: IMG_BOX.y + Math.round((IMG_BOX.h - img.info.height) / 2),
          },
          { input: overlaySvg(pinTitle(fm, relParts[relParts.length - 2])), left: 0, top: 0 },
        ])
        .jpeg({ quality: 85 })
        .toFile(outFile)
      done++
    } catch (e) {
      errors.push(`${outName}: ${e.message}`)
    }
    if (done % 100 === 0 && done) console.log(`${done} gotowych...`)
  }
}))

// Manifest obejmuje WSZYSTKIE piny obecne w pins-output/ (nie tylko z tego uruchomienia),
// wiec kolejne partie (--only rozne kategorie) kumuluja sie w jednym pliku.
for (const dir of leafs) {
  const fm = frontmatter(join(dir, 'index.md'))
  const relParts = dir.slice(CONTENT.length).replace(/\\/g, '/').split('/').filter(Boolean)
  const outName = relParts.join('-') + '.jpg'
  if (!existsSync(join(OUT, outName))) continue
  const pinDesc = (fm.description || fm.title || '').replace(/"/g, "'") +
    ' Darmowa kolorowanka do druku (PDF) i kolorowania online.'
  manifest.push([outName, `${SITE}/${relParts.join('/')}/`, pinTitle(fm, relParts[relParts.length - 2]).join(' '), pinDesc])
}
manifest.sort((a, b) => a[0].localeCompare(b[0]))
writeFileSync(join(OUT, 'manifest.csv'),
  'plik;link;tytul;opis\n' + manifest.map(r => r.map(c => `"${c}"`).join(';')).join('\n') + '\n',
  'utf8')

console.log(`Gotowe. Wygenerowano: ${done}, pominieto: ${skipped}, bledy: ${errors.length}. Manifest: ${manifest.length} pozycji.`)
if (errors.length) { console.log(errors.slice(0, 10).join('\n')); process.exitCode = 1 }
