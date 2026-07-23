// Audyt/naprawa canonicali leafów (strategia: canonical leafa -> kategoria nadrzedna z trailing slashem).
// Uzycie: node scripts/fix-canonicals.mjs [--write]
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const CONTENT = join(ROOT, 'content')
const WRITE = process.argv.includes('--write')

const leafs = []
;(function walk (dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (!statSync(p).isDirectory()) continue
    if (/^\d+$/.test(name) && existsSync(join(p, 'index.md'))) leafs.push(p)
    else walk(p)
  }
})(CONTENT)

const stats = { total: leafs.length, okCategory: 0, noSlash: 0, self: 0, broken: 0, missing: 0, fixed: 0 }
const brokenSamples = []

for (const dir of leafs) {
  const rel = dir.slice(CONTENT.length).replace(/\\/g, '/')          // np. /zwierzeta/koty/1
  const expected = rel.replace(/\/\d+$/, '') + '/'                   // np. /zwierzeta/koty/
  const file = join(dir, 'index.md')
  const src = readFileSync(file, 'utf8')
  const m = src.match(/^canonical:\s*(\S+)\s*$/m)
  const current = m ? m[1] : null

  if (!current) stats.missing++
  else if (current === expected) stats.okCategory++
  else if (current + '/' === expected) stats.noSlash++
  else if (current.replace(/\/$/, '') === rel) stats.self++
  else { stats.broken++; if (brokenSamples.length < 15) brokenSamples.push(`${rel}: ${current} -> ${expected}`) }

  if (current === expected) continue
  if (WRITE) {
    const out = m
      ? src.replace(/^canonical:\s*\S+\s*$/m, `canonical: ${expected}`)
      : src.replace(/^---\r?\n/, s => `${s}canonical: ${expected}\n`)
    writeFileSync(file, out, 'utf8')
    stats.fixed++
  }
}

console.log(JSON.stringify(stats, null, 2))
if (brokenSamples.length) console.log('Przyklady blednych:\n' + brokenSamples.join('\n'))
console.log(WRITE ? 'ZAPISANO zmiany.' : 'DRY RUN - nic nie zapisano. Uruchom z --write aby naprawic.')
