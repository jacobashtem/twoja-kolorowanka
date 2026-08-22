// Wspolna logika warsztatu fraz — uzywana i przez skrypt `scripts/dfs/frazy.mjs`,
// i przez panel (`netlify/functions/panel-frazy.mjs`).
//
// Powod, dla ktorego to tu lezy, a nie w dwoch kopiach: fraza oznaczona w skrypcie jako
// pokryta kategoria musi byc tak samo oznaczona w panelu. Dwie kopie tej samej reguly
// rozjechalyby sie przy pierwszej poprawce i nikt by tego nie zauwazyl, bo obie wygladalyby
// sensownie osobno.
//
// Modul jest czysty: nie czyta dysku ani zmiennych srodowiskowych. Zrodlo slugow i klucze
// API podaje wolajacy — skrypt bierze slugi z `content/`, panel z sitemapy produkcji.

// ------------------------------------------------------------------ rynki

// `szablony` i `koncowki` sluza trybowi „warianty": z jednego slowa buduja wszystkie
// sensowne sposoby, na jakie ludzie moga o to zapytac.
export const RYNKI = {
  pl: {
    location_code: 2616, language_code: 'pl', nazwa: 'Polska', flaga: '🇵🇱',
    szablony: ['kolorowanki {w}', 'kolorowanka {w}', '{w} kolorowanki', '{w} kolorowanka',
      'kolorowanki {w} do druku', '{w} kolorowanka do druku', '{w} do kolorowania'],
    koncowki: ['', 'a', 'y', 'i', 'e', 'ę', 'ow', 'ów', 'ami', 'ach', 'ka', 'ki']
  },
  nl: {
    location_code: 2528, language_code: 'nl', nazwa: 'Holandia', flaga: '🇳🇱',
    szablony: ['kleurplaat {w}', 'kleurplaten {w}', '{w} kleurplaat', '{w} kleurplaten',
      'kleurplaat {w} printen'],
    koncowki: ['', 's', 'en', 'je', 'jes']
  },
  de: {
    location_code: 2276, language_code: 'de', nazwa: 'Niemcy', flaga: '🇩🇪',
    szablony: ['ausmalbilder {w}', 'malvorlagen {w}', '{w} ausmalbilder', '{w} malvorlage',
      'ausmalbilder {w} kostenlos'],
    koncowki: ['', 'n', 'en', 'e', 'er', 's']
  },
  it: {
    location_code: 2380, language_code: 'it', nazwa: 'Wlochy', flaga: '🇮🇹',
    szablony: ['disegni da colorare {w}', '{w} da colorare', 'disegni {w} da colorare',
      'immagini da colorare {w}'],
    koncowki: ['', 'i', 'e', 'o', 'a']
  },
  se: {
    location_code: 2752, language_code: 'sv', nazwa: 'Szwecja', flaga: '🇸🇪',
    szablony: ['målarbilder {w}', '{w} målarbild', 'målarbild {w}', 'målarbilder {w} gratis'],
    koncowki: ['', 'r', 'ar', 'or', 'en']
  }
}

// ------------------------------------------------------------------ tryby

