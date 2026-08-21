#!/usr/bin/env node
/**
 * Test zaufania do DataForSEO — zanim zaczniemy na nim opierac decyzje o nowych rynkach.
 *
 * Pomysl jest prosty: na polskim rynku mamy wlasne dane z Search Console, wiec da sie
 * sprawdzic, czy narzedzie mowi prawde. Jesli pozycje sie zgadzaja tam, gdzie mamy jak
 * to zweryfikowac, mozna mu ufac tam, gdzie nie mamy (Holandia, Niemcy).
 *
 * Czego NIE nalezy oczekiwac: identycznych liczb. Search Console podaje pozycje SREDNIA
 * wazona wyswietleniami z trzech miesiecy, a to jest pomiar punktowy z dzisiaj, z jednej
 * lokalizacji i bez personalizacji. Zgodnosc co do rzedu wielkosci wystarczy w zupelnosci;
 * rozjazd o kilkanascie pozycji znaczylby, ze cos jest nie tak.
 *
 * Uzycie:
 *   node scripts/dfs/sprawdz.mjs                # saldo + porownanie na 4 frazach
 *   node scripts/dfs/sprawdz.mjs --tylko-saldo  # samo saldo, za darmo
 *   node scripts/dfs/sprawdz.mjs --na-sucho     # pokaz zapytania, nie wysylaj
 */

import { wywolaj, stanKonta, podsumujKoszt, RYNKI } from './klient.mjs'

const NASZA_DOMENA = 'twoja-kolorowanka.pl'

// Frazy z eksportu Search Console za ostatnie 3 miesiace (Zapytania.csv), dobrane tak,
// zeby pokryly rozne polki pozycji — od czolowki po dalsza czesc pierwszej strony.
const PROBKA = [
  { fraza: 'kolorowanie po numerach dla dorosłych pdf', gsc: 1.33 },
  { fraza: 'kolorowanki dla dorosłych pdf',             gsc: 5.51 },
  { fraza: 'kolorowanki dla dzieci do druku',           gsc: 6.47 },
  { fraza: 'kolorowanki do druku',                      gsc: 8.04 }
]

const argumenty = process.argv.slice(2)
const naSucho = argumenty.includes('--na-sucho')
const tylkoSaldo = argumenty.includes('--tylko-saldo')

/** Szuka naszej domeny wsrod wynikow organicznych i zwraca jej pozycje bezwzgledna. */
function znajdzNas (elementy) {
  if (!Array.isArray(elementy)) return null
  for (const e of elementy) {
    if (e.type !== 'organic') continue
    const domena = e.domain || ''
    if (domena === NASZA_DOMENA || domena.endsWith(`.${NASZA_DOMENA}`)) {
      return { pozycja: e.rank_absolute, url: e.url }
    }
  }
  return null
}

async function main () {
  if (!naSucho) {
    const konto = await stanKonta()
    console.log('=== KONTO ===')
    console.log(`Saldo:  $${konto?.money?.balance ?? '?'}`)
    console.log(`Limit dzienny: ${konto?.rates?.limits?.day ?? '?'}   minutowy: ${konto?.rates?.limits?.minute ?? '?'}`)
    if (tylkoSaldo) return
    console.log('')
  }

  const rynek = RYNKI.pl
  console.log(`=== POROWNANIE Z SEARCH CONSOLE (${rynek.nazwa}) ===`)
  console.log('GSC podaje srednia wazona z 3 miesiecy, DataForSEO pomiar z dzisiaj —')
  console.log('szukamy zgodnosci co do rzedu wielkosci, nie identycznych liczb.')
  console.log('')

  const wiersze = []
  for (const { fraza, gsc } of PROBKA) {
    const zadanie = [{
      keyword: fraza,
      location_code: rynek.location_code,
      language_code: rynek.language_code,
      depth: 100
    }]

    const wynik = await wywolaj('serp/google/organic/live/advanced', zadanie, { naSucho })
    if (naSucho) continue

    const my = znajdzNas(wynik?.[0]?.items)
    wiersze.push({ fraza, gsc, dfs: my?.pozycja ?? null, url: my?.url ?? null })
  }

  if (naSucho) return

  const szer = Math.max(...wiersze.map(w => w.fraza.length))
  console.log(`${'FRAZA'.padEnd(szer)}   GSC    DFS    ROZNICA`)
  console.log('-'.repeat(szer + 26))
  for (const w of wiersze) {
    const dfs = w.dfs === null ? 'poza 100' : String(w.dfs)
    const roznica = w.dfs === null ? '—' : (w.dfs - w.gsc >= 0 ? '+' : '') + (w.dfs - w.gsc).toFixed(1)
    console.log(`${w.fraza.padEnd(szer)}   ${String(w.gsc).padEnd(6)} ${dfs.padEnd(6)} ${roznica}`)
  }

  console.log('')
  console.log('Adresy, ktore Google faktycznie pokazuje:')
  for (const w of wiersze) {
    if (w.url) console.log(`  ${w.fraza}\n      ${w.url}`)
  }

  const trafione = wiersze.filter(w => w.dfs !== null)
  if (trafione.length) {
    const sredniRozjazd = trafione.reduce((s, w) => s + Math.abs(w.dfs - w.gsc), 0) / trafione.length
    console.log('')
    console.log(`Sredni rozjazd: ${sredniRozjazd.toFixed(1)} pozycji na ${trafione.length} z ${wiersze.length} fraz.`)
    console.log(sredniRozjazd <= 3
      ? 'Zgodnosc dobra — mozna ufac pomiarom na rynkach bez wlasnych danych.'
      : 'Rozjazd wiekszy niz oczekiwany — warto sprawdzic lokalizacje i jezyk zapytania.')
  }

  podsumujKoszt()
}

main().catch(err => {
  console.error(`\nBLAD: ${err.message}`)
  podsumujKoszt()
  process.exit(1)
})
