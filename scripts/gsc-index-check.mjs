#!/usr/bin/env node
/**
 * Kontrola indeksacji stron z sitemapy przez URL Inspection API Search Console.
 *
 * Zakres to dokladnie to, co jest w `sitemap.xml`, czyli huby, kategorie, przekroje
 * i blog — a NIE liscie. Liscie sa celowo wykluczone (`nuxt.config.ts`: sitemap.exclude)
 * i maja canonical wskazujacy kategorie, wiec ich brak w indeksie to stan zamierzony,
 * nie awaria. Gdyby je tu wciagnac, kazdy przebieg zglaszalby ~4000 falszywych alarmow.
 *
 * Zadna lista adresow nie jest wpisana na sztywno: skrypt czyta sitemape z produkcji,
 * wiec nowa kategoria wpada do monitoringu sama, a usunieta znika.
 *
 * Uwierzytelnianie: konto usługi Google (JWT RS256 -> token OAuth). Bez zaleznosci
 * zewnetrznych — `googleapis` ciagnie kilkadziesiat megabajtow na dwa zapytania HTTP.
 *
 * Uzycie:
 *   node scripts/gsc-index-check.mjs --out data/gsc/snapshot.json
 *   node scripts/gsc-index-check.mjs --key ./klucz.json --limit 5     # test lokalny
 *   node scripts/gsc-index-check.mjs --prev poprzedni.json --out nowy.json
 *
 * Klucz konta uslugi: zmienna GSC_SERVICE_ACCOUNT_JSON (cala tresc pliku JSON)
 * albo sciezka podana przez --key.
 *
 * Kod wyjscia 1, gdy przy podanym --prev wykryto regresje (strona wypadla z indeksu
 * albo Google przestal respektowac nasz canonical). To jest caly mechanizm alertu:
 * GitHub Actions wysyla maila o nieudanym przebiegu — tak samo jak w health-check.yml.
 */

import { createSign } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const DOMYSLNY_SITE    = 'sc-domain:twoja-kolorowanka.pl'
const DOMYSLNA_SITEMAP = 'https://twoja-kolorowanka.pl/sitemap.xml'
const SCOPE            = 'https://www.googleapis.com/auth/webmasters.readonly'

// Limit API to 600 zapytan/min i 2000/dobe na wlasciwosc. Przy ~114 adresach dobowy
// limit jest nieosiagalny, ale minutowy juz tak — 5 rownoleglych zapytan trzyma nas
// grubo ponizej, a caly przebieg i tak zamyka sie w okolo minucie.
const RownolegleDomyslnie = 5

// ---------------------------------------------------------------- argumenty

function parsujArgumenty (argv) {
  const a = { site: DOMYSLNY_SITE, sitemap: DOMYSLNA_SITEMAP, concurrency: RownolegleDomyslnie }
  for (let i = 0; i < argv.length; i++) {
    const [klucz, wartoscInline] = argv[i].split('=')
    const nastepna = () => wartoscInline ?? argv[++i]
    switch (klucz) {
      case '--site':        a.site        = nastepna(); break
      case '--sitemap':     a.sitemap     = nastepna(); break
      case '--key':         a.key         = nastepna(); break
      case '--out':         a.out         = nastepna(); break
      case '--prev':        a.prev        = nastepna(); break
      case '--magazyn':     a.magazyn     = nastepna(); break
      case '--limit':       a.limit       = Number(nastepna()); break
      case '--concurrency': a.concurrency = Number(nastepna()); break
    }
  }
  return a
}

// ---------------------------------------------------------------- uwierzytelnianie

function base64url (dane) {
  return Buffer.from(dane).toString('base64url')
}

async function wczytajKonto (sciezkaKlucza) {
  const surowy = sciezkaKlucza
    ? await readFile(sciezkaKlucza, 'utf8')
    : process.env.GSC_SERVICE_ACCOUNT_JSON

  if (!surowy) {
    throw new Error(
      'Brak klucza konta uslugi. Ustaw GSC_SERVICE_ACCOUNT_JSON albo podaj --key <sciezka>.'
    )
  }
  let konto
  try {
    konto = JSON.parse(surowy)
  } catch {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON nie jest poprawnym JSON-em (wklejona calosc pliku?).')
  }
  if (!konto.client_email || !konto.private_key) {
    throw new Error('Klucz nie zawiera client_email / private_key — to chyba nie jest klucz konta uslugi.')
  }
  return konto
}

