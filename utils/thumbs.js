// Mapuje URL SVG kolorowanki na jej rastrowy podgląd WebP (generowany przez scripts/generate-thumbnails.mjs).
// 'thumb' = 400px (galerie), 'view' = 800px (obraz główny). Pełny SVG ładuje tylko edytor /koloruj/.
export const svgPreview = (url, kind = 'thumb') =>
  typeof url === 'string' && url.endsWith('.svg') && !url.startsWith('/vectors/')
    ? url.replace(/\.svg$/, `-${kind}.webp`)
    : url

// Kandydaci do `srcset` w galeriach: 400px + 800px.
// Powód: 93% wyświetleń w Grafice Google przypada na strony kategorii, a te serwowały
// wyłącznie miniatury 400px — za małe, żeby konkurować w wynikach graficznych (średnia
// pozycja 33). Pliki 800px już istnieją dla wszystkich kolorowanek, więc wystarczy je
// zadeklarować: przeglądarka wybiera wg `sizes` i DPR, crawler ma z czego wziąć większy plik.
// Zwraca null dla URL-i, które nie są kolorowanką (fallbacki, ikony) — wtedy atrybut nie leci.
export const svgPreviewSrcset = (url) =>
  typeof url === 'string' && url.endsWith('.svg') && !url.startsWith('/vectors/')
    ? `${svgPreview(url, 'thumb')} 400w, ${svgPreview(url, 'view')} 800w`
    : null
