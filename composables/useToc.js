function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
}

function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'section'
  )
}

export function parseToc(html) {
  if (!html) return { processedHtml: html || '', headings: [] }

  const headings = []
  const seen = {}

  const processedHtml = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag, attrs, inner) => {
      const text = decodeEntities(inner.replace(/<[^>]+>/g, '').trim())
      if (!text) return _match

      const level = Number(tag[1])
      const base = slugify(text)
      const id =
        seen[base] !== undefined ? `${base}-${++seen[base]}` : ((seen[base] = 0), base)

      const cleanAttrs = attrs.replace(/\s+id="[^"]*"/gi, '')
      headings.push({ id, text, level })
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`
    },
  )

  return { processedHtml, headings }
}