/** Podpisuje JWT kluczem konta uslugi i wymienia go na token dostepu OAuth. */
async function pobierzToken (konto) {
  const teraz = Math.floor(Date.now() / 1000)
  const naglowek = { alg: 'RS256', typ: 'JWT' }
  const roszczenie = {
    iss:   konto.client_email,
    scope: SCOPE,
    aud:   'https://oauth2.googleapis.com/token',
    iat:   teraz,
    exp:   teraz + 3600
  }

  const doPodpisu = `${base64url(JSON.stringify(naglowek))}.${base64url(JSON.stringify(roszczenie))}`
  const podpis = createSign('RSA-SHA256').update(doPodpisu).sign(konto.private_key)
  const jwt = `${doPodpisu}.${base64url(podpis)}`

  const odp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  const tresc = await odp.json().catch(() => ({}))
  if (!odp.ok) {
    throw new Error(
      `Nie udalo sie pobrac tokenu (${odp.status}): ${tresc.error_description || tresc.error || 'brak szczegolow'}\n` +
      'Najczestsza przyczyna: Search Console API nie jest wlaczone w tym projekcie Google Cloud.'
    )
  }
  return tresc.access_token
}

// ---------------------------------------------------------------- sitemapa

/**
 * Wyciaga adresy z sitemapy. Bierze `<loc>` tylko z wnetrza `<url>`, bo nasza sitemapa
 * zawiera rowniez `<image:loc>` — plaskie szukanie `<loc>` wciagneloby tysiace obrazkow.
 * Obsluguje tez sitemape zbiorcza (`<sitemapindex>`), gdyby kiedys urosla ponad limit.
 */
async function adresyZSitemapy (url, odwiedzone = new Set()) {
  if (odwiedzone.has(url)) return []
  odwiedzone.add(url)

  const odp = await fetch(url, { headers: { 'user-agent': 'gsc-index-check' } })
  if (!odp.ok) throw new Error(`Nie udalo sie pobrac sitemapy ${url}: HTTP ${odp.status}`)
  const xml = await odp.text()

  if (xml.includes('<sitemapindex')) {
    const dzieci = [...xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)]
      .map(m => m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim())
      .filter(Boolean)
    const zebrane = []
    for (const dziecko of dzieci) zebrane.push(...await adresyZSitemapy(dziecko, odwiedzone))
    return zebrane
  }

  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(m => m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------- inspekcja

const uspij = ms => new Promise(r => setTimeout(r, ms))

/** Pojedyncza inspekcja z ponowieniami przy 429 i bledach serwera. */
async function zbadajAdres (adres, site, token, proba = 0) {
  const odp = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: adres, siteUrl: site, languageCode: 'pl' })
  })

  if ((odp.status === 429 || odp.status >= 500) && proba < 4) {
    await uspij(2000 * 2 ** proba)           // 2s, 4s, 8s, 16s
    return zbadajAdres(adres, site, token, proba + 1)
  }

  const tresc = await odp.json().catch(() => ({}))

  if (!odp.ok) {
    const powod = tresc.error?.message || `HTTP ${odp.status}`
    if (odp.status === 403) {
      throw new Error(
        `Odmowa dostepu dla ${site}: ${powod}\n` +
        'Sprawdz dwie rzeczy: czy konto uslugi ma w Search Console uprawnienie "Pelne" ' +
        '(nie "Ograniczone"), oraz czy --site pasuje do typu wlasciwosci ' +
        '(domenowa => sc-domain:domena, prefiksowa => https://domena/).'
      )
    }
    return { adres, blad: powod }
  }

  const wynik = tresc.inspectionResult?.indexStatusResult ?? {}
  return {
    adres,
    verdict:        wynik.verdict        ?? 'BRAK',
    coverageState:  wynik.coverageState  ?? null,
    robotsTxtState: wynik.robotsTxtState ?? null,
    indexingState:  wynik.indexingState  ?? null,
    pageFetchState: wynik.pageFetchState ?? null,
    lastCrawlTime:  wynik.lastCrawlTime  ?? null,
    googleCanonical: wynik.googleCanonical ?? null,
    userCanonical:   wynik.userCanonical   ?? null,
    wSitemapie:     Array.isArray(wynik.sitemap) && wynik.sitemap.length > 0,
    linkDoInspekcji: tresc.inspectionResult?.inspectionResultLink ?? null
  }
}

