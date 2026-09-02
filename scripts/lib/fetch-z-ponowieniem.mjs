// Pobranie adresu z ponowieniami — do kontroli produkcji z GitHub Actions.
//
// Powod: health-check z runnera GitHuba padal co tydzien od 27.07.2026 na ~10 LOSOWYCH
// adresach ze 171 z golym `fetch failed`, a ten sam skrypt odpalony lokalnie przechodzil
// wszystkie. To czknięcia sieci runnera, nie serwisu — a bez ponowien i timeoutu kazde
// takie czknięcie robilo czerwony przebieg i alarm byl czystym szumem.
//
// Zasady:
//   - blad sieci (fetch rzuca) oraz 5xx/429 sa ponawiane z rosnacym odstepem,
//   - kazdy inny status (200, 301, 404...) wraca od razu — to odpowiedz serwisu, nie sieci,
//   - po wyczerpaniu prob: blad sieci rzuca (z kodem przyczyny, bo samo `fetch failed`
//     nic nie mowi), a 5xx zwraca ostatni status — o obu decyduje wolajacy,
//   - GET zamiast HEAD, bo to sprawdza, ze strona naprawde sie serwuje, a nie tylko
//     ze edge zna sciezke; tresc nie jest czytana (body.cancel), wiec nie ma kosztu transferu.
//
// `fetchImpl` i `uspij` sa wstrzykiwane wylacznie na potrzeby testow.

const PONAWIALNY_STATUS = status => status === 429 || status >= 500

export function opiszBlad (e) {
  const kod = e?.cause?.code
  return kod ? `${e.message} (${kod})` : e.message
}

export async function pobierzZPonowieniem (url, {
  proby = 3,
  timeoutMs = 15000,
  odstepMs = 1000,
  init = {},
  fetchImpl = fetch,
  uspij = ms => new Promise(r => setTimeout(r, ms))
} = {}) {
  let ostatniBlad = null
  let ostatniStatus = null

  for (let proba = 1; proba <= proby; proba++) {
    if (proba > 1) await uspij(odstepMs * 2 ** (proba - 2))   // 1s, 2s, 4s...

    let odp
    try {
      odp = await fetchImpl(url, {
        method: 'GET',
        redirect: 'manual',
        ...init,
        signal: AbortSignal.timeout(timeoutMs)
      })
    } catch (e) {
      ostatniBlad = e
      continue
    }

    await odp.body?.cancel?.().catch(() => {})
    ostatniStatus = odp.status
    ostatniBlad = null
    if (!PONAWIALNY_STATUS(odp.status)) return { status: odp.status, proba }
  }

  if (ostatniBlad) {
    throw new Error(`${opiszBlad(ostatniBlad)} po ${proby} probach`, { cause: ostatniBlad })
  }
  return { status: ostatniStatus, proba: proby }
}
