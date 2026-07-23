# Roadmapa rozwoju twoja-kolorowanka.pl

> Utworzona 2026-07-23 na bazie audytu technicznego i biznesowego.
> Wykonawca: Claude (krok po kroku, etapami). Decyzje strategiczne: Jakub.

## Stan wyjściowy (audyt 2026-07-23)

- ~23k ruchu organicznego/mies. wg SEMrush (szacunek wizyt), realne liczby do zmierzenia w Etapie 0.
- 79 landingów kategorii/podkategorii (jednostka SEO), 4116 podstron kolorowanek (leaf), 4173 SVG + 4168 PDF w `public/` (~1,2 GB).
- Hosting: Netlify (transfer na wykupionym wyższym pakiecie — koszt do zbicia).
- GSC podpięte, GTM (GTM-PMTV7XJ8) za zgodą Klaro. Brak reklam, brak przychodów.

## Decyzje strategiczne (ustalone — nie podważać w kolejnych sesjach)

1. **Leafy poza sitemapą, canonical → kategoria.** Budżet crawlowania idzie w 79 landingów, nie w 4116 cienkich podstron. Linki do wariantów mogą być nofollow / niewidoczne dla Google — to celowe.
2. **Żadnych cudzych brandów w contencie.** Kolorowanki są własne/generyczne; nazwy i opisy sugerujące brandy (Barbie, Psi Patrol itd.) do wyczyszczenia (Etap 1).
3. **Wysokiej jakości SVG zostają** — są potrzebne do trybu kolorowania online. Optymalizacja = osobne małe pliki do podglądów, nie degradacja źródeł.

---

## NAJBLIŻSZE KROKI — kolejka do zrobienia (stan po quick winach 2026-07-23)

Wykonawcze (Claude):
- [ ] Commit + PR quick winów: branch `feature/quick-wins-seo-thumbs` — w trakcie.
- [x] Stopka (`AppFooter.vue`): 15 linków do najważniejszych kategorii. (2026-07-23)
- [x] Twitter cards na kategoriach/leafach + blogu; `og:image`/`twitter:image` leafów wskazują teraz raster WebP zamiast SVG (crawlery social nie renderują SVG). (2026-07-23)
- [x] Odporność builda na awarię WordPressa: `routes-from-content.js` przy padzie WP przepisuje trasy bloga z poprzedniego `prerender-routes.json` (przetestowane symulacją), a nowy `scripts/check-build.mjs` (wpięty w `pnpm build`) wywala deploy przy pustym blogu/kategorii/leafie — koniec cichych pustych deployów mimo `failOnError:false`. (2026-07-23)
- [x] Cloudflare Web Analytics wpięte w `nuxt.config.ts` przez env `CF_ANALYTICS_TOKEN` (bez tokena w repo). **Do aktywacji przez Jakuba:** darmowe konto Cloudflare → Web Analytics → Add site → skopiować token → Netlify: Site settings → Environment variables → `CF_ANALYTICS_TOKEN` → redeploy. (2026-07-23)
- [ ] Po deployu: tydzień obserwacji transferu Netlify → jeśli spadł zgodnie z planem (80–95%), rozważyć powrót na tańszy pakiet.

Decyzje (Jakub):
- [ ] Kategorie aut z brandami (`pojazdy/bmw|bugattii|lamborghini`, 145 podstron): zostawić i obserwować vs przemianować z redirectami 301 (przed wnioskiem AdSense).
- [ ] Regulamin (`pages/regulamin.vue:369,389`): akceptacja przeredagowania wzmianek o Peppie/Elsie/Barbie na generyczny disclaimer.
- [ ] Cloudflare przed Netlify: darmowy proxy (cache statyków) vs migracja na Cloudflare Pages vs zostawić jak jest.

## Etap 0 — Pomiar (baseline przed monetyzacją)

Cel: znać PRAWDZIWE odsłony/sesje/UU (GA za zgodą niedoszacowuje; SEMrush to szacunek). Bez tego nie da się wybrać sieci reklamowej ani zmierzyć efektów.