/** Prosta pula robotnikow — trzyma stala liczbe zapytan w locie. */
async function zbadajWszystkie (adresy, site, token, rownolegle, naPostep) {
  const wyniki = new Array(adresy.length)
  let nastepny = 0
  let gotowe = 0

  const robotnik = async () => {
    while (true) {
      const i = nastepny++
      if (i >= adresy.length) return
      wyniki[i] = await zbadajAdres(adresy[i], site, token)
      naPostep(++gotowe, adresy.length)
    }
  }

  await Promise.all(Array.from({ length: Math.min(rownolegle, adresy.length) }, robotnik))
  return wyniki
}

// ---------------------------------------------------------------- porownanie

/**
 * Regresja to zmiana na gorsze wzgledem poprzedniego przebiegu. Rozroznia dwa rodzaje,
 * bo znacza co innego: wypadniecie z indeksu (tracimy ruch) oraz rozjazd canonicali
 * (Google przestal wierzyc w nasz canonical — tego nie widac golym okiem).
 */
function znajdzRegresje (teraz, poprzednio) {
  if (!poprzednio) return []
  const wczesniej = new Map(poprzednio.wyniki?.map(w => [w.adres, w]) ?? [])
  const regresje = []

  for (const w of teraz) {
    const stary = wczesniej.get(w.adres)
    if (!stary || w.blad) continue

    if (stary.verdict === 'PASS' && w.verdict !== 'PASS') {
      regresje.push({ adres: w.adres, rodzaj: 'wypadl-z-indeksu', bylo: stary.coverageState, jest: w.coverageState })
    }
    const kanonicznyOk    = !w.googleCanonical || !w.userCanonical || w.googleCanonical === w.userCanonical
    const kanonicznyBylOk = !stary.googleCanonical || !stary.userCanonical || stary.googleCanonical === stary.userCanonical
    if (kanonicznyBylOk && !kanonicznyOk) {
      regresje.push({ adres: w.adres, rodzaj: 'rozjazd-canonical', bylo: w.userCanonical, jest: w.googleCanonical })
    }
  }
  return regresje
}

// ---------------------------------------------------------------- magazyn

/**
 * Historia mieszka w Netlify Blobs, za funkcja `gsc-store`. Nie w repo, bo repozytorium
 * jest publiczne, i nie w artefaktach przebiegow, bo te w publicznym repo tez sa jawne.
 */
async function pobierzZMagazynu (url) {
  const token = process.env.GSC_INGEST_TOKEN
  if (!token) throw new Error('Brak GSC_INGEST_TOKEN — magazyn wymaga tokenu.')

  const odp = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
  if (odp.status === 404) {
    console.log('Magazyn nie ma jeszcze zadnego zrzutu — to pierwszy przebieg.')
    return null
  }
  if (!odp.ok) {
    console.log(`Nie udalo sie odczytac magazynu (HTTP ${odp.status}) — porownanie pominiete.`)
    return null
  }
  const zrzut = await odp.json()
  console.log(`Poprzedni zrzut z magazynu: ${zrzut.pobrano}`)
  return zrzut
}

async function zapiszWMagazynie (url, zrzut) {
  const token = process.env.GSC_INGEST_TOKEN
  const odp = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(zrzut)
  })
  if (!odp.ok) {
    throw new Error(`Nie udalo sie zapisac w magazynie: HTTP ${odp.status} ${await odp.text()}`)
  }
  console.log('Zrzut zapisany w magazynie.')
}

// ---------------------------------------------------------------- raport

