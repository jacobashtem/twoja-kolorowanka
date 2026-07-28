// Buduje lokalną stronę HTML do przeglądu wygenerowanych kolorowanek.
//
// Po co, skoro jest Eksplorator Windows: Eksplorator NIE renderuje miniatur SVG —
// pokazuje generyczne ikony, więc w dużych kafelkach nic nie zobaczysz. Przeglądarka
// renderuje SVG natywnie, w dowolnej skali i bez instalowania czegokolwiek.
//
// Klikasz kafelek, żeby oznaczyć odrzut. Zaznaczenia zapisują się w przeglądarce,
// więc przeżyją odświeżenie. Na górze masz gotową listę odrzutów do skopiowania.
//
// Użycie:
//   node scripts/galeria.mjs lineart-work/jaszczurki/raw-v3-krotki
//   node scripts/galeria.mjs lineart-work/jaszczurki/raw-v3-krotki --kolumny=4
//
// Potem otwórz wypisany plik galeria.html w przeglądarce.
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { join, extname, relative, basename } from 'node:path'
import { svgScore, difficulty } from './lib/trudnosc.mjs'

const argv    = process.argv.slice(2)
const katalog = argv.find(a => !a.startsWith('--'))
const KOLUMNY = Number((argv.find(a => a.startsWith('--kolumny=')) ?? '').split('=')[1]) || 5

// --filtr=fragment zostawia tylko pliki, których ścieżka zawiera podany fragment.
// Po to, żeby jedna galeria mogła zestawić kilka serii z tego samego katalogu kategorii:
// wskazujesz `lineart-work/koniki` i filtrem `out-` odsiewasz surowe rastry, zostawiając
// same wyniki. Bez tego trzeba było robić osobną stronę na każdą serię i przeklikiwać się
// między nimi, co przy porównywaniu stylów nie ma sensu.
// Po przecinku można podać kilka fragmentów naraz — plik wchodzi, jeśli pasuje do
// któregokolwiek. Potrzebne, bo porównanie idzie zwykle po katalogach o różnych nazwach
// (wyniki wektoryzacji obok serii, które przyszły z API od razu jako SVG).
const FILTR = ((argv.find(a => a.startsWith('--filtr=')) ?? '').split('=')[1] || '')
  .split(',').map(f => f.trim()).filter(Boolean)

// --wybor odwraca sens klikania: zaznaczasz to, co ZOSTAJE, a nie to, co odpada.
// Przy przeglądaniu jednej serii naturalne jest odrzucanie wpadek, ale przy zestawieniu
// kilkunastu stylów obok siebie odrzuca się prawie wszystko — wtedy szybciej i bezpieczniej
// jest wskazać garść zwycięzców. Lista z tego trybu idzie prosto do wektoryzacji.
const WYBOR = argv.includes('--wybor')

// --sort=trudnosc układa kafelki od najprostszych do najbardziej złożonych, zamiast
// grupować po serii. Pomysł Jakuba: przewijając galerię w dół widzisz rysunki narastająco
// trudniejsze, więc od razu czujesz, gdzie kończy się materiał dla malucha, a zaczyna
// dla starszego dziecka. Skala jest ta sama, która nadaje tagi `trudnosc-N` na stronie.
const SORT = (argv.find(a => a.startsWith('--sort=')) ?? '').split('=')[1] || 'seria'
const S = WYBOR
  ? { tytul: 'Wybór', akcja: 'Kopiuj listę wybranych', podpowiedz: 'Kliknij kafelek, żeby go WYBRAĆ do wektoryzacji.', licznik: 'wybranych' }
  : { tytul: 'Remanent', akcja: 'Kopiuj listę odrzutów', podpowiedz: 'Kliknij kafelek, żeby oznaczyć go jako odrzut.', licznik: 'odrzuconych' }

if (!katalog) {
  console.error('Podaj katalog, np. lineart-work/jaszczurki/raw-v3-krotki')
  process.exit(2)
}

const EXTS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp'])

