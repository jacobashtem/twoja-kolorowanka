// Statystyka struktury contentu: ile jest kategorii (landingów) i ile kolorowanek
// przypada na każdą. Podstawa do planowania wymiany biblioteki — pokazuje, gdzie
// naprawdę leży masa plików i ile realnie trzeba wygenerować.
//
// Jednostką SEO jest LANDING (katalog z index.md, którego nazwa nie jest liczbą).
// Liściem jest podstrona pojedynczej kolorowanki (katalog o nazwie będącej liczbą).
//
// Użycie:
//   node scripts/stat-kategorie.mjs
//   node scripts/stat-kategorie.mjs --pelna    # wypisz wszystkie kategorie, nie tylko skrajne
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { KATEGORIE } from '../prompty/kategorie.mjs'

const PELNA = process.argv.includes('--pelna')
const CONTENT = 'content'
const PUBLIC = 'public'

const jestLiczba = (s) => /^[0-9]+$/.test(s)

// Zbiera landingi: katalog z index.md, którego nazwa nie jest liczbą.
const landingi = []

function przejdz (dir, sciezka) {
  let wpisy
  try { wpisy = readdirSync(dir) } catch { return }

  const podkatalogi = wpisy.filter(n => {
    try { return statSync(join(dir, n)).isDirectory() } catch { return false }
  })
  const liscie = podkatalogi.filter(jestLiczba)
  const dzieci = podkatalogi.filter(n => !jestLiczba(n))

  if (existsSync(join(dir, 'index.md')) && sciezka.length) {
    landingi.push({
      sciezka: sciezka.join('/'),
      liscie: liscie.length,
      podkategorie: dzieci.length,
      // Ścieżki liści trzymamy, bo weryfikacja plików idzie po frontmatterze, nie po katalogu
      katalogiLisci: liscie.map(n => join(dir, n))
    })
  }

  for (const d of dzieci) przejdz(join(dir, d), [...sciezka, d])
}

przejdz(CONTENT, [])

