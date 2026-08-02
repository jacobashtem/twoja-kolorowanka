// Generuje surowy line-art do katalogu roboczego. Nie dotyka public/ — to materiał do przeglądu.
//
// Dwa silniki, świadomie, żeby dało się je porównać na tym samym materiale:
//   --provider=recraft  API Recrafta. Model wybierasz przez --model (patrz MODELE niżej).
//                       Warianty "vector" dają natywny SVG i pomijają trasowanie.
//   --provider=flux     Flux.1 dev przez fal.ai — raster (.png), najtańszy, do zwektoryzowania.
//
// Klucze (ustaw w PowerShellu przed uruchomieniem):
//   $env:RECRAFT_API_TOKEN = "..."   # https://www.recraft.ai/  → API
//   $env:FAL_KEY           = "..."   # https://fal.ai/dashboard/keys
//
// Użycie:
//   node scripts/lineart-generate.mjs kombajny --count=20 --dry-run          # prompty + koszt, nic nie wysyła
//   node scripts/lineart-generate.mjs kombajny --count=20 --model=utility    # raster $0.035
//   node scripts/lineart-generate.mjs kombajny --count=20 --model=v41-vector # natywny SVG $0.08
//   node scripts/lineart-generate.mjs kombajny --count=20 --provider=flux
//
// Generuj ZAWSZE z zapasem — część sztuk odpadnie na walidacji i na przeglądzie.
import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { KATEGORIE } from '../prompty/kategorie.mjs'

// Wczytuje klucze z pliku .env w katalogu projektu (jest w .gitignore).
// Zmienne ustawiane w terminalu nie przeżywają zamknięcia okna i różnią się składnią
// między bashem a PowerShellem — plik jest odporny na jedno i drugie.
// Format pliku:  RECRAFT_API_TOKEN=twoj-klucz
function wczytajEnv () {
  try {
    for (const linia of readFileSync('.env', 'utf8').split(/\r?\n/)) {
      const m = linia.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (!m || linia.trimStart().startsWith('#')) continue
      const klucz = m[1]
      const wartosc = m[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[klucz]) process.env[klucz] = wartosc
    }
  } catch { /* brak .env to nie błąd — klucz może być w zmiennych środowiskowych */ }
}
wczytajEnv()

// ══ WZORZEC PROMPTU ═════════════════════════════════════════════════════════
//
//   {temat} {poza}, {trudność} drawing, thick even outline, white, unfilled
//
// Trzy kanały, każdy robi swoje, nic się nie dubluje:
//   1. `style: "Line art"`      → styl. Już wymusza kreskę, więc NIE powtarzamy tego słowami.
//   2. prompt pozytywny         → CO ma być na obrazku, wyłącznie twierdząco, kilkanaście słów.
//   3. `negative_prompt`        → czego ma nie być. Tu i TYLKO tu idą wszystkie zakazy.
//   4. `controls.artistic_level`→ 0 = "static and clean", czyli brak udziwnień.
//
// Dlaczego tak krótko: zakazy wpisane do promptu pozytywnego działają przeciw sobie,
// bo "no dark colouring" karmi model tokenami "dark". Wcześniejsza wersja miała
// 60 słów ograniczeń w kanale opisowym i sama sobie przeszkadzała.
//
// Droga, którą do tego doszliśmy (nie powtarzać błędów):
//   • czerń w TLE   — model wypełniał liście, krzaki i cień, bo prompt zamawiał scenerię;
//   • czerń w CIELE — po naprawieniu tła przeniósł wypełnienia na zwierzę, bo sylwetka
//                     JEST najprostszym kształtem, gdy prosisz o "very simple shapes";
//   • czerń w DETALACH — koty wychodziły łaciate, bo takie są prawdziwe koty.
// Wszystkie trzy fronty siedzą teraz w NEGATYW, nie w opisie.
// "full body fills the frame" doszło po konikach: część sztuk miała zwierzę wielkości
// znaczka pocztowego pośrodku pustej kartki, co w druku daje bezużyteczną kolorowankę.
const KONTUR = 'full body fills the frame, thick even outline, white, unfilled'

// Trudność to JEDNO określenie, nie akapit — reszta opisu jest wspólna, więc różnice
// między poziomami są czyste i porównywalne. Neutralne gatunkowo: przy pierwszej wersji
// były pisane pod gady ("scale patterns") i kot wychodziłby w łuskach.
// UWAGA na historię tego pola. Przez chwilę stało tu "very simple" i to był błąd:
// model rozumiał to jako polecenie odarcia rysunku z charakteru, a nie ułatwienia go
// dziecku. Wychodziły poprawne, sterylne sylwetki bez wyrazu. "Simple" ma opisywać
// CZYTELNOŚĆ dla malucha, nie ubóstwo rysunku — stąd "bold and friendly" zamiast "very simple".
// `art` to poziom artystyczny przypisany do stopnia trudności — wynik sweepu po
// wszystkich wartościach 0–5 na tych samych tematach:
//   0 → frontalne, statyczne, martwe. "Koń przeskakujący płot" wyszedł jako koń STOJĄCY za płotem.
//   2 → czysto i poprawnie, ale konwencjonalnie.
//   3 → wyraźnie więcej życia: rozwiane grzywy, realny ruch, faktura podłoża.
//   4 → model sam dodaje LUDZI (dziewczynka przy koniu, jeździec) i sceny; kreska luźniejsza
//       (włosowatość 13% wobec 8%), ale nadal szczelna.
//   5 → pełna ilustracja książkowa, kreska szkicowa, przypadkowe kreski ruchu — za dużo.
//
// Stąd rampa: maluch dostaje spokojny rysunek, starsze dziecko scenę z postacią.
const TRUDNOSC = {
  latwa:   { opis: 'simple bold friendly',       art: 2, obszary: '5–15' },
  srednia: { opis: 'charming detailed',          art: 3, obszary: '15–40' },
  trudna:  { opis: 'richly detailed decorative', art: 4, obszary: '40+' }
}

