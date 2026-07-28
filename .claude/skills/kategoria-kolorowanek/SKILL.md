---
name: kategoria-kolorowanek
description: Pelny pipeline wymiany kategorii kolorowanek na wlasne, generowane przez Recraft - od napisania promptow, przez generowanie i selekcje, po podmiane plikow w public/ i przetagowanie. Uzyj gdy uzytkownik prosi o zrobienie, wygenerowanie, dogranie albo podmiane kategorii kolorowanek (np. "zrob kategorie kotki", "wygeneruj 32 traktory", "podmien dinozaury"), albo gdy pyta o style, prompty czy koszty generowania grafik.
---

# Kategoria kolorowanek: od promptu do podmiany

Migracja biblioteki z licencjonowanego stocka na własne grafiki z Recrafta.
75 kategorii, ~4400 kolorowanek. Pipeline przeszedł pełny cykl na `zwierzeta/dinozaury`
(39 sztuk, 2026-07-28) — kolejne kategorie idą tą samą ścieżką.

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

Sprawdzone ID stylów i werdykty są w pamięci projektu. Jeśli temat jest nowego rodzaju,
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
node scripts/galeria.mjs lineart-work/<kategoria> --wybor --sort=trudnosc --kolumny=5
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

Jeśli usuwasz stare liście — usuń je z `content/` **i** z `public/` (4 pliki na liść),
potem `pnpm build` odtworzy `prerender-routes.json`. Wszystko jest w gicie, więc odwracalne.

## Rzeczy, które łatwo zrobić źle

- **Ścieżek w `public/` nie da się zgadnąć z nazwy kategorii.** Cztery kategorie (koty, koniki,
  kroliczki, pieski) leżą w `public/` bez `zwierzeta/`. Zawsze czytaj pole `image:` z index.md
  danego liścia — zgadywanie wyprodukowało kiedyś fałszywy alarm o 304 martwych liściach.
- **Waga SVG >500 KB** to sygnał, że to styl cieniowany, a nie kolorowanka. Wydajnościowo
  prawie nie boli (strona serwuje webp; pełny SVG idzie tylko do edytora `/koloruj/`), ale
  boli rozmiar repo i szybkość flood filla.
- **`--dry-run` pokazuje cenę modelu z `--model=`**, nie z nadpisanego `--model-id=`, więc
  przy stylach rastrowych zawyża koszt dwukrotnie.
- Identyfikatory modeli mają podkreślniki (`recraftv4_1_vector`), nie kropki.
- Modele wektorowe przyjmują proporcje (`10:14`), nie piksele. Wygenerowane URL-e żyją ~24h,
  więc pliki trzeba pobrać od razu.
- Limity: 100 obrazków/min, 5 zapytań/s. Przy trzech równoległych lecą 429 — generator ponawia.
