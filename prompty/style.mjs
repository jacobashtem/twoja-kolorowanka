// REJESTR STYLÓW RECRAFTA — UUID-y z panelu webowego plus werdykty z testów.
//
// Dlaczego ten plik istnieje: style panelowe NIE są stylami kuratorowanymi, więc API
// odrzuca ich nazwy ("Invalid style") i trzeba podawać `style_id` jako UUID. Nie ma
// endpointu do listowania stylów — jedyne źródło to panel (Styles → menu trzykropkowe →
// copy style ID). Do 2026-08-04 te identyfikatory nie były zapisane nigdzie w repozytorium;
// żyły w treści commitów i w pamięci sesji, czyli w miejscach, z których nie da się ich
// odtworzyć po fakcie. Zgubienie UUID-a oznacza ponowne przeklikanie panelu.
//
// WSZYSTKIE style panelowe są RASTROWE. Wymagają `--model-id=recraftv3`, bo model
// wektorowy w parze z nimi nie zgłasza błędu — API po cichu zwraca zdegradowany wynik
// (kreska cienka, szarpana, poprzerywana zamiast grubej i płynnej). Stąd pole `modelId`
// jest częścią rekordu stylu, a nie decyzją podejmowaną przy każdym wywołaniu.
//
// Ekonomia: raster 40 units ($0.04) + wektoryzacja wybranych 10 units ($0.01) = $0.05/szt.
// Wektor natywny przez `recraftv3_vector` + wbudowany "Line art" kosztuje 80 units
// i wypada gorzej — czerń wchodzi w obiekt. Raster wygrywa i ceną, i jakością.

