# Kolejność wymiany kategorii na własne grafiki

> Decyzja Jakuba (2026-08-02): **bierzemy się najpierw za kategorie najpopularniejsze**,
> a nie za największe czy najłatwiejsze. Podstawa: wejścia z ostatniego tygodnia.
> Stan wyjściowy: 10 kategorii zrobionych, **66 do zrobienia (3644 liście)**.

## Dane wejściowe (wejścia, ostatni tydzień)

| strona | wejścia | co to jest |
|---|---|---|
| `/dla-dziewczynek/` | 200 | **przekrój po tagach**, zero własnych liści |
| `/dla-chlopcow/` | 152 | **przekrój po tagach**, zero własnych liści |
| `/dla-doroslych/po-numerach/` | 92 | kategoria, 50 liści, Freepik |
| `/dla-doroslych/` | 90 | hub (4 podkategorie), zero własnych liści |
| `/pojazdy/kombajny/` | 89 | ✅ własne (46) |
| `/zwierzeta/koty` | 78 | ✅ własne (84) |
| `/search` | 65 | wyszukiwarka, nie kategoria |
| `/fantasy/jednorozce` | 56 | ✅ własne (44) |
| `/dla-doroslych/mandala` + `/mandala/` | 42 + 40 = **82** | kategoria, 75 liści, Freepik |
| `/jedzenie/lody/` | 42 | kategoria, 52 liście, Freepik |
| `/fantasy/syrenki/` | 40 | kategoria, 50 liści, Freepik |
| `/pojazdy/traktory/` | 38 | kategoria, 63 liście, Freepik |
| `/fantasy/wrozki/` | (ucięte) | ✅ własne (54) |

**Dwa zastrzeżenia do tych liczb, zanim się na nich oprzemy:**

1. **Ukośnik na końcu rozbija pomiar.** `/dla-doroslych/mandala` i `/dla-doroslych/mandala/`
   są liczone jako dwie strony — to jedna strona i realnie ma 82 wejścia, nie 42. Pozycje
   podane bez ukośnika (`/zwierzeta/koty` 78, `/fantasy/jednorozce` 56) prawdopodobnie mają
   swoje bliźniaki poza uciętą listą, więc ich prawdziwe liczby są **wyższe**. Do sprawdzenia
   osobno — jeśli obie wersje URL-a zwracają 200, to nie tylko psuje statystyki, ale i dzieli
   sygnał SEO.
2. Lista jest ucięta na `/fantasy/wrozki/` (brak liczby).

## Kluczowe ustalenie: dwie najpopularniejsze strony nie mają własnych kolorowanek

`/dla-dziewczynek/` (200) i `/dla-chlopcow/` (152) to **41% ruchu z powyższej listy** i obie
mają zero własnych liści — zaciągają kolorowanki z innych kategorii przez `tagsFilter`:

```
/dla-dziewczynek/  →  fantasy, zwierzeta, rosliny
/dla-chlopcow/     →  pojazdy, smoki, zwierzeta
```

Nie da się więc „zrobić kategorii dla dziewczynek". **Poprawia się ją wymieniając źródła.**
Aktualne pokrycie tych źródeł własnymi grafikami:

| tag | liści | własnych | pokrycie | zasila |
|---|---|---|---|---|
| `fantasy` | 235 | 142 | **60%** | dziewczynki, chłopcy |
| `zwierzeta` | 1627 | 373 | **23%** | dziewczynki, chłopcy |
| `pojazdy` | 777 | 46 | **6%** | chłopcy |
| `rosliny` | 226 | 0 | **0%** | dziewczynki |

`pojazdy` (6%) i `rosliny` (0%) to najsłabsze ogniwa. Każda wymieniona kategoria pojazdów
podnosi jednocześnie `/dla-chlopcow/` i własny landing — to jedyne miejsce, gdzie jedna
robota liczy się podwójnie.

## Kolejka

### Tura 1 — ruch + prompty już napisane (zero pisania, od razu generowanie)

Te sześć kategorii ma gotowe warianty w `prompty/kategorie.mjs`, więc wchodzi się od razu
w Fazę 3. Koszt: ok. $0,08/szt. generowania + $0,01/szt. wektoryzacji.

