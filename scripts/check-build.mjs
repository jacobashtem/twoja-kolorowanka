// Strażnik jakości builda: wywala deploy (exit 1), gdy kluczowe strony wyszły puste.
// nitro ma failOnError:false, więc bez tego pusty blog / pusta kategoria trafiłyby na produkcję po cichu.
// Uruchamiany po `nuxt generate` (patrz "build" w package.json).
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const OUT = join(ROOT, '.output', 'public')

const problems = []

function checkFile (rel, mustContain, label) {
  const p = join(OUT, ...rel.split('/'))
  if (!existsSync(p)) { problems.push(`${label}: brak pliku ${rel}`); return }
  const html = readFileSync(p, 'utf8')
  for (const needle of mustContain) {
    if (!html.includes(needle)) problems.push(`${label}: ${rel} nie zawiera "${needle}" (strona wyszła pusta?)`)
  }
}

checkFile('index.html', ['Kolorowanki dla dzieci', '/zwierzeta'], 'Strona główna')
checkFile('zwierzeta/koty/index.html', ['thumb.webp', 'canonical'], 'Kategoria koty')
checkFile('zwierzeta/koty/1/index.html', ['koty-1', 'canonical'], 'Leaf koty/1')
checkFile('blog/index.html', ['/blog/'], 'Blog index')

// Blog: co najmniej jeden prerenderowany artykuł z sensowną treścią.
//
// Sprawdzamy WYNIK w .output, a nie listę tras w prerender-routes.json — i to jest
// poprawka, nie obejście. WordPress zasiewa do prerenderu tylko garstkę slugów, a resztę
// wpisów nitro znajduje sam, przechodząc po linkach z /blog. Stara wersja liczyła zasiew,
// więc przy jednym zasianym i zepsutym poście krzyczała "zero postów", choć obok
// wyrenderowało się czterdzieści kilka poprawnych stron. Liczy się to, co realnie powstało.
const blogDir = join(OUT, 'blog')
let wyrenderowane = []
try {
  wyrenderowane = readdirSync(blogDir)
    .filter(d => d !== 'kategoria' && existsSync(join(blogDir, d, 'index.html')))
} catch { /* brak katalogu bloga w ogóle — złapie to warunek niżej */ }

if (!wyrenderowane.length) {
  problems.push('Blog: ani jeden artykuł nie wyrenderował się do index.html')
} else {
  checkFile(`blog/${wyrenderowane[0]}/index.html`, ['og:title'], `Post ${wyrenderowane[0]}`)
}

// Trasy zasiane przez WordPressa, które NIE wyprodukowały strony. Nie wywalamy przez to
// builda (wpis może być świeżo usunięty w WP), ale trzeba o nich wiedzieć.
const routes = JSON.parse(readFileSync(join(ROOT, 'prerender-routes.json'), 'utf8'))
const zasiane = routes.filter(r => r.startsWith('/blog/') && !r.startsWith('/blog/kategoria/') && r !== '/blog')
const puste = zasiane.filter(r => !existsSync(join(OUT, ...r.slice(1).split('/'), 'index.html')))
if (puste.length) {
  console.warn(`UWAGA: ${puste.length} zasianych tras bloga nie wyprodukowało strony:`)
  puste.forEach(r => console.warn('  - ' + r))
}

if (problems.length) {
  console.error('BUILD ODRZUCONY przez scripts/check-build.mjs:')
  problems.forEach(p => console.error(' - ' + p))
  process.exit(1)
}
console.log(`check-build OK (wyrenderowanych artykułów bloga: ${wyrenderowane.length})`)