function wypiszRaport (wyniki, regresje) {
  const bledy       = wyniki.filter(w => w.blad)
  const zaindeksowane = wyniki.filter(w => w.verdict === 'PASS')
  const problemy    = wyniki.filter(w => !w.blad && w.verdict !== 'PASS')

  console.log('')
  console.log('='.repeat(64))
  console.log(`Sprawdzono: ${wyniki.length}   w indeksie: ${zaindeksowane.length}   poza: ${problemy.length}   bledy API: ${bledy.length}`)
  console.log('='.repeat(64))

  const wgStanu = {}
  for (const w of wyniki) {
    const k = w.blad ? 'BLAD API' : (w.coverageState || w.verdict)
    ;(wgStanu[k] ??= []).push(w.adres)
  }
  console.log('\nStan pokrycia:')
  for (const [stan, lista] of Object.entries(wgStanu).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(lista.length).padStart(4)}  ${stan}`)
  }

  if (problemy.length) {
    console.log('\nPoza indeksem:')
    for (const w of problemy) console.log(`  ${w.adres}\n        ${w.coverageState || w.verdict}`)
  }

  const rozjazdy = wyniki.filter(w => w.googleCanonical && w.userCanonical && w.googleCanonical !== w.userCanonical)
  if (rozjazdy.length) {
    console.log('\nGoogle wybral inny canonical niz my:')
    for (const w of rozjazdy) console.log(`  ${w.adres}\n        nasz:   ${w.userCanonical}\n        Google: ${w.googleCanonical}`)
  }

  if (bledy.length) {
    console.log('\nBledy API:')
    for (const w of bledy) console.log(`  ${w.adres}\n        ${w.blad}`)
  }

  if (regresje.length) {
    console.log('\n' + '!'.repeat(64))
    console.log(`REGRESJE WZGLEDEM POPRZEDNIEGO PRZEBIEGU: ${regresje.length}`)
    console.log('!'.repeat(64))
    for (const r of regresje) console.log(`  [${r.rodzaj}] ${r.adres}\n        bylo: ${r.bylo}\n        jest: ${r.jest}`)
  }
  console.log('')
}

// ---------------------------------------------------------------- main

async function main () {
  const a = parsujArgumenty(process.argv.slice(2))

  const konto = await wczytajKonto(a.key)
  console.log(`Konto uslugi: ${konto.client_email}`)
  const token = await pobierzToken(konto)
  console.log('Token OAuth: OK')

  let adresy = await adresyZSitemapy(a.sitemap)
  console.log(`Sitemapa ${a.sitemap}: ${adresy.length} adresow`)
  if (a.limit) {
    adresy = adresy.slice(0, a.limit)
    console.log(`Ograniczono do ${adresy.length} (--limit)`)
  }

  const start = Date.now()
  const wyniki = await zbadajWszystkie(adresy, a.site, token, a.concurrency, (ile, zIlu) => {
    if (ile % 10 === 0 || ile === zIlu) process.stdout.write(`\r  inspekcja: ${ile}/${zIlu}`)
  })
  console.log(`\nCzas: ${Math.round((Date.now() - start) / 1000)}s`)

  let poprzednio = null
  if (a.prev) {
    poprzednio = await readFile(a.prev, 'utf8').then(JSON.parse).catch(() => null)
    if (!poprzednio) console.log(`(brak poprzedniego zrzutu pod ${a.prev} — porownanie pominiete)`)
  } else if (a.magazyn) {
    poprzednio = await pobierzZMagazynu(a.magazyn)
  }
  const regresje = znajdzRegresje(wyniki, poprzednio)

  wypiszRaport(wyniki, regresje)

  const bledy = wyniki.filter(w => w.blad).length
  const zrzut = {
    pobrano: new Date().toISOString(),
    site: a.site,
    sitemap: a.sitemap,
    podsumowanie: {
      sprawdzono:   wyniki.length,
      wIndeksie:    wyniki.filter(w => w.verdict === 'PASS').length,
      pozaIndeksem: wyniki.filter(w => !w.blad && w.verdict !== 'PASS').length,
      bledyApi:     bledy
    },
    regresje,
    wyniki
  }

  if (a.out) {
    await mkdir(dirname(a.out), { recursive: true })
    await writeFile(a.out, JSON.stringify(zrzut, null, 2))
    console.log(`Zrzut zapisany: ${a.out}`)
  }
  if (a.magazyn) await zapiszWMagazynie(a.magazyn, zrzut)

  // Kod wyjscia 1 = mail z GitHuba. Celowo waski prog: alarmuje wypadniecie z indeksu
  // i rozjazd canonicali, a nie samo „cos jest poza indeksem" — te 12 adresow widac
  // w panelu i nie ma sensu przypominac o nich co tydzien.
  //
  // Pojedyncze bledy API nie alarmuja (zdarzaja sie i wracaja same), ale przebieg,
  // w ktorym posypala sie polowa zapytan, nie jest wiarygodnym pomiarem i o tym warto
  // wiedziec — inaczej „brak regresji" znaczylby tylko tyle, ze nie bylo czego porownac.
  const posypalSie = bledy > wyniki.length / 2
  if (regresje.length || posypalSie) {
    if (posypalSie) console.error(`\nBLAD: ${bledy} z ${wyniki.length} zapytan nie przeszlo — pomiar niewiarygodny.`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error(`\nBLAD: ${err.message}`)
  process.exit(1)
})