// Kazdy tryb opisany przez to, CO WPISUJESZ i CO DOSTAJESZ, na jednym przykladzie
// przewijajacym sie przez wszystkie — zeby dalo sie je porownac, a nie tylko przeczytac
// osobno. Liczby w przykladach sa prawdziwe, zmierzone 21 sierpnia 2026.
export const TRYBY = {
  dokladny: {
    nazwa: 'Sprawdź konkretne frazy',
    kiedy: 'Wiesz, o co pytasz, i chcesz liczby.',
    wpisujesz: 'kolorowanka panda\nkolorowanki pandy',
    dostajesz: 'Dokładnie te dwie frazy i nic więcej: 745 oraz 0. Frazy z zerem też zobaczysz — brak wyszukiwań to też odpowiedź.',
    koszt: 'najtańszy, jedno zapytanie niezależnie od liczby fraz',
    endpoint: 'dataforseo_labs/google/keyword_overview/live'
  },
  warianty: {
    nazwa: 'Znajdź najlepszy zapis',
    kiedy: 'Wiesz, o czym chcesz zrobić kategorię, ale nie wiesz, jak ludzie to nazywają.',
    wpisujesz: 'pandy',
    dostajesz: 'Około 80 odmian i szyków zmierzonych naraz: „kolorowanka panda” 745, „kolorowanki panda” 149, „kolorowanki pandy” 0. Odpowiedź, którego zapisu użyć w tytule.',
    koszt: 'jedno zapytanie, około $0,03',
    endpoint: 'dataforseo_labs/google/keyword_overview/live'
  },
  ogon: {
    nazwa: 'Długi ogon',
    kiedy: 'Szukasz fraz na śródtytuły artykułu albo na podstrony kategorii.',
    wpisujesz: 'kolorowanki panda',
    dostajesz: 'Frazy zawierające te słowa, od najpopularniejszych: „kolorowanki panda do druku”, „kolorowanki panda kung fu”. Im dłuższa fraza, tym mniejszy ruch, ale i mniejsza konkurencja.',
    uwaga: 'Musisz podać słowo tematyczne. Samo „panda” wciągnie Fiata Pandę i Kung Fu Pandę — sprawdzone, kosztowało $0,06.',
    koszt: 'jedno zapytanie na każdą wpisaną frazę',
    endpoint: 'dataforseo_labs/google/keyword_suggestions/live'
  },
  pelny: {
    nazwa: 'Pełne rozpoznanie',
    kiedy: 'Zakładasz nową kategorię albo piszesz o czymś od zera.',
    wpisujesz: 'kolorowanki panda',
    dostajesz: 'Odmiany i długi ogon w jednym: jak nazwać rzecz w tytule ORAZ czym wypełnić śródtytuły. Na „kolorowanki mikołaj” dało 39 fraz z danymi.',
    koszt: 'dwa zapytania, około $0,05',
    endpoint: null
  },
  skojarzenia: {
    nazwa: 'Sąsiednie tematy',
    kiedy: 'Rzadko. Gdy szukasz zupełnie nowej niszy, nie wariantu tego, co masz.',
    wpisujesz: 'kolorowanki panda',
    dostajesz: 'Frazy z tej samej kategorii reklamowej Google Ads — a to nie to samo, co z tego samego tematu.',
    uwaga: 'Na „kolorowanki do druku” zwrócił pogodę na 10 dni, darmowe gry i tłumacza polsko-angielskiego. Używaj świadomie.',
    koszt: 'jedno zapytanie',
    endpoint: 'dataforseo_labs/google/keyword_ideas/live'
  }
}

// ------------------------------------------------------------------ dopasowanie kategorii

// Slowa, ktore wystepuja niemal w kazdej frazie i same z siebie nic nie znacza. Bez tej
// listy kazda fraza dostawala etykiete „mamy: kolorowanki", bo „kolorowanki" jest slugiem
// huba — czyli mechanizm nie znajdowal ani jednej niepokrytej frazy.
export const SLOWA_PUSTE = new Set([
  'kolorowanki', 'kolorowanka', 'kolorowanek', 'kolorowanke', 'kolorowania',
  'do', 'druku', 'dla', 'za', 'darmo', 'darmowe', 'online', 'pdf', 'druk', 'wydruku',
  'kleurplaten', 'kleurplaat', 'ausmalbilder', 'malvorlagen', 'colorare', 'disegni',
  'malarbilder', 'malarbild'
])

/** Polska odmiana i ogonki psuja porownanie doslowne — sprowadzamy wszystko do ascii. */
export function bezOgonkow (s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')   // jedyna litera, ktorej NFD nie rozklada
}

