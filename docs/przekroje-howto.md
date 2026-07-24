# Jak stworzyć stronę przekroju tematycznego (Etap 4)

> Przekrój = landing SEO typu `/kolorowanki/latwe-kolorowanki/`, który agreguje kolorowanki
> z różnych kategorii po tagach. Jeden przekrój = jeden plik markdown, zero zmian w kodzie.

## Krok po kroku

1. **Wybierz frazę** (np. „kolorowanki na Mikołajki") i slug URL: `kolorowanki-na-mikolajki`.
2. **Utwórz plik** `content/kolorowanki/<slug>/index.md` (nazwa folderu = URL).
3. **Dobierz tagi** do `tagsFilter` — galeria pokaże wszystkie leafy mające którykolwiek z nich.
   Tagi leafów = slugi ich kategorii/podkategorii (np. `koty`, `mandala`, `kredka`).
   Ile leafów ma dany tag: `grep -rl "^- koty$" content --include=index.md | grep -E "/[0-9]+/" | wc -l`
4. **Napisz copy** (patrz szablon niżej): title, description, 4–6 sekcji `##`, 3–4 FAQ.
5. **Sprawdź**: `pnpm health` (canonical + obrazki), lokalnie `pnpm dev` → `localhost:3000/kolorowanki/<slug>/`.
6. Commit + PR. Po deployu strona sama trafia do sitemapy i jako kafelek na hub `/kolorowanki/`.

## Co się dzieje automatycznie

- trasa + prerender (build skanuje `content/`),
- wpis w sitemapie (URL-e bez cyfry na końcu są włączane),
- kafelek na `/kolorowanki/` (z pola `image`),
- JSON-LD FAQ z pola `faqs`,
- galeria aktualizuje się sama, gdy dochodzą nowe kolorowanki z pasującym tagiem.

## Szablon pliku

```markdown
---
title:          "FRAZA GŁÓWNA – dopełnienie z korzyścią | do druku PDF"
description:    "1–2 zdania z frazą główną i zachętą. Max ~155 znaków."
categoryName:   "Nazwa przekroju"
canonical:      "/kolorowanki/SLUG/"
tags:           [ kolorowanki, slug-frazy, pdf ]
tagsFilter:     [ tag1, tag2, tag3 ]
alt: 'fraza główna'
h1First: Kolorowanki
h1Sec:  reszta nagłówka
heroImg1: "/sciezka/do/istniejacego-1.svg"
heroImg2: "/sciezka/do/istniejacego-2.svg"
image:          "/sciezka/do/istniejacego-1.svg"
keywords:       "fraza główna, wariant frazy, trzeci wariant"
robots:         "index, follow"
schemaType:     "CollectionPage"
faqs:
  - question: "Pytanie, które realnie zadaje rodzic/nauczyciel?"
    answer: "Konkretna, pomocna odpowiedź 2–3 zdania."
  - question: "..."
    answer: "..."
---
## H2 z frazą główną – obietnica wartości
Akapit wprowadzający: co tu jest, dla kogo, dlaczego warto. Fraza główna naturalnie, bez upychania.

## H2 tematyczne (rozwój dziecka / okazja / poradnik)
Treść merytoryczna — sekcje mają być pomocne, nie tylko „pod SEO".

## Co znajdziesz w zestawie? (opcjonalnie kolorowa lista)
<ul class="grid grid-cols-1 mb-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3 text-center text-base md:text-lg font-light max-w-5xl mx-auto"> <li class="bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-orange-500">punkt 1</li> <li class="bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-sec-500">punkt 2</li> </ul>

## H2 z CTA – pobierz / wydrukuj
Zamknięcie z wezwaniem do działania i informacją o darmowych PDF A4.
```

## Zasady

- **Sezonowe publikować 2–3 miesiące przed pikiem** (Mikołajki → wrzesień/październik).
- Fraza w: title (na początku), description, H1, pierwszym H2, min. 1 FAQ — naturalnie.
- `heroImg1/2` i `image` muszą wskazywać ISTNIEJĄCE pliki SVG (health-check to wyłapie).
- Unikalne copy per przekrój — żadnego kopiowania sekcji między stronami.
- Zmiana sluga po publikacji = redirect 301 w `netlify.toml`.

## Dotychczasowe przekroje (2026-07-24)

| URL | tagsFilter |
|---|---|
| /kolorowanki/latwe-kolorowanki/ | serce, dom, mis, zabki, jablka, lody |
| /kolorowanki/kolorowanki-dla-3-latka/ | serce, dom, mis, zabki, jablka |
| /kolorowanki/kolorowanki-dla-5-latka/ | koty, pieski, dinozaury, samochody, jednorozce, syrenki |
| /kolorowanki/kolorowanki-do-wydruku-a4/ | koty, pieski, jednorozce, mandala, samochody, dinozaury, smoki, motyle |
| /kolorowanki/pierwszy-dzien-szkoly/ | kredka, wedlug-kodu, znaki-drogowe |