// Raport walidatora leżący obok obrazków (`_walidacja.json`). Czytany raz na katalog
// i zapamiętywany, bo przy kilkunastu seriach ten sam plik byłby otwierany dziesiątki razy.
const cacheWalidacji = new Map()
function walidacja (dir) {
  if (!cacheWalidacji.has(dir)) {
    try { cacheWalidacji.set(dir, JSON.parse(readFileSync(join(dir, '_walidacja.json'), 'utf8'))) }
    catch { cacheWalidacji.set(dir, {}) }
  }
  return cacheWalidacji.get(dir)
}

// Zbieramy pliki wraz z informacją, w którym podkatalogu leżą — po segregacji
// walidatorem ok/ i odrzut/ same w sobie niosą werdykt, więc nie trzeba nic doczytywać.
const pliki = []
;(function walk (dir) {
  for (const nazwa of readdirSync(dir)) {
    if (nazwa.startsWith('_')) continue
    const p = join(dir, nazwa)
    if (statSync(p).isDirectory()) walk(p)
    else if (EXTS.has(extname(nazwa).toLowerCase()) && !/-thumb\.|-view\./.test(nazwa)) {
      const podkatalog = basename(dir)
      const wzgledna = relative(katalog, p).replace(/\\/g, '/')
      if (FILTR.length && !FILTR.some(f => wzgledna.includes(f))) continue
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

if (!pliki.length) { console.error(`Brak obrazków w ${katalog}`); process.exit(2) }

// Grupujemy po katalogu źródłowym, żeby generacje nie mieszały się na siatce.
if (SORT === 'trudnosc') {
  // Bez trudności (rastry) na koniec — inaczej wpadałyby w środek skali jako zera
  // i psuły odczyt narastania złożoności.
  pliki.sort((a, b) =>
    (a.trudnosc ?? 99) - (b.trudnosc ?? 99) ||
    a.zrodlo.localeCompare(b.zrodlo) ||
    a.nazwa.localeCompare(b.nazwa, 'pl', { numeric: true }))
} else {
  pliki.sort((a, b) => a.zrodlo.localeCompare(b.zrodlo) ||
                       a.nazwa.localeCompare(b.nazwa, 'pl', { numeric: true }))
}

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

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
  #licznik { font-variant-numeric:tabular-nums }
  .siatka { display:grid; grid-template-columns:repeat(${KOLUMNY},1fr); gap:14px; padding:16px }
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
  <h1>${S.tytul}: ${basename(katalog)}</h1>
  <span id="licznik"></span>
  <button id="czysc">Wyczyść zaznaczenia</button>
  <button id="kopiuj">${S.akcja}</button>
</header>
<div class="panel"><textarea id="lista" readonly placeholder="${S.podpowiedz}"></textarea></div>
<div class="siatka">${kafelki}</div>
<div id="lupaTlo"><img alt=""></div>
<script>
  // Klucz zależy od trybu, żeby wybory nie mieszały się z odrzutami tej samej serii.
  const KLUCZ = '${WYBOR ? 'wybor' : 'remanent'}:${basename(katalog)}';
  const WYBOR = ${WYBOR};
  const skreslone = new Set(JSON.parse(localStorage.getItem(KLUCZ) || '[]'));
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
  for (const k of kafle) {
    const przelacz = () => { const p = k.dataset.plik; skreslone.has(p) ? skreslone.delete(p) : skreslone.add(p); odswiez(); };
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
  document.getElementById('czysc').onclick = () => { skreslone.clear(); odswiez(); };
  document.getElementById('kopiuj').onclick = () => {
    navigator.clipboard.writeText([...skreslone].sort().join('\\n'));
  };
  odswiez();
</script>
</body></html>`

const wyjscie = join(katalog, 'galeria.html')
writeFileSync(wyjscie, html, 'utf8')

const ok = pliki.filter(p => p.werdykt === 'ok').length
const odrzut = pliki.filter(p => p.werdykt === 'odrzut').length
console.log(`Galeria: ${wyjscie}`)
console.log(`Obrazków: ${pliki.length}${ok || odrzut ? `  (ok: ${ok}, odrzut: ${odrzut})` : ''}`)
console.log(WYBOR
  ? `Otwórz w przeglądarce, klikaj kafelki, które ZOSTAJĄ, i skopiuj listę wybranych.`
  : `Otwórz plik w przeglądarce i klikaj kafelki, żeby oznaczać odrzuty.`)