// Koncowki odmiany, od najdluzszych. Liczenie wspolnych znakow sie nie sprawdzilo:
// czterema znakami „dzieci" zlewalo sie z „dzien", a piecioma „panda" przestawala pasowac
// do kategorii „pandy" — i tabela mowila, ze nie ma strony o pandach, choc jest.
//
// Celowo BEZ „ki" i „ka": to koncowki zdrobnien, nie przypadkow, i zjadaly litere rdzenia
// („smoki" -> „smo"). Ich brak oznacza, ze zdrobnienia sie nie dopasuja — i tak ma byc,
// bo „kotek" to co innego niz „koty" i lepiej pokazac je jako osobna okazje.
const KONCOWKI = ['ami', 'ach', 'ych', 'ich', 'ow', 'om', 'em', 'ie',
  'y', 'i', 'a', 'e', 'u', 'o']

/** Zgrubny rdzen. Nie jest to poprawny stemmer polszczyzny i nie musi byc. */
export function rdzen (slowo) {
  for (const k of KONCOWKI) {
    if (slowo.length - k.length >= 3 && slowo.endsWith(k)) return slowo.slice(0, -k.length)
  }
  return slowo
}

/** Z listy slugow buduje pary [czesc, slug] gotowe do porownywania. */
export function czesciZeSlugow (slugi) {
  const czesci = []
  for (const slug of slugi) {
    for (const czesc of bezOgonkow(slug).split('-')) {
      if (czesc.length >= 4 && !SLOWA_PUSTE.has(czesc)) czesci.push([czesc, slug])
    }
  }
  return czesci
}

/**
 * Czy fraza trafia w ktoras z kategorii. Celowo zachowawcze: falszywe „mamy to" ukrywa
 * okazje i nigdy sie o niej nie dowiesz, a falszywe „nie mamy" kosztuje chwile przy
 * przegladaniu.
 */
export function mamyToJuz (fraza, czesciSlugow) {
  const slowa = bezOgonkow(fraza).split(/[\s\-_]+/)
    .filter(s => s.length >= 4 && !SLOWA_PUSTE.has(s))

  // Zostaly same slowa puste — to fraza ogolna („kolorowanki do druku"), celujaca
  // w strone glowna, a nie w kategorie.
  if (!slowa.length) return 'ogolna'

  for (const slowo of slowa) {
    const r = rdzen(slowo)
    if (!r) continue
    for (const [czesc, slug] of czesciSlugow) {
      if (r === rdzen(czesc)) return slug
    }
  }
  return null
}

// ------------------------------------------------------------------ warianty

/**
 * Z jednego slowa buduje wszystkie sensowne zapytania. Czesc kombinacji to belkot — nic
 * nie szkodzi, API zwroci dla nich zero, a jedno zapytanie kosztuje tyle samo niezaleznie
 * od tego, ile fraz w nim wyslemy.
 *
 * Formy budujemy z ogonkami I bez nich, bo w danych „kolorowanki dla dorosłych" i wersja
 * bez ogonkow zyja jako dwie osobne frazy, obie z realnym wolumenem.
 */
export function budujWarianty (zarodek, rynek) {
  const bazaOrg = String(zarodek).toLowerCase().trim().split(/\s+/).pop()
  const bazaAscii = bezOgonkow(bazaOrg)
  const formy = [...new Set([
    bazaOrg, bazaAscii,
    ...rynek.koncowki.map(k => rdzen(bazaOrg) + k),
    ...rynek.koncowki.map(k => rdzen(bazaAscii) + k)
  ])].filter(f => f.length >= 3)

  return {
    formy,
    kandydaci: [...new Set(formy.flatMap(f => rynek.szablony.map(s => s.replace('{w}', f))))]
  }
}

// ------------------------------------------------------------------ mapowanie wiersza

