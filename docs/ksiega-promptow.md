# Księga promptów

Jak pisać prompty do 75 kategorii tak, żeby wychodziły kolorowanki, a nie ilustracje.
Wszystko poniżej jest wyprowadzone z serii, które faktycznie wygenerowaliśmy — każda
zasada ma za sobą konkretną porażkę.

- **Rejestr kategorii:** `prompty/kategorie.mjs`
- **Pule scen:** `prompty/sceny.mjs`
- **Postęp:** `node scripts/stat-kategorie.mjs`

---

## 1. Dwie osie i nic więcej

Każda kategoria tematyczna ma dokładnie dwie osie, które generator krzyżuje automatycznie:

| Oś | Ile | Co opisuje |
|---|---|---|
| `warianty` | 12 | **CO** to jest — cecha widoczna w obrysie |
| `sceny` | 6 | **GDZIE i CO robi** — świat wokół |

Prompt to `{wariant}, {scena}` i ani słowa więcej. 12 × 6 = 72 kombinacje, czyli zapas
nawet na kategorię odtwarzaną 1:1.

Dlaczego tak mało: seria jaszczurek — jedyna, którą uznaliśmy za naprawdę dobrą — miała
prompt `a chameleon with a curled spiral tail and bulging eyes, basking on a flat rock in the sun`
i **zero** dodatków. Bez negative_prompt, bez `artistic_level`, bez słów o stylu. Każda
warstwa dokładana później psuła rysunki na wszystkich sztukach, żeby uratować kilka.

---

## 2. Zasada naczelna: wariant musi zmieniać KONTUR

To jest jedyny test, który trzeba przejść przy pisaniu wariantu:

> **Czy zobaczę różnicę w samym obrysie, bez patrzenia na wypełnienie?**

Rasy i odmiany są świetnym źródłem różnorodności — pod warunkiem, że zmieniają sylwetkę:

| Dobre | Złe | Dlaczego |
|---|---|---|
| jamnik kontra buldog | pers kontra syjam | druga para różni się tylko sierścią |
| lop-ear kontra stojące uszy | rudy kontra bury | kolor nie istnieje w kolorowance |
| kombajn na gąsienicach kontra na kołach | „czerwony kombajn" | j.w. |

Przy kotach nauczyliśmy się tego kosztownie: warianty opisane rasami wciągnęły model
w realizm, a stamtąd w umaszczenie — koty wychodziły łaciate i czarno-białe, bo takie są
prawdziwe koty. Skuteczność spadła do 68%. Po przejściu na cechy sylwetki wróciła do 90%.

### Wyjątek: postać ludzka ma węższą oś niż zwierzę

Przy zwierzętach i stworach **masa ciała jest świetnym różnicowaniem obrysu** i używamy jej
bez wahania: „a chubby baby unicorn", „a plump baby dragon", „a stocky dragon with a round
belly". Przy **postaci ludzkiej ten sam chwyt czyta się zupełnie inaczej** — na syrenkach
dwa warianty z „plump" i „chubby" dały 17% serii, którą Jakub skomentował sam z siebie.

Dziecko jeszcze uchodzi, bo działa trop bobasa. Dorosła postać nie. Zostają: **włosy
o zamkniętym kształcie, strój, rekwizyt, kształt ogona lub skrzydeł, poza**.

Druga rzecz specyficzna dla postaci: **nie doklejaj cech zwierzęcych do ludzkiej połowy.**
Najsłabszy wariant syrenek (2/6) miał płetwę grzbietową na ludzkich plecach. Ogon jest
miejscem na wariacje płetw, tors nie jest.

Trzecia: **każda druga istota w kadrze to druga twarz do zepsucia.** Wariant z bobasem
i scena z delfinem poszły po 50% przy średniej 67%.

**Kiedy gatunek ma naturalnie ciemne partie** (grzywa konia, uszy kota, kopyta), nie zakazuj
ich w negatywie — to nie działa (test na koniach: 3,7% → 4,0% czerni, czyli zero zmiany).
Użyj pola `biale` z twierdzeniem: `white mane, white tail, white hooves`. Model dostaje wtedy
coś do narysowania zamiast czegoś do pominięcia. To jedyny uzasadniony wyjątek od zasady
„zakazy tylko w negatywie".

---

## 3. Ekosystem wchodzi SCENĄ, nie wariantem

Jednorożec ciągnie tęczę, smok jaskinię, kombajn pole. To jest prawdziwe źródło klimatu —
ale musi siedzieć w osi scen, nie w opisie wariantu.

Gdyby doklejać „with a rainbow" do każdego z dwunastu wariantów, tęcza byłaby na wszystkich
i przestałaby cokolwiek różnicować — a przy okazji zabrałaby miejsce cesze, która ma
odróżniać sztuki od siebie. W scenach tęcza pojawia się na co szóstej.

**Jak pisać scenę:**

1. **Świat, nie kamera.** `basking on a flat rock in the sun` — tak. `side view`,
   `three-quarter front view` — nie. To była główna przyczyna sztampy przy konikach
   i kombajnach: połowa „wariantów" była instrukcją dla operatora.
2. **Dwa–trzy konkretne rekwizyty**, nie „rich background". Rekwizyt daje dziecku co
   kolorować; mgliste tło model wypełnia czernią dla kontrastu.
3. **Scena musi pasować do każdego wariantu** w kategorii, bo krzyżujemy automatycznie.
   `chasing its own tail` nie jest sceną — to poza jednego zwierzęcia.

### Pula scen ma wbudowany podmiot