export const STYLE = {
  // ── TRZON I DWA NAJBLIŻSZE MU JAKOŚCIĄ ────────────────────────────────────
  whimsy: {
    id: 'ea3adca4-f786-4b4a-b8ef-22d396d28a13',
    nazwa: 'Whimsy Playland',
    modelId: 'recraftv3',
    // Trzon biblioteki. Gruba płynna kreska, duże obszary, buzie z oczami i rzęsami.
    // Waga SVG 56–71 KB, czyli najlżejszy ze wszystkich — a waga jest darmowym proxy
    // gęstości kreskowania. To jest kolorowanka dla dziecka.
    // WADA, o której trzeba pamiętać przy pisaniu wariantów: gubi cechy poniżej poziomu
    // SYLWETKI. Przy jaszczurkach „fringed eyebrows" i „smooth glossy" dały tego samego
    // generycznego gadzika, przy pieskach zgubił szpica. Warianty muszą się różnić
    // obrysem, inaczej dwanaście opisów da pięć rozróżnialnych rysunków.
    // Nie zna też póz leżących (flop i sploot u królików wyszły do góry nogami).
    uwaga: 'różnicować wyłącznie sylwetką; bez póz leżących'
  },
  nautical: {
    id: '39ec8e0a-ec5e-4b1e-bee8-70f571748c8c',
    nazwa: 'Nautical Line Art',
    modelId: 'recraftv3',
    // Drugi w rankingu. Na pieskach gruba płynna kreska i trzymał gatunek — najbliżej
    // whimsy jakością. Na konikach kreska wychodziła cieńsza, a trawa i kora potrafią
    // wyjść równoległym sztrychem, który w druku daje szarą płachtę. Waga SVG 65–92 KB.
    //
    // SYRENKI 2026-08-04: **10/10 wybranych, jedyny styl ze 100% przy n=10.** Whimsy
    // na tej samej serii dał 69%. Hipoteza do sprawdzenia na następnej kategorii wodnej
    // (`zwierzeta/ryby`, `pory-roku/lato`): przy temacie MORSKIM to nautical powinien być
    // trzonem, nie whimsy. Jeśli się potwierdzi, miks przestaje być jeden na wszystko.
    uwaga: 'przy scenach z trawą/korą sprawdzić sztrych; na temacie morskim 10/10'
  },
  heroic: {
    id: '69deb851-172e-4b65-8579-e23702f25356',
    nazwa: 'Heroic Everyday Life',
    modelId: 'recraftv3',
    // Charakterny i bogaty scenicznie, ale kreska cienka i 120–130 obszarów, a futro
    // bywa kreskowane. Waga SVG 138–218 KB. Stąd rola uzupełniająca: dorzuca kategorii
    // kilka sztuk „dla starszego dziecka" bez zalewania jej trudnymi rysunkami.
    uwaga: 'kandydat na trudniejsze sztuki; dużo obszarów'
  },

  // ── WBUDOWANY „LINE ART" — INNY KSZTAŁT NIŻ RESZTA ────────────────────────
  // Te dwa NIE są stylami panelowymi: nie mają UUID-a, tylko czytelną nazwę, którą API
  // przyjmuje jako `style`, i chodzą na modelach WEKTOROWYCH. Konsekwencje są trzy:
  //   1. zwracają NATYWNY SVG, więc omijają wektoryzację ($0.01/szt. mniej i o krok
  //      krócej w pipelinie — `recraft-wektoryzuj.mjs` sam je pomija)
  //   2. PDF-y robi im lokalnie i za darmo `lineart-postprocess.mjs`
  //   3. cena idzie z modelu, nie z rastra: V3 kosztuje dwa razy więcej niż panelowe
  // Dlatego mają `wbudowany: true` i własne pole `cena` — wrapper składa im inne flagi.
  //
  // To jest ta rodzina, z której powstała formuła jaszczurek, czyli jedyna seria uznana
  // za naprawdę dobrą przed erą stylów panelowych. Na kotach dała 33 sztuki z 84.
  lineart3: {
    wbudowany: true,
    model: 'v3',
    nazwa: 'Line art (V3, wektor natywny)',
    cena: 0.08,
    // Czysty kontur, białe wnętrze, ~38 obszarów. Sprawdza się na ZWIERZĘTACH i postaciach.
    // PUŁAPKA: przy maszynach czerń, która u zwierząt szła w tło, wchodzi w części
    // pojazdu — czarne kabiny, opony, wnętrza szyb. Do pojazdów brać v2, nie v3.
    // To także jedyny styl, przy którym wracał problem czarnego umaszczenia (koty),
    // bo to była właściwość tego stylu, nie modelu — stąd pole `biale` w kategoriach.
    uwaga: 'natywny SVG; mocny na zwierzętach i postaciach, słaby na maszynach'
  },
  // POZA MIKSEM DOMYŚLNYM — bierze się go jawnie: `--miks=...,lineart2`.
  // Powód (2026-08-04, na syrenkach): V2 miał być wariantem PROSTSZYM pod maluchy i na
  // kombajnach faktycznie dawał ~8 obszarów. Na postaci nie dowozi tego wcale — wyszło
  // 52 obszary średnio, czyli WIĘCEJ niż V3 (37), przy 2/3 do druku wobec 3/3 u V3.
  // Do tego jego znana wada, „sterylny, bez buziek, płasko", uderza najmocniej właśnie
  // w postacie z twarzą.
  // Rozstrzygające jest jednak to, że jego nisza NIE JEST PUSTA: profil „maluchy"
  // pokrywa whimsy (32/32 na tej samej serii), więc V2 nie uzupełnia niczego.
  // ZOSTAJE dla POJAZDÓW I MASZYN — tam bije V3, bo czerń V3 wchodzi w kabiny, opony
  // i wnętrza szyb, a V2 daje równy kontur i praktycznie zero czerni.
  lineart2: {
    wbudowany: true,
    model: 'v2',
    nazwa: 'Line art (V2, wektor natywny)',
    cena: 0.04,
    uwaga: 'opt-in: bierz przy pojazdach i maszynach, nie przy postaciach'
  },

  // ── PRÓBKOWANE, ALE Z OSTRZEŻENIEM ────────────────────────────────────────
  // Te style wypadły słabo w testach na koniach, kotach i pieskach i NIE nadają się
  // na trzon kategorii. Zostają w miksie po trzy sztuki, bo pojedyncze rysunki z nich
  // Jakub czasem wybiera świadomie — ale zielona plakietka walidatora nic tu nie znaczy,
  // bo on nie widzi gęstego kreskowania. Ocena wyłącznie okiem, z galerii.
  // Wagi SVG zmierzone na kotach — powyżej ~300 KB to ilustracja cieniowana, nie kolorowanka.
  rustic: {
    id: '27fb2fe6-1be3-462e-a1bc-d7962d19806d',
    nazwa: 'Rustic Line Art',
    modelId: 'recraftv3',
    uwaga: 'przyzwoity, ale szkicowy; tło i trawa jako gęsty sztrych → druk na szaro (229 KB)'
  },
  office: {
    id: '0dfe07c2-4bac-400b-b66c-f8de4c9ed25e',
    nazwa: 'Office Line Art',
    modelId: 'recraftv3',
    // SYRENKI 2026-08-04: **3/3 wybranych.** Werdykt „odrzucony" pochodzi z KONIKÓW,
    // gdzie liczyły się gruba kreska i profil malucha. Na postaci ludzkiej cienka,
    // precyzyjna kreska najwyraźniej pomaga — twarz i dłonie wychodzą czytelniej.
    // Nie kasuję ostrzeżenia (n=3), ale „odrzucony" jest tu za mocnym słowem.
    uwaga: 'słaby dla maluchów (włosowate linie 62–65%), ale 3/3 na postaci ludzkiej'
  },
  minimalist: {
    id: 'ee6eb538-86d7-42eb-973a-ce212050fbd9',
    nazwa: 'Minimalist Narratives',
    modelId: 'recraftv3',
    uwaga: 'ODRZUCONY: drzeworyt, gęste kreskowanie; zgubił szpica i narysował kota'
  },
  elegant: {
    id: '5b299bd0-9110-4208-9fdd-b8bae1f27cca',
    nazwa: 'Elegant Contemporary',
    modelId: 'recraftv3',
    uwaga: 'ODRZUCONY: lite plamy czerni 13–15% (465 KB)'
  },
  rusticElegance: {
    id: 'f2c36aba-4782-400d-aea3-140d2c80dd80',
    nazwa: 'Rustic Elegance Illustration',
    modelId: 'recraftv3',
    uwaga: 'ODRZUCONY: piękne ilustracje tuszem, ale koń w całości czarny (957 KB)'
  },
  rugged: {
    id: 'd1fc1120-0291-413e-8d18-53536f86ab7c',
    nazwa: 'Rugged Exploration Art',
    modelId: 'recraftv3',
    // SYRENKI 2026-08-04: **3/3 wybranych**, mimo 0/3 u walidatora i wagi 1943 KB
    // na kotach. Jakub bierze z niego pojedyncze sztuki świadomie (tak samo koty 79–84).
    // To jest najlepszy dowód na regułę „próbkuj każdy styl": gdyby go nie było
    // w galerii, te trzy sztuki nigdy by nie powstały.
    // UWAGA: ciężkie pliki, więc sprawdzić wagę SVG po wektoryzacji przed podmianą.
    uwaga: 'półtony i cieniowanie, ciężki (1943 KB) — ale 3/3 wybrane na syrenkach'
  }
}

