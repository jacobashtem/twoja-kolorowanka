---
name: kategoria-kolorowanek
description: Pelny pipeline wymiany kategorii kolorowanek na wlasne, generowane przez Recraft - od napisania promptow, przez generowanie i selekcje, po podmiane plikow w public/ i przetagowanie. Uzyj gdy uzytkownik prosi o zrobienie, wygenerowanie, dogranie albo podmiane kategorii kolorowanek (np. "zrob kategorie kotki", "wygeneruj 32 traktory", "podmien dinozaury"), albo gdy pyta o style, prompty czy koszty generowania grafik.
---

# Kategoria kolorowanek: od promptu do podmiany

Migracja biblioteki z licencjonowanego stocka na własne grafiki z Recrafta.
76 kategorii, ~4200 kolorowanek.

**Pełny cykl przeszło dwanaście kategorii** (stan 2026-08-22): dinozaury, jaszczurki,
jednorożce, kombajny, koniki, koty, króliczki, motyle, pieski, smoki, syrenki, wróżki —
razem 662 liście. Sprawdzone plik po pliku, nie na słowo: w żadnym z nich nie ma grupy `<g>`,
podczas gdy każdy plik ze stocka ma ich od kilkudziesięciu w górę. W całym `public/` zostały
**cztery** pliki ze znacznikiem Freepika: `pory-roku/zima/44`, `pory-roku/zima/10`,
`zwierzeta/mis/44`, `pojazdy/samochody/34`.

