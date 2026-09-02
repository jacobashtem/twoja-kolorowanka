// Uruchom: node --test scripts/lib/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pobierzZPonowieniem, opiszBlad } from './fetch-z-ponowieniem.mjs'

/** Atrapa fetch: kolejne wywolania zwracaja kolejne elementy `scenariusz`
 *  (liczba = status HTTP, Error = rzucony blad sieci). */
function atrapaFetch (scenariusz) {
  const wywolania = []
  const fetchImpl = async (url, init) => {
    wywolania.push({ url, init })
    const krok = scenariusz.shift()
    if (krok instanceof Error) throw krok
    return { status: krok, body: { cancel: async () => {} } }
  }
  return { fetchImpl, wywolania }
}

const bezCzekania = () => {
  const odstepy = []
  return { uspij: async ms => { odstepy.push(ms) }, odstepy }
}

test('200 za pierwszym razem: jedno zapytanie, bez czekania', async () => {
  const { fetchImpl, wywolania } = atrapaFetch([200])
  const { uspij, odstepy } = bezCzekania()
  const wynik = await pobierzZPonowieniem('https://x/a', { fetchImpl, uspij })
  assert.equal(wynik.status, 200)
  assert.equal(wynik.proba, 1)
  assert.equal(wywolania.length, 1)
  assert.deepEqual(odstepy, [])
})

test('blad sieci dwa razy, potem 200: trzy zapytania z rosnacym odstepem', async () => {
  const blad = new TypeError('fetch failed')
  const { fetchImpl, wywolania } = atrapaFetch([blad, blad, 200])
  const { uspij, odstepy } = bezCzekania()
  const wynik = await pobierzZPonowieniem('https://x/a', { fetchImpl, uspij, proby: 3, odstepMs: 1000 })
  assert.equal(wynik.status, 200)
  assert.equal(wynik.proba, 3)
  assert.equal(wywolania.length, 3)
  assert.deepEqual(odstepy, [1000, 2000])
})

test('blad sieci za kazdym razem: rzuca po wyczerpaniu prob, z kodem przyczyny', async () => {
  const blad = new TypeError('fetch failed', { cause: { code: 'ECONNRESET' } })
  const { fetchImpl, wywolania } = atrapaFetch([blad, blad, blad])
  const { uspij } = bezCzekania()
  await assert.rejects(
    () => pobierzZPonowieniem('https://x/a', { fetchImpl, uspij, proby: 3 }),
    e => e.message.includes('fetch failed') && e.message.includes('ECONNRESET') && e.message.includes('3')
  )
  assert.equal(wywolania.length, 3)
})

test('503 potem 200: 5xx jest ponawiane', async () => {
  const { fetchImpl, wywolania } = atrapaFetch([503, 200])
  const { uspij } = bezCzekania()
  const wynik = await pobierzZPonowieniem('https://x/a', { fetchImpl, uspij })
  assert.equal(wynik.status, 200)
  assert.equal(wywolania.length, 2)
})

test('404 wraca od razu, bez ponowien', async () => {
  const { fetchImpl, wywolania } = atrapaFetch([404, 200])
  const { uspij } = bezCzekania()
  const wynik = await pobierzZPonowieniem('https://x/a', { fetchImpl, uspij })
  assert.equal(wynik.status, 404)
  assert.equal(wywolania.length, 1)
})

test('5xx do konca: zwraca ostatni status zamiast rzucac', async () => {
  const { fetchImpl, wywolania } = atrapaFetch([502, 502, 502])
  const { uspij } = bezCzekania()
  const wynik = await pobierzZPonowieniem('https://x/a', { fetchImpl, uspij, proby: 3 })
  assert.equal(wynik.status, 502)
  assert.equal(wynik.proba, 3)
  assert.equal(wywolania.length, 3)
})

test('zapytanie idzie jako GET z sygnalem timeoutu', async () => {
  const { fetchImpl, wywolania } = atrapaFetch([200])
  const { uspij } = bezCzekania()
  await pobierzZPonowieniem('https://x/a', { fetchImpl, uspij, timeoutMs: 5000 })
  assert.equal(wywolania[0].init.method, 'GET')
  assert.ok(wywolania[0].init.signal instanceof AbortSignal)
})

test('opiszBlad: komunikat plus kod przyczyny, gdy jest', () => {
  assert.equal(opiszBlad(new Error('fetch failed', { cause: { code: 'ETIMEDOUT' } })), 'fetch failed (ETIMEDOUT)')
  assert.equal(opiszBlad(new Error('fetch failed')), 'fetch failed')
})