To najłatwiejszy błąd do popełnienia i sam go popełniłem przy pierwszym rozpisaniu rejestru.
Sceny zwierzęce zawierają **czasowniki ruchu** (`walking`, `sniffing`, `curled up`), a pojazdowe
**czasowniki jazdy** (`driving`, `parked`). Przypisanie takiej puli do przedmiotu daje bzdurę:
grzyb nie chodzi po lesie, znak drogowy nie jedzie autostradą, a pociąg w puli `droga` czekałby
na przejeździe kolejowym, czyli sam na siebie.

Stąd osobna rodzina pul dla rzeczy, które stoją: `przedmiot`, `runo`, `ulica`, `tory`, `brzeg`,
`krajobraz`. **Przed przypisaniem puli przeczytaj jej sześć scen i podstaw pod nie swój obiekt.**
Jeśli któraś brzmi śmiesznie, to nie ta pula.

Sceny są wymienne w obrębie grupy: lis, wilk i niedźwiedź mieszczą się w tym samym lesie.
Dlatego nowa kategoria zwierzęca to **tylko 12 opisów wariantu**, a nie 12 + 6. To jest
główny mechanizm oszczędzania czasu przy 75 kategoriach.

---

## 4. Pułapka sąsiedniego obiektu

Model podmienia obiekt na pokrewny, jeśli w promptcie są słowa należące do tamtego obiektu.

Kombajny: sześć na szesnaście wyszło jako **traktory**. Winne były trzy opisy —
`chimney pipe` (komin to traktor), `towing a grain trailer` (ciągnięcie przyczepy to robota
traktora) i `oversized rear wheels` (kombajn ma duże koła **z przodu**) — oraz dwie sceny,
które wprowadzały do kadru przyczepę do ciągnięcia.

**Lekarstwo: zakotwicz się na cesze, której nie ma żaden sąsiad.** Przy kombajnie to heder.
Każdy z dwunastu wariantów musi go wymieniać. Po poprawce: 6/6 poprawnych maszyn.

Przy każdej nowej kategorii zadaj pytanie: *co jest najbliższym kuzynem tego obiektu i jakie
słowo go przywoła?* Traktor przy kombajnie, koparka przy ładowarce, zając przy króliku,
ćma przy motylu.

**Styl też ma z tym związek:** style „zabawkowe" (Whimsy Playland) łatwiej gubią konkretny
obiekt niż style dosłowne (Rustic Line Art, które dało 16/16). Przy kategoriach, gdzie
wierność obiektu jest ważna — maszyny, znaki drogowe — wybieraj styl dosłowny.

---

## 5. Trzy typy kategorii

Nie wszystkie 75 to ten sam problem:

**Tematyczne (~69)** — mają obiekt, działa oś wariant × scena. Standardowa robota.

**Wzory (2: mandala, antystresowe)** — ornament nigdzie nie stoi, więc druga oś to nie scena,
tylko **układ** (`arranged in concentric rings`, `mirrored along four axes`). Pula `UKLADY`
w `prompty/sceny.mjs`.

**Mechaniczne (2: po-numerach, wedlug-kodu)** — opisują *sposób kolorowania*, nie temat.
Temat pożyczają z innych kategorii, a różnicuje je naniesiona siatka numerów albo kodów.
Samym krzyżowaniem osi się ich nie zrobi — wymagają osobnego pomysłu i najlepiej zostawić
je na koniec.

**Pory roku (4)** to przypadek graniczny: tematem jest sezon, więc oś wariantu to motyw
sezonowy, a scena musi być neutralna. Zasługują na własną pulę scen.

---

## 6. Metoda pracy: batchuj etapami, nie kategoriami

Największy koszt to nie generowanie — to przełączanie kontekstu. Nie rób jednej kategorii
od A do Z. Rób **pięć kategorii jednym etapem naraz**:

1. **Prompty do pięciu** w jednej sesji — to ten sam tryb myślenia, więc idzie szybciej
2. **Generowanie pięciu** — bezobsługowe, kilka minut
3. **Jedna sesja przeglądu** pięciu arkuszy
4. **Wektoryzacja** tylko tego, co przeszło selekcję

Kolejność grup, od najłatwiejszej: pojazdy (wspólne pule scen, obiekty proste) → zwierzęta
(formuła najlepiej sprawdzona) → fantasy → rośliny i jedzenie → pory roku → mechaniczne.

---

## 7. Checklista nowej kategorii

- [ ] 12 wariantów, każdy przechodzi test konturu z rozdziału 2
- [ ] żaden wariant nie zawiera słowa należącego do sąsiedniego obiektu
- [ ] jeśli obiekt ma naturalnie ciemne partie — wypełnione pole `biale`
- [ ] przypisana pula scen (albo własna, jeśli żadna nie pasuje — jak przy konikach)
- [ ] `format`: `pion` / `poziom` / `kwadrat`
- [ ] `--dry-run` i przeczytanie wszystkich promptów oczami przed wydaniem kredytów
- [ ] po wygenerowaniu: arkusz kontaktowy, **nie sam walidator**

---

## 8. Dlaczego walidator nie wystarczy

`validate-lineart.mjs` mierzy szczelność konturu i lite plamy czerni. **Nie widzi gęstego
kreskowania.** Przepuścił 3/3 dla Minimalist Narratives (drzeworyt) i Rustic Elegance
(koń w całości czarny), a także 6/6 dla serii z czarnymi kabinami i oponami.

Traktuj go jako bramkę pierwszego rzutu, ale decyzję podejmuj z arkusza kontaktowego.
Darmowy skrót: **waga SVG po wektoryzacji** dobrze koreluje z gęstością — powyżej ~300 KB
to już ilustracja cieniowana, nie kolorowanka.