// artistic_level (0–5, tylko V3). UWAGA na pułapkę: dokumentacja opisuje zero jako
// "the person looks straight at the camera in a static style" — i to działa DOSŁOWNIE.
// Przy zerze konie wyszły niemal wyłącznie frontalnie i statycznie, ignorując pozy
// z promptu (bok, galop, stanie dęba). Zero kasuje różnorodność ujęć.
// Dwójka zachowuje spokojną, czytelną kreskę, ale wpuszcza z powrotem zmienność pozy.
const POZIOM_ARTYSTYCZNY = 2

// Odcięcie wypełnień na poziomie API. Parametr `negative_prompt` obsługują modele V2/V3 —
// czyli dokładnie te, których używamy. Działa skuteczniej niż dopisywanie zakazów
// do promptu pozytywnego, bo nie konkuruje z opisem tematu.
// Dwa fronty naraz. Pierwsza linia odcina czarne TŁO (liście, krzaki, cień, kamienie).
// Druga odcina czarne WNĘTRZE zwierzęcia — po naprawieniu tła model przeniósł
// wypełnienia na ciało: kameleon wychodził litą sylwetką, kryza agamy czarnymi klinami.
// PRZYCIĘTY ŚWIADOMIE. Poprzednia wersja miała pięć "frontów" mikrozarządzania
// (czarne uszy, łapy, skarpetki, grzywa, kopyta) i efekt był odwrotny do zamierzonego:
// czerni nie ubyło (test na koniach: 3,7% → 4,0%), a rysunki straciły charakter,
// bo model zaczął unikać kontrastu w ogóle.
//
// Zostają tylko zakazy rzeczy, które robią kolorowankę NIEUŻYWALNĄ: wielkie zalane
// płaszczyzny i półtony psujące wypełnianie kolorem. Drobne czarne akcenty — oko,
// nozdrze, kopyto, stylizowana grzywa — to normalny język kolorowanki, nie wada.
// Duże płachty i tak wyłapie walidator, a resztą zajmuje się oko przy przeglądzie.
const NEGATYW = 'large solid black areas, black background, filled silhouette, ' +
                'shading, gradient, gray, halftone, crosshatching, texture fill, ' +
                'photo, realistic rendering, text, watermark, frame'

// Rozkład w serii: przewaga łatwych, bo tam jest masa odbiorców (strony wiekowe 2–7 lat).
// --ramp=latwa | srednia | trudna wymusza jeden poziom na całą serię.
const ROZKLAD = [
  { do: 0.45, poziom: 'latwa' },
  { do: 0.85, poziom: 'srednia' },
  { do: 1.00, poziom: 'trudna' }
]

// ── Proporcje kadru ─────────────────────────────────────────────────────────
// Modele WEKTOROWE przyjmują wyłącznie proporcje (`w:h`), nie wymiary w pikselach —
// SVG jest niezależny od rozdzielczości, więc piksele nie mają tam sensu. V4 Vector
// odrzuca `1024x1434` właśnie z tego powodu (V3 Vector jeszcze to toleruje).
//
// A4 ma proporcję 1:1,4142 (297/210). Najbliżej leży `10:14`, czyli 1:1,400 —
// rozjazd poniżej procenta, w druku niewidoczny. Kwadrat na A4 zostawiłby
// około 30% strony pustej, dlatego nie jest domyślny.
const ROZMIARY = {
  pion:    '10:14', // domyślny — kolorowanka na A4 pionowo
  poziom:  '14:10', // pojazdy, pociągi, krajobrazy — wypełniają A4 poziomo
  kwadrat: '1:1'    // mandale i inne kompozycje symetryczne
}

// ── Katalogi tematyczne ─────────────────────────────────────────────────────
// warianty  – dopisywane rotacyjnie, żeby seria nie była 40 razy tym samym obrazkiem
// grubosc   – młodsze dzieci potrzebują grubszej kreski i prostszych kształtów
// format    – klucz z ROZMIARY; pojazdy są szerokie, więc idą poziomo
// substyl   – nadpisuje domyślny substyl modelu. Recraft daje przy line_art skalę
//             od prostych po bardzo złożone — wpisz tu identyfikator odczytany
//             z panelu, gdy chcesz sterować szczegółowością pod wiek dziecka.
// Kategorie i pule scen mieszkają w prompty/ — przy 75 kategoriach trzymanie ich
// w generatorze robiło z niego plik nie do czytania, a i tak są danymi, nie kodem.
// Rejestr: prompty/kategorie.mjs, pule scen: prompty/sceny.mjs, zasady: docs/ksiega-promptow.md
//
// Klucze rejestru to pełne ścieżki contentu ("zwierzeta/koty"), żeby dało się je zestawić
// ze stat-kategorie.mjs. W wierszu poleceń wystarczy ostatni segment ("koty").

