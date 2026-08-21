// Klient DataForSEO — wspolna warstwa dla calego warsztatu do fraz.
//
// Rozliczenie jest za pojedyncze zapytanie, wiec kazde wywolanie to realne pieniadze.
// Dlatego klient robi dwie rzeczy, ktorych zwykly wrapper by nie robil:
//   1. liczy koszt kazdego wywolania i sumuje go w ramach przebiegu,
//   2. potrafi dzialac na sucho (`--na-sucho`), zeby dalo sie sprawdzic ksztalt zapytania
//      bez placenia za odpowiedz.
//
// Ceny bierzemy z pola `cost` w odpowiedzi, a nie z cennika na stronie. To jedyna liczba,
// ktora jest prawdziwa — cennik bywa nieaktualny, a `cost` to kwota faktycznie pobrana.

import { readFileSync } from 'node:fs'

// Ten sam mechanizm wczytywania .env co w lineart-generate.mjs i recraft-probe.mjs.
try {
  for (const linia of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = linia.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (m && !linia.trimStart().startsWith('#') && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
} catch { /* brak .env */ }

const BAZA = 'https://api.dataforseo.com/v3'

// Polska. Kody lokalizacji DataForSEO pokrywaja sie z kodami Google Ads.
// `szablony` i `koncowki` sluza trybowi „warianty": z jednego slowa buduja wszystkie
// sensowne sposoby, na jakie ludzie moga o to zapytac, zeby dalo sie zmierzyc, ktory
// z nich naprawde niesie ruch. Przy polskim to najwazniejsze, bo odmiana potrafi
// przeniesc caly wolumen na inna forme — „kolorowanka panda" ma 745, a „kolorowanki
// pandy" dokladnie zero.
export const RYNKI = {
  pl: {
    location_code: 2616, language_code: 'pl', nazwa: 'Polska',
    szablony: ['kolorowanki {w}', 'kolorowanka {w}', '{w} kolorowanki', '{w} kolorowanka',
      'kolorowanki {w} do druku', '{w} kolorowanka do druku', '{w} do kolorowania'],
    koncowki: ['', 'a', 'y', 'i', 'e', 'ę', 'ow', 'ów', 'ami', 'ach', 'ka', 'ki']
  },
  nl: {
    location_code: 2528, language_code: 'nl', nazwa: 'Holandia',
    szablony: ['kleurplaat {w}', 'kleurplaten {w}', '{w} kleurplaat', '{w} kleurplaten',
      'kleurplaat {w} printen'],
    koncowki: ['', 's', 'en', 'je', 'jes']
  },
  de: {
    location_code: 2276, language_code: 'de', nazwa: 'Niemcy',
    szablony: ['ausmalbilder {w}', 'malvorlagen {w}', '{w} ausmalbilder', '{w} malvorlage',
      'ausmalbilder {w} kostenlos'],
    koncowki: ['', 'n', 'en', 'e', 'er', 's']
  },
  it: {
    location_code: 2380, language_code: 'it', nazwa: 'Wlochy',
    szablony: ['disegni da colorare {w}', '{w} da colorare', 'disegni {w} da colorare',
      'immagini da colorare {w}'],
    koncowki: ['', 'i', 'e', 'o', 'a']
  },
  se: {
    location_code: 2752, language_code: 'sv', nazwa: 'Szwecja',
    szablony: ['målarbilder {w}', '{w} målarbild', 'målarbild {w}', 'målarbilder {w} gratis'],
    koncowki: ['', 'r', 'ar', 'or', 'en']
  }
}

function naglowekAuth () {
  const login = process.env.DATAFORSEO_LOGIN
  const haslo = process.env.DATAFORSEO_PASSWORD
  if (!login || !haslo) {
    console.error('Brak DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD w .env')
    console.error('Panel DataForSEO -> API Dashboard. Haslo API to NIE haslo do strony.')
    process.exit(2)
  }
  return 'Basic ' + Buffer.from(`${login}:${haslo}`).toString('base64')
}

/** Sumuje wydatki w ramach jednego przebiegu, zeby dalo sie je pokazac na koniec. */
export const licznik = { wydano: 0, wywolan: 0 }

/**
 * Jedno wywolanie API. `sciezka` bez wiodacego ukosnika, np. 'appendix/user_data'.
 * `dane` to tablica zadan (DataForSEO zawsze przyjmuje tablice) albo null dla GET.
 */
export async function wywolaj (sciezka, dane = null, { naSucho = false } = {}) {
  if (naSucho) {
    console.log(`[na sucho] ${sciezka}`)
    console.log(JSON.stringify(dane, null, 2))
    return null
  }

  const odp = await fetch(`${BAZA}/${sciezka}`, {
    method: dane ? 'POST' : 'GET',
    headers: {
      authorization: naglowekAuth(),
      'content-type': 'application/json'
    },
    body: dane ? JSON.stringify(dane) : undefined
  })

  const tresc = await odp.json().catch(() => null)
  if (!odp.ok || !tresc) {
    throw new Error(`${sciezka}: HTTP ${odp.status}`)
  }

  // DataForSEO zwraca 200 nawet przy bledzie logicznym — prawda jest w status_code.
  // 20000 to sukces; wszystko inne wymaga przerwania, zeby nie liczyc smieci jak danych.
  if (tresc.status_code !== 20000) {
    throw new Error(`${sciezka}: ${tresc.status_code} ${tresc.status_message}`)
  }

  licznik.wydano += tresc.cost || 0
  licznik.wywolan += 1

  const zadanie = tresc.tasks?.[0]
  if (zadanie && zadanie.status_code !== 20000) {
    throw new Error(`${sciezka} (zadanie): ${zadanie.status_code} ${zadanie.status_message}`)
  }

  return zadanie?.result ?? tresc
}

export function podsumujKoszt () {
  if (!licznik.wywolan) return
  console.log('')
  console.log(`Wywolan: ${licznik.wywolan}   koszt przebiegu: $${licznik.wydano.toFixed(5)}`)
}

/** Stan konta — saldo i limity. Wywolanie darmowe. */
export async function stanKonta () {
  const r = await wywolaj('appendix/user_data')
  return Array.isArray(r) ? r[0] : r
}
