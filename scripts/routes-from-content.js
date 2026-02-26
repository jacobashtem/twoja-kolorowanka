// scripts/routes-from-content.js
import { readdir } from 'fs/promises'
import { join, sep } from 'path'
import { fileURLToPath } from 'url'

const cwd = fileURLToPath(new URL('.', import.meta.url))
const CONTENT_ROOT = join(cwd, '..', 'content')

const WP_API = process.env.WORDPRESS_API_URL || 'https://tk.delash.pl/wp-json/wp/v2'

/** Rekurencyjnie zbiera ścieżki .md i zwraca tablicę tras */
async function collectRoutes (dir, base = '', acc = new Set()) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const full = join(dir,  entry.name)
    const rel  = join(base, entry.name)

    if (entry.isDirectory()) {
      await collectRoutes(full, rel, acc)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const route = '/' + rel
        .split(sep).join('/')     // Windows → slashy
        .replace(/\.md$/, '')     //  /foo/bar.md  → /foo/bar
        .replace(/\/index$/, '')  //  /foo/index   → /foo
      acc.add(route)
    }
  }
  return acc
}

/** Pobiera wszystkie posty z WordPress API (paginacja po 100) */
async function fetchAllWpPosts() {
  const slugs = []
  let page = 1

  while (true) {
    try {
      const res = await fetch(`${WP_API}/posts?per_page=100&page=${page}&_fields=slug&status=publish`)
      if (!res.ok) break
      const posts = await res.json()
      if (!posts.length) break
      slugs.push(...posts.map(p => p.slug))
      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1')
      if (page >= totalPages) break
      page++
    } catch {
      console.error('[routes] Nie udało się pobrać postów z WordPress API')
      break
    }
  }

  return slugs
}

/** Pobiera kategorie z WordPress API */
async function fetchWpCategories() {
  try {
    const res = await fetch(`${WP_API}/categories?per_page=100&_fields=slug&hide_empty=false`)
    if (!res.ok) return []
    const cats = await res.json()
    return cats.map(c => c.slug).filter(s => s !== 'uncategorized')
  } catch {
    console.error('[routes] Nie udało się pobrać kategorii z WordPress API')
    return []
  }
}

// --- Zbierz routes ---
const routes = await collectRoutes(CONTENT_ROOT)

// Dodaj stałe blog routes
routes.add('/blog')

// Pobierz blog routes z WordPress
const [postSlugs, categorySlugs] = await Promise.all([
  fetchAllWpPosts(),
  fetchWpCategories(),
])

for (const slug of postSlugs) {
  routes.add(`/blog/${slug}`)
}
for (const slug of categorySlugs) {
  routes.add(`/blog/kategoria/${slug}`)
}

if (postSlugs.length || categorySlugs.length) {
  console.error(`[routes] WordPress: ${postSlugs.length} postów, ${categorySlugs.length} kategorii`)
}

console.log(JSON.stringify([...routes].sort(), null, 2))