// ── Modele Recrafta ─────────────────────────────────────────────────────────
// API jest zgodne z OpenAI: POST https://external.api.recraft.ai/v1/images/generations
// z nagłówkiem Bearer. Potwierdzony format identyfikatora to podkreślnik: "recraftv4_vector".
//
// Ceny wg cennika z lipca 2026 (USD za obrazek). Identyfikatory wariantów 4.1 są
// PRZYPUSZCZENIEM — potwierdź je w panelu i w razie czego nadpisz flagą --model-id=...
// bez edytowania tego pliku. Dry-run wypisuje pełne body żądania do weryfikacji.
//
// Uwaga na "utility": opis producenta to "flat lighting, front-facing composition,
// minimal visual drama" — czyli dokładnie to, czego chce kolorowanka. "Artystyczna
// swoboda" droższych modeli jest tu wadą, nie zaletą. Zaczynaj od niego.
//
// KLUCZOWE (dokumentacja Recrafta): "Styles are not yet supported for V4 models".
// Cała rodzina V4/V4.1 — łącznie z Utility — ignoruje parametr `style`. Sterowanie
// stylem mają wyłącznie modele V3 i V2, i to przez CZYTELNE NAZWY ("Line art"),
// a nie identyfikatory z podkreślnikami. Stary schemat style+substyle należy do V2/V3.
//
// Wniosek dla kolorowanek: żeby ŚWIADOMIE wymusić kreskę konturową, trzeba użyć
// recraftv3_vector ze stylem "Line art". V4.1 Vector jest nowszy i ładniejszy,
// ale bez sterowania stylem — dostaniesz jego styl domyślny, jaki by nie był.
// Dlatego oba są w zestawieniu: sonda pokaże, który realnie wygląda jak kolorowanka.
//
// styl: '' = nie wysyłamy pola w ogóle (model użyje domyślnego)
const MODELE = {
  // UWAGA: identyfikatory mają PODKREŚLNIKI, nie kropki — `recraftv4_1_vector`.
  // Zapis z kropką zwraca "Model is not available".
  //
  // ZWYCIĘZCY SONDY (walidator + ogląd, 2026-07-27):
  //   v3 → czysty kontur, 38 obszarów, trudność średnia — domyślny
  //   v2 → grubsza i prostsza kreska, 8 obszarów, trudność łatwa — pod maluchy
  // Odpadły: Vector art, Bold stroke, Cutout, Sharp contrast (figury wypełnione kolorem),
  // Engraving i Linocut (niemal czarne), Marker outline i Thin (nieszczelne kontury).
  'v3':                 { id: 'recraftv3_vector',            cena: 0.08,  wektor: true,  styl: 'Line art', substyl: '' },
  'v2':                 { id: 'recraftv2_vector',            cena: 0.04,  wektor: true,  styl: 'Line art', substyl: '' },
  // V4/V4.1 — nowsze modele, ale BEZ możliwości ustawienia stylu (dostajesz domyślny)
  'v41-vector':         { id: 'recraftv4_1_vector',          cena: 0.08,  wektor: true,  styl: '', substyl: '' },
  'v41-utility-vector': { id: 'recraftv4_1_utility_vector',  cena: 0.08,  wektor: true,  styl: '', substyl: '' },
  'v4-vector':          { id: 'recraftv4_vector',            cena: 0.08,  wektor: true,  styl: '', substyl: '' },
  'v41-pro-vector':     { id: 'recraftv4_1_pro_vector',      cena: 0.30,  wektor: true,  styl: '', substyl: '' },
  'utility':            { id: 'recraftv4_1_utility',         cena: 0.035, wektor: false, styl: '', substyl: '' }
}
const CENA_FLUX = 0.025 // orientacyjnie, fal.ai Flux.1 dev

// ── Argumenty ───────────────────────────────────────────────────────────────
const argv      = process.argv.slice(2)
const kategoria = argv.find(a => !a.startsWith('--'))
const COUNT     = Number((argv.find(a => a.startsWith('--count=')) ?? '').split('=')[1]) || 20
const SEED0     = Number((argv.find(a => a.startsWith('--seed=')) ?? '').split('=')[1]) || 1
const PROVIDER  = (argv.find(a => a.startsWith('--provider=')) ?? '--provider=recraft').split('=')[1]
const MODEL_KEY = (argv.find(a => a.startsWith('--model=')) ?? '--model=v3').split('=')[1]
const DRY       = argv.includes('--dry-run')
const RAMP      = (argv.find(a => a.startsWith('--ramp=')) ?? '').split('=')[1] || ''
// --artistic=N nadpisuje poziom artystyczny i trafia do nazwy katalogu,
// żeby dało się porównać kilka poziomów obok siebie na tych samych tematach.
const ART_FLAGA = argv.find(a => a.startsWith('--artistic='))
const ART       = ART_FLAGA ? Number(ART_FLAGA.split('=')[1]) : null

