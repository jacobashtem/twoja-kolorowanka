// Strażnik jakości builda: wywala deploy (exit 1), gdy kluczowe strony wyszły puste.
// nitro ma failOnError:false, więc bez tego pusty blog / pusta kategoria trafiłyby na produkcję po cichu.
// Uruchamiany po `nuxt generate` (patrz "build" w package.json).
import { readFileSync, existsSync } from 'node:fs'
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

// Blog: co najmniej jeden prerenderowany artykuł z sensowną treścią
const routes = JSON.parse(readFileSync(join(ROOT, 'prerender-routes.json'), 'utf8'))
const posts = routes.filter(r => r.startsWith('/blog/') && !r.startsWith('/blog/kategoria/') && r !== '/blog')
if (!posts.length) {
  problems.push('Blog: zero tras postów w prerender-routes.json')
} else {
  const sample = posts[0]
  checkFile(`${sample.slice(1)}/index.html`, ['og:title'], `Post ${sample}`)
}

if (problems.length) {
  console.error('BUILD ODRZUCONY przez scripts/check-build.mjs:')
  problems.forEach(p => console.error(' - ' + p))
  process.exit(1)
}
console.log(`check-build OK (postów bloga: ${posts.length})`)
