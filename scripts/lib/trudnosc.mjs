// Jedna miara trudności kolorowanki dla całego projektu.
//
// Wyciągnięte z tag-difficulty.mjs, żeby galeria sortowała po DOKŁADNIE tej samej skali,
// którą trafiają tagi `trudnosc-N` na stronie. Gdyby każde narzędzie liczyło po swojemu,
// kolejność w galerii przestałaby odpowiadać temu, co widzi użytkownik serwisu — a wtedy
// przegląd wprowadzałby w błąd zamiast pomagać.
import { readFileSync } from 'node:fs'

// Progi score -> trudnosc 1..10 (górna granica przedziału; ostatni = Infinity).
// Wygenerowane przez `tag-difficulty.mjs --calibrate` na 4307 SVG (2026-07-24).
// NIE zmieniać bez rekalibracji całego korpusu — inaczej stare i nowe kolorowanki
// dostaną nieporównywalne oceny.
export const THRESHOLDS = [572, 915, 1249, 1680, 2325, 3278, 4637, 6638, 11840, Infinity]

// Miara: liczba komend rysowania w atrybutach d="" wszystkich <path> plus waga za
// elementy proste (rect/circle/...). Proste serce ma ~30–100 komend, mandala 10k+.
export function svgScore (svgPath) {
  const src = readFileSync(svgPath, 'utf8')
  let commands = 0
  for (const m of src.matchAll(/\sd="([^"]*)"/g)) {
    commands += (m[1].match(/[A-Za-z]/g) || []).length
  }
  const shapes = (src.match(/<(rect|circle|ellipse|line|polyline|polygon)[\s>]/g) || []).length
  return commands + shapes * 8
}

export const difficulty = score => THRESHOLDS.findIndex(t => score <= t) + 1
