#!/usr/bin/env node
/**
 * Warsztat do kopania fraz. Bierze slowa zarodkowe, wyciaga z DataForSEO wszystko, co
 * z nimi powiazane, i zapisuje jako CSV na dysk oraz JSON do magazynu panelu.
 *
 * UWAGA NA DWA ROZNE ZNACZENIA SLOWA „KONKURENCJA" — to najczestsza pomylka przy
 * czytaniu takich danych:
 *
 *   competition (0-1)         konkurencja REKLAMOWA z Google Ads. Mowi, ilu reklamodawcow
 *                             licytuje o te fraze. Z pozycjonowaniem nie ma wspolnego nic
 *                             poza tym, ze wysoka wartosc sugeruje fraze komercyjna.
 *   keyword_difficulty (0-100) trudnosc SEO. To jest ta liczba, ktora mowi, jak trudno
 *                             wejsc na pierwsza strone wynikow organicznych.
 *
 * Zapisujemy obie i pokazujemy obie, bo odpowiadaja na inne pytania.
 *
 * Uzycie:
 *   node scripts/dfs/frazy.mjs --zestaw traktory --seed "kolorowanki traktory"
 *   node scripts/dfs/frazy.mjs --rynek nl --zestaw dieren --seed "kleurplaten dieren"
 *   node scripts/dfs/frazy.mjs --zestaw traktory --seed "..." --na-sucho
 */

import { writeFileSync, readdirSync, existsSync } from 'node:fs'
import { wywolaj, podsumujKoszt, RYNKI, licznik, czesciZeSlugow, mamyToJuz, budujWarianty, mapujWiersz } from './klient.mjs'

const a = { rynek: 'pl', limit: 500, minWolumen: 10, seedy: [], tryb: 'ogon' }
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  const [k, wInline] = argv[i].split('=')
  const nast = () => wInline ?? argv[++i]
  switch (k) {
    case '--rynek':        a.rynek = nast(); break
    case '--zestaw':       a.zestaw = nast(); break
    case '--seed':         a.seedy.push(nast()); break
    case '--limit':        a.limit = Number(nast()); break
    case '--tryb':         a.tryb = nast(); break
    case '--min-wolumen':  a.minWolumen = Number(nast()); break
    case '--csv':          a.csv = nast(); break
    case '--magazyn':      a.magazyn = nast(); break
    case '--na-sucho':     a.naSucho = true; break
    case '--surowe':       a.surowe = true; break
    case '--bez-clickstream': a.bezClickstream = true; break
  }
}

const rynek = RYNKI[a.rynek]
if (!rynek) {
  console.error(`Nieznany rynek "${a.rynek}". Dostepne: ${Object.keys(RYNKI).join(', ')}`)
  process.exit(2)
}
if (!a.zestaw || !a.seedy.length) {
  console.error('Wymagane: --zestaw <nazwa> oraz co najmniej jeden --seed "fraza"')
  process.exit(2)
}

/**
 * Slugi kategorii, ktore juz macie — po to, zeby przy kazdej frazie od razu bylo widac,
 * czy jest pod nia strona, czy nie. Bez tego kazdy eksport trzeba by recznie
 * przeklikiwac przez serwis.
 */
/**
 * Slugi kategorii z katalogu content/. Panel bierze te sama liste z sitemapy produkcji —
 * caly mechanizm porownywania mieszka we wspolnym module, zeby obie drogi dawaly ten sam
 * wynik.
 */
function naszeKategorie () {
  const slugi = new Set()
  const chodz = (dir, poziom = 0) => {
    if (poziom > 2 || !existsSync(dir)) return
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || /^[0-9]+$/.test(e.name)) continue
      slugi.add(e.name.toLowerCase())
      chodz(`${dir}/${e.name}`, poziom + 1)
    }
  }
  chodz('content')
  return czesciZeSlugow([...slugi])
}


