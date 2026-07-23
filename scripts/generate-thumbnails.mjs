// Generuje rastrowe podglądy WebP obok każdego SVG w public/:
//   nazwa-thumb.webp (400px szer., galerie/miniatury)
//   nazwa-view.webp  (800px szer., obraz główny na stronie kolorowanki)
// Pełne SVG pobiera się odtąd tylko w edytorze /koloruj/. Uruchom: node scripts/generate-thumbnails.mjs
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const PUBLIC = join(ROOT, 'public')
const SIZES = [{ suffix: '-thumb', width: 400 }, { suffix: '-view', width: 800 }]
const CONCURRENCY = 8

const svgs = []
;(function walk (dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) { if (name !== 'vectors') walk(p) }
    else if (name.endsWith('.svg')) svgs.push(p)
  }
})(PUBLIC)

let done = 0, generated = 0, skipped = 0
const errors = []

async function processOne (svgPath) {
  const srcMtime = statSync(svgPath).mtimeMs
  for (const { suffix, width } of SIZES) {
    const out = svgPath.replace(/\.svg$/, `${suffix}.webp`)
    if (existsSync(out) && statSync(out).mtimeMs >= srcMtime) { skipped++; continue }
    try {
      await sharp(svgPath, { density: 150 })
        .resize({ width, withoutEnlargement: false })
        .flatten({ background: '#ffffff' })
        .webp({ quality: 82 })
        .toFile(out)
      generated++
    } catch (e) {
      errors.push(`${svgPath.slice(PUBLIC.length)}: ${e.message}`)
    }
  }
  if (++done % 200 === 0) console.log(`${done}/${svgs.length}...`)
}

const queue = [...svgs]
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await processOne(queue.pop())
}))

console.log(`Gotowe. SVG: ${svgs.length}, wygenerowano: ${generated}, pominięto (aktualne): ${skipped}, błędy: ${errors.length}`)
if (errors.length) console.log(errors.slice(0, 30).join('\n'))
