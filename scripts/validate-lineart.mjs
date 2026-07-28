// Waliduje line-art pod kolorowanki: czy kontury są szczelne, czy kreska nadaje się do druku
// i czy obrazek ma sensowną liczbę obszarów do wypełnienia.
//
// Po co: kolorowanka z jednopikselową szczeliną w konturze jest bezużyteczna — flood fill
// w edytorze wylewa się na całą kartkę. Gołym okiem tego nie widać, a przy generowaniu
// grafik seryjnie (AI) to najczęstsza wada. Ten skrypt odsiewa wadliwe sztuki bez oglądania.
//
// Użycie:
//   node scripts/validate-lineart.mjs public/zwierzeta/koty        # katalog (rekurencyjnie)
//   node scripts/validate-lineart.mjs obrazek.png --width=2000     # pojedynczy plik
//   node scripts/validate-lineart.mjs kandydaci/ --json            # wynik maszynowy
//   node scripts/validate-lineart.mjs kandydaci/ --only-fail       # tylko odrzuty
//
// Wejście: SVG, PNG, JPG, WebP (cokolwiek czyta sharp).
import { readdirSync, statSync, mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { join, extname, dirname, basename } from 'node:path'
import sharp from 'sharp'

// ── Progi akceptacji ────────────────────────────────────────────────────────
// Dobrane pod kolorowanki dziecięce A4. Do kalibracji na własnym materiale:
// puść skrypt na istniejącej, sprawdzonej kategorii i zobacz, w jakich widełkach siedzi.
const INK_MIN        = 0.015 // min. udział czerni — mniej = kreska zbyt uboga/wyblakła
const INK_MAX        = 0.35  // max — więcej = obrazek zamalowany, mało do kolorowania
const GRAY_MAX       = 0.06  // max udział półtonów — AI lubi dorzucać cieniowanie, które psuje wypełnianie
// 3, nie 4: prosty śpiący kot albo idący kot bokiem mają legalnie 3 zamknięte obszary
// i są poprawnymi kolorowankami dla malucha. Poniżej trzech mamy już realny przeciek.
const REGIONS_MIN    = 3     // min. liczba osobnych obszarów do wypełnienia
const HAIRLINE_MAX   = 0.45  // max udział czerni ginącej po erozji 1px — więcej = włosowate linie, złe w druku

// Lite plamy czerni — najgroźniejsza realna wada. Dziecko ich nie pokoloruje,
// a drukarka atramentowa zużywa na nie absurdalne ilości tuszu. Mierzymy je erozją
// wielokrotną: kreska, nawet gruba, znika po kilku przejściach, a zwarta płaszczyzna
// zostaje. Udział tego, co przetrwa, liczony do CAŁEGO kadru.
// Liczba erozji musi przekraczać grubość NAJGRUBSZEJ zamierzonej kreski, inaczej
// gruby kontur (o który prosimy w prompcie) sam zostanie uznany za plamę.
// Przy szerokości roboczej 1500 px kontur ma ~8–15 px, więc 12 przejść go zdejmuje,
// a płaszczyzna liczona w setkach pikseli zostaje.
// Podniesione z 0.08 na 0.12 świadomie. Przy ośmiu procentach walidator wymuszał
// walkę z KAŻDYM czarnym akcentem, a ta walka degradowała rysunki: znikały sceneria,
// kontrast i charakter, zostawały sterylne sylwetki. Stylizowana grzywa czy czarne
// kopyto to normalny język kolorowanki, nie wada — dziecko koloruje wokół nich.
// Automat ma łapać wyłącznie płachty zajmujące kawał kartki (te szły po 15–25%).
// Ocena estetyczna należy do człowieka przy przeglądzie w galerii.
const SOLID_MAX      = 0.12
const EROZJE         = 12

// Udział bieli zamkniętej w konturach. UWAGA na interpretację: przy rysunku scenicznym
// (jaszczurka na kamieniu, niebo, trawa) większość bieli słusznie łączy się z krawędzią
// kadru, bo tło jest otwarte — i to NIE jest wada. Realny przeciek poznaje się po tym,
// że zamkniętych obszarów jest bardzo mało LUB nie ma ich prawie wcale.
// Próg 0.12 odrzucał poprawne kolorowanki sceniczne. Zszedł do 0.015 i pełni już tylko
// rolę zabezpieczenia przed katastrofalnym przeciekiem — właściwą robotę wykonuje
// REGIONS_MIN, bo obrazek z dziurą w konturze nie ma prawie żadnych zamkniętych obszarów.
const INTERIOR_MIN   = 0.015

const BLACK_AT       = 128   // próg binaryzacji
const GRAY_LO        = 60    // piksele między GRAY_LO a GRAY_HI liczymy jako półtony
const GRAY_HI        = 200
const MIN_REGION_FRAC = 0.0002 // obszary mniejsze niż 0,02% kadru to śmieci, nie liczymy ich

// ── Parsowanie argumentów ───────────────────────────────────────────────────
const argv     = process.argv.slice(2)
const targets  = argv.filter(a => !a.startsWith('--'))
const WIDTH    = Number((argv.find(a => a.startsWith('--width=')) ?? '').split('=')[1]) || 1500
const AS_JSON  = argv.includes('--json')
const ONLY_FAIL = argv.includes('--only-fail')
// --segreguj rozkłada pliki do podkatalogów ok/ i odrzut/ obok źródła.
// Operacja jest powtarzalna: po zmianie progów wystarczy uruchomić ponownie na katalogu
// nadrzędnym, a pliki przeskoczą tam, gdzie należą.
const SEGREGUJ = argv.includes('--segreguj')

// Strojenie progów bez edycji pliku — przydatne przy kalibracji na nowej kategorii.
const P_INTERIOR = Number((argv.find(a => a.startsWith('--interior=')) ?? '').split('=')[1]) || INTERIOR_MIN
const P_REGIONS  = Number((argv.find(a => a.startsWith('--regions=')) ?? '').split('=')[1]) || REGIONS_MIN
const P_SOLID    = Number((argv.find(a => a.startsWith('--solid=')) ?? '').split('=')[1]) || SOLID_MAX
const P_EROZJE   = Number((argv.find(a => a.startsWith('--erozje=')) ?? '').split('=')[1]) || EROZJE

if (!targets.length) {
  console.error('Podaj plik lub katalog. Przykład: node scripts/validate-lineart.mjs public/zwierzeta/koty')
  process.exit(2)
}

const EXTS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp'])

const files = []
for (const t of targets) {
  const st = statSync(t)
  if (st.isDirectory()) {
    ;(function walk (dir) {
      for (const name of readdirSync(dir)) {
        // katalogi na podkreślnik to nasze wytwory (arkusze stykowe, raporty), nie materiał
        if (name.startsWith('_')) continue
        const p = join(dir, name)
        if (statSync(p).isDirectory()) walk(p)
        // pomijamy wygenerowane podglądy — to nie są źródła
        else if (EXTS.has(extname(name).toLowerCase()) && !/-thumb\.|-view\./.test(name)) files.push(p)
      }
    })(t)
  } else files.push(t)
}

// ── Analiza pojedynczego obrazka ────────────────────────────────────────────
async function analyse (file) {
  const { data, info } = await sharp(file, { density: 200 })
    .flatten({ background: '#ffffff' })   // SVG bywa przezroczysty; przezroczystość ≠ biel
    .greyscale()
    .resize({ width: WIDTH, withoutEnlargement: false })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width, h = info.height, n = w * h

  // state: 0 = biel nieodwiedzona, 1 = czerń (kontur), 2 = biel połączona z krawędzią (tło)
  const state = new Uint8Array(n)
  let ink = 0, gray = 0
  for (let i = 0; i < n; i++) {
    const v = data[i]
    if (v < BLACK_AT) { state[i] = 1; ink++ }
    if (v > GRAY_LO && v < GRAY_HI) gray++
  }

  // 1) Zalewamy biel od krawędzi kadru. To, co zostanie niezalane, jest zamknięte w konturach.
  const stack = []
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x) }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1) }
  while (stack.length) {
    const i = stack.pop()
    if (state[i] !== 0) continue
    state[i] = 2
    const x = i % w, y = (i / w) | 0
    if (x > 0)     stack.push(i - 1)
    if (x < w - 1) stack.push(i + 1)
    if (y > 0)     stack.push(i - w)
    if (y < h - 1) stack.push(i + w)
  }

  // 2) Zliczamy zamknięte obszary — to są miejsca, które dziecko może wypełnić kolorem.
  const minArea = Math.max(16, Math.floor(n * MIN_REGION_FRAC))
  let interior = 0, regions = 0, largestRegion = 0
  for (let s = 0; s < n; s++) {
    if (state[s] !== 0) continue
    let area = 0
    const q = [s]
    state[s] = 3
    while (q.length) {
      const i = q.pop()
      area++
      const x = i % w, y = (i / w) | 0
      if (x > 0     && state[i - 1] === 0) { state[i - 1] = 3; q.push(i - 1) }
      if (x < w - 1 && state[i + 1] === 0) { state[i + 1] = 3; q.push(i + 1) }
      if (y > 0     && state[i - w] === 0) { state[i - w] = 3; q.push(i - w) }
      if (y < h - 1 && state[i + w] === 0) { state[i + w] = 3; q.push(i + w) }
    }
    interior += area
    if (area >= minArea) { regions++; if (area > largestRegion) largestRegion = area }
  }

  // 3) Erozja 1px: ile czerni znika, gdy zetrzemy pikselową obwódkę.
  //    Dużo = linie włosowate, które w druku bledną, a przy skalowaniu pękają.
  let eroded = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      if (state[i] !== 1) continue
      if (state[i - 1] === 1 && state[i + 1] === 1 && state[i - w] === 1 && state[i + w] === 1) eroded++
    }
  }

  // 4) Erozja wielokrotna: co zostaje po zdjęciu kilku warstw. Kreska znika,
  //    lita plama zostaje — to odróżnia gęsty rysunek od czarnego tła.
  let czern = new Uint8Array(n)
  for (let i = 0; i < n; i++) czern[i] = state[i] === 1 ? 1 : 0
  for (let k = 0; k < P_EROZJE; k++) {
    const nast = new Uint8Array(n)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x
        if (czern[i] && czern[i - 1] && czern[i + 1] && czern[i - w] && czern[i + w]) nast[i] = 1
      }
    }
    czern = nast
  }
  let solid = 0
  for (let i = 0; i < n; i++) if (czern[i]) solid++

  const white     = n - ink
  const inkRatio  = ink / n
  const grayRatio = gray / n
  const interiorRatio = white ? interior / white : 0
  const hairline  = ink ? 1 - (eroded / ink) : 1
  const solidRatio = solid / n

  // TRZY ZASTOSOWANIA, TRZY WERDYKTY.
  //
  // Wcześniej wszystko wpadało do jednego worka i obrazek nadający się doskonale do druku
  // dostawał "ODRZUT" za nieszczelny kontur — a szczelność ma znaczenie WYŁĄCZNIE dla
  // wypełniania online, które jest u nas dodatkiem, nie podstawą. Jedna wspólna ocena
  // kasowała więc dobry materiał.
  //
  //   druk     — czy da się to wydrukować i pokolorować kredkami. Liczy się tusz i czytelność.
  //              Szczelność konturu NIE ma tu żadnego znaczenia.
  //   online   — czy zadziała flood fill. Tu z kolei kontur musi być zamknięty.
  //   maluchy  — czy kreska jest dość gruba i obszary dość duże dla małego dziecka.
  //
  // Uwaga o `hairline`: mierzy udział czerni ginącej po erozji 1 px przy szerokości
  // roboczej 1500 px. Na A4 to ~0,127 mm na piksel, więc "kreska włosowata" ma około
  // 0,25 mm — a to drukuje się bez problemu. Wysoki wynik NIE znaczy "zniknie w druku",
  // tylko "rysunek jest drobny i delikatny". Dlatego liczy się do profilu `maluchy`,
  // a nie do `druk`.
  const wady = { druk: [], online: [], maluchy: [] }

  if (inkRatio < INK_MIN) {
    const t = `kreska zbyt uboga (${(inkRatio * 100).toFixed(1)}% czerni)`
    wady.druk.push(t); wady.online.push(t); wady.maluchy.push(t)
  }
  if (inkRatio > INK_MAX) {
    const t = `zbyt ciemny (${(inkRatio * 100).toFixed(1)}% czerni)`
    wady.druk.push(t); wady.online.push(t); wady.maluchy.push(t)
  }
  if (grayRatio > GRAY_MAX) {
    // Półtony psują jedno i drugie: w druku wychodzą rastrem, a flood fill się o nie rozlewa.
    const t = `półtony/cieniowanie (${(grayRatio * 100).toFixed(1)}%)`
    wady.druk.push(t); wady.online.push(t); wady.maluchy.push(t)
  }
  if (solidRatio > P_SOLID) {
    const t = `LITE PLAMY CZERNI (${(solidRatio * 100).toFixed(1)}% kadru) — nie do pokolorowania, żre tusz`
    wady.druk.push(t); wady.online.push(t); wady.maluchy.push(t)
  }
  if (interiorRatio < P_INTERIOR) {
    // Wyłącznie online — na papierze nikt nie zauważy, że kontur ma przerwę.
    wady.online.push(`NIESZCZELNE KONTURY (zamknięte tylko ${(interiorRatio * 100).toFixed(1)}% bieli)`)
  }
  if (regions < P_REGIONS) {
    const t = `za mało obszarów do wypełnienia (${regions})`
    wady.online.push(t); wady.maluchy.push(t)
  }
  if (hairline > HAIRLINE_MAX) {
    wady.maluchy.push(`drobna kreska (${(hairline * 100).toFixed(0)}% włosowatej) — dla starszych dzieci`)
  }

  const profile = {
    druk: wady.druk.length === 0,
    online: wady.online.length === 0,
    maluchy: wady.maluchy.length === 0
  }

  return {
    file,
    // `ok` = nadaje się do DRUKU, bo to podstawowe zastosowanie biblioteki.
    ok: profile.druk,
    profile,
    inkRatio, grayRatio, interiorRatio, hairline, solidRatio,
    regions,
    // proxy złożoności — przydatne do automatycznego tagowania trudności
    complexity: regions < 15 ? 'latwa' : regions < 45 ? 'srednia' : 'trudna',
    // Zbiorcza lista wad z adnotacją, czego dotyczą — do wypisania w konsoli i w galerii.
    fails: [
      ...wady.druk.map(t => t),
      ...wady.online.filter(t => !wady.druk.includes(t)).map(t => `[online] ${t}`),
      ...wady.maluchy.filter(t => !wady.druk.includes(t) && !wady.online.includes(t)).map(t => `[maluchy] ${t}`)
    ],
    wady
  }
}