**Jak sprawdzić pochodzenie pliku** (przydaje się przy pytaniu „czy ta kategoria jest już
nasza"): grupy `<g>` znaczą stock, ich brak — nasz potrace albo wektoryzator Recrafta.
Sam `<defs>` z gradientem NIE jest oznaką stocka; to podpis wektoryzatora Recrafta i łatwo
się na tym pomylić.

```
grep -c '<g[ >]' public/<sciezka>/<n>/<plik>.svg     # 0 = nasze, >0 = ze stocka
```

**Zasady niepodlegające negocjacji:**

1. **Każde wywołanie API kosztuje pieniądze.** Przed serią większą niż ~10 sztuk podaj koszt
   i saldo, i upewnij się, że użytkownik chce ją puścić. Po serii raportuj zużycie.
2. **Nie wektoryzuj przed selekcją.** Użytkownik wybiera, co zostaje; płacimy tylko za to.
3. **Nie wybieraj stylu za użytkownika.** Pokaż materiał, podaj rekomendację z uzasadnieniem,
   ale decyzja jest jego. Moja ocena rozminęła się z jego dwukrotnie.

## Zanim zaczniesz

```
node scripts/stat-kategorie.mjs
```

Daje: liczbę liści kategorii, wymagane minimum (sekcje H2 × 4 — poniżej tego ostatnie sekcje
SEO mają nagłówek i **pustą galerię**), stan księgi promptów i koszt przy obu stawkach.
Cel domyślny to **32 sztuki na kategorię**; sześć kategorii z 9 sekcjami H2 potrzebuje 36.

## Faza 0 — jak nazwać kategorię (przy nowej, przed pisaniem tytułu)

**Polska odmiana potrafi przenieść cały ruch na inną formę słowa i to nie jest drobiazg.**
Zmierzone 2026-08-21 na trzech kategoriach z rzędu:

| Tytuł kategorii celuje w | Zmierzony wolumen | Co naprawdę wygrywa | Wolumen |
|---|---|---|---|
| kolorowanki pandy | **0** | kolorowanka panda | **745** |
| kolorowanki ryby | 149 | rybki kolorowanka | **670** |
| kolorowanki koty | mniejszy koszyk | kotek / kotki | większy koszyk |

Wzór jest ten sam: kategorie nazwano poprawną polszczyzną w liczbie mnogiej, a ludzie szukają
w pojedynczej albo w zdrobnieniu. Przy pandach potwierdza to Search Console — „panda
kolorowanka do druku" ma 34 kliknięcia, „kolorowanki pandy" siedem.

Zanim napiszesz `title` i `H1` nowej kategorii, sprawdź, który zapis niesie ruch:

```
node scripts/dfs/frazy.mjs --tryb warianty --zestaw <kategoria> --seed "<slowo>"
```

Buduje wszystkie odmiany i szyki, mierzy je jednym zapytaniem (~$0,03) i pokazuje zwycięzcę.
**Patrz na kolumnę źródła:** wartości z koszyka Google Ads są górną granicą całej grupy
wariantów, a nie pomiarem jednej frazy — porównywalne są tylko te ze strumienia kliknięć.

Adresu istniejącej kategorii NIE zmieniaj z tego powodu. Przy stronie z tysiącami wyświetleń
tracisz historię adresu, a zyskujesz odmianę słowa, którą można dopisać do tytułu za darmo.

## Faza 1 — prompty

Zasady i uzasadnienia: **`docs/ksiega-promptow.md`**. Przeczytaj przed pisaniem wariantów.
Rejestr: `prompty/kategorie.mjs`, pule scen: `prompty/sceny.mjs`.

Dwie osie, prompt to `{wariant}, {scena}` i ani słowa więcej:

- `warianty` — 12 pozycji. **Test: czy widać różnicę w samym obrysie?** Rasy tak, ale tylko
  gdy zmieniają sylwetkę (jamnik kontra buldog — tak; pers kontra syjam — nie, to samo ciało,
  a model dorysuje umaszczenie i zaczerni łaty).
- `sceny` — 6 pozycji, z puli wspólnej dla grupy. **Pula ma wbudowany podmiot** — sceny
  zwierzęce zawierają czasowniki ruchu, więc grzyb w puli `las` będzie „chodził". Dla rzeczy
  nieruchomych: `przedmiot`, `runo`, `ulica`, `tory`, `brzeg`, `krajobraz`.

**Pułapka sąsiedniego obiektu:** model podmienia obiekt na pokrewny, jeśli prompt zawiera
słowo należące do tamtego. Kombajny wyszły jako traktory przez `chimney pipe`,
`towing a trailer` i `oversized rear wheels`. Zakotwicz się na cesze, której nie ma żaden
kuzyn (przy kombajnie: heder). Zadaj sobie pytanie: *co jest najbliższym krewnym tego obiektu
i jakie słowo go przywoła?*

Zawsze `--dry-run` i przeczytanie promptów oczami przed wydaniem kredytów.

## Faza 2 — styl (tylko przy nowym typie tematu)

Sprawdzone ID stylów i werdykty są w pamięci projektu — plik `pipeline-generowania-kolorowanek`
(model `recraftv3_vector` + styl „Line art", pułapka niezgodności modelu ze stylem, koszty).
Reguła doboru serii: plik `seria-48-wszystkie-style`. Jeśli temat jest nowego rodzaju,
puść pilota: 3 sztuki na styl, **te same prompty** (`--od=0 --krok=13`), potem
`contact-sheet.mjs` i obejrzyj arkusze.

**Diagnostyka:** sztuka zła w jednym stylu = wina stylu. Zła w kilku naraz = **wina promptu**.

## Faza 3 — generowanie

```
node scripts/lineart-generate.mjs <kategoria> --model=v3 --model-id=recraftv3 \
  --count=40 --goly --krok=13 --od=0 --style-id=<UUID> --nazwa=<styl>
```

- `--krok=13` przesuwa obie osie naraz; `--od=N` przesuwa punkt startu, więc różne serie
  dostają różne kombinacje zamiast trzeciej kopii tego samego pomysłu
- `--goly` = sam temat i scena, bez negatywu i controls (formuła, która zadziałała)
- Styl rastrowy z panelu **wymaga** `--model-id=recraftv3`; z modelem `*_vector` API po cichu
  produkuje zdegradowany wynik zamiast błędu
- Generuj z zapasem (~25%), część odpadnie

## Faza 4 — selekcja (STOP i czekaj)

```
node scripts/validate-lineart.mjs lineart-work/<kategoria>
node scripts/galeria.mjs lineart-work/<kategoria> --wybor --sort=trudnosc --kolumny=5 --serwer
```

**`--serwer` jest ważne.** Bez niego strona idzie z `file://`, czyli NIE MOŻE nic zapisać —
listę trzeba przeklejać ze schowka. Z nim galeria stoi na `localhost:4321` i zaznaczenia
lądują same w `lineart-work/<kategoria>/_wybor.txt`, sekundę po ostatnim kliknięciu.
Wcześniejszy `_wybor.txt` wraca jako stan początkowy, więc selekcję można przerwać
i dokończyć innego dnia.

Do przejścia wielu kategorii naraz jest **panel**: `start.cmd` w katalogu głównym
(albo `node scripts/panel-selekcji.mjs`). Pokazuje wszystkie kategorie z katalogu roboczego
ze statusem — do selekcji → wybrane → podmieniona → na produkcji — i wchodzi w galerię
każdej z nich pod tym samym adresem. Materiał kategorii, które są już na `origin/main`,
kasuje przy starcie; `_wybor.txt` zostaje zawsze.

**Uwaga: samo zajrzenie do panelu kasuje materiał roboczy** kategorii będących na produkcji.
Jeśli chcesz tylko sprawdzić stan, użyj wariantu, który niczego nie rusza i nie podnosi serwera:

```
node scripts/panel-selekcji.mjs --raport          # tekstowy stan wszystkich kategorii
node scripts/panel-selekcji.mjs --bez-sprzatania  # panel, ale bez kasowania
```

Walidator daje trzy niezależne profile: **druk** (podstawa biblioteki), **online** (flood fill,
u nas dodatek), **maluchy** (gruba kreska). Zapisuje `_walidacja.json`, a galeria pokazuje
werdykt i powód odrzutu na kafelku, plus lupę do powiększenia.

**Walidator nie widzi gęstego kreskowania** — przepuszczał drzeworyty i konie w całości czarne.
Zielona plakietka nie jest rekomendacją. Decyzja zapada z galerii, nie z tabelki.

Zapisz wybór użytkownika do `lineart-work/<kategoria>/_wybor.txt`, jedna ścieżka na linię.

## Faza 5 — wektoryzacja wybranych

```
node scripts/recraft-wektoryzuj.mjs --lista=lineart-work/<kategoria>/_wybor.txt \
  --baza=lineart-work/<kategoria>
```

Pomija pliki już będące SVG (natywny wektor z modeli `*_vector` — wysłanie ich to wyrzucone
10 units za sztukę) i liczy katalog wyjściowy per plik. PDF-y dla natywnych SVG robi
`lineart-postprocess.mjs` lokalnie i za darmo — ale przerabia CAŁY katalog, więc dorzuci
też odrzuty; posprzątaj je.

## Faza 6 — podmiana i trzy kroki po niej

```
node scripts/podmien-kategorie.mjs <sciezka/kategorii> --lista=... --baza=...            # dry-run
node scripts/podmien-kategorie.mjs <sciezka/kategorii> --lista=... --baza=... --zapisz
```

**Kolejność dalszych kroków ma znaczenie. Pominięcie któregokolwiek zostawia stronę, która
wygląda na działającą, a pokazuje stare obrazki albo kłamie kolejnością:**

```
node scripts/generate-thumbnails.mjs     # każdy liść ma też -thumb.webp (400px) i -view.webp (800px)
node scripts/tag-difficulty.mjs --write  # tagi trudnosc-N pod NOWE rysunki
node scripts/health-check.mjs
```

Strona sortuje galerię kategorii po tagu `trudnosc-N` (`byTrudnosc` w `pages/[...slug].vue`),
więc bez przetagowania kolejność będzie kłamać.

Wybór jest zwykle mniejszy niż stara kategoria, więc nadmiar liści zostaje z grafikami
z Freepika — `podmien-kategorie.mjs` celowo ich nie rusza, tylko o nich mówi. Do usunięcia
jest osobny skrypt (dry-run domyślnie, `--zapisz` wykonuje):

```
node scripts/usun-nadmiarowe-liscie.mjs <sciezka/kategorii> --lista=lineart-work/<kategoria>/_wybor.txt --zapisz
```

Kasuje z `content/` **i** z `public/` naraz (4 pliki na liść, razem z miniaturami, których
nie ma we frontmatterze) i odmawia, gdyby kategoria zeszła poniżej progu `sekcje H2 × 4`.
Potem `pnpm build` odtworzy `prerender-routes.json`. Wszystko jest w gicie, więc odwracalne.

## Rzeczy, które łatwo zrobić źle

- **Ścieżek w `public/` nie da się zgadnąć z nazwy kategorii.** Cztery kategorie (koty, koniki,
  kroliczki, pieski) leżą w `public/` bez `zwierzeta/`. Zawsze czytaj pole `image:` z index.md
  danego liścia — zgadywanie wyprodukowało kiedyś fałszywy alarm o 304 martwych liściach.
- **Nazwa katalogu roboczego NIE jest unikalna.** `lineart-work/<nazwa>` to ostatni segment
  klucza z księgi promptów, a dwie pary kluczy kończą się tak samo: `fantasy/jednorozce`
  z `dla-doroslych/jednorozce` oraz `zwierzeta/myszki` z `myszki`. Mapowanie „segment →
  kategoria" pokazało kiedyś stan zupełnie innej kategorii. Do skryptów podawaj PEŁNĄ ścieżkę
  kategorii, a przy wyprowadzaniu jej z nazwy katalogu sprawdź, czy kandydat jest jeden.
- **Waga SVG >500 KB** to sygnał, że to styl cieniowany, a nie kolorowanka. Wydajnościowo
  prawie nie boli (strona serwuje webp; pełny SVG idzie tylko do edytora `/koloruj/`), ale
  boli rozmiar repo i szybkość flood filla.
- **`--dry-run` pokazuje cenę modelu z `--model=`**, nie z nadpisanego `--model-id=`, więc
  przy stylach rastrowych zawyża koszt dwukrotnie.
- Identyfikatory modeli mają podkreślniki (`recraftv4_1_vector`), nie kropki.
- Modele wektorowe przyjmują proporcje (`10:14`), nie piksele. Wygenerowane URL-e żyją ~24h,
  więc pliki trzeba pobrać od razu.
- Limity: 100 obrazków/min, 5 zapytań/s. Przy trzech równoległych lecą 429 — generator ponawia.
