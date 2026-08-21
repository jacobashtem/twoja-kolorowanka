// Magazyn fraz — jeden trwaly dokument na kraj, dosypywany przy kolejnych kopaniach.
//
// Celowo NIE jest to historia z datami, w odroznieniu od monitoringu indeksacji. Pomiar
// wolumenu robimy raz, ewentualnie powtarzamy na zadanie; wahania „raz 1000, raz 50"
// nikogo nie interesuja i trzymanie ich kosztowaloby miejsce oraz mieszalo w panelu.
// Dlatego kluczem jest sam rynek, a nie rynek plus data.
//
// Scalanie dzieje sie TUTAJ, a nie w skrypcie, zeby powtorne kopanie tej samej kategorii
// aktualizowalo wiersze zamiast tworzyc duplikaty — niezaleznie od tego, z ktorej maszyny
// zostalo uruchomione.
//
// Zmienna srodowiskowa: GSC_INGEST_TOKEN (ten sam sekret co monitoring indeksacji — to ta
// sama granica zaufania: moj skrypt pisze do mojego panelu).
//
//   GET  ?rynek=pl   -> dokument rynku
//   GET  (bez rynku) -> podsumowanie wszystkich rynkow
//   POST             -> dosypuje wiersze do rynku i zwraca statystyke scalenia

import { getStore } from '@netlify/blobs'
import { timingSafeEqual } from 'node:crypto'

const json = (dane, status = 200) =>
  new Response(JSON.stringify(dane), {
    status, headers: { 'content-type': 'application/json; charset=utf-8' }
  })

function tokenPasuje (podany, oczekiwany) {
  if (!podany || !oczekiwany) return false
  const a = Buffer.from(podany)
  const b = Buffer.from(oczekiwany)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

const kluczRynku = rynek => `frazy/${rynek}`

export default async (request) => {
  const oczekiwany = process.env.GSC_INGEST_TOKEN
  if (!oczekiwany) return json({ error: 'Magazyn nie jest skonfigurowany.' }, 500)

  const podany = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!tokenPasuje(podany, oczekiwany)) return json({ error: 'Brak dostepu.' }, 401)

  const store = getStore('dfs')
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const rynek = url.searchParams.get('rynek')
    if (rynek) {
      const dok = await store.get(kluczRynku(rynek), { type: 'json' })
      if (!dok) return json({ error: `Brak danych dla rynku ${rynek}.` }, 404)
      return json(dok)
    }
    const { blobs } = await store.list({ prefix: 'frazy/' })
    return json({ rynki: blobs.map(b => b.key.replace('frazy/', '')) })
  }

  if (request.method !== 'POST') return json({ error: 'Dozwolone GET i POST.' }, 405)

  let paczka
  try {
    paczka = await request.json()
  } catch {
    return json({ error: 'Tresc nie jest poprawnym JSON-em.' }, 400)
  }
  if (!paczka?.rynek || !Array.isArray(paczka.wiersze)) {
    return json({ error: 'Wymagane pola: rynek, wiersze[].' }, 400)
  }

  const klucz = kluczRynku(paczka.rynek)
  const istniejacy = await store.get(klucz, { type: 'json' }) ?? {
    rynek: paczka.rynek,
    nazwaRynku: paczka.nazwaRynku,
    zestawy: {},
    wiersze: []
  }

  // Scalanie po samej frazie. Powtorne kopanie nadpisuje liczby i date pomiaru,
  // ale nie mnozy wierszy — dokument rosnie tylko o to, czego wczesniej nie bylo.
  const wgFrazy = new Map(istniejacy.wiersze.map(w => [w.fraza, w]))
  let nowych = 0
  let odswiezonych = 0

  for (const w of paczka.wiersze) {
    if (!w?.fraza) continue
    const wpis = {
      ...w,
      zestaw: paczka.zestaw,
      zmierzono: paczka.pobrano || new Date().toISOString()
    }
    if (wgFrazy.has(w.fraza)) odswiezonych++
    else nowych++
    wgFrazy.set(w.fraza, wpis)
  }

  const dokument = {
    rynek: paczka.rynek,
    nazwaRynku: paczka.nazwaRynku || istniejacy.nazwaRynku,
    zaktualizowano: new Date().toISOString(),
    zestawy: {
      ...istniejacy.zestawy,
      [paczka.zestaw]: {
        seedy: paczka.seedy,
        pobrano: paczka.pobrano,
        koszt: paczka.koszt,
        fraz: paczka.wiersze.length
      }
    },
    wiersze: [...wgFrazy.values()].sort((a, b) => (b.wolumen || 0) - (a.wolumen || 0))
  }

  await store.setJSON(klucz, dokument)

  return json({
    zapisano: true,
    rynek: paczka.rynek,
    nowych,
    odswiezonych,
    lacznieWRynku: dokument.wiersze.length
  })
}