// ── Przebieg ────────────────────────────────────────────────────────────────
const results = []
const CONCURRENCY = 8
const queue = [...files]
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const f = queue.pop()
    try { results.push(await analyse(f)) }
    catch (e) { results.push({ file: f, ok: false, fails: [`błąd odczytu: ${e.message}`], regions: 0 }) }
  }
}))

results.sort((a, b) => a.file.localeCompare(b.file))

// Raport obok plików — galeria go czyta i wypisuje powód odrzutu na kafelku.
// Bez tego werdykt istniał tylko w konsoli, więc przy ocenianiu obrazków trzeba było
// zestawiać nazwy plików z listą w terminalu. Werdykt ma być widoczny NA obrazku,
// bo to obrazek się ocenia. Nazwa z podkreśleniem — galeria pomija pliki na `_`.
// Grupujemy po katalogu źródłowym, bo walidator przyjmuje wiele celów naraz i schodzi
// w podkatalogi — jeden zbiorczy raport trafiłby nie tam, gdzie leżą pliki.
const wgKatalogu = new Map()
for (const r of results) {
  const d = dirname(r.file)
  if (!wgKatalogu.has(d)) wgKatalogu.set(d, {})
  wgKatalogu.get(d)[basename(r.file)] = {
    ok: r.ok, profile: r.profile, fails: r.fails ?? [], regions: r.regions, complexity: r.complexity
  }
}
for (const [d, wpisy] of wgKatalogu) {
  try { writeFileSync(join(d, '_walidacja.json'), JSON.stringify(wpisy, null, 2), 'utf8') }
  catch { /* raport to wygoda, nie warunek działania walidatora */ }
}