/**
 * Zamienia surowa pozycje z API na wiersz, ktorym posluguje sie reszta narzedzia.
 *
 * Wolumen wiodacy to clickstream, bo koszyk Google Ads zawyza pojedyncza fraze o wielkosc
 * calej grupy bliskich wariantow — zmierzone na „kapibara kolorowanki": koszyk 8100,
 * clickstream 223, Semrush 110.
 */
export function mapujWiersz (p, czesciSlugow) {
  const info = p.keyword_info ?? {}
  const wlas = p.keyword_properties ?? {}
  const linki = p.avg_backlinks_info ?? {}
  const cs = p.clickstream_keyword_info ?? {}

  const wolumenAds = info.search_volume ?? 0
  const wolumenCs = cs.search_volume ?? null
  const maCs = wolumenCs !== null && wolumenCs !== undefined

  // Krzywa tez z clickstreamu, gdy jest — miesiace z Google Ads dziedzicza splaszczenie
  // koszyka (widac golym okiem: szesc miesiecy z rzedu po dokladnie 8100).
  const miesiace = (maCs && Array.isArray(cs.monthly_searches) && cs.monthly_searches.length)
    ? cs.monthly_searches
    : (Array.isArray(info.monthly_searches) ? info.monthly_searches : [])
  const szczyt = miesiace.reduce((n, m) => (m.search_volume > (n?.search_volume ?? -1) ? m : n), null)
  const sredniMies = miesiace.length
    ? miesiace.reduce((s, m) => s + (m.search_volume || 0), 0) / miesiace.length
    : 0

  return {
    fraza: p.keyword,
    wolumen: maCs ? wolumenCs : wolumenAds,
    wolumenAds,
    wolumenClickstream: maCs ? wolumenCs : null,
    zrodloWolumenu: maCs ? 'clickstream' : 'ads',
    trudnoscSeo: wlas.keyword_difficulty ?? null,
    slow: wlas.words_count ?? null,
    domenyTop10: linki.referring_domains ?? null,
    silaTop10: linki.main_domain_rank ?? null,
    intencja: p.search_intent_info?.main_intent ?? null,
    trendRoczny: info.search_volume_trend?.yearly ?? null,
    szczytMiesiac: szczyt?.month ?? null,
    szczytWolumen: szczyt?.search_volume ?? null,
    sezonowosc: sredniMies ? Number(((szczyt?.search_volume ?? 0) / sredniMies).toFixed(2)) : null,
    miesiace: miesiace.map(m => m.search_volume ?? 0),
    konkurencjaReklamowa: info.competition ?? null,
    poziomReklamowy: info.competition_level ?? null,
    cpc: info.cpc ?? null,
    mamyKategorie: mamyToJuz(p.keyword, czesciSlugow)
  }
}

// ------------------------------------------------------------------ klient API

/**
 * Jedno wywolanie DataForSEO. Poswiadczenia podaje wolajacy, zeby modul nie musial wiedziec,
 * czy siedza w .env, czy w zmiennych Netlify.
 *
 * Zwraca { wynik, koszt }. Koszt bierzemy z pola `cost` w odpowiedzi, a nie z cennika na
 * stronie — to jedyna liczba, ktora jest prawdziwa.
 */
export async function wywolajDfs (sciezka, zadanie, { login, haslo }) {
  const odp = await fetch(`https://api.dataforseo.com/v3/${sciezka}`, {
    method: 'POST',
    headers: {
      authorization: 'Basic ' + Buffer.from(`${login}:${haslo}`).toString('base64'),
      'content-type': 'application/json'
    },
    body: JSON.stringify(zadanie)
  })

  const tresc = await odp.json().catch(() => null)
  if (!odp.ok || !tresc) throw new Error(`${sciezka}: HTTP ${odp.status}`)

  // DataForSEO zwraca 200 nawet przy bledzie logicznym — prawda jest w status_code.
  if (tresc.status_code !== 20000) {
    throw new Error(`${sciezka}: ${tresc.status_code} ${tresc.status_message}`)
  }
  const z = tresc.tasks?.[0]
  if (z && z.status_code !== 20000) {
    throw new Error(`${sciezka}: ${z.status_code} ${z.status_message}`)
  }

  return { wynik: z?.result ?? [], koszt: tresc.cost || 0 }
}