- [ ] Wdrożyć cookieless analytics (rekomendacja: **Umami** self-host za darmo lub **Cloudflare Web Analytics** — jeden skrypt, zero kosztów). Bez cookies i danych osobowych → działa bez zgody, RODO-zgodne, mierzy 100% ruchu.
- [ ] Zebrać 2–4 tyg. danych: odsłony/mies., sesje/mies., UU, top strony, % mobile.
- [ ] Z GSC: kliknięcia/wyświetlenia per landing — które kategorie ciągną ruch (baza pod Etap 4 i 6).
- [ ] Przejrzeć billing Netlify: ile transferu zjadają SVG (spodziewane: większość).

## Etap 1 — Szybkie naprawy techniczne

- [x] `pages/index.vue` — scalony zdublowany `useHead` (żywy title + bogatszy description + JSON-LD + pełne OG/Twitter). (2026-07-23)
- [x] Canonicale leafów znormalizowane skryptem `scripts/fix-canonicals.mjs`: 617 plików naprawionych (248 zepsutych typu `/dom/dom/`, 276 bez ukośnika, 93 brakujące → wszystkie na `→ kategoria/`). Skrypt zostaje jako narzędzie health-check. (2026-07-23)
- [x] `pages/[...slug].vue` — `og:url` używa wyliczonego canonicala (wcześniej `undefined` przy braku pola), `og:image` przechodzi przez `fixImageUrl`. (2026-07-23)
- [x] Fallback OG bloga → istniejący `logo-1.webp` (pełny URL). (2026-07-23)
- [x] `AppFooter.vue` — mailto poprawione. (2026-07-23)
- [x] `pages/index.vue` — usunięte 8 martwych duplikatów kafla „Sowy" (pozycje 41–48, nigdy nie wyświetlane). (2026-07-23)
- [x] Czystka brandów w tekstach strony głównej: FAQ (Frozen/Peppa/Psi Patrol → fantasy generyczne), seoBlock (Frozen/Peppa/Pokemony/Spiderman → jednorożce/smoki/syrenki/rycerze), usunięta obietnica „bez reklam" (przed wdrożeniem AdSense). (2026-07-23)
- [ ] **Decyzja Jakuba — kategorie aut z brandami:** `pojazdy/bmw` (51 plików), `pojazdy/bugattii` (53), `pojazdy/lamborghini` (41) to całe podkategorie pod nazwami marek (URL-e + nazwy plików). Zmiana = nowe URL-e + redirecty 301 + rename assetów. Ryzyko AdSense niższe niż przy postaciach z bajek, ale realne. Opcje: (a) zostawić i obserwować, (b) przemianować z redirectami.
- [ ] **Decyzja Jakuba — regulamin** (`pages/regulamin.vue:369,389`): tekst prawny sugeruje, że serwis MA kolorowanki z Peppą/Elsą/Barbie („postacie przedstawione w kolorowankach"). Skoro ich nie ma — przeredagować na generyczny disclaimer. Strona prawna, więc do Twojej akceptacji.
- [x] ~~Zduplikowane katalogi public/~~ — FAŁSZYWY TROP: `public/koty|koniki|kroliczki|pieski` to NIE duplikaty, tylko jedyne źródło tych plików (pod `public/zwierzeta/` ich nie ma; frontmatter wskazuje płaskie ścieżki). Zostawić jak jest. (zweryfikowano 2026-07-23)

## Etap 2 — Wydajność i transfer (bezpośrednia oszczędność $)

Zasada: pełny SVG pobiera się TYLKO w `/koloruj/` (edytor). Wszędzie indziej — mały raster.

- [x] Skrypt `scripts/generate-thumbnails.mjs` (sharp): każdy SVG → `-thumb.webp` 400px + `-view.webp` 800px obok oryginału. 4168/4168 wygenerowane (281 MB), efekt np. `serce-11.svg` 9,6 MB → 19 KB thumb. Uruchamiać po dodaniu nowych kolorowanek. Naprawiono też 4 SVG z zepsutym XML (brak xmlns:serif/vectornator). (2026-07-23)
- [x] `utils/thumbs.js` (`svgPreview()`) + podmiana w `GalleryItem`, `VariantCard` (galerie, „Podobne", wyszukiwarka) i obraz główny + modal leafa na WebP z fallbackiem do SVG przy braku pliku; druk = PDF, edytor `/koloruj/` = pełny SVG. (2026-07-23)
- [x] `loading="lazy"` w `GalleryItem` (VariantCard już miał). (2026-07-23)
- [x] Nagłówki cache w `netlify.toml`: `max-age=31536000, immutable` dla SVG/PDF/WebP. (2026-07-23)
- [ ] SVGO na `public/**` (bezpieczny config: bez łączenia ścieżek, precyzja 2–3) + test trybu kolorowania — po wdrożeniu miniatur priorytet spadł (SVG pobiera już tylko edytor), robić przy okazji.
- [ ] **Decyzja Jakuba:** darmowy Cloudflare jako proxy przed Netlify (cache statyków = transfer Netlify spada niemal do zera) albo pełna migracja na Cloudflare Pages (statyczny hosting, transfer bez limitu, $0). Rekomendacja: zacząć od proxy — bez ruszania deployu.

## Etap 3 — Start monetyzacji

- [ ] Klaro: dodać Google Consent Mode v2 (wymóg reklam w EOG).
- [ ] Wniosek do **AdSense** (po czystce brandów z Etapu 1) — start i punkt odniesienia. Alternatywa/test B: Ezoic (brak progu, zwykle wyższy RPM).
- [ ] Placement: strony kategorii (in-content między sekcjami galerii) + leafy (pod przyciskami, nad „Podobnymi"). NIGDY w `/koloruj/` (UX dzieci + i tak noindex).
- [ ] Po 2–3 mies. danych: ocena RPM, decyzja o kolejnych krokach (Setupad przy ~100k odwiedzin/mies.).

## Etap 4 — Strony tagów / przekroje tematyczne (nowe landingi)

To jest silnik wzrostu na rynku PL: skalujemy to, co już działa (79 landingów → +15–30 nowych).

- [ ] Architektura: `/kolorowanki/{przekroj}/` — prerenderowane, W SITEMAPIE, z pełnym copy jak kategorie (FAQ, opisy). Źródło: pola `tags[]` z frontmatter + ręczna kuracja listy wariantów.
- [ ] Pierwsza fala przekrojów (do weryfikacji wolumenów w SEMrush): „kolorowanki dla 3-latka" (i 2/4/5-latka), „łatwe kolorowanki", „kolorowanki do wydruku A4", „kolorowanki mandale proste", sezonowe braki: Dzień Dziecka, Dzień Taty, Mikołajki, komunia, ferie, pierwszy dzień szkoły.
- [ ] Linkowanie: kafle na stronie głównej, sekcja w stopce (footer dziś nie linkuje żadnej kategorii), linki kontekstowe z landingów kategorii.
- [ ] Sezonowe publikować 2–3 mies. przed pikiem (Mikołajki → wrzesień/październik).

## Etap 5 — Pinterest (drugi kanał ruchu)

W niszy printables Pinterest bywa większy niż Google. Mechanika: pin = pionowa grafika (1000×1500) z linkiem do naszej strony; piny żyją miesiącami i się kumulują.

- [ ] Konto firmowe Pinterest + weryfikacja domeny + włączenie Rich Pins (czytają OG tagi — już je mamy).
- [ ] Skrypt `scripts/generate-pins.mjs`: miniatura kolorowanki → grafika pinu 2:3 (biała ramka, tytuł, subtelne logo) — masowo z istniejących WebP z Etapu 2.
- [ ] Automatyzacja publikacji: **Pinterest API v5** (oficjalne, darmowe) — skrypt planujący 3–5 pinów/dzień z kolejki; boardy per kategoria + boardy sezonowe. Alternatywa bez kodu: Buffer/Tailwind (płatne).
- [ ] Start: 5 boardów (zwierzęta, mandale/antystres, sezonowe, edukacyjne, pojazdy), potem rozbudowa wg statystyk.

## Etap 6 — Ekspansja językowa (największa dźwignia przychodu)

SVG/PDF są językowo neutralne — koszt wejścia to tłumaczenie ~79 landingów + szablonowe meta leafów. Wysokie RPM-y sieci premium (Journey/Raptive $13–40+) dotyczą ruchu EN/US — polska strona ich nie zobaczy; wersja EN tak.

- [ ] Research w SEMrush (Jakub ma dostęp) — frazy do sprawdzenia: patrz tabela niżej.
- [ ] **Decyzja Jakuba:** pierwszy rynek. Rekomendacja: **DE („ausmalbilder")** — wysokie RPM, to samo RODO, mniejsza konkurencja niż EN; lub **EN** — największy wolumen i odblokowuje Journey (1k sesji) → Raptive (25k PV).
- [ ] Wdrożenie — **architektura multi-domenowa z jednego repo (potwierdzona koncepcja):**
  - Jedno repo, osobna domena per rynek (np. kupiona domena .de). W Netlify dwa „sites" podpięte pod to samo repo.
  - Każdy site ma env: `SITE_LOCALE=pl|de`, `SITE_URL=https://...`. `nuxt.config.ts` czyta env i ustawia `site.url`, meta, hreflang na bliźniacze domeny.
  - Content per język: `content/` (PL, bez zmian) + `content-de/` — build wybiera katalog po `SITE_LOCALE` (source w konfigu @nuxt/content). Assety SVG/PDF/WebP współdzielone 1:1.
  - `scripts/routes-from-content.js` parametryzowany przez `SITE_LOCALE` (osobny prerender-routes per język).
  - Tłumaczenia landingów: Claude tłumaczy 79 plików kategorii (frontmatter + faqs + seoBlocks) na DE z korektą fraz kluczowych pod „ausmalbilder"; meta leafów generowane szablonowo skryptem.
  - hreflang: każda strona linkuje odpowiednik na drugiej domenie (`rel=alternate hreflang=pl/de/x-default`).
- [ ] Po 3–6 mies.: wniosek do Journey/Ezoic dla ruchu zagranicznego.
- [ ] **Wersja RU — opcja odłożona, z triggerem** (decyzja 2026-07): nie wchodzimy do Rosji na zapas (AdSense tam martwy, powrót Google = lata po zakończeniu wojny, brak premii za wczesne wejście — odpalenie wersji RU to ~miesiąc pracy w dowolnym momencie). Wariant pośredni: wersja rosyjskojęzyczna jako dosypka wolumenu PO DE/EN/ES — monetyzuje się od razu na Kazachstanie/Azji Środkowej/diasporze, a w dniu otwarcia Rosji jest gotowa. Trigger do obserwacji: wiadomość o wznowieniu AdSense/monetyzacji Google w Rosji. Rynek chiński: poza zasięgiem (Baidu + licencja ICP + chiński podmiot) — nie wracamy do tematu.

Frazy do weryfikacji wolumenów (SEMrush, baza per kraj):

| Język | Fraza główna | Rząd wielkości (do potwierdzenia) | Atrakcyjność RPM |
|---|---|---|---|
| EN | coloring pages | bardzo wysoki (setki tys.–1M+) | wysoka (US/UK) |
| DE | ausmalbilder | wysoki (kilkaset tys.) | wysoka |
| FR | coloriage | wysoki (kilkaset tys.) | średnia |
| ES | dibujos para colorear | bardzo wysoki (ES+LatAm) | niska–średnia |
| PT | desenhos para colorir | wysoki (Brazylia) | niska |
| IT | disegni da colorare | średni | średnia |
| NL | kleurplaten | średni (b. wysoki per capita) | wysoka |
| CS | omalovánky | niski–średni | niska–średnia |

## Etap 7 — Produkty i e-mail (uniezależnienie od RPM)

- [ ] Newsletter (MailerLite, darmowy próg) + lead magnet „paczka 10 PDF"; zapis na leafach i po pobraniu PDF.
- [ ] Pierwsza płatna paczka PDF (np. „50 kolorowanek antystresowych — 19 zł", Gumroad/EasyCart) jako test popytu.
- [ ] Generator kolorowanek z imieniem dziecka (sekcje `generator-cta` już istnieją w contencie) — produkt premium.
- [ ] Afiliacja: recenzje kredek/markerów na blogu + webePartners/Awin (Empik, Allegro).
- [ ] **WhitePress** (artykuły sponsorowane na blogu): rejestracja portalu, wycena startowa ~300–800 zł/artykuł. Zasady bezpieczeństwa: max 2–4 artykuły/mies., oznaczanie „artykuł sponsorowany" (wymóg UOKiK), tematyka zbliżona do niszy (dzieci/rodzina/edukacja), nie pozwolić żeby sponsorowane zdominowały blog — nadmiar płatnych linków dofollow to ryzyko kary od Google.

## Etap 8 — Własne narzędzia monitorujące (mini-stack zamiast SEMrusha)

Nie klon SEMrusha — własne skrypty na darmowych API, uruchamiane z GitHub Actions (cron) i zapisujące dane do repo/SQLite + prosty dashboard HTML. Kolejność wg wartości:

- [ ] **GSC query mining** (najcenniejsze): dzienny pull z Google Search Console API (kliknięcia/wyświetlenia/pozycje per fraza i per landing). Automatyczny raport: frazy z wyświetleniami, na które NIE mamy landinga → gotowa lista tematów do Etapu 4; frazy na pozycjach 8–20 → landingi do dopieszczenia. To realnie zastępuje 80% tego, do czego używa się SEMrusha przy własnej stronie — za darmo i na prawdziwych danych.
- [ ] **Monitor transferu Netlify**: pull z Netlify API (usage), alert (e-mail/commit do repo) przy >70% pakietu — koniec niespodzianek na fakturze.
- [ ] **Health check tygodniowy**: skrypt sprawdzający sitemapę (200-ki), canonicale w `content/**` (czy wskazują istniejące strony — wyłapałby `/dom/dom/`), 404 w linkach wewnętrznych, brakujące pliki z frontmatter (`image:`/`pdf:`).
- [ ] **Core Web Vitals tracker**: dzienne odpytanie CrUX/PSI API dla 10 kluczowych stron, wykres trendu LCP/CLS — wcześnie łapie regresje po deployach.
- [ ] **Radar konkurencji**: tygodniowy diff publicznych sitemap 3–5 konkurentów (kolorowankowe portale PL/DE) → co nowego dodają, jakie sezony obstawiają.
- [ ] **Pinterest stats pull** (po Etapie 5): API → które motywy pinów ciągną ruch, feedback do produkcji kolorowanek.

Uwaga szczera: sprzedawanie takich narzędzi jako osobny produkt to inny biznes (wsparcie, konkurencja z tanimi SaaS) — nie polecam na teraz. Ich rola tutaj: portal ma działać jak najbliżej „dochodu pasywnego" — automaty pilnują zdrowia strony i podpowiadają content, Ty podejmujesz tylko decyzje.

---

## Kolejność i metryki

| Kiedy | Etapy | Miernik sukcesu |
|---|---|---|
| Tydzień 1–2 | 0 + 1 | baseline PV/sesje; wszystkie naprawy zmergowane |
| Tydzień 3–6 | 2 | transfer Netlify ↓ >70%; LCP mobile < 2,5 s |
| Miesiąc 2 | 3 | pierwsze przychody z reklam |
| Miesiąc 2–3 | 4 + 5 | +15 landingów w indeksie; pierwsze sesje z Pinteresta |
| Kwartał 2 | 6 | wersja DE/EN live; 1k sesji zagranicznych/mies. |
| Kwartał 3 | 7 | lista e-mail 500+; pierwsza sprzedaż paczki PDF |