// --goly odtwarza dokładnie formułę, na której powstały jaszczurki — jedyną serię
// uznaną za naprawdę udaną. Prompt to WYŁĄCZNIE temat i poza, request zawiera tylko
// model, style i rozmiar. Zero słów o stylu, zero negatywu, zero artistic_level.
// Cała późniejsza maszyneria powstała w reakcji na czarne płachty i przy okazji
// wyprała rysunki z charakteru.
const GOLY = argv.includes('--goly')

// --krok=N rozrzuca próbkę po przestrzeni kombinacji zamiast brać N pierwszych.
// Przy krzyżowaniu gatunek×scena pierwsze N sztuk to zawsze TA SAMA scena, więc
// próbka kalibracyjna nie pokazywałaby, czy sceny działają. Krok równy liczbie
// gatunków plus jeden przesuwa obie osie naraz.
const KROK = Number((argv.find(a => a.startsWith('--krok=')) ?? '').split('=')[1]) || 1

// --od=N przesuwa punkt startu w przestrzeni kombinacji. Sam --krok tego nie załatwia,
// bo pierwsza sztuka wypada zawsze na idx 0, czyli na tym samym gatunku i tej samej scenie
// niezależnie od kroku. Przy porównywaniu kilku stylów obok siebie każdy dostaje własne --od
// i dzięki temu własny zestaw koni i scenerii, zamiast trzeciej kopii tego samego pomysłu.
const OD = Number((argv.find(a => a.startsWith('--od=')) ?? '').split('=')[1]) || 0

// --zestaw=nazwa bierze warianty (i ewentualnie własną pulę scen) z pola `zestawy`
// kategorii zamiast z głównych. Powstało dla królików: bajkowa dwunastka zostaje na
// swoim miejscu, a obok niej stoi druga, naturalistyczna. Zestawów NIE mieszamy w jednym
// przebiegu — „oversized head" obok „loaf shape" dałoby serię bez wspólnego charakteru.
// Nazwa trafia też do katalogu wyjściowego, żeby serie się nie nadpisały.
const ZESTAW = (argv.find(a => a.startsWith('--zestaw=')) ?? '').split('=')[1] || ''

// --prompt="..." omija obie osie i wysyła podany tekst dosłownie, dla wszystkich sztuk serii
// (różnicuje je tylko seed). Furtka do testów w rodzaju "czy pięć słów nie wypada lepiej
// niż nasz rozbudowany opis" — przy jaszczurkach wygrał prompt minimalny, więc pytanie
// wraca przy każdej nowej kategorii i lepiej mieć na nie tanią odpowiedź.
// Kategorię i tak trzeba podać, bo z niej bierzemy format i katalog roboczy.
const PROMPT = (argv.find(a => a.startsWith('--prompt=')) ?? '').split('=').slice(1).join('=')

// Rejestr trzyma pełne ścieżki contentu ("zwierzeta/koty"), ale w wierszu poleceń
// wygodniej pisać sam ogon ("koty"). Skrót akceptujemy tylko wtedy, gdy jest
// jednoznaczny — przy dwóch "myszki" trzeba podać pełną ścieżkę, bo inaczej
// wygenerowalibyśmy w złą kategorię i dowiedzieli się o tym po fakcie.
const klucze = Object.keys(KATEGORIE)
let klucz = klucze.includes(kategoria) ? kategoria : null
if (!klucz && kategoria) {
  const trafienia = klucze.filter(k => k.split('/').pop() === kategoria)
  if (trafienia.length === 1) klucz = trafienia[0]
  else if (trafienia.length > 1) {
    console.error(`Skrót "${kategoria}" jest niejednoznaczny: ${trafienia.join(', ')}`)
    console.error('Podaj pełną ścieżkę.')
    process.exit(2)
  }
}

const cfgBazowe = KATEGORIE[klucz]
if (!cfgBazowe) {
  console.error(`Nieznana kategoria: ${kategoria ?? '(brak)'}`)
  console.error(`Dostępne: ${klucze.join(', ')}`)
  console.error('Nową dopisz w prompty/kategorie.mjs.')
  process.exit(2)
}

// Zestaw nadpisuje tylko te pola, które sam podaje. Format, grubość i `biale` zostają
// od kategorii, bo to wciąż ta sama kategoria — zmienia się pomysł na warianty, nie temat.
const zestaw = ZESTAW ? cfgBazowe.zestawy?.[ZESTAW] : null
if (ZESTAW && !zestaw) {
  const dostepne = Object.keys(cfgBazowe.zestawy ?? {})
  console.error(`Kategoria "${klucz}" nie ma zestawu "${ZESTAW}".`)
  console.error(dostepne.length
    ? `Dostępne zestawy: ${dostepne.join(', ')}`
    : 'Ta kategoria nie ma żadnych zestawów — pomiń --zestaw.')
  process.exit(2)
}
const cfg = { ...cfgBazowe, ...(zestaw ?? {}) }
if (!PROMPT && !cfg.warianty?.length) {
  console.error(`Kategoria "${klucz}" jest zarejestrowana, ale nie ma jeszcze wariantów.`)
  console.error('Uzupełnij pole `warianty` w prompty/kategorie.mjs (12 pozycji, każda musi zmieniać KONTUR).')
  console.error('Zasady: docs/ksiega-promptow.md')
  process.exit(2)
}

