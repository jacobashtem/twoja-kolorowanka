// Ikonka na karcie przeglądarki dla panelu selekcji i galerii — ta sama, co na stronie.
// Wstawiana jako data URI, bo galeria bywa otwierana z `file://`, gdzie ścieżka
// `/favicon.ico` prowadzi donikąd.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

let tag = ''
try {
  const png = readFileSync(fileURLToPath(new URL('../../public/favicon-32x32.png', import.meta.url)))
  tag = `<link rel="icon" type="image/png" href="data:image/png;base64,${png.toString('base64')}">`
} catch { /* bez ikonki strona działa tak samo */ }

export const FAVICON = tag
