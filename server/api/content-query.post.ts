import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async event => {
  const body         = await readBody(event)
  const regexPattern = body?.where?.[0]?._path?.$regex || ''
  const skip         = body?.skip  ?? 0
  const limit        = body?.limit ?? 8
  const only         = Array.isArray(body?.only) ? body.only : null
  const numericSort  = body?.sort?.[0]?._stem && body?.sort?.[0]?.$numeric

  const all   = await crawl(join(process.cwd(), 'content'))
  const filt  = regexPattern ? all.filter(i => new RegExp(regexPattern).test(i._path)) : all
  if (numericSort) filt.sort((a, b) => num(a._path) - num(b._path))
  const page  = filt.slice(skip, skip + limit)

  return only ? page.map(it => Object.fromEntries(only.map(f => [f, it[f]]))) : page
})

async function crawl(dir, base = '') {
  const items   = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isDirectory()) continue
    const full = join(dir, e.name)
    const url  = base + '/' + e.name
    try {
      const raw = await readFile(join(full, 'index.md'), 'utf-8')
      const fm  = front(raw)
      items.push({ _path: url, title: fm.title || '', image: fm.image || '', description: fm.description || '', tags: fm.tags || [] })
    } catch {}
    items.push(...await crawl(full, url))
  }
  return items
}

function front(src) {
  const m   = src.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!m) return {}
  const out = {}
  let k     = ''
  m[1].split('\n').forEach(l => {
    const t = l.trim()
    if (!t) return
    if (t.startsWith('- ')) { if (k) (out[k] ??= []).push(t.slice(2).trim()) }
    else if (t.includes(':')) { const i = t.indexOf(':'); k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim(); out[k] = v || [] }
  })
  return out
}

const num = p => +(p.match(/\/(\d+)\/?$/)?.[1] || 0)
