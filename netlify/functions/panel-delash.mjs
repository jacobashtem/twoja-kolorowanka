// Panel monitoringu indeksacji. Renderuje HTML po stronie serwera z danych w Netlify Blobs.
//
// Basic Auth siedzi w tej samej funkcji, celowo, a nie w Edge Function przed nia.
// Edge Functions nie da sie przypiac do `/.netlify/functions/*` — to obszar zastrzezony —
// wiec straznik postawiony tylko na `/panel-gsc` zostawialby otwarte drugie wejscie pod
// wlasnym adresem funkcji. Sprawdzenie w srodku zamyka oba naraz.
//
// Zmienne srodowiskowe: PANEL_USER, PANEL_PASS. Bez nich panel jest zamkniety dla
// wszystkich — brak konfiguracji nie moze oznaczac otwartych drzwi.
//
// Zamysl wizualny: panel jest kolorowanka. Kazdy adres z sitemapy to jedno pole, a stopien
// wypelnienia koduje, jak daleko adres zaszedl u Google — sam kontur (wykryty, nigdy
// nieodwiedzony), polowa (zeskanowany, niezaindeksowany), pelny kolor (w indeksie).
// Cel, czyli komplet sitemapy w indeksie, wyglada wtedy jak domalowany do konca obrazek.

import { getStore } from '@netlify/blobs'
import { sprawdzDostep, szkielet, komunikat, esc, data, NAGLOWKI_HTML } from '../wspolne/panel.mjs'

// Adres deklarowany przez sama funkcje, a nie przepisaniem w netlify.toml. Przepisanie
// `/panel-gsc` -> `/.netlify/functions/panel-gsc` bylo ignorowane i zadanie spadalo na
// regule `/*` -> 404, mimo ze inne reguly z tego pliku dzialaja. Funkcje v2 maja na to
// wlasny mechanizm i on jest wiazacy.
//
// `/panel-delash/indeks` to adres docelowy — panel ma z czasem miec wiecej zakladek niz
// jedna (warsztat do fraz z DataForSEO). `/panel-delash` prowadzi na razie tutaj, bo przy
// jednej zakladce rozdzielacz nie mialby czego rozdzielac. `/panel-gsc` zostaje, zeby nie
// zepsuc zakladki w przegladarce — kosztuje jedna linijke.
export const config = { path: ['/panel-delash', '/panel-delash/indeks', '/panel-gsc'] }

// Dostep, style i szkielet strony z zakladkami mieszkaja w `netlify/wspolne/panel.mjs` —
// wspolne z zakladka fraz. Trzymanie tego osobno w kazdej funkcji skonczyloby sie tym, ze
// przy pierwszej zmianie stylu zakladki zaczelyby wygladac inaczej.

// ------------------------------------------------------------------ dane

/** Stan adresu niezalezny od jezyka odpowiedzi API — po samych faktach, nie po opisie. */
function stan (w) {
  if (w.blad) return 'blad'
  if (w.verdict === 'PASS') return 'indeks'
  if (w.lastCrawlTime) return 'zeskanowany'
  return 'wykryty'
}

const rozjazdCanonical = w =>
  Boolean(w.googleCanonical && w.userCanonical && w.googleCanonical !== w.userCanonical)

const OPIS_STANU = {
  indeks: 'w indeksie',
  zeskanowany: 'zeskanowany, ale niezaindeksowany',
  wykryty: 'wykryty, nigdy nieodwiedzony',
  blad: 'blad odczytu'
}

/** Roznice miedzy dwoma zrzutami — osobno straty i osobno zdobycze. */
function zmiany (teraz, wczesniej) {
  if (!wczesniej) return null
  const stary = new Map(wczesniej.wyniki.map(w => [w.adres, w]))
  const stracone = []
  const zyskane = []
  for (const w of teraz.wyniki) {
    const p = stary.get(w.adres)
    if (!p) continue
    const bylo = stan(p)
    const jest = stan(w)
    if (bylo === 'indeks' && jest !== 'indeks') stracone.push({ w, bylo, jest })
    if (bylo !== 'indeks' && jest === 'indeks') zyskane.push({ w, bylo, jest })
  }
  return { stracone, zyskane, data: wczesniej.pobrano }
}