// Katalog roboczy zostaje płaski (lineart-work/koty), bo tak wyglądają dotychczasowe serie.
const katalogRoboczy = klucz.split('/').pop()
if (!['recraft', 'flux'].includes(PROVIDER)) {
  console.error(`Nieznany provider: ${PROVIDER}. Dostępne: recraft, flux`)
  process.exit(2)
}

const model = MODELE[MODEL_KEY]
if (PROVIDER === 'recraft' && !model) {
  console.error(`Nieznany model: ${MODEL_KEY}. Dostępne: ${Object.keys(MODELE).join(', ')}`)
  process.exit(2)
}

// Nadpisania bez edycji pliku — przydatne, gdy Recraft zmieni nazewnictwo wariantów
// albo gdy chcesz przetestować inny poziom szczegółowości na jednej serii.
// Style z panelu webowego ("Whimsy Playland", "Rustic Line Art" itd.) NIE są stylami
// kuratorowanymi — API odrzuca je jako "Invalid style". Trzeba podać ich UUID przez
// --style-id=..., a ID kopiuje się w panelu Recrafta z menu trzykropkowego przy stylu.
// Dokumentacja: `style` i `style_id` wykluczają się wzajemnie, więc przy podanym ID
// nie wysyłamy nazwy stylu w ogóle.
const STYLE_ID = (argv.find(a => a.startsWith('--style-id=')) ?? '').split('=')[1] || ''

const MODEL_ID = (argv.find(a => a.startsWith('--model-id=')) ?? `--model-id=${model?.id ?? ''}`).split('=')[1]
// Nazwy stylów V3 są czytelne i mają spacje ("Line art") — w powłoce trzeba je cytować:
//   --style="Line art"
const STYLE    = (argv.find(a => a.startsWith('--style=')) ?? `--style=${model?.styl ?? ''}`).split('=').slice(1).join('=')
const SUBSTYLE = (argv.find(a => a.startsWith('--substyle=')) ?? `--substyle=${cfg.substyl ?? model?.substyl ?? ''}`).split('=')[1]
const SIZE     = (argv.find(a => a.startsWith('--size=')) ?? `--size=${ROZMIARY[cfg.format ?? 'pion'] ?? ROZMIARY.pion}`).split('=')[1]

// Katalogi rozdzielone per model — dzięki temu porównanie jest uczciwe i nic się nie miesza.
// Styl trafia do nazwy katalogu, gdy podany jawnie — inaczej porównanie kilku stylów
// wpadałoby do jednego folderu i nadpisywało się nawzajem.
const STYL_ETYKIETA = (argv.find(a => a.startsWith('--nazwa=')) ?? '').split('=')[1] || ''
const STYL_SLUG = STYL_ETYKIETA
  ? '-' + STYL_ETYKIETA.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  : (argv.some(a => a.startsWith('--style='))
      ? '-' + STYLE.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : '')

const WARIANT = (PROVIDER === 'flux' ? 'flux' : MODEL_KEY) +
                (ART !== null ? `-art${ART}` : '') + (GOLY ? '-goly' : '') + STYL_SLUG +
                (ZESTAW ? `-${ZESTAW}` : '')
const OUT = join('lineart-work', katalogRoboczy, `raw-${WARIANT}`)
mkdirSync(OUT, { recursive: true })

const CENA = PROVIDER === 'flux' ? CENA_FLUX : model.cena

// Gdy styl wymusza już substyl (line_art), rozbudowany prompt stylistyczny bywa zbędny,
// generuje sam temat, do porównania która wersja daje lepszą kreskę.
// Poziom trudności dla pozycji i w serii o długości COUNT.
function poziomDla (i) {
  if (RAMP && TRUDNOSC[RAMP]) return RAMP
  // Kategoria może nadpisać rozkład — np. koty mają być łatwe, bez poziomu trudnego.
  const rozklad = cfg.rozklad ?? ROZKLAD
  const udzial = COUNT > 1 ? i / COUNT : 0
  return (rozklad.find(r => udzial < r.do) ?? rozklad[rozklad.length - 1]).poziom
}

