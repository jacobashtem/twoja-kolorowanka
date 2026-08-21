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
import { wywolaj, podsumujKoszt, RYNKI, licznik } from './klient.mjs'

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
 * czy jest pod nia strona, czy to biala plama. Bez tego kazdy eksport trzeba by recznie
 * przeklikiwac przez serwis.
 */
function naszeKategorie () {
  const slugi = new Set()
  const chodz = (dir, poziom = 0) => {
    if (poziom > 2 || !existsSync(dir)) return
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || /^\d+$/.test(e.name)) continue
      slugi.add(e.name.toLowerCase())
      chodz(`${dir}/${e.name}`, poziom + 1)
    }
  }
  chodz('content')

  // Slug „dla-doroslych" nie dopasuje sie do slowa „doroslych", dopoki nie rozbijemy go
  // po mysliku. Budujemy mape przedrostek -> pelny slug, zeby porownanie bylo jednym
  // odczytem zamiast petli po wszystkich slugach dla kazdego slowa.
  const czesci = []
  for (const slug of slugi) {
    for (const czesc of bezOgonkow(slug).split('-')) {
      if (czesc.length >= 4 && !SLOWA_PUSTE.has(czesc)) czesci.push([czesc, slug])
    }
  }
  return czesci
}

// Slowa, ktore wystepuja niemal w kazdej frazie i same z siebie nic nie znacza. Bez tej
// listy kazda fraza dostawala etykiete „mamy: kolorowanki", bo „kolorowanki" jest slugiem
// huba — czyli caly mechanizm wykrywania bialych plam pokazywal zero plam.
const SLOWA_PUSTE = new Set([
  'kolorowanki', 'kolorowanka', 'kolorowanek', 'kolorowanke', 'kolorowanki-do-druku',
  'do', 'druku', 'dla', 'za', 'darmo', 'darmowe', 'online', 'pdf', 'druk', 'wydruku',
  'kleurplaten', 'kleurplaat', 'ausmalbilder', 'malvorlagen'
])

/**
 * Czy fraza trafia w ktoras z naszych kategorii. Dopasowanie po czteroznakowym przedrostku,
 * bo polska odmiana psuje porownanie doslowne („traktory" kontra „traktorow").
 *
 * Celowo zachowawcze: wolimy oznaczyc biala plama cos, co juz mamy, niz odwrotnie.
 * Falszywe „mamy to" ukrywa okazje i nigdy sie o niej nie dowiesz; falszywa biala plama
 * kosztuje tylko chwile Twojego czasu przy przegladaniu.
 */
function mamyToJuz (fraza, czesciSlugow) {
  const slowa = bezOgonkow(fraza).split(/[\s\-_]+/)
    .filter(s => s.length >= 4 && !SLOWA_PUSTE.has(s))

  // Zostaly same slowa puste — to fraza ogolna w rodzaju „kolorowanki do druku",
  // celujaca w strone glowna, a nie w kategorie. To nie jest biala plama.
  if (!slowa.length) return 'ogolna'

  for (const slowo of slowa) {
    for (const [czesc, slug] of czesciSlugow) {
      // Dlugosc porownywanego przedrostka rosnie z dlugoscia krotszego ze slow, do pieciu
      // znakow. Staly przedrostek czteroznakowy dawal falszywe trafienia na wspolnych
      // poczatkach: „dzieci" i „dzien" zaczynaja sie tak samo, wiec „kolorowanki dla dzieci"
      // ladowalo w kategorii „pierwszy-dzien-szkoly". Piec znakow te pare rozdziela,
      // a krotkie slugi w rodzaju „koty" nadal daja sie dopasowac.
      const n = Math.min(5, slowo.length, czesc.length)
      if (n >= 4 && slowo.slice(0, n) === czesc.slice(0, n)) return slug
    }
  }
  return null
}

/** Polska odmiana i ogonki psuja porownanie doslowne — sprowadzamy wszystko do ascii. */
function bezOgonkow (s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')   // jedyna litera, ktorej NFD nie rozklada
}

