# Strategia ekspansji i monetyzacji

> Spisana 2026-08-13 po sesji analitycznej na realnych danych (Cloudflare, GSC, SEMrush)
> i researchu sieci reklamowych. Warstwa strategiczna **nad** `ROADMAP.md` — tamten plik
> jest kolejką wykonawczą, ten opisuje kierunek i uzasadnienie decyzji.
>
> **Zasada czytania:** wszędzie rozdzielone jest to, co **zmierzone**, od tego, co **szacowane**.
> Szacunki są moje i mają szerokie widełki. Nie planuj na nich budżetu bez weryfikacji.

---

## 1. Stan faktyczny — zmierzony 2026-08-13

Zastępuje szacunki z audytu 2026-07-23, które były zawyżone ~2,7×.

| Metryka | Wartość | Źródło |
|---|---|---|
| Wizyty | **~8 400/mies.** | Cloudflare, 21 dni (5,9k) → ekstrapolacja |
| Odsłony | ~20 000/mies. | Cloudflare (14,07k / 21 dni) |
| Odsłony na wizytę | **2,38** | dno przedziału dla printables (dobre serwisy: 4–8) |
| Authority Score | **12** | SEMrush |
| Domeny odsyłające | **154** | SEMrush (4,7 tys. linków = profil sitewide, nie redakcyjny) |
| Frazy organiczne | 2,8 tys. (+8,7%) | SEMrush |

Doliczyć 10–25% do liczb z Cloudflare — beacon `cloudflareinsights.com` jest na części list blokujących.

### Google Search Console, 3 miesiące

| | Wyświetlenia | Kliknięcia | CTR | Poz. |
|---|---|---|---|---|
| Sieć | 609 975 | 9 362 | 1,53% | 6,8 |
| **Grafika** | **603 019** | **3 526** | **0,59%** | **33,0** |
| Razem | **1 213 000** | 12 888 | 1,06% | — |

**Grafika to połowa widoczności serwisu.** 47% jej wyświetleń lądowało na pozycji 31+, tylko 12,9% w top 10.

### Rozkład ruchu po typach stron (Sieć)

- **kategorie: 79% kliknięć** (94 strony, 490 tys. wyświetleń)
- strona główna: 20% (108 tys. wyświetleń, CTR 1,76%)
- leafy: 0,9% (720 stron, CTR 0,38%) — zgodnie z projektem, są poza sitemapą
- przekroje (Etap 4): 13 stron, 19 kliknięć — w indeksie od 24 lipca, za wcześnie na ocenę
- **blog: 49 postów → 431 wyświetleń, 11 kliknięć** — praktycznie nie istnieje w Google

### Wzorzec CTR — kluczowa obserwacja

Zapytania dzielą się na dwa typy i zachowują skrajnie różnie:

- **obiektowe** („lody kolorowanka", „konik kolorowanka") — CTR **0,1–1%** mimo pozycji 1–5,
  bo karuzela grafik przechwytuje uwagę, zanim użytkownik zejdzie do niebieskich linków
