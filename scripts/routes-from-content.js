// scripts/routes-from-content.js
import { readdir } from 'fs/promises'
import { join, sep } from 'path'
import { fileURLToPath } from 'url'

const cwd = fileURLToPath(new URL('.', import.meta.url))
const CONTENT_ROOT = join(cwd, '..', 'content')

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

const routes = await collectRoutes(CONTENT_ROOT)
console.log(JSON.stringify([...routes].sort(), null, 2))
