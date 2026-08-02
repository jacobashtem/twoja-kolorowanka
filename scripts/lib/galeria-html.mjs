// Budowanie strony galerii: zebranie plików z katalogu roboczego i złożenie HTML-a.
//
// Wydzielone z `galeria.mjs`, bo tę samą stronę podaje teraz `panel-selekcji.mjs` —
// panel serwuje kilkanaście kategorii pod jednym adresem i musi umieć zbudować galerię
// dla każdej z nich. Dwie kopie tego HTML-a rozjechałyby się przy pierwszej poprawce.
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, extname, relative, basename } from 'node:path'
import { svgScore, difficulty } from './trudnosc.mjs'

const EXTS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp'])

// Nazwa pliku jest ZWIĄZANA Z TRYBEM, nie dowolna: `_wybor.txt` to dokładnie ta nazwa,
// którą przyjmują `recraft-wektoryzuj.mjs --lista=` i `podmien-kategorie.mjs --lista=`.
// Podkreślnik na początku ma drugie zadanie — walk() pomija pliki na `_`, więc zapisany
// wybór nigdy nie wejdzie do galerii jako własny kafelek.
export const plikWyboruDla = (wybor) => (wybor ? '_wybor.txt' : '_odrzut.txt')

export function wczytajWybor (katalog, wybor = true) {
  const sciezka = join(katalog, plikWyboruDla(wybor))
  return {
    sciezka,
    wpisy: existsSync(sciezka)
      ? readFileSync(sciezka, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      : []
  }
}

// Raport walidatora leżący obok obrazków (`_walidacja.json`). Czytany raz na katalog
// i zapamiętywany, bo przy kilkunastu seriach ten sam plik byłby otwierany dziesiątki razy.
function czytnikWalidacji () {
  const cache = new Map()
  return (dir) => {
    if (!cache.has(dir)) {
      try { cache.set(dir, JSON.parse(readFileSync(join(dir, '_walidacja.json'), 'utf8'))) }
      catch { cache.set(dir, {}) }
    }
    return cache.get(dir)
  }
}

// Zbieramy pliki wraz z informacją, w którym podkatalogu leżą — po segregacji
// walidatorem ok/ i odrzut/ same w sobie niosą werdykt, więc nie trzeba nic doczytywać.
export function zbierzPliki (katalog, { filtr = [], sort = 'seria' } = {}) {
  const walidacja = czytnikWalidacji()
  const pliki = []
  ;(function walk (dir) {
    for (const nazwa of readdirSync(dir)) {
      if (nazwa.startsWith('_')) continue
      const p = join(dir, nazwa)
      if (statSync(p).isDirectory()) walk(p)
      else if (EXTS.has(extname(nazwa).toLowerCase()) && !/-thumb\.|-view\./.test(nazwa)) {
        const podkatalog = basename(dir)
        const wzgledna = relative(katalog, p).replace(/\\/g, '/')
        if (filtr.length && !filtr.some(f => wzgledna.includes(f))) continue
        const raport = walidacja(dir)[nazwa]
        pliki.push({
          sciezka: wzgledna,
          nazwa,
          // Nazwy plików powtarzają się między generacjami (koty-001-s1.svg istnieje
          // w każdym przebiegu), więc w podpisie pokazujemy katalog — inaczej nie da się
          // odróżnić starej serii od nowej.
          zrodlo: wzgledna.split('/').slice(0, -1).join('/') || '.',
          werdykt: podkatalog === 'ok' ? 'ok' : podkatalog === 'odrzut' ? 'odrzut'
            : raport ? (raport.ok ? 'ok' : 'odrzut') : '',
          // Powód odrzutu prosto z walidatora — żeby dało się ocenić, czy słusznie.
          powody: raport?.fails ?? [],
          obszary: raport?.regions,
          // Trzy niezależne zastosowania. Obrazek nienadający się do flood filla nadal
          // może być świetną kolorowanką do druku, więc pokazujemy je osobno.
          profil: raport?.profile,
          // Trudność liczymy tylko dla SVG — raster nie ma ścieżek do policzenia.
          // Rastry lądują na końcu sortowania, bo i tak są etapem przejściowym.
          trudnosc: extname(nazwa).toLowerCase() === '.svg'
            ? (() => { try { return difficulty(svgScore(p)) } catch { return null } })()
            : null
        })
      }
    }
  })(katalog)

  if (sort === 'trudnosc') {
    // Bez trudności (rastry) na koniec — inaczej wpadałyby w środek skali jako zera
    // i psuły odczyt narastania złożoności.
    pliki.sort((a, b) =>
      (a.trudnosc ?? 99) - (b.trudnosc ?? 99) ||
      a.zrodlo.localeCompare(b.zrodlo) ||
      a.nazwa.localeCompare(b.nazwa, 'pl', { numeric: true }))
  } else {
    // Grupujemy po katalogu źródłowym, żeby generacje nie mieszały się na siatce.
    pliki.sort((a, b) => a.zrodlo.localeCompare(b.zrodlo) ||
                         a.nazwa.localeCompare(b.nazwa, 'pl', { numeric: true }))
  }
  return pliki
}

export const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// `zapisNaSerwerze` włącza przycisk i autozapis. Adres endpointu jest CELOWO względny
// (`_zapisz`, bez ukośnika z przodu) — dzięki temu ta sama strona działa i pod samodzielnym
// serwerem galerii (`/` → `/_zapisz`), i w panelu (`/k/kroliczki/` → `/k/kroliczki/_zapisz`),
// bez wstrzykiwania skądkolwiek adresu bazowego.
export function zbudujGalerie (katalog, {
  kolumny = 5, filtr = [], sort = 'seria', wybor = false,
  zapisNaSerwerze = false, powrot = null
} = {}) {
  const pliki = zbierzPliki(katalog, { filtr, sort })
  const plikWyboru = plikWyboruDla(wybor)
  const { sciezka: sciezkaWyboru, wpisy: wyborZDysku } = wczytajWybor(katalog, wybor)

  const S = wybor
    ? { tytul: 'Wybór', akcja: 'Kopiuj listę wybranych', podpowiedz: 'Kliknij kafelek, żeby go WYBRAĆ do wektoryzacji.' }
    : { tytul: 'Remanent', akcja: 'Kopiuj listę odrzutów', podpowiedz: 'Kliknij kafelek, żeby oznaczyć go jako odrzut.' }

  const kafelki = pliki.map((p, i) => `
  <figure class="kafel ${p.werdykt}" data-plik="${p.sciezka}" tabindex="0">
    <button class="lupa" data-src="${p.sciezka}" title="Powiększ">&#128269;</button>
    <img src="${p.sciezka}" alt="${esc(p.nazwa)}" loading="lazy">
    <figcaption><b>${i + 1}</b> ${esc(p.nazwa)}
      <br><span class="zrodlo">${esc(p.zrodlo)}</span>
      ${p.trudnosc ? `<span class="trud" title="trudnosc-${p.trudnosc} — ta sama skala co tagi na stronie">T${p.trudnosc}</span>` : ''}
      ${p.profil ? `<br><span class="profile">${
        ['druk', 'online', 'maluchy'].map(k =>
          `<span class="p ${p.profil[k] ? 'tak' : 'nie'}">${k}</span>`).join('')
      }</span>` : ''}
      ${p.powody.length ? `<br><span class="powod">${esc(p.powody.join(' · '))}</span>` : ''}
    </figcaption>
  </figure>`).join('')

  const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${S.tytul} — ${basename(katalog)} (${pliki.length})</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font:15px/1.4 system-ui,sans-serif; background:#f5f5f4; color:#1c1917; }
  @media (prefers-color-scheme: dark){ body{ background:#1c1917; color:#e7e5e4 } }
  header { position:sticky; top:0; z-index:5; padding:12px 16px; background:#10B981; color:#fff;
           display:flex; gap:16px; align-items:center; flex-wrap:wrap; box-shadow:0 2px 8px rgba(0,0,0,.2) }
  header h1 { font-size:16px; margin:0; font-weight:600 }
  header button { font:inherit; padding:6px 12px; border:0; border-radius:6px; cursor:pointer;
                  background:rgba(255,255,255,.2); color:#fff }
  header button:hover { background:rgba(255,255,255,.32) }
  header a.powrot { color:#fff; text-decoration:none; padding:6px 12px; border-radius:6px;
                    background:rgba(0,0,0,.18); font-size:14px }
  header a.powrot:hover { background:rgba(0,0,0,.3) }
  #licznik { font-variant-numeric:tabular-nums }
  #stanZapisu { font-size:13px; opacity:.7; margin-left:-8px }
  .siatka { display:grid; grid-template-columns:repeat(${kolumny},1fr); gap:14px; padding:16px }
  .kafel { margin:0; background:#fff; border-radius:10px; overflow:hidden; cursor:pointer;
           border:3px solid transparent; transition:border-color .12s, transform .12s }
  .kafel:hover { transform:translateY(-2px) }
  .kafel img { width:100%; aspect-ratio:10/14; object-fit:contain; display:block; background:#fff }
  .kafel { position:relative }
  .kafel figcaption { padding:6px 8px; font-size:12px; color:#57534e; background:#fafaf9;
                      white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
  .zrodlo { font-size:11px; color:#a8a29e }
  /* Powód odrzutu z walidatora. Celowo nie ucinamy go wielokropkiem — to jest informacja,
     dla której ten kafelek w ogóle warto obejrzeć. */
  .powod { font-size:11px; color:#b45309; white-space:normal; display:block; line-height:1.25 }
  .lupa { position:absolute; top:6px; right:6px; z-index:2; width:30px; height:30px; padding:0;
          border:0; border-radius:8px; cursor:zoom-in; font-size:14px; line-height:30px;
          background:rgba(255,255,255,.85); box-shadow:0 1px 4px rgba(0,0,0,.25) }
  .lupa:hover { background:#fff }
  #lupaTlo { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,.85); display:none;
             align-items:center; justify-content:center; cursor:zoom-out; padding:24px }
  #lupaTlo.otwarte { display:flex }
  #lupaTlo img { max-width:100%; max-height:100%; background:#fff; border-radius:8px }
  /* ZASADA KOLORU: zieleń znaczy WYŁĄCZNIE "wybrane przeze mnie".
     Wcześniej werdykt walidatora też malował ramkę na zielono i oba stany były nie do
     odróżnienia — nie dało się poznać, co już kliknięte, a co tylko przeszło walidację.
     Werdykt zszedł więc do plakietek w barwach neutralnych, a ramka należy do wyboru. */
  .kafel.skreslony { border-color:#dc2626; opacity:.45 }
  .kafel.skreslony img { filter:grayscale(1) }
  .kafel.wybrany { border-color:#10B981; box-shadow:0 0 0 4px rgba(16,185,129,.3) }
  .kafel.wybrany figcaption { background:#ecfdf5 }
  /* Ptaszek, żeby stan był czytelny także przy przewijaniu i na wydruku ekranu,
     a nie zależał wyłącznie od odcienia ramki. */
  .kafel.wybrany::after { content:"✓"; position:absolute; top:6px; left:6px; z-index:2;
    width:30px; height:30px; border-radius:8px; background:#10B981; color:#fff;
    font-size:17px; line-height:30px; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,.3) }
  .tag { background:#e7e5e4; border-radius:4px; padding:1px 5px; font-size:11px }
  .tag.odrzut { background:#fde68a; color:#78350f }
  .tag.ok { background:#e0e7ff; color:#3730a3 }   /* nie zielony — zieleń należy do wyboru */
  /* Trzy niezależne zastosowania zamiast jednego werdyktu — obrazek bez flood filla
     nadal bywa świetny do druku, a to druk jest u nas podstawą. */
  .trud { background:#1c1917; color:#fafaf9; border-radius:4px; padding:1px 5px; font-size:10px;
          margin-left:4px; font-variant-numeric:tabular-nums }
  .profile { display:inline-flex; gap:4px; margin-top:3px }
  .profile .p { border-radius:4px; padding:1px 5px; font-size:10px; letter-spacing:.02em }
  .profile .p.tak { background:#e0e7ff; color:#3730a3 }
  .profile .p.nie { background:#e7e5e4; color:#a8a29e; text-decoration:line-through }
  textarea { width:100%; box-sizing:border-box; min-height:70px; font:12px/1.4 ui-monospace,monospace;
             padding:8px; border-radius:8px; border:1px solid #d6d3d1 }
  .panel { padding:0 16px 8px }
</style></head><body>
<header>
  ${powrot ? `<a class="powrot" href="${powrot.url}">← ${esc(powrot.etykieta)}</a>` : ''}
  <h1>${S.tytul}: ${basename(katalog)}</h1>
  <span id="licznik"></span>
  <button id="czysc">Wyczyść zaznaczenia</button>
  <button id="kopiuj">${S.akcja}</button>
  ${zapisNaSerwerze ? `<button id="zapisz">Zapisz do ${plikWyboru}</button><span id="stanZapisu"></span>` : ''}
</header>
<div class="panel"><textarea id="lista" readonly placeholder="${S.podpowiedz}"></textarea></div>
<div class="siatka">${kafelki}</div>
<div id="lupaTlo"><img alt=""></div>
<script>
  // Klucz zależy od trybu, żeby wybory nie mieszały się z odrzutami tej samej serii.
  const KLUCZ = '${wybor ? 'wybor' : 'remanent'}:${basename(katalog)}';
  const WYBOR = ${wybor};
  const SERWER = ${zapisNaSerwerze};
  const Z_DYSKU = ${JSON.stringify(wyborZDysku)};
  const skreslone = new Set(JSON.parse(localStorage.getItem(KLUCZ) || 'null') ?? Z_DYSKU);
  const kafle = [...document.querySelectorAll('.kafel')];

  function odswiez () {
    for (const k of kafle) {
      const zazn = skreslone.has(k.dataset.plik);
      k.classList.toggle('wybrany', WYBOR && zazn);
      k.classList.toggle('skreslony', !WYBOR && zazn);
    }
    document.getElementById('licznik').textContent = WYBOR
      ? kafle.length + ' szt. — wybranych: ' + skreslone.size
      : kafle.length + ' szt. — odrzuconych: ' + skreslone.size + ', zostaje: ' + (kafle.length - skreslone.size);
    document.getElementById('lista').value = [...skreslone].sort().join('\\n');
    localStorage.setItem(KLUCZ, JSON.stringify([...skreslone]));
  }

  // ── Zapis na dysk ─────────────────────────────────────────────────────────
  // Wołany WYŁĄCZNIE ze zdarzeń użytkownika, nigdy przy starcie strony. Gdyby zapisywał
  // się też na starcie, otwarcie galerii ze stanem z localStorage nadpisałoby plik, który
  // mógł być nowszy — a to jest właśnie ten plik, którego nie da się odtworzyć.
  let timerZapisu = null, ostatniStan = '';
  async function zapisz () {
    if (!SERWER) return;
    const tresc = [...skreslone].sort().join('\\n');
    if (tresc === ostatniStan) return;
    const stan = document.getElementById('stanZapisu');
    try {
      const r = await fetch('_zapisz', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: tresc });
      if (!r.ok) throw new Error(await r.text());
      ostatniStan = tresc;
      stan.textContent = '✓ zapisano ' + new Date().toLocaleTimeString('pl') + ' (' + skreslone.size + ' poz.)';
      stan.style.opacity = '.85';
    } catch (e) {
      stan.textContent = '✗ NIE ZAPISANO: ' + e.message;
      stan.style.opacity = '1';
    }
  }
  // Sekunda zwłoki: przy przeklikiwaniu galerii leci kilkanaście zaznaczeń na minutę,
  // a interesuje nas stan końcowy, nie każdy pojedynczy klik.
  function poZmianie () {
    odswiez();
    if (!SERWER) return;
    clearTimeout(timerZapisu);
    document.getElementById('stanZapisu').textContent = '… zapisywanie';
    timerZapisu = setTimeout(zapisz, 1000);
  }

  for (const k of kafle) {
    const przelacz = () => { const p = k.dataset.plik; skreslone.has(p) ? skreslone.delete(p) : skreslone.add(p); poZmianie(); };
    k.addEventListener('click', przelacz);
    k.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); przelacz(); } });
  }

  // Podgląd na pełnym ekranie. Lupa jest osobnym przyciskiem, a nie podwójnym kliknięciem,
  // bo klik na kafelku już oznacza wybór — powiększanie nie może go przypadkiem przełączać.
  const tlo = document.getElementById('lupaTlo');
  const duzy = tlo.querySelector('img');
  for (const b of document.querySelectorAll('.lupa')) {
    b.addEventListener('click', e => {
      e.stopPropagation();
      duzy.src = b.dataset.src;
      tlo.classList.add('otwarte');
    });
  }
  const zamknij = () => { tlo.classList.remove('otwarte'); duzy.removeAttribute('src'); };
  tlo.addEventListener('click', zamknij);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') zamknij(); });
  document.getElementById('czysc').onclick = () => { skreslone.clear(); poZmianie(); };
  document.getElementById('kopiuj').onclick = () => {
    navigator.clipboard.writeText([...skreslone].sort().join('\\n'));
  };
  if (SERWER) {
    document.getElementById('zapisz').onclick = () => { clearTimeout(timerZapisu); ostatniStan = ''; zapisz(); };
    // Zamknięcie karty w trakcie sekundy zwłoki nie może zjeść ostatniego kliknięcia.
    addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') zapisz(); });
  }
  odswiez();
</script>
</body></html>`

  return { html, pliki, plikWyboru, sciezkaWyboru, wyborZDysku }
}

// Zapis listy wyboru przysłanej przez stronę. Wspólny dla galerii i panelu, żeby format
// pliku (jedna ścieżka na linię, bez pustych) był definiowany w jednym miejscu.
export function zapiszWybor (sciezka, body) {
  const wpisy = body.split('\n').map(s => s.trim()).filter(Boolean)
  writeFileSync(sciezka, wpisy.length ? wpisy.join('\n') + '\n' : '', 'utf8')
  return wpisy.length
}
