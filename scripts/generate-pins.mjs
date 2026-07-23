// Generator grafik pinow Pinterest (Etap 5 roadmapy) - zapis plikow na dysk do recznej publikacji.
// Publikacja automatyczna przez API: scripts/pinterest/publish.mjs (wspolna logika w scripts/pinterest/lib.mjs).
//
// Uzycie: node scripts/generate-pins.mjs [--limit N] [--only kategoria]
// Wyjscie: pins-output/<kategoria>-<wariant>.jpg + manifest.csv (poza public/, katalog w .gitignore).
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, walkLeafs, pinMeta, composePin } from './pinterest/lib.mjs'

const OUT = join(ROOT, 'pins-output')

const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) || Infinity : Infinity
const onlyArg = process.argv.indexOf('--only')
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1] : null

mkdirSync(OUT, { recursive: true })
const leafs = walkLeafs()

let done = 0, skipped = 0
const errors = []
const queue = leafs.filter(dir => !ONLY || dir.replace(/\\/g, '/').includes(`/${ONLY}/`)).slice(0, LIMIT)
console.log(`Leafow do przetworzenia: ${queue.length}`)

await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const dir = queue.pop()
    const meta = pinMeta(dir)
    if (!meta) { skipped++; continue }
    const outFile = join(OUT, meta.name)
    if (existsSync(outFile)) { skipped++; continue }
    try {
      writeFileSync(outFile, await composePin(meta))
      done++
    } catch (e) {
      errors.push(`${meta.name}: ${e.message}`)
    }
    if (done % 100 === 0 && done) console.log(`${done} gotowych...`)
  }
}))

// Manifest CSV obejmuje WSZYSTKIE piny obecne w pins-output/ (kolejne partie sie kumuluja)
const manifest = []
for (const dir of leafs) {
  const meta = pinMeta(dir)
  if (!meta || !existsSync(join(OUT, meta.name))) continue
  manifest.push([meta.name, meta.link, meta.titleLines.join(' '), meta.description])
}
manifest.sort((a, b) => a[0].localeCompare(b[0]))
writeFileSync(join(OUT, 'manifest.csv'),
  'plik;link;tytul;opis\n' + manifest.map(r => r.map(c => `"${c}"`).join(';')).join('\n') + '\n',
  'utf8')

console.log(`Gotowe. Wygenerowano: ${done}, pominieto: ${skipped}, bledy: ${errors.length}. Manifest: ${manifest.length} pozycji.`)
if (errors.length) { console.log(errors.slice(0, 10).join('\n')); process.exitCode = 1 }
