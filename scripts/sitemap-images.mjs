// Generuje public/sitemap-images.xml — sitemapę obrazów dla stron kategorii.
//
// Po co: 93% wyświetleń serwisu w Grafice Google przypada na strony kategorii, ale galeria
// renderuje w HTML-u tylko kafelki wplecione pod sekcje H2 (`liczba sekcji × 4`, patrz
// pages/[...slug].vue:182-189) — reszta pojawia się po kliknięciu „pokaż więcej", którego
// crawler nie kliknie. W kategorii z 84 kolorowankami Google widzi 28. Sitemapa obrazów
// pozwala odkryć pozostałe bez zmieniania układu strony.
//
// Świadome ograniczenia:
//   - tylko kategorie (katalog z index.md i numerycznymi podkatalogami). Przekroje
//     (`tagsFilter`) pokazują te same pliki co kategorie, więc powtarzanie ich niczego nie wnosi
//     — obrazek ma mieć jeden dom, a jest nim kategoria.
//   - liście są poza sitemapą (canonical → kategoria) i tu też ich nie ma.
//   - wskazujemy wariant 800px `-view.webp`, nie 400px `-thumb.webp` ani źródłowy SVG:
//     Grafika premiuje większe pliki, a SVG indeksuje słabo.
//   - Google z całej specyfikacji image sitemap czyta dziś wyłącznie <image:loc>;
//     image:title/caption/license są wycofane, więc ich nie emitujemy.
//
// Uruchomienie: node scripts/sitemap-images.mjs [--dry]
import { readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT, PUBLIC, ROOT, SITE, frontmatter } from './pinterest/lib.mjs'

const DRY = process.argv.includes('--dry')
const OUT = join(PUBLIC, 'sitemap-images.xml')

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const isLeafDir = name => /^\d+$/.test(name)
const hasIndex = dir => existsSync(join(dir, 'index.md'))

// Ta sama naprawa co `fixImageUrl` w pages/[...slug].vue — część frontmatterów niesie
// ścieżki typu /kategoria/kategoria/plik.svg. Runtime to prostuje, więc sitemapa też musi,
// inaczej zgłosiłaby Google adresy zwracające 404.
function fixImageUrl (url) {
  if (!url) return ''
  const clean = url.replace(/\/+/g, '/')
  const category = clean.split('/').filter(Boolean)[0]
  if (!category) return clean
  return new RegExp(`^/${category}/${category}/`).test(clean)
    ? clean.replace(`/${category}`, '')
    : clean
}

const toPublicPath = url => join(PUBLIC, ...url.split('/').filter(Boolean))

/** Zbiera kategorie: katalog z index.md, który ma przynajmniej jeden numeryczny podkatalog. */
function collectCategories (dir, rel = '', acc = []) {
  const children = readdirSync(dir).filter(n => statSync(join(dir, n)).isDirectory())
  const leafDirs = children.filter(n => isLeafDir(n) && hasIndex(join(dir, n)))

  if (rel && hasIndex(dir) && leafDirs.length) acc.push({ dir, rel, leafDirs })

  for (const name of children) {
    if (!isLeafDir(name)) collectCategories(join(dir, name), `${rel}/${name}`, acc)
  }
  return acc
}

const categories = collectCategories(CONTENT)

let entries = [], totalImages = 0, skippedNoindex = 0
const missing = []

for (const { dir, rel, leafDirs } of categories) {
  const fm = frontmatter(join(dir, 'index.md'))
  if (/noindex/i.test(fm.robots || '')) { skippedNoindex++; continue }

  const images = []
  for (const leaf of leafDirs) {
    const src = fixImageUrl(frontmatter(join(dir, leaf, 'index.md')).image)
    if (!src || !src.endsWith('.svg')) continue

    const view = src.replace(/\.svg$/, '-view.webp')
    // Zgłaszamy Google tylko pliki, które faktycznie leżą na dysku — sitemapa z 404
    // szkodzi bardziej niż jej brak.
    if (existsSync(toPublicPath(view))) images.push(view)
    else missing.push(`${rel}/${leaf} → ${view}`)
  }

  if (!images.length) continue
  entries.push({ loc: `${SITE}${rel}/`, images })
  totalImages += images.length
}

entries.sort((a, b) => a.loc.localeCompare(b.loc))

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(e => `  <url>
    <loc>${esc(e.loc)}</loc>
${e.images.map(i => `    <image:image><image:loc>${esc(SITE + i)}</image:loc></image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>
`

console.log(`Kategorie z obrazkami: ${entries.length}`)
console.log(`Obrazków w sitemapie:  ${totalImages}`)
console.log(`Średnio na kategorię:  ${(totalImages / (entries.length || 1)).toFixed(1)}`)
if (skippedNoindex) console.log(`Pominięte (noindex):   ${skippedNoindex}`)

if (missing.length) {
  console.log(`\nUWAGA: ${missing.length} liści bez pliku -view.webp (pominięte):`)
  for (const m of missing.slice(0, 15)) console.log(`  ${m}`)
  if (missing.length > 15) console.log(`  ...i ${missing.length - 15} więcej`)
  console.log(`Podpowiedź: node scripts/generate-thumbnails.mjs --missing-only`)
}

if (DRY) {
  console.log('\n--dry: plik nie zapisany')
} else {
  writeFileSync(OUT, xml, 'utf8')
  console.log(`\nZapisano ${OUT.slice(ROOT.length)} (${(Buffer.byteLength(xml) / 1024).toFixed(0)} kB)`)
}