const csvPole = w => {
  const s = String(w ?? '')
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main () {
  const slugi = naszeKategorie()
  console.log(`Rynek: ${rynek.nazwa} (${a.rynek})   zestaw: ${a.zestaw}`)
  console.log(`Zarodki: ${a.seedy.map(s => `"${s}"`).join(', ')}`)
  console.log(`Znam ${slugi.length} czesci nazw waszych kategorii — po nich rozpoznaje, co juz macie.`)
  console.log('')

  // Dwa tryby, bo dwa endpointy odpowiadaja na zupelnie inne pytania:
  //
  //   ogon (domyslny)  keyword_suggestions — frazy ZAWIERAJACE zarodek. To jest dlugi ogon
  //                    i to jest to, czego chcemy w 95% przypadkow.
  //   skojarzenia      keyword_ideas — frazy powiazane KATEGORIA REKLAMOWA w Google Ads,
  //                    nie tematem. Sprawdzone na „kolorowanki do druku": zwrocilo pogode,
  //                    darmowe gry i tlumacza polsko-angielskiego. Zostawione, bo bywa
  //                    przydatne do szukania sasiednich nisz, ale nie jako domyslne.
  //   warianty         bierze JEDNO slowo i sam buduje z niego wszystkie odmiany oraz
  //                    szyki, po czym mierzy je naraz. Odpowiedz na pytanie „ktory zapis
  //                    tej frazy naprawde niesie ruch" — przy polskim kluczowe, bo odmiana
  //                    potrafi przeniesc caly wolumen gdzie indziej.
  //   dokladny         keyword_overview — pelne dane dla DOKLADNIE podanych fraz, bez
  //                    dosypywania wariantow. Odpowiednik „Keyword Overview" z Semrusha:
  //                    wpisujesz fraze, ktora Cie interesuje, i dostajesz jej liczby.
  //                    Najtanszy tryb, bo nie placisz za setki wierszy, ktorych nie chcesz.
  const endpoint = a.tryb === 'skojarzenia'
    ? 'dataforseo_labs/google/keyword_ideas/live'
    : a.tryb === 'dokladny'
      ? 'dataforseo_labs/google/keyword_overview/live'
      : 'dataforseo_labs/google/keyword_suggestions/live'

  // Wolumeny z Google Ads to KOSZYKI, nie pomiary: Google zlepia bliskie warianty w jedna
  // grupe i kazdemu czlonkowi przypisuje sume grupy, zaokraglona do drabinki progow
  // (…2900, 3600, 4400, 5400, 6600, 8100, 9900, 12100, 14800…). Kazda liczba w naszych
  // danych lezy dokladnie na tej drabince — stad „kapibara kolorowanki" jako 8100, podczas
  // gdy pojedyncza fraza ma realnie rzad wielkosci mniej.
  //
  // `include_clickstream_data` dokłada dane ze strumieni klikniec, ktore rozbijaja koszyk
  // z powrotem na pojedyncze frazy. WLACZONE DOMYSLNIE, bo bez tego liczby sa nie do uzytku:
  // zmierzone na „kapibara kolorowanki" — koszyk Google Ads 8100, clickstream 223,
  // Semrush 110. Trzydziestosześciokrotne zawyżenie. Kosztuje mniej wiecej dwa razy tyle
  // ($0,14 zamiast $0,07 przy 500 frazach) i jest tego warte.
  const wspolne = {
    location_code: rynek.location_code,
    language_code: rynek.language_code,
    limit: a.limit,
    order_by: ['keyword_info.search_volume,desc'],
    filters: [['keyword_info.search_volume', '>', a.minWolumen]],
    ...(a.bezClickstream ? {} : { include_clickstream_data: true })
  }

  const pozycje = []
  // Tryb pelny to warianty ORAZ dlugi ogon w jednym przebiegu. Do pisania artykulu to
  // wlasciwa para: warianty mowia, jak nazwac rzecz w tytule, a dlugi ogon podsuwa frazy
  // na srodtytuly i akapity.
  const robWarianty = a.tryb === 'warianty' || a.tryb === 'pelny'
  const robOgon = a.tryb === 'ogon' || a.tryb === 'pelny'

  if (robWarianty) {
    // Z jednego slowa budujemy wszystkie sensowne sposoby, na jakie mozna o to zapytac,
    // i mierzymy je naraz. Czesc kombinacji to bedzie belkot — nic nie szkodzi, API zwroci
    // dla nich zero, a jedno zapytanie kosztuje tyle samo niezaleznie od tego, ile fraz
    // w nim wyslemy. Lepiej zapytac o pietnascie za duzo niz przegapic ta jedna, ktora niesie
    // caly ruch.
    const { formy, kandydaci } = budujWarianty(a.seedy[0], rynek)

    console.log(`Formy slowa "${a.seedy[0].split(/\s+/).pop()}": ${formy.join(', ')}`)
    console.log(`Do zmierzenia: ${kandydaci.length} kombinacji w jednym zapytaniu.`)
    console.log('')

    const { order_by, filters, limit, ...bezSortowania } = wspolne
    const wynik = await wywolaj('dataforseo_labs/google/keyword_overview/live',
      [{ keywords: kandydaci, ...bezSortowania }], { naSucho: a.naSucho })
    if (a.naSucho) return
    pozycje.push(...(wynik?.[0]?.items ?? []))
  }

  if (a.tryb === 'dokladny') {
    // Tryb dokladny nie sortuje ani nie filtruje — pytamy o konkretne frazy i chcemy
    // dostac je wszystkie, takze te o zerowym wolumenie. Zerowy wynik to tez odpowiedz.
    const { order_by, filters, limit, ...bezSortowania } = wspolne
    const wynik = await wywolaj(endpoint, [{ keywords: a.seedy, ...bezSortowania }], { naSucho: a.naSucho })
    if (a.naSucho) return
    pozycje.push(...(wynik?.[0]?.items ?? []))
  } else if (a.tryb === 'skojarzenia') {
    const wynik = await wywolaj(endpoint, [{ keywords: a.seedy, ...wspolne }], { naSucho: a.naSucho })
    if (a.naSucho) return
    pozycje.push(...(wynik?.[0]?.items ?? []))
  } else if (robOgon) {
    // keyword_suggestions przyjmuje jeden zarodek na zapytanie, wiec petla po seedach.
    for (const seed of a.seedy) {
      const wynik = await wywolaj('dataforseo_labs/google/keyword_suggestions/live',
        [{ keyword: seed, ...wspolne }], { naSucho: a.naSucho })
      if (a.naSucho) continue
      const ile = wynik?.[0]?.items?.length ?? 0
      console.log(`  dlugi ogon "${seed}" -> ${ile} fraz`)
      pozycje.push(...(wynik?.[0]?.items ?? []))
    }
  }
  if (a.naSucho) return

  console.log(`Zwrocono ${pozycje.length} fraz (tryb: ${a.tryb}).`)

  // --surowe: zrzuca cala pozycje tak, jak przyszla z API. Sluzy do sprawdzenia, jakie
  // pola sa naprawde dostepne, zanim zaczniemy je czytac — zgadywanie nazw pol konczy sie
  // kolumnami pelnymi „undefined".
  if (a.surowe) {
    console.log('\n=== surowa pierwsza pozycja ===')
    console.log(JSON.stringify(pozycje[0], null, 2))
    podsumujKoszt()
    return
  }

  // Kilka zarodkow potrafi zwrocic te sama fraze — odsiewamy, zanim policzymy cokolwiek.
  const unikalne = [...new Map(pozycje.filter(p => p?.keyword).map(p => [p.keyword, p])).values()]
  if (unikalne.length !== pozycje.length) {
    console.log(`Po odsianiu powtorzen: ${unikalne.length} fraz.`)
  }

  const wiersze = unikalne.map(p => mapujWiersz(p, slugi)).sort((x, y) => y.wolumen - x.wolumen)

  // --- CSV na dysk
  const sciezkaCsv = a.csv || `frazy-${a.rynek}-${a.zestaw}.csv`
  const naglowek = ['fraza', 'wolumen', 'zrodlo wolumenu', 'wolumen Google Ads (koszyk)', 'trudnosc SEO', 'domeny do top10', 'sila top10',
    'intencja', 'trend r/r %', 'szczyt (miesiac)', 'szczyt (wolumen)', 'sezonowosc',
    'slow', 'konkurencja reklamowa', 'poziom reklamowy', 'CPC', 'mamy kategorie']
  const csv = [
    naglowek.join(';'),
    ...wiersze.map(w => [
      w.fraza, w.wolumen, w.zrodloWolumenu ?? '', w.wolumenAds ?? '', w.trudnoscSeo ?? '', w.domenyTop10 ?? '', w.silaTop10 ?? '',
      w.intencja ?? '', w.trendRoczny ?? '', w.szczytMiesiac ?? '', w.szczytWolumen ?? '',
      w.sezonowosc ?? '', w.slow ?? '', w.konkurencjaReklamowa ?? '',
      w.poziomReklamowy ?? '', w.cpc ?? '', w.mamyKategorie ?? 'brak kategorii'
    ].map(csvPole).join(';'))
  ].join('\r\n')
  // Srednik jako separator i BOM na poczatku — inaczej Excel w polskiej lokalizacji
  // wrzuca caly wiersz do jednej komorki i lamie polskie znaki.
  writeFileSync(sciezkaCsv, '﻿' + csv, 'utf8')
  console.log(`CSV: ${sciezkaCsv}`)

  // --- podglad w konsoli
  console.log('')
  console.log('Pierwsza dziesiatka:')
  const szer = Math.min(52, Math.max(...wiersze.slice(0, 10).map(w => w.fraza.length)))
  for (const w of wiersze.slice(0, 10)) {
    const znacznik = w.mamyKategorie ? `  [nasza kategoria: ${w.mamyKategorie}]` : '  [brak kategorii]'
    console.log(`  ${w.fraza.slice(0, szer).padEnd(szer)}  ${String(w.wolumen).padStart(7)}  trud. ${String(w.trudnoscSeo ?? '?').padStart(3)}${znacznik}`)
  }

  const plamy = wiersze.filter(w => !w.mamyKategorie)
  const sumaPlam = plamy.reduce((s, w) => s + w.wolumen, 0)
  console.log('')
  console.log(`Bez naszej kategorii: ${plamy.length} fraz, laczny wolumen ${sumaPlam.toLocaleString('pl-PL')}/mies.`)

  // --- magazyn
  if (a.magazyn) {
    const token = process.env.GSC_INGEST_TOKEN
    if (!token) {
      console.log('Pomijam zapis do magazynu — brak GSC_INGEST_TOKEN w .env.')
    } else {
      const odp = await fetch(a.magazyn, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          rynek: a.rynek,
          nazwaRynku: rynek.nazwa,
          zestaw: a.zestaw,
          seedy: a.seedy,
          pobrano: new Date().toISOString(),
          koszt: licznik.wydano,
          wiersze
        })
      })
      console.log(odp.ok ? 'Zapisano w magazynie panelu.' : `Magazyn odmowil: HTTP ${odp.status}`)
    }
  }

  podsumujKoszt()
}

main().catch(err => {
  console.error(`\nBLAD: ${err.message}`)
  podsumujKoszt()
  process.exit(1)
})