// ------------------------------------------------------------------ scalanie zbioru

/**
 * Dosypuje wiersze do dokumentu rynku. Funkcja czysta: dostaje stary dokument i paczke,
 * zwraca nowy — zapis nalezy do wolajacego.
 *
 * Scalanie po samej frazie. Powtorne kopanie nadpisuje liczby i date pomiaru, ale nie mnozy
 * wierszy — dokument rosnie tylko o to, czego wczesniej nie bylo. Oceny operatora leza
 * w OSOBNYM dokumencie wlasnie dlatego, ze ta funkcja nadpisuje wiersz w calosci.
 */
export function scalWiersze (istniejacy, paczka) {
  const stary = istniejacy ?? { rynek: paczka.rynek, nazwaRynku: paczka.nazwaRynku, zestawy: {}, wiersze: [] }
  const wgFrazy = new Map((stary.wiersze ?? []).map(w => [w.fraza, w]))
  let nowych = 0
  let odswiezonych = 0

  for (const w of paczka.wiersze) {
    if (!w?.fraza) continue
    if (wgFrazy.has(w.fraza)) odswiezonych++
    else nowych++
    wgFrazy.set(w.fraza, { ...w, zestaw: paczka.zestaw, zmierzono: paczka.pobrano || new Date().toISOString() })
  }

  return {
    dokument: {
      rynek: paczka.rynek,
      nazwaRynku: paczka.nazwaRynku || stary.nazwaRynku,
      zaktualizowano: new Date().toISOString(),
      zestawy: {
        ...(stary.zestawy ?? {}),
        [paczka.zestaw]: {
          seedy: paczka.seedy, pobrano: paczka.pobrano, tryb: paczka.tryb,
          koszt: paczka.koszt, fraz: paczka.wiersze.length,
          // Pelna lista fraz, ktore to kopanie zwrocilo. Bez niej nie da sie pokazac
          // „co dokladnie wyszlo z tamtego przebiegu": znacznik `zestaw` w wierszu wskazuje
          // tylko OSTATNIE kopanie, ktore te fraze dotknelo, wiec przy nakladajacych sie
          // przebiegach wczesniejsze wykopalisko wygladaloby na mniejsze, niz bylo.
          frazy: paczka.wiersze.map(w => w.fraza)
        }
      },
      wiersze: [...wgFrazy.values()].sort((a, b) => (b.wolumen || 0) - (a.wolumen || 0))
    },
    nowych,
    odswiezonych
  }
}

// ------------------------------------------------------------------ slugi z sitemapy

/**
 * Slugi kategorii wyciagniete z sitemapy produkcji. Panel nie ma dostepu do katalogu
 * `content/`, a sitemapa zawiera dokladnie te adresy, ktore sa jednostka SEO — wiec jest
 * lepszym zrodlem niz cokolwiek, co dalo by sie wbudowac na sztywno. Nowa kategoria trafia
 * do rozpoznawania sama, bez zmiany kodu.
 */
export async function slugiZSitemapy (url = 'https://twoja-kolorowanka.pl/sitemap.xml') {
  const odp = await fetch(url, { headers: { 'user-agent': 'panel-frazy' } })
  if (!odp.ok) throw new Error(`Nie udalo sie pobrac sitemapy: HTTP ${odp.status}`)
  const xml = await odp.text()

  const slugi = new Set()
  for (const m of xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>/g)) {
    let sciezka
    try { sciezka = new URL(m[1]).pathname } catch { continue }
    for (const seg of sciezka.split('/')) {
      if (seg && !/^\d+$/.test(seg)) slugi.add(seg.toLowerCase())
    }
  }
  return [...slugi]
}