- **kolekcyjne** („kolorowanki do druku za darmo") — CTR **3%+**

Skrajny przykład: `/dla-doroslych/po-numerach/` ma CTR **5,92%** przy pozycji 5,3 — bo przy tym
zapytaniu szuka się systemu, nie obrazka. `/zwierzeta/koniki/` ma **0,43%** przy pozycji 7.

### Co z tego wynika: SEMrush i GSC mówią to samo

SEMrush szacuje ruch na **24,9 tys./mies.** — czyli tyle, ile obecne pozycje **powinny** dawać przy
rynkowym CTR. Realnie masz ~4,3 tys. kliknięć z Google. **Masz ~3× więcej widoczności niż ruchu.**

**Zasada na przyszłość: ufaj zmianom w SEMrushu, nie wartościom bezwzględnym.** `+48%` ruchu
i `+8,7%` fraz to sygnał realny. Liczba 24,9 tys. nie nadaje się do planowania przychodu.

---

## 2. Co zostało naprawione (PR #162, 2026-08-13)

Trzy przyczyny słabego wyniku w Grafice, wszystkie po naszej stronie:

1. **Galerie serwowały tylko miniatury 400 px.** 93% wyświetleń w Grafice przypada na kategorie,
   a warianty 800 px leżały wyłącznie na liściach — scanonicalizowanych na kategorię.
   → `srcset` 400/800 px w `GalleryItem` i `VariantCard`.
2. **W HTML-u kategorii było tylko `liczba sekcji H2 × 4` kafelków.** Reszta czekała na klik
   w „załaduj więcej", którego crawler nie klika — kategoria z 84 kolorowankami pokazywała 28.
   → pełne renderowanie, `loadMore` usunięte. Koszt zmierzony: **+1,8 kB po gzipie** (+4,8%)
   przy potrojeniu liczby kafelków. Obrazki bez zmian dzięki `loading="lazy"`.
3. **Brak sitemapy obrazów.** → `scripts/sitemap-images.mjs`, 76 kategorii, **4165 obrazków**.

**Efekt do odczytu w GSC od ~połowy września 2026.** Metryka: raport pokrycia dla
`sitemap-images.xml` (zgłosić ręcznie w GSC) oraz średnia pozycja w Grafice.

Szacowany zapas: **2,5–3× ruchu bez nowych stron i bez nowych pozycji** — potwierdzony
niezależnie przez rozjazd SEMrush ↔ GSC.

---

## 3. Monetyzacja — twarde ustalenia z researchu

### Sieci reklamowe premium są zamknięte dla ruchu europejskiego

| Sieć | Próg | Wymóg geograficzny | Dostępne? |
|---|---|---|---|
| **Raptive** | 25 tys. odsłon | **50% Tier 1** (US/UK/CA/AU/NZ), 40% powyżej 100 tys. | ❌ nie dla ruchu z UE |
| **Mediavine** | **$5 000/rok przychodu z reklam** | preferuje Tier 1, DE case-by-case | ⚠️ osiągalne |
| **Journey by Mediavine** | **1 000 sesji** | preferuje Tier 1 | ✅ aplikować teraz |
| **Setupad** | 100 tys. wizyt | brak | ✅ cel docelowy (firma z Łotwy, CMP w cenie) |
| **Snigel** | 100 tys. odsłon | tylko 20% Tier 1 | ⚠️ przy wersji EN |
| Ezoic / AdSense | brak | brak | ✅ baza odniesienia |

**To jest najważniejsze ustalenie tej sesji.** Raptive gatuje **geografią** — szwedzka czy
holenderska domena nie spełni tego warunku niezależnie od skali. Mediavine przeszedł na próg
**przychodowy**, co dla europejskiego wydawcy jest odpowiadalne („czy Twój ruch zarabia"
zamiast „skąd jest Twój ruch").

Serwisy siostrzane: Raptive przyjmuje kolejny serwis istniejącego wydawcy przy 25 tys. odsłon;
Mediavine **skasował** nieoficjalną praktykę przyjmowania siostrzanych poniżej progu.

### Szacowany RPM dla ruchu europejskiego: $2–5

Twarde dane: AdSense RPM dla czołowych rynków anglojęzycznych to **$4,59–6,15**. Średnie CPC
krajowe: US $0,61, UK $0,48, FI $0,45, SE $0,31, DK $0,28, NO $0,26, DE $0,22, IT $0,13.

**Uwaga — to przeczy folklorowi o wysokich stawkach skandynawskich.** Norwegia i Szwecja mają
CPC na poziomie połowy amerykańskiego, nie powyżej.

Kontrapunkt: CPC dla samej frazy „kleurplaten" (NL) to **$3,59**, czyli wielokrotnie powyżej
średniej krajowej. Jedna z tych liczb nie mówi całej prawdy. **Rozstrzygnie dopiero realny ruch.**

### Wniosek: dla rynków europejskich produkty biją reklamy

Sprzedaż PDF nie zna pojęcia Tier 1, nie ma progu i nie wymaga aplikacji. Szwedzki rodzic płaci
tyle samo co polski — a przy wyższej sile nabywczej często więcej.

**Na każdym nowym rynku: najpierw sklep, potem reklamy.** Reklamy finansują hosting; produkty
są biznesem.

---

## 4. Wybór rynków

| Rynek | Uniwersum fraz | CPC | KD | Ocena |
|---|---|---|---|---|
| **NL** kleurplaat/-en | 1,9 mln | **$3,59** | **20** | **pierwszy** |
| **DE** ausmalbilder | **4,7 mln** | $2,24 | 50 | drugi — największy sufit |
| IT disegni da colorare | 1,5 mln | $0,36 | **25** | rynek **produktowy**, nie reklamowy |
| SE målarbilder | 254 tys. | $0,50 | 17 | tani dodatek, gdy koszt języka spadnie |
| FR coloriage | **5,9 mln** | $0,49 | **63** | ❌ pułapka: najtrudniej i słabo płaci |
| ES dibujos para colorear | 1,5 mln | **$0,19** | 37 | ❌ pułapka: wolumen LatAm, gęstość reklam 0,02 |
| NO fargelegging | **26 tys.** | $0,43 | 12 | ❌ za mały samodzielnie |

**Zasada: mały rynek bez konkurencji przy przyzwoitym CPC bije duży rynek z rzezią.**
Przy Authority Score 12 w NL można realnie zdominować rynek; w DE można powalczyć; w EN
nie zaczyna się walki (supercoloring, justcolor, crayola + setki farm AI).

**Kolejność: NL → DE → IT (produktowo) → SE → dopiero EN.**

### Warstwa lokalna to najtańsza przewaga konkurencyjna

Ok. 90% biblioteki przenosi się 1:1 (zwierzęta, pojazdy, kwiaty, jednorożce). Święta — nie:

- **NL:** Sinterklaas (5 XII) — osobna, duża fraza sezonowa, nie Boże Narodzenie
- **NO:** 17. mai — poza radarem serwisów międzynarodowych
- **SE:** Lucia (13 XII), midsommar
- **CZ/SK:** własny kalendarz

Serwisy globalne tego nie mają, bo tłumaczą jeden zestaw. Plan: **20–40 kolorowanek per rynek
pod lokalne święta.** To jednocześnie chroni przed oceną „skalowane treści" — siedem serwisów
z mechanicznie przetłumaczoną tą samą biblioteką to profil, który systemy antyspamowe rozpoznają.

**Uwaga wspólna:** w czołówce każdego rynku siedzą frazy markowe (pokemon, stitch), z których
rezygnujemy decyzją strategiczną nr 2. **DE ma najczystszy profil generyczny** — „einhorn
ausmalbild" 27,1 tys., „ausmalbilder weihnachten" 18,1 tys., „ausmalbilder zum ausdrucken"
33,1 tys. To częściowo odrabia jego wyższe KD.

---

## 5. Architektura wielorynkowa

### Decyzja: osobne domeny ccTLD (`.nl`, `.de`, `.se`…)

Pierwotnie argumentowałem za pulą (podkatalogi na jednej domenie), bo przekracza progi sieci
premium. **Ten argument upadł** — Raptive jest geograficznie zamknięty niezależnie od skali,
więc pula nie kupuje dostępu do premium.

Zostają zalety ccTLD:
- **Google wycofał ustawianie kraju w Search Console** — dla `.com` nie ma już ręcznego
  przełącznika, przy ccTLD sygnał jest jednoznaczny
- zaufanie i CTR w wynikach — istotne przy serwisie bez rozpoznawalnej marki
- brak zależności od hreflanga (przy 7 rynkach to kilkadziesiąt wzajemnych deklaracji,
  jedna z najczęściej psutych rzeczy w SEO)

**Do sprawdzenia przed planowaniem:** `.no` historycznie wymagał podmiotu zarejestrowanego
w Norwegii. `.se`, `.fi`, `.cz`, `.is` są otwarte. `.dk` zweryfikować osobno.

**Uwaga:** przy językach jeden-do-jednego z krajem (SV, DA, NO, FI, CS, SK) sam język jest
sygnałem geograficznym i ccTLD daje głównie zaufanie/CTR. Targetowanie krajowe naprawdę waży
tam, gdzie jeden język obsługuje kilka rynków: **NL vs BE**, DE/AT/CH, PT vs BR.

### Mechanika buildów

Dwie osobne rzeczy, które łatwo pomylić:

**Co wchodzi do builda rynku — rozstrzyga katalog.** `content-sv/svenska-kungar/` istnieje tylko
w szwedzkim drzewie. Żółwie istnieją w siedmiu drzewach jako siedem przetłumaczonych plików
wskazujących na **te same** SVG. Flaga nie jest potrzebna — obecność w drzewie jest flagą.

**Które rynki przebudować po pushu — wymaga logiki.** Netlify ma to natywnie:

```toml
[build]
  ignore = "node scripts/should-build.mjs"   # exit 0 = pomiń, exit 1 = buduj
```

Skrypt czyta `CACHED_COMMIT_REF`/`COMMIT_REF` i `SITE_LOCALE`:

| Zmiana w repo | Przebudowa |
|---|---|
| `content-<locale>/**` | tylko ten rynek |
| `components/`, `pages/`, `layouts/`, `utils/`, `nuxt.config.ts`, `scripts/` | wszystkie |
| `public/**` | wszystkie (miniatury + sitemapa obrazów) |

Bez tego każdy commit przebudowuje 7 serwisów po ~5 minut. **GitHub Actions zostaje do croników
Etapu 8** (health-check, monitor indeksu, pull z GSC), nie do deployów.

### Assety: duplikowane per domena — świadomie

Kusi hostowanie grafik z jednego miejsca. **Nie robić tego:** obrazki hostowane na innej domenie
indeksują się w Grafice pod **tamtą** domeną. Straciłoby to cały zysk z sekcji 2 i rozmyło sygnał
lokalny. Koszt duplikacji (~1,2 GB × N) jest akceptowalny; `generate-thumbnails --missing-only`
plus cache Netlify sprawiają, że po pierwszym buildzie nie boli.

---

## 6. Kanały poza własnymi serwisami

Kluczowa obserwacja: **odwiedzający Twój serwis przyszedł po darmowe.** To najtrudniejsza
publiczność do konwersji — już dostał to, po co przyszedł. Na Etsy i Amazonie ludzie przychodzą
**kupować**. To inne audytorium, nie ten sam lejek.

### Etsy — pierwszy test popytu

- listing $0,20, nie wymaga ruchu ani zmian w serwisie
- **Etsy jest deemed supplier dla unijnego VAT-u przy produktach cyfrowych** — rozlicza go
  za Ciebie, więc OSS odpada z pierwszego podejścia
- materiał gotowy: pakiet „Kim chcę zostać?" (50 stron)
- odpowiedź w miesiąc

### Amazon KDP — druk bez inwentarza

Przewaga: **SVG = dowolny format bez straty jakości**, a `scripts/zloz-pakiet.mjs` (pdfkit +
svg-to-pdfkit) już istnieje — wariant pod specyfikację KDP to modyfikacja, nie nowy projekt.

Mocniejszy argument: **gra wielorynkowa bez budowania stron.** Amazon.de/.fr/.it/.es/.nl/.se/.pl
istnieją, a kolorowanka jest produktem prawie bezjęzykowym — tłumaczy się tytuł, opis i słowa
kluczowe. **Ruch przynosi Amazon.** To hedge wobec całej strategii SEO. Cena: nie budujesz
relacji z klientem — to przychód, nie aktywo.

Jednostkowo: ~55 stron, €7,99 na amazon.de → 60% royalty minus druk (~€2,00–2,50) =
**~€2,50–2,80/egz.** Problem nie w marży, tylko w odkrywalności — rynek jest przeorany,
mediana tytułu sprzedaje się blisko zera. To biznes portfelowy: 20–40 tytułów, kilka ciągnie resztę.

**Obowiązek: KDP wymaga ujawnienia treści generowanych AI** — obowiązkowe pole w formularzu,
obejmuje wprost kolorowanki. Nie jest pokazywane klientom i nie wpływa na ranking, ale
nieujawnienie grozi zablokowaniem konta. (Unijny AI Act tego **nie** wymaga — art. 50 dotyczy
deep fake'ów; kolorowanka nim nie jest. Prawo nie, platforma tak.)

### Jedna kolekcja → cztery kanały

Dobrze złożona kolekcja 50 kolorowanek to jednocześnie: lead magnet, paczka na Etsy, książka
na KDP i płatny produkt na własnej stronie. **Iść w głąb jednej kolekcji, nie wszerz.**

---

## 7. Ekonomia — model i jego słabe punkty

Założenie bazowe dla **dojrzałego** rynku: 8 000 wizyt/mies. ≈ 30 000 odsłon (przy 3,7 odsłony
na wizytę po naprawie galerii).

| Strumień | Założenie | Na rynek/mies. |
|---|---|---|
| Reklamy | 30 tys. odsłon × RPM $2–5 | €55–140 |
| Produkty | 8 tys. wizyt × konw. 0,1–0,5% × €9 | €72–360 |
| Lista mailowa | kampanie do ~500 zapisanych | €20–60 |
| **Razem** | | **€150–560** (~650–2 400 zł) |

| | Podłoga (same reklamy) | Z produktami |
|---|---|---|
| 7 rynków | 2 100–5 600 zł | 4 500–16 800 zł |
| 10 rynków | 3 000–8 000 zł | 6 500–24 000 zł |

**Podłoga jest przypadkiem dolnym** — ile zostaje, gdy produkty w ogóle nie wypalą. To scenariusz
akceptowalny, i to jest główny argument za podjęciem ryzyka.

### Trzy rzeczy, przez które to nie jest prognoza

1. **Szacunki mnożone przez szacunki.** RPM $2–5 jest mój. Konwersja 0,1–0,5% pochodzi
   z roadmapy i też jest zgadywana. „8 tys. wizyt na rynek" jest optymistyczne dla Norwegii
   i pesymistyczne dla Holandii.
2. **Nośne założenie nigdy nie było testowane: czy paczki PDF w ogóle się sprzedają.**
   Przy konwersji 0,05% zamiast 0,3% kolumna produktów spada 6× i całość leci poniżej celu.
3. **To jest stan dojrzały.** Każdy rynek potrzebuje 9–18 miesięcy, żeby tam dojść — choć
   przy gotowej bibliotece, kodzie i playbooku to realnie 15–25% pracy włożonej w Polskę.

### Prawdziwy sufit tej strategii: ogon utrzymaniowy

**Kumuluje się:** biblioteka grafik, narzędzia, kolekcje produktowe, wiedza o konwersji.

**Nie kumuluje się:** pozycje, linki, sezonowe treści lokalne, obsługa klienta, rozliczenia,
strony prawne. To wraca co roku, per rynek.

„Mały nakład" razy siedem to nie jest mały nakład. Dlatego **automaty z Etapu 8 przestają być
gadżetem** — przy jednym serwisie monitoring to wygoda, przy siedmiu to warunek wykonalności
obok JDG.

---

## 8. Bramki decyzyjne — kupujemy informację przed zobowiązaniem

Nie ma dziś decyzji o dwóch latach. Są trzy tanie eksperymenty, każdy zabija albo potwierdza
jedno nośne założenie:

| # | Test | Koszt | Odpowiada na | Wynik |
|---|---|---|---|---|
| 1 | Naprawa Grafiki | **zrobione** (PR #162) | czy ruch da się odzyskać bez nowych treści | ~15 IX 2026 |
| 2 | **Paczka na Etsy** | weekend | **czy ktokolwiek to kupi** | ~1 miesiąc |
| 3 | Jeden rynek (NL) | 2–3 tygodnie | realny RPM i tempo indeksacji | ~1 kwartał |

Cztery miesiące rozstrzygają większość niepewności z tego dokumentu.

**Warunek wstępny przed replikacją na wiele domen:** wymiana biblioteki na własne grafiki musi
być domknięta. Jeden nierozstrzygnięty problem licencyjny pomnożony przez siedem domen w pięciu
krajach to inna kategoria sprawy niż ten sam problem na jednym serwisie.

### Do zrobienia od razu

- [ ] Zgłosić `sitemap-images.xml` w GSC → Sitemapy (osobny raport pokrycia = metryka dla testu 1)
- [ ] Aplikować do **Journey by Mediavine** (próg 1 000 sesji, mamy 8 400) — nawet odmowa jest
      wartościowa: powie, jak sieci traktują ruch spoza Tier 1, zanim zbudujemy 7 domen
- [ ] Odezwać się do **Setupadu** o realny RPM dla ruchu PL/SE/NL w niszy dziecięcej —
      to jedyna liczba, której brakuje całemu modelowi
- [ ] Wystawić pakiet „Kim chcę zostać?" na Etsy
- [ ] Konto serwisowe Google Cloud + Search Console API → monitor indeksu (Etap 8)
- [ ] Sprawdzić wymogi rejestracyjne `.no` i `.dk`

---

## 9. Opcja, która też jest poprawna

Można **wziąć małe i przestać inwestować**. Naprawiona Grafika + AdSense + okazjonalna
publikacja to prawdopodobnie kilkaset złotych miesięcznie przy niewielkim nakładzie.

To nie jest porażka — to projekt, który się zwrócił i zamienił w drobny, pasywny strumień.
Ekspansja ma sens tylko wtedy, gdy jest chęć jej budowania. Jeśli po trzech testach okaże się,
że to męczarnia bez sygnału, zatrzymanie się jest decyzją, a nie odpuszczeniem.
