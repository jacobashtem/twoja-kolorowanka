# Twoja Kolorowanka

Nuxt 3 (SSG, `nuxt generate`) + @nuxt/content. Serwis z kolorowankami do druku i do
kolorowania online. Język projektu i komentarzy w kodzie: **polski**.

## Gdzie co leży

| Ścieżka | Co to |
|---|---|
| `content/**/index.md` | strony. Katalog o nazwie liczbowej = **liść**, czyli jedna kolorowanka |
| `public/**` | pliki kolorowanek: `.svg`, `.pdf`, `-thumb.webp` (400px), `-view.webp` (800px) |
| `pages/[...slug].vue` | jeden szablon na wszystko: huby, kategorie i liście |
| `prompty/` | rejestr 75 kategorii (`kategorie.mjs`) i pule scen (`sceny.mjs`) do generowania |
| `scripts/` | narzędzia pipeline'u grafik + `health-check.mjs` |
| `docs/ksiega-promptow.md` | zasady pisania promptów, z uzasadnieniem każdej |
| `lineart-work/` | katalog roboczy generowania, w `.gitignore` |

## Konwencje, które łatwo złamać

- **Ścieżki w `public/` NIE dają się wyprowadzić z nazwy kategorii.** Cztery kategorie
  (koty, koniki, kroliczki, pieski) leżą w `public/` bez przedrostka `zwierzeta/`.
  Jedynym wiarygodnym źródłem jest pole `image:` we frontmatterze liścia.
- **Trudność jest mierzona, nie deklarowana.** `scripts/tag-difficulty.mjs` liczy złożoność
  SVG i dopisuje tag `trudnosc-N` (1–10). Progi są skalibrowane na całym korpusie —
  nie zmieniać bez rekalibracji. Galeria kategorii sortuje się po tym tagu.
- **Liczba kolorowanek w kategorii ma twardy próg.** Strona wplata po `KAFLI_NA_SEKCJE` (4)
  kafelków pod każdą sekcją H2, więc kategoria potrzebuje minimum `sekcje × 4` sztuk.
  Poniżej tego ostatnie sekcje mają nagłówek i pustą galerię pod spodem.
- Zmiana obrazka w `public/` wymaga przegenerowania miniatur — strona serwuje `.webp`,
  a pełny SVG idzie tylko do edytora `/koloruj/`.

## Komendy

```
pnpm dev                        # serwer deweloperski
pnpm build                      # trasy + brakujące miniatury + generate + kontrola builda
node scripts/health-check.mjs   # spójność content ↔ public, puste SVG, brakujące pliki
node scripts/stat-kategorie.mjs # ile kategorii, ile liści, postęp migracji, koszty
```

## Wymiana biblioteki grafik

Trwa migracja z licencjonowanego stocka na własne grafiki generowane przez Recrafta.
Cały pipeline — prompty, generowanie, selekcja, wektoryzacja, podmiana — opisuje skill
**`kategoria-kolorowanek`**; wywołuje się sam przy zadaniach dotyczących kolorowanek.
Nie odtwarzaj tych kroków z pamięci, bo kolejność ma znaczenie.

Klucze API w `.env` (w `.gitignore`), wzór w `.env.example`. **Nigdy nie wklejaj klucza
do czatu ani do commita.**