| # | kategoria | liści | dlaczego teraz |
|---|---|---|---|
| 1 | `dla-doroslych/mandala` | 75 | **82 wejścia** — najpopularniejsza kategoria wciąż na Freepiku, a prompty gotowe |
| 2 | `pojazdy/samochody` | 84 | największa pozycja w `pojazdy` (6% pokrycia); podnosi `/dla-chlopcow/` |
| 3 | `zwierzeta/motyle` | 91 | największa gotowa; podnosi `/dla-dziewczynek/` |
| 4 | `pojazdy/koparki` | 68 | dalej dobija `pojazdy` |
| 5 | `zwierzeta/ryby` | 56 | |
| 6 | `zwierzeta/lisy` | 55 | |

Razem 429 liści. Po tej turze `pojazdy` skacze z 6% na ~26%, `zwierzeta` z 23% na ~35%.

### Tura 2 — ruch jest, prompty do napisania

| kategoria | liści | wejścia | uwaga |
|---|---|---|---|
| `fantasy/syrenki` | 50 | 40 | domyka `fantasy` do ~81%; ostatnia duża dziura w tagu, który już jest najlepiej pokryty |
| `jedzenie/lody` | 52 | 42 | |
| `pojazdy/traktory` | 63 | 38 | pułapka sąsiedniego obiektu: traktor kontra kombajn — kotwicą kombajnu był heder, traktor musi dostać własną |
| `rosliny/kwiat` | 76 | — | jedyne źródło tagu `rosliny` dla `/dla-dziewczynek/`, dziś 0% |

### Tura 3 — największe pozostałe

`pojazdy/samoloty` (99), `pory-roku/lato` (99), `pojazdy/pociagi` (80), `pory-roku/zima` (79),
`pory-roku/jesien` (75), `zwierzeta/ptaki` (67).

**Sezonowe mają termin.** Zgodnie z zasadą z ROADMAP-y (publikacja 2–3 miesiące przed
pikiem) `pory-roku/jesien` i `pory-roku/zima` trzeba zrobić **do września/października**,
inaczej wymiana trafi w sam pik i nie ma sensu jej wtedy ruszać.

## Osobny problem: `/dla-doroslych/po-numerach/` (92 wejścia)

Trzecia najpopularniejsza strona serwisu i **nie da się jej zrobić dotychczasowym
pipeline'em**. Kolorowanie po numerach to nie jest line art — to obrazek z ponumerowanymi
obszarami i legendą kolorów. Recraft w stylu „Line art" tego nie wyprodukuje: numery
wychodzą jako ozdobne kleksy, a obszary nie są zamknięte.

Do rozstrzygnięcia osobno, są trzy drogi:
- wygenerować czysty line art i **dorysować numerację programowo** (mamy już SVG i liczenie
  obszarów w `validate-lineart.mjs` — profil „online" sprawdza właśnie zamknięte regiony);
- zostawić na Freepiku do końca i wymienić jako ostatnią;
- odpuścić kategorię.

To samo dotyczy `wedlug-kodu` (50 liści) i częściowo `dla-doroslych/antystresowe` (57).

## Czego NIE robić

- **Nie brać się za `dla-dziewczynek` / `dla-chlopcow` / `dla-doroslych` jako kategorie** —
  nie mają własnych plików, poprawia je wyłącznie wymiana źródeł.
- **Nie sugerować się nazwą katalogu roboczego.** `dla-doroslych/jednorozce` (50 liści) to
  OSOBNA kategoria od zrobionej `fantasy/jednorozce`, a `myszki` (49) od `zwierzeta/myszki`.
  Obie pary mają ten sam ostatni segment ścieżki i obie łatwo uznać za już zrobione.
- **Nie schodzić poniżej progu `sekcje H2 × 4`** — `usun-nadmiarowe-liscie.mjs` pilnuje tego
  sam i odmawia bez `--mimo-progu`.

## Jak odświeżyć te liczby

```
node scripts/stat-kategorie.mjs      # postęp migracji, progi, koszty
start.cmd                            # panel: co czeka na selekcję
```