const csvPole = w => {
  const s = String(w ?? '')
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main () {
  const slugi = naszeKategorie()
  console.log(`Rynek: ${rynek.nazwa} (${a.rynek})   zestaw: ${a.zestaw}`)
  console.log(`Zarodki: ${a.seedy.map(s => `"${s}"`).join(', ')}`)
  console.log(`Znam ${slugi.length} czesci nazw kategorii do oznaczenia bialych plam.`)
  console.log('')

  // Dwa tryby, bo dwa endpointy odpowiadaja na zupelnie inne pytania:
  //
  //   ogon (domyslny)  keyword_suggestions — frazy ZAWIERAJACE zarodek. To jest dlugi ogon
  //                    i to jest to, czego chcemy w 95% przypadkow.
  //   skojarzenia      keyword_ideas — frazy powiazane KATEGORIA REKLAMOWA w Google Ads,
  //                    nie tematem. Sprawdzone na „kolorowanki do druku": zwrocilo pogode,
  //                    darmowe gry i tlumacza polsko-angielskiego. Zostawione, bo bywa
  //                    przydatne do szukania sasiednich nisz, ale nie jako domyslne.
  const endpoint = a.tryb === 'skojarzenia'
    ? 'dataforseo_labs/google/keyword_ideas/live'
    : 'dataforseo_labs/google/keyword_suggestions/live'

  const wspolne = {
    location_code: rynek.location_code,
    language_code: rynek.language_code,
    limit: a.limit,
    order_by: ['keyword_info.search_volume,desc'],
    filters: [['keyword_info.search_volume', '>', a.minWolumen]]
  }

  const pozycje = []
  if (a.tryb === 'skojarzenia') {
    const wynik = await wywolaj(endpoint, [{ keywords: a.seedy, ...wspolne }], { naSucho: a.naSucho })
    if (a.naSucho) return
    pozycje.push(...(wynik?.[0]?.items ?? []))
  } else {
    // keyword_suggestions przyjmuje jeden zarodek na zapytanie, wiec petla po seedach.
    for (const seed of a.seedy) {
      const wynik = await wywolaj(endpoint, [{ keyword: seed, ...wspolne }], { naSucho: a.naSucho })
      if (a.naSucho) continue
      const ile = wynik?.[0]?.items?.length ?? 0
      console.log(`  "${seed}" -> ${ile} fraz`)
      pozycje.push(...(wynik?.[0]?.items ?? []))
    }
    if (a.naSucho) return
  }

  console.log(`Zwrocono ${pozycje.length} fraz (tryb: ${a.tryb}).`)

  // Kilka zarodkow potrafi zwrocic te sama fraze — odsiewamy, zanim policzymy cokolwiek.
  const unikalne = [...new Map(pozycje.filter(p => p?.keyword).map(p => [p.keyword, p])).values()]
  if (unikalne.length !== pozycje.length) {
    console.log(`Po odsianiu powtorzen: ${unikalne.length} fraz.`)
  }

  const wiersze = unikalne.map(p => {
    const info = p.keyword_info ?? {}
    const wlas = p.keyword_properties ?? {}
    const nasza = mamyToJuz(p.keyword, slugi)
    return {
      fraza: p.keyword,
      wolumen: info.search_volume ?? 0,
      trudnoscSeo: wlas.keyword_difficulty ?? null,
      konkurencjaReklamowa: info.competition ?? null,
      poziomReklamowy: info.competition_level ?? null,
      cpc: info.cpc ?? null,
      mamyKategorie: nasza
    }
  }).sort((x, y) => y.wolumen - x.wolumen)

  // --- CSV na dysk
  const sciezkaCsv = a.csv || `frazy-${a.rynek}-${a.zestaw}.csv`
  const naglowek = ['fraza', 'wolumen', 'trudnosc SEO', 'konkurencja reklamowa', 'poziom reklamowy', 'CPC', 'mamy kategorie']
  const csv = [
    naglowek.join(';'),
    ...wiersze.map(w => [
      w.fraza, w.wolumen, w.trudnoscSeo ?? '', w.konkurencjaReklamowa ?? '',
      w.poziomReklamowy ?? '', w.cpc ?? '', w.mamyKategorie ?? ''
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
    const znacznik = w.mamyKategorie ? `  [mamy: ${w.mamyKategorie}]` : '  [biala plama]'
    console.log(`  ${w.fraza.slice(0, szer).padEnd(szer)}  ${String(w.wolumen).padStart(7)}  trud. ${String(w.trudnoscSeo ?? '?').padStart(3)}${znacznik}`)
  }

  const plamy = wiersze.filter(w => !w.mamyKategorie)
  const sumaPlam = plamy.reduce((s, w) => s + w.wolumen, 0)
  console.log('')
  console.log(`Bialych plam: ${plamy.length} fraz, laczny wolumen ${sumaPlam.toLocaleString('pl-PL')}/mies.`)

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
