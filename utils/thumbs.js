// Mapuje URL SVG kolorowanki na jej rastrowy podgląd WebP (generowany przez scripts/generate-thumbnails.mjs).
// 'thumb' = 400px (galerie), 'view' = 800px (obraz główny). Pełny SVG ładuje tylko edytor /koloruj/.
export const svgPreview = (url, kind = 'thumb') =>
  typeof url === 'string' && url.endsWith('.svg') && !url.startsWith('/vectors/')
    ? url.replace(/\.svg$/, `-${kind}.webp`)
    : url
