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

const a = { rynek: 'pl', limit: 1000, minWolumen: 10, seedy: [] }
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  const [k, wInline] = argv[i].split('=')
  const nast = () => wInline ?? argv[++i]
  switch (k) {
    case '--rynek':        a.rynek = nast(); break
    case '--zestaw':       a.zestaw = nast(); break
    case '--seed':         a.seedy.push(nast()); break
    case '--limit':        a.limit = Number(nast()); break
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
  return slugi
}

/** Czy fraza trafia w ktoras z naszych kategorii — proste dopasowanie po slowie. */
function mamyToJuz (fraza, slugi) {
  const slowa = fraza.toLowerCase().split(/[\s-]+/)
  for (const s of slowa) {
    if (s.length >= 4 && slugi.has(s)) return s
  }
  return null
}

const csvPole = w => {
  const s = String(w ?? '')
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main () {
  const slugi = naszeKategorie()
  console.log(`Rynek: ${rynek.nazwa} (${a.rynek})   zestaw: ${a.zestaw}`)
  console.log(`Zarodki: ${a.seedy.map(s => `"${s}"`).join(', ')}`)
  console.log(`Znam ${slugi.size} naszych kategorii do oznaczenia bialych plam.`)
  console.log('')

  const zadanie = [{
    keywords: a.seedy,
    location_code: rynek.location_code,
    language_code: rynek.language_code,
    limit: a.limit,
    order_by: ['keyword_info.search_volume,desc'],
    filters: [['keyword_info.search_volume', '>', a.minWolumen]]
  }]

  const wynik = await wywolaj('dataforseo_labs/google/keyword_ideas/live', zadanie, { naSucho: a.naSucho })
  if (a.naSucho) return

  const pozycje = wynik?.[0]?.items ?? []
  console.log(`Zwrocono ${pozycje.length} fraz.`)

  const wiersze = pozycje.map(p => {
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