// ── JAK DZIELIMY SERIĘ MIĘDZY STYLE ───────────────────────────────────────────
//
// UWAGA, TU ŁATWO POMYLIĆ SKUTEK Z PRZYCZYNĄ (pomyliłem, 2026-08-04). W commicie
// motyli stoi „skład wybrany przez Jakuba: 35 whimsy, 11 nautical, 7 heroic" — i to
// kusi, żeby wziąć 66/21/13 jako plan generowania. To błąd: te liczby opisują FINALNY
// WYBÓR z galerii, a nie to, co do galerii trafiło. Gdyby generować w proporcjach
// wyboru, w rzadszych stylach nie byłoby z czego wybierać i wynik zabetonowałby się
// na pierwszej decyzji.
//
// Praktyka jest odwrotna i szeroka: **wszystkie style w jednej galerii**, trzon
// (whimsy) dostaje duży blok, a każdy pozostały po trzy sztuki. Jakub opisał to jako
// „często 12 whimsy, a potem z reszty po 3". Trzy sztuki wystarczą, żeby zobaczyć,
// czy styl łapie temat — a przy koniach i kotach pokazało się, że ranking stylów jest
// cechą STYLU, nie tematu, więc więcej na próbę nie potrzeba.
//
// Dlatego style z werdyktem odrzucającym TEŻ są próbkowane. Ich `uwaga` to ostrzeżenie
// przed hurtowym braniem, nie zakaz: z rugged-exploration i rustic-elegance Jakub wziął
// świadomie pojedyncze sztuki do kotów (79–84), mimo że oba style średnio dają
// cieniowane ilustracje. Decyzja zapada z galerii, nie z tabelki.
// REGUŁA SERII (ustalenie Jakuba, 2026-08-04): **do 48 grafik na kategorię, ale tak,
// żeby każdy styl coś swojego wypluł.** Dwa warunki naraz, i to one wyznaczają liczby:
//   • sufit 48 — powyżej tego selekcja okiem robi się mordęgą, a to ona jest wąskim
//     gardłem całej migracji, nie API ani pieniądze
//   • żaden styl nie może wypaść z galerii, bo dopiero zestawienie wszystkich naraz
//     pokazuje, który złapał TEN temat; ranking stylów jest cechą stylu, ale trafienie
//     w konkretną kategorię już nie
// Przy jedenastu stylach i próbce 3 daje to 18 sztuk trzonu + 10×3 = równo 48.
export const SERIA_DOMYSLNA = 48

