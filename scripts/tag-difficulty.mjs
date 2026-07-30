// Obiektywna trudnosc kolorowanek: mierzy zlozonosc SVG kazdego leafa i dopisuje
// do frontmatter tag `trudnosc-N` (N = 1..10, 1 = najprostsza). Idempotentny -
// stary tag trudnosc-* jest podmieniany, wiec mozna odpalac wielokrotnie.
//
// Uzycie:
//   node scripts/tag-difficulty.mjs --calibrate   # histogram + progi decylowe (bez zmian)
//   node scripts/tag-difficulty.mjs --dry-run     # pokaz co by sie zmienilo
//   node scripts/tag-difficulty.mjs --write       # zapisz tagi do content/**
//
// Miara: liczba komend rysowania w atrybutach d="" wszystkich <path> + waga za
// elementy proste (rect/circle/...). Proste serce ma ~30-100 komend, mandala 10k+.
// Progi sa STALE (skalibrowane na korpusie 2026-07) - nowe kolorowanki dostaja
// spojne oceny bez ponownego rankingowania starych.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT, PUBLIC, walkLeafs, frontmatter } from './pinterest/lib.mjs'

const MODE = process.argv.includes('--write') ? 'write'
  : process.argv.includes('--calibrate') ? 'calibrate' : 'dry'

// Miara i progi mieszkaja w scripts/lib/trudnosc.mjs — dzieli je z galeria.mjs,
// zeby sortowanie w przegladzie odpowiadalo tagom `trudnosc-N` na stronie.
import { THRESHOLDS, svgScore, difficulty } from './lib/trudnosc.mjs'

const leafs = walkLeafs()
const scores = []
let changed = 0, unchanged = 0, skipped = 0
const changes = []

for (const dir of leafs) {
  const file = join(dir, 'index.md')
  const fm = frontmatter(file)
  if (!fm.image) { skipped++; continue }
  const svg = join(PUBLIC, ...fm.image.split('/').filter(Boolean))
  if (!existsSync(svg) || !svg.endsWith('.svg')) { skipped++; continue }

  const score = svgScore(svg)
  if (score < 10) { skipped++; continue }   // pusty/zepsuty SVG - zglasza go pnpm health, nie tagujemy
  scores.push(score)
  if (MODE === 'calibrate') continue

  const tag = `trudnosc-${difficulty(score)}`
  const rel = dir.slice(CONTENT.length).replace(/\\/g, '/')
  let src = readFileSync(file, 'utf8')
  if (new RegExp(`^- ${tag}\\r?$`, 'm').test(src) || src.match(new RegExp(`tags:\\s*\\[[^\\]]*\\b${tag}\\b`))) { unchanged++; continue }

  // usun stary tag trudnosc-* (obie notacje YAML)
  let out = src.replace(/^- trudnosc-\d+\r?\n/gm, '')
  out = out.replace(/(tags:\s*\[[^\]]*?),?\s*trudnosc-\d+/g, '$1')

  if (/^tags:\s*$/m.test(out)) {
    // lista blokowa: wstaw po linii "tags:"
    out = out.replace(/^(tags:\s*)$/m, `$1\n- ${tag}`)
  } else if (/^tags:\s*\[/m.test(out)) {
    // notacja inline: dopisz przed "]"
    out = out.replace(/^(tags:\s*\[[^\]]*)\]/m, `$1, ${tag} ]`)
  } else {
    // brak pola tags: dodaj przed zamykajacym ---
    out = out.replace(/^---\r?\n/, m => m).replace(/\r?\n---/, `\ntags:\n- ${tag}\n---`)
  }

  changes.push(`${rel}: score ${score} -> ${tag}`)
  if (MODE === 'write') writeFileSync(file, out, 'utf8')
  changed++
}

if (MODE === 'calibrate') {
  scores.sort((a, b) => a - b)
  const decile = q => scores[Math.min(scores.length - 1, Math.floor(scores.length * q) - 1)]
  console.log(`SVG: ${scores.length}, min ${scores[0]}, max ${scores.at(-1)}, mediana ${decile(0.5)}`)
  console.log('Progi decylowe (do THRESHOLDS):', [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(decile).join(', '), ', Infinity')
} else {
  const hist = {}
  for (const s of scores) { const d = difficulty(s); hist[d] = (hist[d] || 0) + 1 }
  console.log('Rozklad trudnosci:', Object.entries(hist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' '))
  console.log(`Zmienione: ${changed}, bez zmian: ${unchanged}, pominiete: ${skipped}${MODE === 'dry' ? ' (DRY RUN)' : ''}`)
  if (MODE === 'dry') console.log(changes.slice(0, 15).join('\n'))
}