const sciezka = adres => {
  try { return new URL(adres).pathname } catch { return adres }
}

// ------------------------------------------------------------------ widok

function stronaHtml (zrzut, roznice) {
  const wyniki = zrzut.wyniki
  const wIndeksie = wyniki.filter(w => stan(w) === 'indeks').length
  const razem = wyniki.length
  const komplet = wIndeksie === razem

  const doZrobienia = wyniki
    .filter(w => stan(w) !== 'indeks' || rozjazdCanonical(w))
    // Najpierw to, czego Google nigdy nie odwiedzil — tam reczne zgloszenie realnie pomaga.
    .sort((a, b) => {
      const waga = { wykryty: 0, blad: 1, zeskanowany: 2, indeks: 3 }
      return waga[stan(a)] - waga[stan(b)]
    })

  const komorki = wyniki.map((w, i) => {
    const s = stan(w)
    const rozjazd = rozjazdCanonical(w)
    const opis = `${sciezka(w.adres)} — ${OPIS_STANU[s]}${rozjazd ? ', rozjazd canonical' : ''}`
    const tresc = `<span class="pole pole--${s}${rozjazd ? ' pole--rozjazd' : ''}" style="--i:${i}"></span>`
    return w.linkDoInspekcji
      ? `<a class="komorka" href="${esc(w.linkDoInspekcji)}" target="_blank" rel="noopener" title="${esc(opis)}" aria-label="${esc(opis)}">${tresc}</a>`
      : `<span class="komorka" title="${esc(opis)}" aria-label="${esc(opis)}">${tresc}</span>`
  }).join('')

  const wiersz = w => {
    const s = stan(w)
    const rozjazd = rozjazdCanonical(w)
    return `<li class="wiersz">
      <span class="pole pole--${s}${rozjazd ? ' pole--rozjazd' : ''} pole--duze"></span>
      <span class="wiersz__tresc">
        <span class="wiersz__adres">${esc(sciezka(w.adres))}</span>
        <span class="wiersz__stan">${esc(w.coverageState || OPIS_STANU[s])}${
          w.lastCrawlTime ? ` · ostatnia wizyta Google ${esc(data(w.lastCrawlTime))}` : ''
        }</span>
        ${rozjazd ? `<span class="wiersz__ostrzezenie">Google wybral inny adres kanoniczny: ${esc(sciezka(w.googleCanonical))}</span>` : ''}
        ${w.blad ? `<span class="wiersz__ostrzezenie">${esc(w.blad)}</span>` : ''}
      </span>
      ${w.linkDoInspekcji
        ? `<a class="zglos" href="${esc(w.linkDoInspekcji)}" target="_blank" rel="noopener">Otworz w Search Console</a>`
        : ''}
    </li>`
  }

  const sekcjaZmian = () => {
    if (!roznice) return ''
    const { stracone, zyskane } = roznice
    if (!stracone.length && !zyskane.length) {
      return `<section class="sekcja">
        <h2 class="naglowek">Od poprzedniego sprawdzenia</h2>
        <p class="spokoj">Bez zmian od ${esc(data(roznice.data))}.</p>
      </section>`
    }
    return `<section class="sekcja">
      <h2 class="naglowek">Od poprzedniego sprawdzenia <span class="naglowek__meta">${esc(data(roznice.data))}</span></h2>
      ${stracone.length ? `<p class="zmiana zmiana--strata"><strong>${stracone.length}</strong> ${stracone.length === 1 ? 'strona wypadla' : 'strony wypadly'} z indeksu</p>
        <ul class="lista">${stracone.map(z => wiersz(z.w)).join('')}</ul>` : ''}
      ${zyskane.length ? `<p class="zmiana zmiana--zysk"><strong>${zyskane.length}</strong> ${zyskane.length === 1 ? 'strona weszla' : 'strony weszly'} do indeksu</p>
        <ul class="lista lista--zwiezla">${zyskane.map(z => `<li class="wiersz wiersz--zwiezly"><span class="pole pole--indeks"></span><span class="wiersz__adres">${esc(sciezka(z.w.adres))}</span></li>`).join('')}</ul>` : ''}
    </section>`
  }

  return szkielet({
    tytul: 'Stan indeksu — twoja-kolorowanka.pl',
    aktywna: 'indeks',
    tresc: `

  <p class="brew">Stan indeksu<span class="brew__kropka">/</span>${esc(zrzut.site.replace('sc-domain:', ''))}<span class="brew__kropka">/</span>sprawdzono ${esc(data(zrzut.pobrano))}</p>

  <p class="wynik">
    <span class="wynik__licznik">${wIndeksie}</span>
    <span class="wynik__kreska">/</span>
    <span class="wynik__mianownik">${razem}</span>
  </p>
  <p class="zdanie${komplet ? ' zdanie--komplet' : ''}">${
    komplet
      ? 'Wszystko, co jest w sitemapie, jest w indeksie Google.'
      : `Adresow z sitemapy w indeksie Google. Pozostale ${razem - wIndeksie} czekaja ponizej.`
  }</p>

  <div class="plansza" role="img" aria-label="Kazde pole to jeden adres z sitemapy. Wypelnione pole oznacza strone w indeksie.">${komorki}</div>

  <ul class="legenda">
    <li><span class="pole pole--indeks"></span>w indeksie</li>
    <li><span class="pole pole--zeskanowany"></span>zeskanowany, niezaindeksowany</li>
    <li><span class="pole pole--wykryty"></span>wykryty, nigdy nieodwiedzony</li>
    <li><span class="pole pole--wykryty pole--rozjazd"></span>rozjazd canonical</li>
  </ul>

  ${doZrobienia.length ? `<section class="sekcja">
    <h2 class="naglowek">Do zrobienia <span class="naglowek__meta">${doZrobienia.length} ${doZrobienia.length === 1 ? 'adres' : 'adresow'}</span></h2>
    <ul class="lista">${doZrobienia.map(wiersz).join('')}</ul>
  </section>` : ''}

  ${sekcjaZmian()}

  <p class="stopka">
    Sprawdzane co tydzien w poniedzialek przez <code>gsc-index-check</code>.
    Zrodlo listy adresow: <code>${esc(zrzut.sitemap)}</code>.
    Zgloszenie do ponownej indeksacji klika sie recznie w Search Console — Google nie
    udostepnia na to API dla zwyklych stron.
  </p>

`
  })
}