// Kontrola, czy każdy liść ma swój plik na dysku.
//
// UWAGA — tu była pułapka, która wyprodukowała fałszywy alarm o "304 martwych liściach":
// wcześniejsza wersja liczyła pliki w public/<ścieżka contentu>, czyli zakładała, że
// content/zwierzeta/kroliczki odpowiada public/zwierzeta/kroliczki. A tak NIE jest —
// koty, koniki, kroliczki i pieski leżą w public/ na pierwszym poziomie, bez "zwierzeta/".
// Jedynym wiarygodnym źródłem ścieżki jest pole `image:` we frontmatterze liścia,
// bo to ono trafia do strony. Sprawdzamy więc plik po pliku, a nie katalog po katalogu.
function sprawdzLiscie (katalogi) {
  let sa = 0
  const brakuje = []
  for (const kat of katalogi) {
    let tresc
    try { tresc = readFileSync(join(kat, 'index.md'), 'utf8') } catch { brakuje.push(`${kat} (brak index.md)`); continue }
    const m = tresc.match(/^image:\s*["']?(.+?)["']?\s*$/m)
    if (!m) { brakuje.push(`${kat} (brak pola image)`); continue }
    const wzgledna = m[1].replace(/^\//, '')
    if (existsSync(join(PUBLIC, wzgledna))) sa++
    else brakuje.push(m[1])
  }
  return { sa, brakuje }
}

for (const l of landingi) {
  const { sa, brakuje } = sprawdzLiscie(l.katalogiLisci ?? [])
  l.svg = sa
  l.brakujace = brakuje
}

// TWARDY PRÓG LICZBY KOLOROWANEK NA KATEGORIĘ.
// pages/[...slug].vue wplata galerię w sekcje SEO: pod KAŻDĄ sekcją H2 leci dokładnie
// osiem kafelków (`wpleceione = h2Blocks.length * KAFLI_NA_SEKCJE`). Kategoria, która ma
// mniej kolorowanek niż sekcje × 8, pokaże ostatnie sekcje z nagłówkiem i tekstem,
// ale z PUSTĄ galerią pod spodem. Dlatego minimum nie jest kwestią gustu — wynika z copy.
// MUSI się zgadzać z `KAFLI_NA_SEKCJE` w pages/[...slug].vue — tam siatka ma 4 kolumny,
// więc 4 to jeden pełny rząd pod sekcją. Jeśli zmienisz tam, zmień i tu.
const KAFLI_NA_SEKCJE = 4
function liczH2 (sciezka) {
  try {
    const tresc = readFileSync(join(CONTENT, sciezka, 'index.md'), 'utf8')
    // Bez frontmatteru, żeby "## " w opisie YAML-a nie liczyło się jako sekcja
    const body = tresc.replace(/^---[\s\S]*?\n---\n/, '')
    return (body.match(/^##\s+\S/gm) ?? []).length
  } catch { return 0 }
}
for (const l of landingi) {
  l.h2 = liczH2(l.sciezka)
  l.minimum = l.h2 * KAFLI_NA_SEKCJE
}

// Landingi "liściaste" — te, które realnie trzymają kolorowanki
const zLiscmi = landingi.filter(l => l.liscie > 0).sort((a, b) => b.liscie - a.liscie)
const huby = landingi.filter(l => l.liscie === 0)

const sumaLisci = zLiscmi.reduce((s, l) => s + l.liscie, 0)
const sumaSvg = zLiscmi.reduce((s, l) => s + l.svg, 0)
const srednia = zLiscmi.length ? sumaLisci / zLiscmi.length : 0
const posortowane = [...zLiscmi].map(l => l.liscie).sort((a, b) => a - b)
const mediana = posortowane.length
  ? (posortowane.length % 2
      ? posortowane[(posortowane.length - 1) / 2]
      : (posortowane[posortowane.length / 2 - 1] + posortowane[posortowane.length / 2]) / 2)
  : 0

console.log(`── Struktura contentu ───────────────────────────────`)
console.log(`Landingi ogółem:            ${landingi.length}`)
console.log(`  z kolorowankami:          ${zLiscmi.length}`)
console.log(`  huby/rozdzielacze:        ${huby.length}  (same podkategorie, bez liści)`)
console.log(`Kolorowanek (liści) razem:  ${sumaLisci}`)
console.log(`Plików SVG w public/:       ${sumaSvg}`)
console.log(``)
console.log(`Na kategorię z kolorowankami:`)
console.log(`  średnia:                  ${srednia.toFixed(1)}`)
console.log(`  mediana:                  ${mediana}`)
console.log(`  min / max:                ${posortowane[0]} / ${posortowane[posortowane.length - 1]}`)

// Rozkład — pokazuje, czy kategorie są równe, czy kilka gigantów ciągnie średnią
const progi = [[1, 20], [21, 40], [41, 60], [61, 80], [81, 100], [101, 9999]]
console.log(`\nRozkład wielkości kategorii:`)
for (const [od, do_] of progi) {
  const ile = zLiscmi.filter(l => l.liscie >= od && l.liscie <= do_).length
  if (!ile) continue
  const etykieta = do_ === 9999 ? `${od}+`.padEnd(9) : `${od}–${do_}`.padEnd(9)
  console.log(`  ${etykieta} ${String(ile).padStart(3)} kategorii  ${'█'.repeat(Math.round(ile / 2))}`)
}

const doPokazania = PELNA ? zLiscmi : [...zLiscmi.slice(0, 10), null, ...zLiscmi.slice(-5)]
console.log(`\n${PELNA ? 'Wszystkie kategorie' : 'Największe i najmniejsze'} (liście / SVG):`)
for (const l of doPokazania) {
  if (!l) { console.log(`  ...`); continue }
  const ostrzezenie = l.svg !== l.liscie ? `  ⚠ rozjazd content↔public` : ''
  console.log(`  ${String(l.liscie).padStart(4)} / ${String(l.svg).padStart(4)}  ${l.sciezka}${ostrzezenie}`)
}

// Pełna lista brakujących plików — to jest odpowiedź na pytanie "co realnie trzeba zrobić",
// a nie sam licznik rozjazdu.
const zBrakami = zLiscmi.filter(l => l.brakujace.length)
console.log(`\n── Liście bez pliku na dysku ────────────────────────`)
if (!zBrakami.length) {
  console.log(`Brak. Każdy liść ma plik pod ścieżką z frontmatteru.`)
} else {
  let suma = 0
  for (const l of zBrakami) {
    suma += l.brakujace.length
    console.log(`  ${String(l.brakujace.length).padStart(4)}  ${l.sciezka}`)
    for (const b of l.brakujace.slice(0, 3)) console.log(`        ${b}`)
    if (l.brakujace.length > 3) console.log(`        … i ${l.brakujace.length - 3} więcej`)
  }
  console.log(`Razem brakuje: ${suma}`)
}

// Zestawienie contentu z księgą promptów — odpowiedź na "co jeszcze zostało do napisania".
// Trzymane tutaj, a nie w osobnym skrypcie, bo to jedno pytanie: ile z tego już umiemy zrobić.
console.log(`\n── Księga promptów (prompty/kategorie.mjs) ──────────`)
const wKsiedze = new Set(Object.keys(KATEGORIE))
const wContencie = zLiscmi.map(l => l.sciezka)
const nieZarejestrowane = wContencie.filter(s => !wKsiedze.has(s))
const gotowe = wContencie.filter(s => KATEGORIE[s]?.warianty?.length)
const puste = wContencie.filter(s => wKsiedze.has(s) && !KATEGORIE[s].warianty.length)

console.log(`Gotowe (mają warianty):     ${gotowe.length} z ${wContencie.length}`)
console.log(`Zarejestrowane, bez wariantów: ${puste.length}`)
if (nieZarejestrowane.length) {
  console.log(`⚠ Brak w księdze:            ${nieZarejestrowane.length}`)
  for (const s of nieZarejestrowane) console.log(`    ${s}`)
}
const nadmiarowe = [...wKsiedze].filter(k => !wContencie.includes(k))
if (nadmiarowe.length) console.log(`W księdze, ale nie ma takiej kategorii w content: ${nadmiarowe.join(', ')}`)
console.log(`Gotowe: ${gotowe.join(', ') || '—'}`)

// Ile kategorii wytrzyma dany cel, a ile zostanie z pustymi galeriami pod ostatnimi sekcjami.
console.log(`\n── Ile kolorowanek wymaga copy (sekcje H2 × ${KAFLI_NA_SEKCJE}) ──`)
const minima = zLiscmi.map(l => l.minimum).sort((a, b) => a - b)
console.log(`Wymagane minimum — mediana: ${minima[Math.floor(minima.length / 2)]}, max: ${minima[minima.length - 1]}`)
for (const cel of [32, 40, 48, 56, 64]) {
  const zaMalo = zLiscmi.filter(l => l.minimum > cel)
  const brak = zaMalo.reduce((s, l) => s + (l.minimum - cel), 0)
  console.log(`  cel ${String(cel).padStart(3)}:  ${String(zaMalo.length).padStart(3)} z ${zLiscmi.length} kategorii z pustymi sekcjami  (brakuje łącznie ${brak} kafelków)`)
}
const najwieksze = [...zLiscmi].sort((a, b) => b.minimum - a.minimum).slice(0, 5)
console.log(`Najbardziej wymagające kategorie (sekcje H2 → minimum):`)
for (const l of najwieksze) console.log(`  ${String(l.h2).padStart(2)} → ${String(l.minimum).padStart(3)}  ${l.sciezka}`)

// STAWKI (zmierzone 2026-07-28, nie szacowane):
//   recraftv2_vector + "Line art"  → natywny SVG, $0.04, jeden krok
//   styl rastrowy z panelu + wektoryzacja → $0.04 + $0.01 = $0.05, dwa kroki
// Poprzednio stało tu $0.08 (recraftv3_vector) i zawyżało budżet dwukrotnie.
const STAWKI = [
  ['v2 natywny SVG', 0.04],
  ['raster + wektoryzacja', 0.05]
]
const SKUTECZNOSC = 0.75
const KURS = 4

console.log(`\n── Koszt wymiany przy ${SKUTECZNOSC * 100}% skuteczności ──`)
for (const [nazwa, stawka] of STAWKI) {
  console.log(`\n  ${nazwa} ($${stawka.toFixed(2)}/szt.):`)
  const gen = Math.ceil(sumaLisci / SKUTECZNOSC)
  console.log(`    odtworzenie 1:1 (${sumaLisci} szt.):  ~${gen} generacji → $${(gen * stawka).toFixed(0)} (~${(gen * stawka * KURS).toFixed(0)} zł)`)
  for (const cel of [32, 48, 60]) {
    const razem = zLiscmi.length * cel
    const g = Math.ceil(razem / SKUTECZNOSC)
    console.log(`    po ${cel} szt. na kategorię (${razem} szt.):  ~${g} generacji → $${(g * stawka).toFixed(0)} (~${(g * stawka * KURS).toFixed(0)} zł)`)
  }
}