export const TRZON = 'whimsy'
export const PROBKA_NA_STYL = 3
// Dziesięć stylów. `lineart2` celowo poza domyślnym miksem — patrz komentarz przy nim.
// Przy kategorii POJAZDOWEJ dołóż go jawnie:
//   node scripts/generuj-miks.mjs pojazdy/koparki --miks=whimsy,nautical,heroic,lineart3,lineart2,rustic,office,minimalist,elegant,rusticElegance,rugged
export const MIKS = [
  'whimsy', 'nautical', 'heroic', 'lineart3', 'rustic',
  'office', 'minimalist', 'elegant', 'rusticElegance', 'rugged'
]

// Trzon bierze resztę po odjęciu próbek: przy dziesięciu stylach i serii 48 wychodzi
// 48 − 9×3 = 21 sztuk whimsy. Kształt „12 whimsy + po 3" to `--count=39`.
export function podzialMiksu (ile, klucze = MIKS, probka = PROBKA_NA_STYL) {
  const poboczne = klucze.filter(k => k !== TRZON)
  const maTrzon = klucze.includes(TRZON)
  if (!maTrzon) {
    // Sam dosyp stylów pobocznych (np. uzupełnienie galerii) — dzielimy po równo.
    const na = Math.floor(ile / klucze.length)
    const reszta = ile - na * klucze.length
    return klucze.map((k, i) => ({ styl: k, ile: na + (i < reszta ? 1 : 0) }))
  }
  const naTrzon = ile - poboczne.length * probka
  if (naTrzon < probka) {
    throw new Error(
      `--count=${ile} to za mało na miks ${klucze.length} stylów po ${probka} szt. ` +
      `(trzon zostałby z ${naTrzon}). Podnieś --count albo zawęź --miks=.`
    )
  }
  return [{ styl: TRZON, ile: naTrzon }, ...poboczne.map(k => ({ styl: k, ile: probka }))]
}