// ------------------------------------------------------------------ handler

export default async (request) => {
  const odmowa = sprawdzDostep(request)
  if (odmowa) return odmowa

  try {
    const store = getStore('gsc')
    const zrzut = await store.get('ostatni', { type: 'json' })

    if (!zrzut) {
      return new Response(
        komunikat({
          tytul: 'Stan indeksu — panel',
          aktywna: 'indeks',
          naglowek: 'Nie ma jeszcze żadnego sprawdzenia',
          tresc: 'Monitoring nie zapisał dotąd ani jednego zrzutu. Uruchom workflow <code>gsc-index-check</code> w GitHub Actions — po jego zakończeniu ta strona pokaże wynik.'
        }),
        { status: 200, headers: NAGLOWKI_HTML }
      )
    }

    // Przedostatni wpis historii daje porownanie „od poprzedniego sprawdzenia".
    let poprzedni = null
    try {
      const { blobs } = await store.list({ prefix: 'historia/' })
      const klucze = blobs.map(b => b.key).sort().reverse()
      const dzisiejszy = `historia/${(zrzut.pobrano || '').slice(0, 10)}`
      const wczesniejszy = klucze.find(k => k !== dzisiejszy)
      if (wczesniejszy) poprzedni = await store.get(wczesniejszy, { type: 'json' })
    } catch (e) {
      console.error('Nie udalo sie odczytac historii:', e)
    }

    return new Response(stronaHtml(zrzut, zmiany(zrzut, poprzedni)), { status: 200, headers: NAGLOWKI_HTML })
  } catch (e) {
    console.error('Panel:', e)
    return new Response(
      komunikat({
        tytul: 'Stan indeksu — panel',
        aktywna: 'indeks',
        naglowek: 'Panel nie odczytał danych',
        tresc: 'Szczegóły są w logach funkcji w panelu Netlify.'
      }),
      { status: 500, headers: NAGLOWKI_HTML }
    )
  }
}
