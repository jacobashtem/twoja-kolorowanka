# Start — produkcja kolorowanek

Ten dokument jest dla Claude'a pracującego z Delfiną. Przeczytaj go w całości, zanim
cokolwiek zrobisz — potem będziesz wiedział, czym się zająć, bez pytania o to Delfiny.

## Kto co robi

**Delfina prowadzi produkcję kolorowanek.** Cały cykl: prompty → generowanie w Recrafcie →
selekcja → wektoryzacja → podmiana w `public/` → przetagowanie → PR. To jest jej obszar
i nikt inny w nim nie pracuje.

**Jakub prowadzi SEO, panel i monitoring** w osobnej sesji. Zakładka fraz, monitoring
indeksacji, sitemapa, canonicale, teksty na kategoriach — nie ruszaj tego. Jeśli zauważysz
tam coś zepsutego, powiedz o tym Delfinie, żeby przekazała dalej, ale nie naprawiaj sam.

Podział jest po katalogach, więc łatwo go trzymać:

| Obszar Delfiny | Obszar Jakuba |
|---|---|
| `lineart-work/` | `netlify/functions/panel-*` |
| `prompty/` | `netlify/wspolne/` |
| `public/<kategorie>` | `scripts/dfs/` |
| `scripts/lineart-*`, `podmien-kategorie`, `recraft-*` | `scripts/gsc-index-check.mjs` |
| `content/<kategoria>/index.md` — pole `image:` i liście | `content/**` — tytuły, opisy, FAQ, SEO |

## Co przeczytać, w tej kolejności

1. **`CLAUDE.md`** w katalogu głównym — konwencje całego repo. Zwłaszcza akapit o tym, że
   ścieżek w `public/` nie da się wyprowadzić z nazwy kategorii.
2. **Skill `kategoria-kolorowanek`** (`.claude/skills/kategoria-kolorowanek/SKILL.md`) —
   pełny pipeline, sześć faz, plus lista rzeczy, które łatwo zrobić źle. Wywołuje się sam
   przy zadaniach o kolorowankach, ale przeczytaj go raz świadomie na początku.
3. **`docs/ksiega-promptow.md`** — zasady pisania promptów wraz z uzasadnieniem każdej.
   Bez tego prompty wychodzą poprawne gramatycznie i bezużyteczne w praktyce.
4. **Pamięć projektu** — patrz sekcja niżej. Bez niej nie wiesz, którego modelu Recrafta
   używać ani dlaczego akurat tego.

## Pamięć projektu — musi trafić na dysk osobno

Notatki z dotychczasowej pracy **nie leżą w repo**. To dziewięć plików `.md`, które Jakub
przekazuje osobno — ustalenia empiryczne, których nie ma w kodzie: który model i styl
Recrafta działa, ile sztuk generować, jakie są pułapki API, dlaczego w ogóle odchodzimy
od stocka.

Wgraj je do katalogu pamięci projektu na tej maszynie, obok pliku `MEMORY.md`. Jeśli nie
wiesz, gdzie on jest, zapytaj Delfinę o plik `MEMORY.md` — pakiet zawiera instrukcję.

**Nie zaczynaj generowania bez tych plików.** Bez nich powtórzysz błędy, które kosztowały
pół dnia i realne pieniądze.

## Konfiguracja maszyny

```
git clone <repo>
pnpm install
```

Skopiuj `.env.example` do `.env` i uzupełnij. Do produkcji kolorowanek potrzebny jest
wyłącznie **`RECRAFT_API_TOKEN`** — reszta kluczy dotyczy obszaru Jakuba i może zostać pusta.

Klucz Recrafta jest **wspólny, na budżecie Jakuba**. To znaczy dwie rzeczy:

- każde wywołanie wydaje jego pieniądze, więc przed serią większą niż ~10 sztuk podaj koszt
  i saldo, i poczekaj na potwierdzenie;
- po serii raportuj zużycie, żeby dało się to rozliczyć.

Sprawdzenie, czy wszystko działa:

```
node scripts/stat-kategorie.mjs             # ile kategorii, ile liści, postęp migracji
node scripts/panel-selekcji.mjs --raport    # stan katalogu roboczego, nic nie kasuje
node scripts/health-check.mjs               # spójność content ↔ public
```

## Stan na 2026-08-22

**Zamknięte, w stu procentach własne grafiki (12 kategorii, 662 liście):**
dinozaury · jaszczurki · jednorożce · kombajny · koniki · koty · króliczki · motyle ·
pieski · smoki · syrenki · wróżki

**W katalogu roboczym czeka:**

| Kategoria | Stan |
|---|---|
| elfy, księżniczki, rycerze | wygenerowane, czekają na selekcję (po 10 szt.) |
| zawody-2 | wygenerowane, czeka na selekcję (42 szt.) |
| pakiet-zawody | **50 wybranych**, do wektoryzacji i podmiany |
| zawody | **15 wybranych**, do wektoryzacji i podmiany |
| pakiet-fantasy | **8 wybranych**, do wektoryzacji i podmiany |
| mandala | **2 wybrane**, do wektoryzacji i podmiany |
| magiczne-krainy | katalog pusty, generowanie było przerwane |

Najkrótsza droga do widocznego efektu to cztery kategorie „wybrane" — praca człowieka jest
tam już zrobiona, zostały same komendy.

**W `public/` zostały cztery pliki ze stocka:** `pory-roku/zima/44`, `pory-roku/zima/10`,
`zwierzeta/mis/44`, `pojazdy/samochody/34`. Wszystkie w kategoriach jeszcze niezmigrowanych.

## Trzy zasady, których nie negocjujemy

1. **Nie wektoryzuj przed selekcją.** Płacimy tylko za to, co wybrane.
2. **Nie wybieraj stylu za człowieka.** Pokaż materiał, podaj rekomendację z uzasadnieniem,
   ale decyzja należy do Delfiny. Ocena Claude'a rozminęła się z ludzką już dwukrotnie.
3. **Każde wywołanie API kosztuje.** Zawsze `--dry-run` przed serią.

## Jak oddajesz pracę

Repo jest **publiczne**. Nie wrzucaj do niego kluczy, danych osobowych ani plików
z certyfikatami licencyjnymi.

Gałąź, PR, merge od razu — nikt nie recenzuje w GitHubie, a czekanie rozjeżdża gałęzie.
Szczegóły workflow są w pamięci projektu (`pr-otwierac-i-mergowac`, `windows-github-workflow`).

Po podmianie kategorii **kolejność kroków ma znaczenie** i jest opisana w skillu, faza 6.
Pominięcie któregokolwiek zostawia stronę, która wygląda na działającą, a pokazuje stare
obrazki albo kłamie kolejnością.