function budujPrompt (i) {
  if (PROMPT) return PROMPT
  const idx = OD + i * KROK
  // Krzyżowanie dwóch osi: wariant zmienia się co obrazek, scena dopiero po wyczerpaniu
  // wariantów. Dzięki temu pełny przebieg pokrywa wszystkie kombinacje bez powtórek.
  // Jedna oś dla WSZYSTKICH kategorii — stary tryb `motyw` + `warianty` zniknął, bo to
  // przez niego kombajny i koparki dostawały ujęcia kamery zamiast scen.
  const wariant = cfg.warianty[idx % cfg.warianty.length]
  const scena   = cfg.sceny[Math.floor(idx / cfg.warianty.length) % cfg.sceny.length]
  const temat = `${wariant}, ${scena}`
  // Wzorzec: {temat} {poza}, {trudność} drawing, {białe partie}, {3 słowa stylu}
  //
  // `biale` to jedyny wyjątek od zasady "zakazy tylko w negatywie" — i to wyjątek
  // wymuszony przez wynik. Każdy gatunek ma partie, które model uważa za z natury ciemne:
  // u kotów łaty i uszy, u koni grzywa, ogon i kopyta. Sam `negative_prompt` ich nie przebija
  // (test na koniach: średnia czerni 3,7% → 4,0%, czyli bez zmian). Dopiero TWIERDZĄCE
  // "white mane and tail" działa, bo model dostaje coś do narysowania zamiast czegoś do pominięcia.
  if (GOLY) return temat   // formuła jaszczurek: sam temat i poza

  const trudnosc = TRUDNOSC[poziomDla(i)].opis
  const biale = cfg.biale ? `${cfg.biale}, ` : ''
  return `${temat}, ${trudnosc} drawing, ${biale}${KONTUR}`
}

// Body żądania do Recrafta. Wydzielone, żeby --dry-run mógł je wypisać co do znaku
// i żebyś porównał je z dokumentacją, zanim wydasz jednostki.
// UWAGA: `response_format` przyjmuje tylko 'url' albo 'b64_json' — NIE 'svg'.
// O tym, czy wynikiem jest wektor, decyduje sam model (wariant _vector), a nie ten parametr.
// Zwrócony URL wskazuje wtedy plik .svg. Zostawiamy domyślne 'url' i nie wysyłamy pola.
function bodyRecraft (prompt, poziom) {
  const body = { prompt, model: MODEL_ID, size: SIZE, n: 1 }
  // Pola pustego NIE wysyłamy — modele V4/V4.1 odrzucają `style`, a przy jego braku
  // stosują styl domyślny. Wysłanie pustego łańcucha też byłoby błędem.
  // style i style_id wykluczają się wzajemnie — ID ma pierwszeństwo.
  if (STYLE_ID) body.style_id = STYLE_ID
  else if (STYLE) body.style = STYLE
  if (SUBSTYLE && !STYLE_ID) body.substyle = SUBSTYLE
  // negative_prompt i controls obsługują wyłącznie modele V2/V3 — przy V4 API by je odrzuciło
  // W trybie --goly nie wysyłamy ANI negatywu, ANI controls — tak jak przy jaszczurkach.
  if (!GOLY && /recraftv[23]/.test(MODEL_ID)) {
    if (NEGATYW) body.negative_prompt = NEGATYW
    // Kolejność: flaga --artistic (sweep) → poziom przypisany do trudności → domyślny.
    body.controls = {
      artistic_level: ART ?? TRUDNOSC[poziom]?.art ?? cfg.poziomArtystyczny ?? POZIOM_ARTYSTYCZNY
    }
  }
  return body
}

// Szacunek kosztu — żeby nikt nie odpalił 8000 sztuk droższym modelem przez pomyłkę.
function koszt (n) {
  const usd = n * CENA
  return `$${usd.toFixed(2)} (~${(usd * 4).toFixed(0)} zł)`
}

// Saldo kredytów Recrafta. 1000 units = $1. Odczyt jest darmowy, więc mierzymy
// zużycie przed i po przebiegu — realny koszt zamiast szacunku z tabeli cen.
async function saldo () {
  if (PROVIDER !== 'recraft') return null
  try {
    const res = await fetch('https://external.api.recraft.ai/v1/users/me', {
      headers: { 'Authorization': `Bearer ${process.env.RECRAFT_API_TOKEN}` }
    })
    if (!res.ok) return null
    return (await res.json())?.credits ?? null
  } catch { return null }
}

if (DRY) {
  // Pokazujemy po jednym prompcie z każdego poziomu, nie pierwsze cztery z rzędu —
  // inaczej nie byłoby widać, jak rośnie złożoność w serii.
  const proby = [...new Set([0, Math.floor(COUNT * 0.5), COUNT - 1])].filter(i => i >= 0 && i < COUNT)
  for (const i of proby) console.log(`[${i + 1}/${COUNT}] (${poziomDla(i)})\n${budujPrompt(i)}\n`)

  const rozklad = {}
  for (let i = 0; i < COUNT; i++) rozklad[poziomDla(i)] = (rozklad[poziomDla(i)] ?? 0) + 1
  console.log(`Rozkład trudności: ${Object.entries(rozklad).map(([k, v]) => `${k} ${v}`).join(', ')}`)

  if (PROVIDER === 'recraft') {
    console.log('Body żądania (zweryfikuj z dokumentacją Recrafta):')
    console.log(JSON.stringify({ ...bodyRecraft('<prompt>', poziomDla(0)), prompt: '<prompt jak wyżej>' }, null, 2))
  }
  console.log(`\nSilnik:  ${PROVIDER}${PROVIDER === 'recraft' ? ` / ${MODEL_KEY} (${model.wektor ? 'wektor → .svg' : 'raster → .png'})` : ''}`)
  console.log(`Cena:    $${CENA}/szt.`)
  console.log(`Ta seria:      ${COUNT} szt. → ${koszt(COUNT)}`)
  console.log(`Cała biblioteka przy 50% odsiewu: 8336 szt. → ${koszt(8336)}`)
  console.log(`(--dry-run: nic nie wysłano. Docelowo pliki w ${OUT})`)
  process.exit(0)
}

