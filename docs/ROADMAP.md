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
2. **Żadnych cudzych brandów w contencie.** Nazwy i opisy sugerujące brandy (Barbie, Psi Patrol itd.) do wyczyszczenia (Etap 1). **KOREKTA (2026-07-23): grafiki NIE są własne** — kolorowanki pochodzą z komercyjnej licencji Freepik (wg Jakuba platforma działa teraz pod nazwą „Magniic"); Delfina nie rysuje, tylko obrabia i dodaje content. Własne (zlecone) rysunki dopiero przy produktach tematycznych z Etapu 7 — z licencji Freepika NIE WOLNO robić płatnych paczek.
3. **Wysokiej jakości SVG zostają** — są potrzebne do trybu kolorowania online. Optymalizacja = osobne małe pliki do podglądów, nie degradacja źródeł.

---

## NAJBLIŻSZE KROKI — kolejka do zrobienia (stan po quick winach 2026-07-23)

> **Wymiana biblioteki grafik ma własną kolejkę:** `docs/kolejnosc-migracji.md` — priorytety
> ustawione po ruchu z ostatniego tygodnia (decyzja Jakuba 2026-08-02), nie po wielkości
> kategorii. Tam też termin na kategorie sezonowe i osobny problem z „po numerach".

Wykonawcze (Claude):
- [x] Commit + PR quick winów: https://github.com/jacobashtem/twoja-kolorowanka/pull/124 (branch `feature/quick-wins-seo-thumbs`; 633 zmodyfikowane pliki + 8341 nowych). (2026-07-23)
- [x] Stopka (`AppFooter.vue`): 15 linków do najważniejszych kategorii. (2026-07-23)
- [x] Twitter cards na kategoriach/leafach + blogu; `og:image`/`twitter:image` leafów wskazują teraz raster WebP zamiast SVG (crawlery social nie renderują SVG). (2026-07-23)
- [x] Odporność builda na awarię WordPressa: `routes-from-content.js` przy padzie WP przepisuje trasy bloga z poprzedniego `prerender-routes.json` (przetestowane symulacją), a nowy `scripts/check-build.mjs` (wpięty w `pnpm build`) wywala deploy przy pustym blogu/kategorii/leafie — koniec cichych pustych deployów mimo `failOnError:false`. (2026-07-23)
- [x] Cloudflare Web Analytics wpięte w `nuxt.config.ts` przez env `CF_ANALYTICS_TOKEN` (bez tokena w repo). **AKTYWOWANE i zweryfikowane** — beacon na produkcji, dane spływają do panelu CF. Poza Klaro celowo (pomiar bez cookies = bez zgody, 100% ruchu); wpis w polityce prywatności + klauzula transferu poza EOG w PR #127. Etap 0 (baseline 2–4 tyg.) tym samym wystartował. (2026-07-23)
- [ ] Po deployu: tydzień obserwacji transferu Netlify → jeśli spadł zgodnie z planem (80–95%), rozważyć powrót na tańszy pakiet.
- [ ] **Newsletter + lead magnet „paczka 10 kolorowanek za maila" — wyciągnięte z Etapu 7 na teraz (decyzja Jakuba 2026-08-11).** Uzasadnienie: lista mailowa to jedyny kanał dotarcia niezależny od algorytmu Google i Pinteresta. Kroki: konfiguracja MailerLite (darmowy próg), formularz zapisu na leafach i po pobraniu PDF, automat powitalny wysyłający paczkę. **Warunek licencyjny — paczkę składać wyłącznie z grafik własnych (Recraft), nigdy z Freepika:** spakowanie 10 plików do pobrania to redystrybucja „as is", której standardowa licencja Freepika zabrania (zob. decyzja strategiczna nr 2 i nierozstrzygnięty punkt weryfikacji licencji wyżej). Nadają się tylko kategorie już podmienione w ramach migracji. Poczta domenowa gotowa: MX + DKIM działają, `include:_spf.mlsend.com` siedzi w SPF.
  - [x] **Integracja techniczna przetestowana end-to-end (2026-08-11).** Konto MailerLite (założone 26.02) miało już wszystko: `MAILERLITE_API_KEY` i `MAILERLITE_GROUP_ID` w Netlify, grupa „Newsletter Kolorowanki" (id 180499754188277517), domena zweryfikowana z DKIM `litesrv._domainkey`. Włączony **Double opt-in for API and integrations** (osobny przełącznik od formularzowego — bez niego zapisy przez API omijają potwierdzenie) i **Default sender** `team@twoja-kolorowanka.pl` (Account settings → Default settings; bez niego mail potwierdzający w ogóle nie wychodzi). Test przez `netlify functions:serve`: HTTP 200, subskrybent jako `unconfirmed`, mail potwierdzający dostarczony i podpisany DKIM-em domeny. Copy `NewsletterSection.vue` przepisane pod paczkę, komponent odkomentowany w `pages/index.vue` i `layouts/blog.vue`.
  - [x] **Paczka gotowa i na produkcji (2026-08-12).** Pakiet „Kim chcę zostać?" — 50 kolorowanek o zawodach z 26 zawodów, wygenerowanych Recraftem (whimsy, $0.04/szt.) i zwektoryzowanych ($0.01/szt.). Plik: `public/pakiet/kim-chce-zostac-k7m2x9.pdf` (51 stron z okładką, 1,05 MB), składany przez `scripts/zloz-pakiet.mjs`. Na produkcji odpowiada 200 z nagłówkiem `X-Robots-Tag: noindex, nofollow`. Materiał źródłowy i `_wybor.txt` w `lineart-work/pakiet-zawody/`.
  - [ ] **Zostaje automatyzacja w MailerLite** („gdy subskrybent dołącza do grupy Newsletter Kolorowanki" → mail z linkiem do paczki). Dopóki jej nie ma, formularz obiecuje coś, czego nikt nie dostanie. Automations są w darmowym planie.
  - [ ] Do regulaminu (sekcja V): punkt o paczce za zapis i zasadach korzystania z plików — dziś regulamin opisuje newsletter jako usługę bez świadczenia rzeczowego.
  - [ ] Dług: treść *Confirmation email* i *Confirmation thank you page* jest po angielsku — edycja wymaga płatnego planu. Double opt-in **nie jest wymogiem prawnym w PL**, narzuca go własny regulamin (sekcja V pkt 4b), więc alternatywą dla opłaty jest przeredagowanie tego punktu.

Decyzje (Jakub):
- [x] Kategorie aut z brandami — **DECYZJA (2026-07-23): zostawiamy** (ryzyko niskie, frazy z markami mają wolumen SEO; disclaimer znaków towarowych w regulaminie asekuruje). Plan awaryjny gotowy na wypadek odmowy AdSense lub pisma od marki: rename na generyczne + redirecty 301 w netlify.toml + zmiana menu (~1h pracy). Do sprawdzenia przy okazji (na Freepiku, skąd pochodzą grafiki): czy auta to generyczne sylwetki, czy wierne modele (wierne = ryzyko rośnie).
- [x] Regulamin + Prawa autorskie przeredagowane (2026-07-23, w PR #124): usunięte deklaracje fan-artów/postaci z bajek/domeny publicznej („uznane za takie na podstawie internetu"), usunięta obietnica „nie monetyzujemy" (kolizja z planowanym AdSense — zastąpiona „dostęp bezpłatny"), dodany generyczny disclaimer znaków towarowych. Objęte: `pages/regulamin.vue` (sekcje IX–X) i `pages/prawa-autorskie.vue` (PL+EN). UWAGA: przy okazji wdrażania sprzedaży paczek PDF (Etap 7) trzeba będzie zaktualizować zakaz użytku komercyjnego o wyjątek dla płatnych licencji.
- [ ] **WAŻNE — weryfikacja licencji Freepik (przed AdSense):** sprawdzić, czy posiadany plan licencyjny pozwala na udostępnianie grafik jako samodzielnych plików do pobrania (SVG/PDF). Standardowe licencje Freepika zabraniają redystrybucji zasobów „as is" na stronach oferujących downloady — a to jest nasz core model. Jeśli licencja tego nie obejmuje → rozważyć plan wyższy/enterprise albo doprecyzować z Freepikiem. Dotyczy też przeglądu przed wnioskiem AdSense (Google wymaga praw do monetyzowanych treści). Korekta stron prawnych w PR #136 (czeka na akceptację).
- [ ] Cloudflare przed Netlify: darmowy proxy (cache statyków) vs zostawić jak jest. **DECYZJA (2026-07-23): z Netlify nie rezygnujemy** — migracja na Cloudflare Pages odpada; do rozstrzygnięcia zostaje tylko ewentualny proxy (Netlify pozostaje originem).

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

- [x] Skrypt `scripts/generate-thumbnails.mjs` (sharp): każdy SVG → `-thumb.webp` 400px + `-view.webp` 800px obok oryginału. 4168/4168 wygenerowane (281 MB), efekt np. `serce-11.svg` 9,6 MB → 19 KB thumb. Naprawiono też 4 SVG z zepsutym XML (brak xmlns:serif/vectornator). (2026-07-23)
- [x] Automatyzacja miniatur dla nowych kolorowanek: `pnpm build` odpala skrypt z flagą `--missing-only` przed `nuxt generate` — nowe SVG dostają WebP przy deployu na Netlify, zepsuty SVG wywala build. Ręczne uruchomienie lokalnie (bez flagi) nadal możliwe, jeśli chcesz commitować WebP do repo. (2026-07-23)
- [x] `utils/thumbs.js` (`svgPreview()`) + podmiana w `GalleryItem`, `VariantCard` (galerie, „Podobne", wyszukiwarka) i obraz główny + modal leafa na WebP z fallbackiem do SVG przy braku pliku; druk = PDF, edytor `/koloruj/` = pełny SVG. (2026-07-23)
- [x] `loading="lazy"` w `GalleryItem` (VariantCard już miał). (2026-07-23)
- [x] Nagłówki cache w `netlify.toml`: `max-age=31536000, immutable` dla SVG/PDF/WebP. (2026-07-23)
- [ ] SVGO na `public/**` (bezpieczny config: bez łączenia ścieżek, precyzja 2–3) + test trybu kolorowania — po wdrożeniu miniatur priorytet spadł (SVG pobiera już tylko edytor), robić przy okazji.
- [ ] **Decyzja Jakuba:** darmowy Cloudflare jako proxy przed Netlify (cache statyków = transfer Netlify spada niemal do zera) albo pełna migracja na Cloudflare Pages (statyczny hosting, transfer bez limitu, $0). Rekomendacja: zacząć od proxy — bez ruszania deployu.

## Etap 3 — Start monetyzacji

- [ ] Klaro: dodać Google Consent Mode v2 (wymóg reklam w EOG). **Zaimplementowane w PR #129 — czeka na review Jakuba** (domyślnie wszystko denied, zgody sterują sygnałami; kategoria Reklamowe + usługa AdSense w banerze gotowe na Etap 3). (2026-07-23)
- [ ] Wniosek do **AdSense** (po czystce brandów z Etapu 1) — start i punkt odniesienia. Alternatywa/test B: Ezoic (brak progu, zwykle wyższy RPM). **DECYZJA (2026-07-23): odroczony do zebrania baseline'u** — przy szacowanych 40–60k odsłon/mies. i RPM 2–6 zł (PL, nisza dziecięca, made-for-kids, część ruchu bez zgody) wyszłoby ~100–350 zł/mies. Ocena po ~miesiącu danych z Cloudflare; wtedy też planowanie placementów na realnych top stronach. Pamiętać: review AdSense trwa 2–4 tyg., doliczyć do timeline'u.
- [ ] Placement: strony kategorii (in-content między sekcjami galerii) + leafy (pod przyciskami, nad „Podobnymi"). NIGDY w `/koloruj/` (UX dzieci + i tak noindex).
- [ ] Po 2–3 mies. danych: ocena RPM, decyzja o kolejnych krokach (Setupad przy ~100k odwiedzin/mies.).

## Etap 4 — Strony tagów / przekroje tematyczne (nowe landingi)

To jest silnik wzrostu na rynku PL: skalujemy to, co już działa (79 landingów → +15–30 nowych).

- [x] Architektura: `/kolorowanki/{przekroj}/` — prerenderowane, W SITEMAPIE, z pełnym copy jak kategorie (FAQ, opisy). Wykorzystany istniejący mechanizm `tagsFilter` z `pages/[...slug].vue` (galeria leafów po tagach) — nowy przekrój = jeden plik `content/kolorowanki/<slug>/index.md`, zero zmian w kodzie. Hub: `/kolorowanki/`. (PR #141, 2026-07-24)
- [x] Pierwsza fala przekrojów (5 landingów, PR #141, 2026-07-24): „łatwe kolorowanki", „dla 3-latka", „dla 5-latka", „do wydruku A4", „pierwszy dzień szkoły" (sezon wrześniowy — publikacja zgodnie z zasadą 2 mies. przed pikiem). Wolumeny fraz do weryfikacji w SEMrush przy okazji (URL-e generyczne; zmiana = redirect 301).
- [ ] Druga fala (po danych GSC/SEMrush): „dla 2-latka"/„dla 4-latka", „mandale proste", sezonowe: Mikołajki (publikacja wrzesień/październik!), Dzień Dziecka, Dzień Taty, komunia, ferie.
- [ ] Linkowanie: sekcja w stopce ✓ („Zestawy tematyczne", PR #141); ZOSTAJE: kafle na stronie głównej + linki kontekstowe z landingów kategorii.
- [ ] Sezonowe publikować 2–3 mies. przed pikiem (Mikołajki → wrzesień/październik).

## Etap 5 — Pinterest (drugi kanał ruchu)

W niszy printables Pinterest bywa większy niż Google. Mechanika: pin = pionowa grafika (1000×1500) z linkiem do naszej strony; piny żyją miesiącami i się kumulują.

- [ ] Konto firmowe Pinterest + weryfikacja domeny + włączenie Rich Pins (czytają OG tagi — już je mamy). **W TOKU (2026-07-23): Jakub zakłada konto**; weryfikacja metodą „Add HTML tag" — tag wkleja Claude'owi, trafia do `nuxt.config.ts`. Decyzja: startujemy teraz, żeby konto wygrzało się przed pikiem Q4 (publikacja sezonowa od września).
- [x] Skrypt `scripts/generate-pins.mjs`: miniatura kolorowanki → grafika pinu 2:3 (1000×1500, biała ramka, pasek z tytułem i domeną) — masowo z istniejących WebP. Flagi `--limit`/`--only`, wyjście do `pins-output/` (gitignore). Masowe uruchomienie po założeniu konta. (PR #131, 2026-07-23)
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

- [ ] Newsletter (MailerLite, darmowy próg) + lead magnet „paczka 10 PDF"; zapis na leafach i po pobraniu PDF. **→ wyciągnięte na teraz (2026-08-11), szczegóły i warunek licencyjny w „NAJBLIŻSZE KROKI" na górze pliku.**
- [ ] Pierwsza płatna paczka PDF (np. „50 kolorowanek antystresowych — 19 zł", Gumroad/EasyCart) jako test popytu.
- [ ] **Pomysły Jakuba na produkty tematyczne (2026-07-23):** poczet królów Polski (podstawa programowa kl. 4–5 → kupują też nauczyciele, popyt cykliczny), księżniczki z historii Polski, mity słowiańskie (nisza bez konkurencji, wersja EN „Slavic mythology" = rynek globalny). Tematyczność broni ceny 29–49 zł vs 19 zł za generyk. Piki sprzedażowe: wrzesień (rok szkolny), 11 XI, Dzień Flagi — publikacja 2 mies. wcześniej. Do weryfikacji w SEMrush: „kolorowanki historia polski", „kolorowanki mity słowiańskie", „poczet królów dla dzieci". Realistyczny model konwersji: 0,1–0,5% ruchu → przy dzisiejszym ruchu 500–1500 zł/mies., po roku 2–7 tys., dojrzale 7–18 tys. zł/mies. (produkty + osobno reklamy).
- [ ] Generator kolorowanek z imieniem dziecka (sekcje `generator-cta` już istnieją w contencie) — produkt premium.
- [ ] Afiliacja: recenzje kredek/markerów na blogu + webePartners/Awin (Empik, Allegro).
- [ ] **WhitePress** (artykuły sponsorowane na blogu): rejestracja portalu, wycena startowa ~300–800 zł/artykuł. Zasady bezpieczeństwa: max 2–4 artykuły/mies., oznaczanie „artykuł sponsorowany" (wymóg UOKiK), tematyka zbliżona do niszy (dzieci/rodzina/edukacja), nie pozwolić żeby sponsorowane zdominowały blog — nadmiar płatnych linków dofollow to ryzyko kary od Google.

## Etap 8 — Własne narzędzia monitorujące (mini-stack zamiast SEMrusha)

Nie klon SEMrusha — własne skrypty na darmowych API, uruchamiane z GitHub Actions (cron) i zapisujące dane do repo/SQLite + prosty dashboard HTML. Kolejność wg wartości:

- [ ] **GSC query mining** (najcenniejsze): dzienny pull z Google Search Console API (kliknięcia/wyświetlenia/pozycje per fraza i per landing). Automatyczny raport: frazy z wyświetleniami, na które NIE mamy landinga → gotowa lista tematów do Etapu 4; frazy na pozycjach 8–20 → landingi do dopieszczenia. To realnie zastępuje 80% tego, do czego używa się SEMrusha przy własnej stronie — za darmo i na prawdziwych danych.
- [ ] **Monitor transferu Netlify**: pull z Netlify API (usage), alert (e-mail/commit do repo) przy >70% pakietu — koniec niespodzianek na fakturze.
- [x] **Health check tygodniowy**: `scripts/health-check.mjs` (`pnpm health`, `--remote` odpytuje sitemapę produkcji, `--all` pełna lista). Pierwsze uruchomienie wykryło i naprawiliśmy **1023 błędy** (PR #130): 191 canonicali leafów `/kat/kat/`→404 w 8 kategoriach od Delfiny, ~390 zdublowanych ścieżek image/pdf (JSON-LD emitował 404), 6 kategorii z martwym og:image, 6 złych canonicali kategorii. Zostało 38 ostrzeżeń: martwe pola `heroImgDesktop/Mobile` (nieużywane w kodzie) — decyzja: dostarczyć grafiki czy usunąć pola. **TODO: wpiąć w cron GitHub Actions z alertem.** UWAGA na przyszłość: generator contentu Delfiny systematycznie produkuje ścieżki `/kategoria/kategoria/` — health-check łapie to od teraz. (2026-07-23)
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