if (AS_JSON) {
  console.log(JSON.stringify(results, null, 2))
} else {
  for (const r of results) {
    if (ONLY_FAIL && r.ok) continue
    if (r.ok) {
      console.log(`OK    ${r.file}  [obszary: ${r.regions}, ${r.complexity}]`)
    } else {
      console.log(`ODRZUT ${r.file}`)
      for (const f of r.fails) console.log(`         → ${f}`)
    }
  }
  const ok = results.filter(r => r.ok).length
  const pct = results.length ? ((ok / results.length) * 100).toFixed(1) : '0.0'
  console.log(`\nPrzeanalizowano: ${results.length}, do DRUKU: ${ok} (${pct}%), odpada: ${results.length - ok}`)
  const ilu = (k) => results.filter(r => r.profile?.[k]).length
  console.log(`  z tego nadaje się też do kolorowania online: ${ilu('online')}, dla maluchów: ${ilu('maluchy')}`)
}

if (SEGREGUJ) {
  let przeniesione = 0
  for (const r of results) {
    // Katalog bazowy to ten, w którym plik leży teraz — chyba że już siedzi
    // w ok/ albo odrzut/, wtedy cofamy się poziom wyżej, żeby nie zagnieżdżać.
    let baza = dirname(r.file)
    if (['ok', 'odrzut'].includes(basename(baza))) baza = dirname(baza)
    const cel = join(baza, r.ok ? 'ok' : 'odrzut')
    const nowy = join(cel, basename(r.file))
    if (nowy === r.file) continue
    try {
      mkdirSync(cel, { recursive: true })
      renameSync(r.file, nowy)
      przeniesione++
    } catch (e) {
      console.error(`  nie przeniesiono ${basename(r.file)}: ${e.message}`)
    }
  }
  console.log(`Posegregowano: ${przeniesione} plików do podkatalogów ok/ i odrzut/`)
}