// ── Silniki ─────────────────────────────────────────────────────────────────
// Każdy zwraca { url, ext }. Reszta skryptu jest wspólna.

// Recraft odbija nadmiarowe zapytania kodem 429. Ponawiamy z rosnącą przerwą,
// zamiast tracić obrazek (i tak już opłacony czasem, nie jednostkami — 429 nic nie kosztuje).
async function fetchPonawiaj (url, opts, proby = 4) {
  let res
  for (let p = 1; p <= proby; p++) {
    res = await fetch(url, opts)
    if (res.status !== 429) return res
    if (p === proby) break
    const czekaj = 2000 * 2 ** (p - 1) // 2s, 4s, 8s
    console.log(`  limit zapytań — czekam ${czekaj / 1000}s i ponawiam...`)
    await new Promise(r => setTimeout(r, czekaj))
  }
  return res
}

// API Recrafta (zgodne z OpenAI). Warianty "vector" zwracają URL do pliku .svg.
async function przezRecraft (prompt, poziom) {
  const token = process.env.RECRAFT_API_TOKEN
  if (!token) throw new Error('brak RECRAFT_API_TOKEN')

  const res = await fetchPonawiaj('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyRecraft(prompt, poziom))
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)

  const json = await res.json()
  const url = json?.data?.[0]?.url
  if (!url) throw new Error('brak URL obrazka w odpowiedzi')
  return { url }
}

// Format rozpoznajemy po ZAWARTOŚCI pobranego pliku, nie po URL-u — adresy Recrafta
// bywają bez rozszerzenia, a zgadywanie kończyło się plikami .bin, których nie
// czytał żaden kolejny skrypt w pipelinie.
function rozpoznajFormat (buf) {
  const glowa = buf.subarray(0, 200).toString('latin1').trimStart()
  if (glowa.startsWith('<svg') || glowa.startsWith('<?xml')) return 'svg'
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png'
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'jpg'
  if (glowa.startsWith('RIFF')) return 'webp'
  return 'bin'
}

