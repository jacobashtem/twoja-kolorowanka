// Magazyn zrzutow monitoringu indeksacji — Netlify Blobs.
//
// Dlaczego nie w repo: repozytorium jest publiczne, a artefakty przebiegow w publicznym
// repo takze da sie pobrac bez logowania. Blobs to jedyne miejsce w tym stosie, ktore
// jest prywatne domyslnie.
//
// Dlaczego przez funkcje, a nie prosto z GitHub Actions: `getStore` uruchomiony wewnatrz
// Netlify dostaje dostep do kubelka automatycznie. Gdyby workflow pisal do Blobs sam,
// trzebaby wystawic mu osobisty token do calego konta Netlify. Wspolny sekret ograniczony
// do jednego endpointu jest wezszym uprawnieniem.
//
// Wymagana zmienna srodowiskowa: GSC_INGEST_TOKEN
//
//   GET   -> ostatni zrzut (do porownania przed zapisem nowego)
//   POST  -> zapisuje zrzut jako `ostatni` oraz w historii pod data

import { getStore } from '@netlify/blobs'
import { timingSafeEqual } from 'node:crypto'

const json = (dane, status = 200) =>
  new Response(JSON.stringify(dane), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })

/** Porownanie odporne na pomiar czasu — zwykle === wycieka dlugosc wspolnego prefiksu. */
function tokenPasuje (podany, oczekiwany) {
  if (!podany || !oczekiwany) return false
  const a = Buffer.from(podany)
  const b = Buffer.from(oczekiwany)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export default async (request) => {
  const oczekiwany = process.env.GSC_INGEST_TOKEN
  if (!oczekiwany) {
    console.error('Brak GSC_INGEST_TOKEN w srodowisku')
    return json({ error: 'Magazyn nie jest skonfigurowany.' }, 500)
  }

  const podany = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!tokenPasuje(podany, oczekiwany)) {
    return json({ error: 'Brak dostepu.' }, 401)
  }

  const store = getStore('gsc')

  if (request.method === 'GET') {
    const ostatni = await store.get('ostatni', { type: 'json' })
    if (!ostatni) return json({ error: 'Brak zapisanych zrzutow.' }, 404)
    return json(ostatni)
  }

  if (request.method === 'POST') {
    let zrzut
    try {
      zrzut = await request.json()
    } catch {
      return json({ error: 'Tresc nie jest poprawnym JSON-em.' }, 400)
    }
    if (!Array.isArray(zrzut?.wyniki)) {
      return json({ error: 'Zrzut nie zawiera tablicy `wyniki`.' }, 400)
    }

    // Data w kluczu historii, nie znacznik czasu — przy tygodniowym rytmie jeden zrzut
    // na dobe w zupelnosci wystarcza, a powtorzone uruchomienie tego samego dnia ma
    // nadpisac poprzednie, nie mnozyc wpisow.
    const dzien = (zrzut.pobrano || new Date().toISOString()).slice(0, 10)

    await store.setJSON('ostatni', zrzut)
    await store.setJSON(`historia/${dzien}`, zrzut)

    return json({ zapisano: true, dzien, adresow: zrzut.wyniki.length })
  }

  return json({ error: 'Dozwolone tylko GET i POST.' }, 405)
}
