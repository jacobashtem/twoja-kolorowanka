// Wspolna logika pinow Pinterest: chodzenie po leafach, frontmatter, kompozycja grafiki 1000x1500.
// Uzywana przez scripts/generate-pins.mjs (pliki na dysk) i scripts/pinterest/publish.mjs (API, in-memory).
// sharp importowany leniwie w composePin - dzieki temu skrypty czysto-contentowe
// (tag-difficulty w CI) dzialaja bez instalowania zaleznosci graficznych.
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
export const CONTENT = join(ROOT, 'content')
export const PUBLIC = join(ROOT, 'public')
export const SITE = 'https://twoja-kolorowanka.pl'

const W = 1000, H = 1500, BAR_H = 260
const IMG_BOX = { x: 60, y: 60, w: W - 120, h: H - BAR_H - 120 }

export function walkLeafs () {
  const leafs = []
  ;(function walk (dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (!statSync(p).isDirectory()) continue
      if (/^\d+$/.test(name) && existsSync(join(p, 'index.md'))) leafs.push(p)
      else walk(p)
    }
  })(CONTENT)
  return leafs.sort()
}

export function frontmatter (file) {
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

// "Kolorowanki Koty - wariant 1" -> max 2 linie po ~22 znaki
export function pinTitle (fm, categorySlug) {
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

// Metadane pinu dla leafa; null gdy brak zrodla (image/-view.webp)
export function pinMeta (leafDir) {
  const fm = frontmatter(join(leafDir, 'index.md'))
  if (!fm.image) return null
  const view = join(PUBLIC, ...fm.image.replace(/\.svg$/, '-view.webp').split('/').filter(Boolean))
  if (!existsSync(view)) return null
  const relParts = leafDir.slice(CONTENT.length).replace(/\\/g, '/').split('/').filter(Boolean)
  return {
    view,
    relParts,
    name: relParts.join('-') + '.jpg',
    link: `${SITE}/${relParts.join('/')}/`,
    titleLines: pinTitle(fm, relParts[relParts.length - 2]),
    description: (fm.description || fm.title || '').replace(/"/g, "'") +
      ' Darmowa kolorowanka do druku (PDF) i kolorowania online.',
  }
}

// Buffer JPEG pinu 1000x1500
export async function composePin (meta) {
  const sharp = (await import('sharp')).default
  const img = await sharp(meta.view)
    .resize({ width: IMG_BOX.w, height: IMG_BOX.h, fit: 'inside' })
    .toBuffer({ resolveWithObject: true })
  return sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([
      {
        input: img.data,
        left: IMG_BOX.x + Math.round((IMG_BOX.w - img.info.width) / 2),
        top: IMG_BOX.y + Math.round((IMG_BOX.h - img.info.height) / 2),
      },
      { input: overlaySvg(meta.titleLines), left: 0, top: 0 },
    ])
    .jpeg({ quality: 85 })
    .toBuffer()
}