// Flux.1 dev przez fal.ai — raster do późniejszej wektoryzacji.
async function przezFlux (prompt, seed) {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('brak FAL_KEY')

  const [szer, wys] = SIZE.split('x').map(Number)
  const res = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { 'Authorization': `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width: szer, height: wys },  // te same proporcje co u Recrafta — porównanie musi być uczciwe
      num_inference_steps: 30,
      guidance_scale: 3.5,
      num_images: 1,
      seed,
      enable_safety_checker: true
    })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)

  const json = await res.json()
  const url = json?.images?.[0]?.url
  if (!url) throw new Error('brak URL obrazka w odpowiedzi')
  return { url, ext: 'png' }
}

// ── Przebieg ────────────────────────────────────────────────────────────────
// Seed siedzi w nazwie pliku — udany obrazek da się odtworzyć, nieudany wariant pominąć.
// Recraft odbija już przy trzech równoległych zapytaniach, więc domyślnie idziemy
// po jednym. Podnieś flagą --rownolegle=N, jeśli Twój plan pozwala na więcej.
const CONCURRENCY = Number((argv.find(a => a.startsWith('--rownolegle=')) ?? '').split('=')[1])
  || (PROVIDER === 'recraft' ? 1 : 4)
let zrobione = 0, bledy = 0, ponowione = 0, ostrzezono = false

// Pętla uzupełniania: pozycja jest gotowa tylko wtedy, gdy plik leży luzem albo w ok/.
// Sztuka odrzucona (w odrzut/) NIE liczy się jako zrobiona — zostaje skasowana
// i wygenerowana ponownie, już na poprawionych promptach. Dzięki temu cykl
//   generuj → waliduj --segreguj → generuj ponownie
// dobija kategorię do kompletu, nie płacąc powtórnie za sztuki, które przeszły.
function stanPozycji (nazwa) {
  // `webp` MUSI tu być: style panelowe (rastrowe) zapisują właśnie webp, więc bez tego
  // rozszerzenia pętla uzupełniania nie rozpoznawała ani jednej gotowej pozycji i seria
  // przerwana w połowie naliczała się od nowa w całości.
  for (const ext of ['svg', 'png', 'webp']) {
    if (existsSync(join(OUT, `${nazwa}.${ext}`)))        return { gotowa: true }
    if (existsSync(join(OUT, 'ok', `${nazwa}.${ext}`)))  return { gotowa: true }
    const odrzut = join(OUT, 'odrzut', `${nazwa}.${ext}`)
    if (existsSync(odrzut)) return { gotowa: false, doUsuniecia: odrzut }
  }
  return { gotowa: false }
}

async function jeden (i) {
  const seed = SEED0 + i
  // Prefiks musi być PŁASKI (`koty`), nie surowym argumentem CLI (`zwierzeta/koty`) —
  // ukośnik w kluczu robił z nazwy pliku podkatalog, którego nikt nie tworzył, więc
  // cała seria pobierała się i padała na ENOENT już PO naliczeniu kredytów.
  const nazwa = `${katalogRoboczy}-${String(i + 1).padStart(3, '0')}-s${seed}`
  const baza = join(OUT, nazwa)

  const stan = stanPozycji(nazwa)
  if (stan.gotowa) { zrobione++; return }
  // Starego odrzutu NIE kasujemy tutaj — dopiero po udanym zapisie następcy.
  // Inaczej nieudane wywołanie (brak kredytów, awaria sieci) zostawiałoby pustą pozycję.

  try {
    const prompt = budujPrompt(i)
    const { url } = PROVIDER === 'recraft'
      ? await przezRecraft(prompt, poziomDla(i))
      : await przezFlux(prompt, seed)

    const plik = await fetch(url)
    if (!plik.ok) throw new Error(`pobranie pliku: HTTP ${plik.status}`)
    const buf = Buffer.from(await plik.arrayBuffer())
    const format = rozpoznajFormat(buf)
    // Kredyty są już naliczone, więc zapis NIE MOŻE polec na brakującym katalogu.
    // Kosztowało to kiedyś całą serię 36 kotów ($1.44) wyrzuconą w błoto.
    mkdirSync(dirname(baza), { recursive: true })
    writeFileSync(`${baza}.${format}`, buf)

    // STRAŻNIK NIEZGODNOŚCI MODELU. Gdy prosimy o model wektorowy, a wraca raster,
    // znaczy że użyty styl jest rastrowy i API po cichu zignorowało nasz model.
    // Wynik jest wtedy WYRAŹNIE gorszy: kreska cienka, szarpana i poprzerywana
    // zamiast grubej i płynnej. API nie zgłasza tego jako błędu, więc ostrzegamy sami.
    if (!ostrzezono && format !== 'svg' && /_vector$/.test(MODEL_ID)) {
      ostrzezono = true
      console.warn(`\n  ⚠ Model ${MODEL_ID} jest wektorowy, a odpowiedź przyszła jako .${format}.`)
      console.warn(`    Ten styl jest rastrowy — dodaj --model-id=${MODEL_ID.replace(/_vector$/, '')}`)
      console.warn(`    Inaczej kreska wychodzi cienka i poprzerywana.\n`)
    }
    // Następca zapisany — teraz można bezpiecznie usunąć poprzedni odrzut.
    if (stan.doUsuniecia) {
      try { unlinkSync(stan.doUsuniecia); ponowione++ } catch { /* nieistotne */ }
    }

    zrobione++
    if (zrobione % 10 === 0) console.log(`${zrobione}/${COUNT}...`)
  } catch (e) {
    bledy++
    console.error(`  błąd [${i + 1}]: ${e.message}`)
  }
}

const saldoPrzed = await saldo()
if (saldoPrzed !== null) console.log(`Saldo przed: ${saldoPrzed} units ($${(saldoPrzed / 1000).toFixed(2)})\n`)

const kolejka = Array.from({ length: COUNT }, (_, i) => i)
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (kolejka.length) await jeden(kolejka.shift())
}))

const saldoPo = await saldo()

const wektorowy = PROVIDER === 'recraft' && model.wektor

console.log(`\nGotowe (${WARIANT}). Pozycji kompletnych: ${zrobione}, błędy: ${bledy}${ponowione ? `, ponowionych odrzutów: ${ponowione}` : ''}`)
if (saldoPrzed !== null && saldoPo !== null) {
  const zuzyte = saldoPrzed - saldoPo
  const naSztuke = zrobione ? (zuzyte / zrobione) : 0
  console.log(`Zużyto:  ${zuzyte} units = $${(zuzyte / 1000).toFixed(2)}  (${naSztuke.toFixed(0)} units/szt. = $${(naSztuke / 1000).toFixed(3)})`)
  console.log(`Zostało: ${saldoPo} units ($${(saldoPo / 1000).toFixed(2)})`)
  // Ekstrapolacja na całą bibliotekę przy dwukrotnej nadprodukcji
  if (naSztuke > 0) {
    const pelna = naSztuke * 8336 / 1000
    console.log(`Prognoza: 4168 grafik przy 2x nadprodukcji → $${pelna.toFixed(0)} (~${(pelna * 4).toFixed(0)} zł)`)
  }
} else {
  console.log(`Wydano:  ~${koszt(zrobione)} (szacunek — brak odczytu salda)`)
}
console.log(`Katalog: ${OUT}`)
console.log(`Dalej:   node scripts/validate-lineart.mjs ${OUT}`)
console.log(`         node scripts/lineart-postprocess.mjs ${OUT}   # ${wektorowy ? 'SVG prosto do PDF A4' : 'binaryzacja + wektoryzacja'}`)
