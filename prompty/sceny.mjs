// PULE SCEN — druga oś każdego promptu.
//
// Po co osobny plik: przy 75 kategoriach pisanie scen od nowa dla każdej byłoby
// największym kosztem całej migracji. Sceny są jednak wymienne w obrębie grupy —
// lis, wilk i niedźwiedź mieszczą się w tym samym lesie. Dzięki temu nowa kategoria
// zwierzęca to tylko 12 opisów wariantu, a nie 12 + 6.
//
// ZASADY PISANIA SCENY (wyprowadzone z tego, co zadziałało przy jaszczurkach):
//  1. Scena opisuje ŚWIAT, nie ujęcie kamery. "basking on a flat rock in the sun" — tak.
//     "side view", "three-quarter view" — nie, to instrukcja dla operatora i daje sztampę.
//  2. Dwa–trzy KONKRETNE rekwizyty, nie "rich background". Rekwizyt daje dziecku
//     co kolorować; mgliste tło model wypełnia czernią dla kontrastu.
//  3. Scena musi pasować do KAŻDEGO wariantu w kategorii, bo krzyżujemy je automatycznie.
//     "chasing its own tail" nie jest sceną — to poza jednego zwierzęcia.
//  4. Nie wprowadzać do kadru przedmiotu, który przyciąga inną maszynę albo inne zwierzę
//     (przyczepa w scenie kombajnu ściągnęła traktory — patrz pułapka sąsiedniej maszyny).
//
// Sześć scen na pulę to nie przypadek: przy 12 wariantach daje 72 kombinacje,
// czyli zapas nawet na kategorię odtwarzaną 1:1.

export const SCENY = {
  // ── Zwierzęta ──────────────────────────────────────────────────────────────
  las: [
    'walking through tall grass with ferns around',
    'peeking out from behind a hollow tree stump',
    'standing on a fallen log over a small stream',
    'sniffing a cluster of mushrooms under a pine',
    'curled up in a nest of leaves at the foot of a tree',
    'looking up at falling leaves on a windy day'
  ],

  // Pula kocio-psia: kłębek wełny, piszcząca zabawka i miska to rekwizyty tych dwóch
  // zwierząt. Dla królika, chomika czy świnki morskiej brać `zagroda`.
  dom: [
    'sitting in a sunny window with a potted plant',
    'curled up on a soft cushion beside a basket',
    'playing with a ball of yarn on a rug',
    'peeking out of a wicker basket full of blankets',
    'sitting beside a food bowl and a squeaky toy',
    'napping under a wooden chair with a rug beneath'
  ],

  // ── Zagroda: pula DEDYKOWANA królikom ─────────────────────────────────────
  // Dziesięć scen zamiast sześciu i pisana pod jedno zwierzę, wbrew regule oszczędności
  // z góry pliku. Powód: kroliczki to największa kategoria serwisu (112 liści), a przy
  // 35 kotach z ogólnej puli `dom` kilkanaście sztuk wyszło jako „kot w koszyku" albo
  // „kot przy oknie". Sześć ogólnych scen na dużą serię daje sztampę.
  //
  // Świat jest KRÓLICZY, nie „domowy": nora, klatka ze słomą, grządka marchewki,
  // koniczyna, kapusta, truskawki. Cztery pierwsze sceny nie pasują do żadnego innego
  // zwierzęcia i to jest ich zaleta — motyw sam mówi, co to za kategoria.
  //
  // Sceny są LOKATYWNE, nie czasownikowe: warianty królika opisują pozy (słupek,
  // w połowie skoku), więc „walking through" biłoby się z nimi.
  // Świadomie NIE ma tu: nocy i cienia (styl Line art wypełnia je czernią), koszyka
  // (byłby dubel z wariantem 12) ani zwierząt towarzyszących poza motylem.
  zagroda: [
    'in a vegetable patch among tall carrot tops with a small trowel',
    'in a clover meadow scattered with dandelion puffs',
    'beside a round burrow opening in a grassy bank with a few pebbles',
    'beside a wooden hutch with a ramp and a bundle of straw',
    'under a garden gate arch covered with climbing roses',
    'beside a wheelbarrow tipped full of round cabbages',
    'in a strawberry patch with ripe berries on low leaves',
    'at a small tea party with a teapot and two cups on a checked cloth',
    'beside a laundry line hung with tiny clothes between two poles',
    'in a greenhouse with rows of seedling pots and a watering can'
  ],

  // ── Podwórko: pula DEDYKOWANA psom ────────────────────────────────────────
  // Druga pula po `zagroda` pisana pod jedno zwierzę i z tego samego powodu, tylko
  // mocniejszego. Psy NIE MOGĄ wziąć `dom`, bo tę pulę wypaliły koty (84 liście) —
  // przy 35 sztukach kilkanaście wyszło jako „kot w koszyku" albo „kot przy oknie",
  // a gdyby psy dostały ten sam kosz i to samo okno, dwie sąsiednie kategorie serwisu
  // miałyby te same pomysły na obrazek. Kłębek wełny, piszcząca zabawka i miska z `dom`
  // to zresztą rekwizyty kocio-psie, więc `dom` nie jest nawet neutralna.
  //
  // Dwanaście scen, nie sześć: przy 12 wariantach daje 144 kombinacje, czyli 48 sztuk
  // bez ani jednej powtórki pary wariant×scena (przy `--krok=13` każdy wariant wypada
  // cztery razy i za każdym razem w innej scenie).
  //
  // Świat jest PSI: buda, smycz, kalosze przy werandzie, kałuża, wąż ogrodowy, otwarta
  // furtka. Świadomie NIE ma tu: kosza (dubel z kotami), okna (to samo), kominka i nocy
  // (ogień i cień wychodzą czarną plamą) ani auta z otwartym bagażnikiem — samochód
  // przyciągnąłby kategorię `pojazdy` i zdominował kadr.
  podworko: [
    'beside a wooden kennel with a food bowl and a bone on the grass',
    'on a doormat by a front door with a leash hanging on a hook',
    'in a garden beside a low picket fence with tall flowers behind',
    'on a porch step between a pair of rubber boots and a watering can',
    'in a park among fallen leaves with a wooden bench behind',
    'at the edge of a puddle with round pebbles and clumps of reeds',
    'on a striped rug beside an armchair and a footstool',
    'beside a bicycle propped against a fence with a basket on the handlebars',
    'on a sandy beach with a bucket, a spade and a beach ball',
    'beside a garden hose coiled on the grass next to a dripping tap',
    'in a field of tall grass with a wooden gate standing open',
    // NIE WRACAĆ do „a rope swing" (wersja z 2026-07-31). Na 5 sztukach model dwa razy
    // narysował linę z pętlą zamiast huśtawki — czyli STRYCZEK, raz nad dwoma śpiącymi
    // szczeniakami. Trzeci raz dał dwie liny bez siedziska. Whimsy rysuje samą linę,
    // bo siedziska w opisie nie było. Jeśli huśtawka ma wrócić, to wyłącznie z DESKĄ
    // nazwaną wprost („a plank swing seat hanging on two ropes"), nigdy jako sama lina.
    'beside a tree stump with a ball and a chewed stick lying in the grass'
  ],

  egzotyka: [
    'resting on a warm flat rock under the sun',
    'walking through tall savanna grass with acacia trees behind',
    'drinking from a waterhole ringed with round stones',
    'lounging on a thick tree branch with hanging leaves',
    'standing on a small hill with clouds above',
    'playing beside a clump of bamboo stalks'
  ],

  niebo: [
    'perched on a branch heavy with round berries',
    'sitting on a wooden fence post beside a sunflower',
    'spreading its wings on a rock with clouds behind',
    'standing at the edge of a nest of woven twigs',
    'perched on a garden gate with climbing roses',
    'gliding above rolling hills with a few clouds'
  ],

  woda: [
    'swimming among tall waving seaweed',
    'gliding over a bed of round pebbles and shells',
    'weaving between branches of coral',
    'blowing a trail of round bubbles toward the surface',
    'resting beside a half-buried treasure chest',
    'passing a rock arch with starfish clinging to it'
  ],

  ogrod: [
    'resting on a wide open flower with petals spread',
    'hovering over a watering can beside a flowerpot',
    'crawling along a curling green stem with buds',
    'sitting on a garden fence beside a ripe berry',
    'landing on a leaf with dewdrops on it',
    'circling a small beehive under a branch'
  ],

  // ── Pasieka: pula DEDYKOWANA pszczołom ────────────────────────────────────
  // `ogrod` ma sześć scen z czasownikami („hovering", „crawling", „landing") — wśród
  // wariantów pszczół jest para, trójka w locie i pszczoła siedząca z łyżką, więc każdy
  // z tych czasowników z którymś się gryzie. Do tego `ogrod` dzielą biedronki, a `laka`
  // należy do motyli: pszczoła na tej samej stokrotce co motyl to ten sam obrazek.
  //
  // Dlatego dwie trzecie scen stoi na rzeczach, których nie ma żaden inny owad: ul
  // słomiany, ule skrzynkowe, plaster miodu, dziupla z plastrem, beczka miodu, domek-ul.
  // To one mówią „pszczoła", zanim ktokolwiek spojrzy na paski. Kwiaty są cztery i każdy
  // inny niż w `laka` (słonecznik w `laka` jest, ale tu jest JEDEN i wielki).
  //
  // Wszystkie przyimkowe. Plaster to „big cells" — drobna siatka sześciokątów wyszłaby
  // gęstym sztrychem. Nie ma pszczelarza (twarz za siatką = gotowy odrzut) ani
  // niedźwiedzia (patrz komentarz przy kategorii).
  pasieka: [
    'beside a round straw beehive on a wooden stand',
    'in front of a honeycomb of big six-sided cells with honey dripping from a few',
    'beside one giant open sunflower',
    'beside a row of wooden box hives with sloping roofs on a hill',
    'next to a hollow tree with honeycomb showing inside the opening',
    'on a branch of apple blossom with a few open buds',
    'beside a wooden barrel brimming with honey and a ladle',
    'in a field of tulips with round clouds above',
    'on the rim of a flowerpot with a watering can beside it',
    'in a garden with a picket fence and one tall hollyhock',
    'beside a beehive shaped like a little house with a round door, a window and a chimney',
    'among tall clover flowers with a smiling sun in the corner'
  ],

  // ── Łąka: pula DEDYKOWANA motylom ─────────────────────────────────────────
  // Piąta pula pisana pod jedną kategorię, z tego samego powodu co `zagroda` i `podworko`:
  // motyle to 91 liści, a `ogrod` ma sześć scen. Przy serii na 48 sztuk każda scena wypadłaby
  // osiem razy — dokładnie tak zepsuły się koty, gdzie z 35 sztuk kilkanaście to „kot
  // w koszyku" albo „kot przy oknie".
  //
  // Sceny są LOKATYWNE, bez czasowników. `ogrod` ma „hovering over" i „circling", a wśród
  // wariantów motyli są takie, które NIE latają: gąsienica, poczwarka i motyl ze złożonymi
  // skrzydłami. Czasownik lotu biłby się z nimi wprost.
  //
  // Świadomie NIE ma tu ULA — pszczoły to osobna kategoria serwisu i dzielą z motylami
  // pulę `ogrod`; ul w kadrze przyciąga pszczołę zamiast motyla. Nie ma też nocy ani gęstej
  // trawy: pierwsza wychodzi czarną plamą, druga równoległym sztrychem, który w druku daje
  // szarą płachtę (tak poległa kora drzewa przy jaszczurkach w stylu nautical).
  //
  // Kwiaty są dobrane pod KOLOROWANKĘ, nie pod botanikę: stokrotka, słonecznik i lawenda mają
  // duże, wyraźne płatki, czyli gotowe obszary do zamalowania.
  laka: [
    'in a meadow of tall daisies with round open centres',
    'on a spike of lavender leaning over a stone path',
    'beside a sunflower head ringed with broad petals',
    'among clover and dandelion clocks in short grass',
    'on a branch of apple blossom with a few open buds',
    'beside a stone birdbath with a rim of round pebbles',
    'among the pots and seed trays of a small greenhouse',
    'at the edge of a pond with flat lily pads and one reed',
    'on a wooden trellis with climbing roses',
    'beside a hanging basket spilling round flowers',
    'among ripe berries on a low bush by a picket fence',
    'on a curling green stem with fat buds about to open'
  ],

  prehistoria: [
    // "passing", nie "stomping" — w tej puli jest też pteranodon, a on nie tupie.
    'passing a steaming volcano in the distance',
    'drinking from a lake ringed with round boulders',
    'walking between giant curling ferns',
    'standing beside a nest of large speckled eggs',
    'crossing a rocky ridge with a palm tree behind',
    'calling out with the sun low over the hills'
  ],

  // ── Fantasy ────────────────────────────────────────────────────────────────
  // Ekosystem tematu, o który prosił Jakub: jednorożec ciągnie tęczę i gwiazdy,
  // smok jaskinię i skarb. Rekwizyty są WSPÓLNE dla całej magicznej grupy, żeby
  // wróżka, elf i syrenka też miały gdzie się znaleźć.
  magia: [
    'standing under an arching rainbow with round clouds',
    'beside a sparkling waterfall falling into a pool',
    'in a ring of toadstools with fireflies around',
    'on a hilltop under a sky of stars and a crescent moon',
    'at the gate of a castle with pointed towers behind',
    'among floating soap bubbles and swirling ribbons'
  ],

  // ── Rycerskie: pula pisana pod rycerzy ─────────────────────────────────────
  // `magia` im NIE pasuje, mimo że rycerz jest postacią fantasy. Podstaw rycerza
  // pod jej sześć scen zgodnie z rozdziałem 3 księgi: „rycerz wśród baniek mydlanych"
  // i „rycerz w kręgu muchomorów z świetlikami" brzmią śmiesznie, a tęcza i wodospad
  // ciągną kadr w stronę bajki dla najmłodszych, czyli dokładnie tam, gdzie zbroja
  // przestaje być czytelna. Jedyna scena wspólna z `magia` to brama zamku — została
  // powtórzona świadomie, bo dla rycerza jest naturalna.
  //
  // Rekwizyty dobrane tak, by dawały DUŻE obszary do malowania (namioty w pasy,
  // proporce, banery), a nie mgliste tło, które model wypełnia czernią dla kontrastu.
  // Żadna scena nie wprowadza do kadru konia — koń przejąłby sylwetkę i zrobiłby
  // z tego `zwierzeta/koniki`.
  rycerskie: [
    'at the gate of a castle with pointed towers behind',
    'on a stone bridge over a moat with water below',
    'in a tournament field with striped tents and fluttering pennants',
    'beside a campfire with a round shield propped against a rock',
    'in a courtyard with long banners hanging down the walls',
    'on a rocky path winding up to a hilltop castle'
  ],

  // ── Pałacowe: pula DEDYKOWANA księżniczkom ────────────────────────────────
  // `magia` odpada z trzech powodów. Po pierwsze przejechały ją właśnie elfy (47 liści na
  // produkcji od 2026-11-14) — dwie sąsiednie kategorie miałyby te same pomysły na kadr.
  // Po drugie jej rekwizyty ciągną do sąsiadów: krąg muchomorów ze świetlikami to wróżka,
  // a „sky of stars and a crescent moon" to czarne niebo. Po trzecie sześć scen na serię
  // 48 daje każdą osiem razy.
  //
  // Świat jest DWORSKI i żadna inna kategoria go nie ma: tron, balkon, sala balowa,
  // kareta, toaletka, łoże z baldachimem. To on, a nie sama suknia, odróżnia księżniczkę
  // od „dziewczynki w sukience" — ta sama rola, którą skala rekwizytu gra u wróżek.
  //
  // Sceny są PRZYIMKOWE i BEZ ZAIMKÓW: warianty niosą własne czynności (dyga, klęczy,
  // siedzi z książką), a jeden z nich to książę. Kareta stoi BEZ KONI — koń przejąłby kadr
  // i zrobił z tego `zwierzeta/koniki` (ta sama decyzja co w `rycerskie`). Jedyne zwierzęta
  // to dwa łabędzie w tle, bez twarzy do zepsucia.
  // Nie ma nocy ani posadzki w szachownicę (co drugie pole wyszłoby czarne), nie ma też
  // biblioteki — rzędy grzbietów książek to gęsty równoległy sztrych.
  palacowe: [
    'in a throne room beside a tall throne with a heart-shaped back and a long carpet',
    'on a palace balcony with a stone balustrade and flags flying on distant towers',
    'in a ballroom under a big chandelier with tall arched windows and ribbon garlands',
    'in a rose garden beside a round fountain with three tiers',
    'at the foot of a grand curving staircase with a long carpet runner',
    'beside a round carriage with big spoked wheels and a crown on its roof',
    'in front of a castle with pointed towers, a drawbridge and pennant flags',
    'beside a dressing table with an oval mirror, a jewellery box and a string of pearls',
    'at a garden tea table with a tiered cake stand, a teapot and two cups',
    'beside a canopy bed with draped curtains and a pile of round pillows',
    'under a garden arch of climbing roses with a stone bench',
    'beside a pond with two swans and a little arched bridge'
  ],

  // ── Tęcza: pula DEDYKOWANA jednorożcom ────────────────────────────────────
  // Trzecia pula pisana pod jedno stworzenie, po `zagroda` i `podworko`. Powody dwa.
  //
  // Pierwszy — tęcza jest w kolorowance darmowym prezentem: to kilka koncentrycznych
  // pasm, czyli gotowe duże obszary do zamalowania, i jedyny motyw, przy którym dziecko
  // samo wie, jakich kolorów użyć. `magia` miała ją tylko w jednej scenie na sześć.
  //
  // Drugi, ważniejszy — PUŁAPKA SĄSIEDNIEGO OBIEKTU. Sąsiadem jednorożca jest koń,
  // a koniki to osobna kategoria tego samego serwisu. Zwykła łąka albo wodospad dadzą
  // konia z patyczkiem na czole. Każda z dwunastu scen niesie więc rekwizyt, którego
  // w stajni nie ma: tęczę, chmurę do stania, spadające gwiazdy, bańki.
  //
  // Świadomie NIE ma tu NOCY — `magia` miała „sky of stars and a crescent moon", a ciemne
  // niebo style dosłowne wypełniają czernią. Gwiazdy zostają, ale spadające, na jasnym tle.
  tecza: [
    'under a tall arching rainbow with round fluffy clouds',
    'on a path of rainbow stripes winding up a green hill',
    'beside a waterfall pouring into a pool with a rainbow in the spray',
    'on a floating island of cloud with rainbow ribbons trailing below',
    'in a meadow of star-shaped flowers with a rainbow low on the horizon',
    'crossing a rainbow bridge between two banks of cloud',
    'among big floating soap bubbles with rainbow bands across them',
    'in a ring of toadstools with rainbow pennant flags strung above',
    'beside a crystal pool throwing rainbow bands onto the rocks',
    'at the gate of a castle with pointed towers and rainbow banners',
    'under a shower of falling stars with a rainbow arc behind',
    'in a grove of swirl-trunked trees with a rainbow between them'
  ],

  // ── Smocze: pula DEDYKOWANA smokom ────────────────────────────────────────
  // Czwarta pula pod jedno stworzenie. `magia` nie nadaje się do smoków z dwóch powodów:
  // ma tylko sześć scen (za mało na 48 sztuk), a jej rekwizyty są jednorożcowe — smok
  // w kręgu muchomorów wśród baniek mydlanych to nie jest ta kategoria.
  //
  // PUŁAPKA SĄSIEDNIEGO OBIEKTU jest tu ostrzejsza niż zwykle, bo sąsiad nie jest
  // hipotetyczny: `zwierzeta/dinozaury` i `zwierzeta/jaszczurki` to istniejące kategorie
  // tego samego serwisu. Dlatego w puli NIE MA paproci, wulkanu ani dżungli — to rekwizyty
  // z `prehistoria`, wystarczyłyby, żeby smok wyszedł jako dinozaur. Zamiast tego wszystko
  // stoi na motywach, których żaden dinozaur nie ma: skarb, wieża, zamek, stojące kamienie.
  //
  // Świadomie NIE ma NOCY, OGNIA ani WNĘTRZA JASKINI — ciemne tło style dosłowne wypełniają
  // czernią. Jaskinia występuje wyłącznie jako WEJŚCIE, oglądane z zewnątrz.
  smocze: [
    'on a rocky mountain peak with pointed crags and clouds below',
    'at the mouth of a cave with round gold coins spilling out onto the stones',
    'coiled around a stone tower with a pointed roof and narrow windows',
    'on a heap of treasure with goblets, crowns and an open chest',
    'on a stone bridge arching over a gorge with a stream far below',
    'among tall standing stones on a grassy hilltop',
    // „cracked" wypadło świadomie: wariant 5 to pisklę wychodzące z PĘKNIĘTEGO jaja,
    // a przy krzyżowaniu obie pozycje spotykają się w jednej sztuce. Bez tego słowa
    // pęknięte jajo zostaje wyłącznością wariantu, a scena daje mu tylko gniazdo.
    // Nie ma tu też „speckled" — tak wygląda gniazdo w puli `prehistoria`, a dinozaur
    // jest tu najgroźniejszym sąsiadem.
    'beside a nest of big eggs on a wide rock ledge',
    'above a village of little round-roofed houses with a winding road',
    'in the courtyard of a ruined castle with broken arches and climbing ivy',
    'beside a still mountain lake ringed with round boulders',
    'on a ledge behind a waterfall falling in a wide curtain',
    'among floating rocks with waterfalls tipping off their edges'
  ],

  // ── Wróżkowe: pula DEDYKOWANA wróżkom ─────────────────────────────────────
  // UWAGA NA NAZWĘ. Pierwotnie nazwałem tę pulę `runo` i to był cichy błąd: `runo`
  // istnieje już niżej w tym pliku (grzyby na ściółce). Duplikat klucza w literale
  // obiektu nie jest błędem składni — późniejszy po prostu wygrywa, więc wróżki
  // dostały sceny grzybowe i nikt by tego nie zauważył bez wypisania promptów.
  // Przed dodaniem nowej puli sprawdź `grep -nE "^  [a-z_]+: \[" prompty/sceny.mjs`.
  //
  // Piąta pula pod jedną kategorię, ale pierwsza pod postać LUDZKĄ.
  //
  // Każda scena ma jedno zadanie ponad zwykłe: ustawić SKALĘ. Wróżka jest mała i to
  // musi być widać, bo inaczej wyjdzie zwykła dziewczynka ze skrzydłami. Dlatego
  // rekwizyt jest zawsze WIĘKSZY od postaci — kapelusz muchomora, filiżanka w trawie,
  // kropla rosy, żołądź. To jednocześnie zabezpieczenie przed kategorią `ksiezniczki`,
  // która czeka pusta i też jest o dziewczynkach w sukienkach.
  //
  // NIE bierzemy puli `ogrod` mimo pokusy: to pula motyli, a `zwierzeta/motyle` ma
  // 91 liści w serwisie. Wróżka na kwiatku w tej samej scenerii co motyl dałaby dwie
  // kategorie z tym samym obrazkiem.
  //
  // Sceny są BEZ ZAIMKÓW — wśród wariantów jest chłopiec, więc „with her wings" wyklułoby
  // się w sprzeczność przy krzyżowaniu. Nie ma też nocy: latarenki są rekwizytem
  // wiszącym, nie źródłem światła w ciemności.
  wrozkowe: [
    'on a big open flower with petals curving up all round',
    'on a toadstool cap with blades of grass towering above',
    'beside a single dewdrop resting on a broad leaf',
    // Te dwie i „mushroom house" niżej zastąpiły sceny z pilota, w których rekwizytem
    // było DUŻE OTOCZENIE (pień drzewa, ścieżka), a nie pojedynczy przedmiot. Efekt był
    // odwrotny do zamierzonego: drzewo zajmowało kadr, a wróżka schodziła do roli
    // drobnego elementu tła i traciła twarz. Zasada po pilocie brzmi więc precyzyjniej:
    // rekwizyt ma być większy od postaci, ale ma być JEDNYM PRZEDMIOTEM w jej skali.
    'on a small woven basket heaped with wild berries',
    'on a stack of three books left open in the grass',
    'on the rim of a teacup left standing in the grass',
    'among tall bluebells with the stems arching overhead',
    'on a spider web strung with dewdrops between two stems',
    'on a stack of acorns beside an upturned acorn cap',
    'at a mushroom house with a round window and a small door in its stalk',
    'on a lily pad with round ripples spreading out around it',
    'beside a snail shell on a bed of moss dotted with tiny flowers'
  ],

  // ── Morskie: pula DEDYKOWANA syrenkom ─────────────────────────────────────
  // Szósta pula pod jedną kategorię, druga pod postać LUDZKĄ (po `wrozkowe`).
  //
  // Dlaczego NIE `woda`, mimo że syrenka pływa. `woda` to pula RYB — `zwierzeta/ryby`
  // bierze ją wprost, a jej sześć scen to czasowniki rybie w rybim świecie: wodorosty,
  // kamyki, koral, bańki. Syrenka wpuszczona w tę scenerię dostaje otoczenie, w którym
  // wyłącznością jest ryba, czyli własny SĄSIEDNI OBIEKT (patrz komentarz przy kategorii).
  // Do tego sześć scen to za mało na 40+ sztuk. Rekwizyty poniżej należą do świata
  // syrenki, nie ryby: wrak, skrzynia, pałac z muszli, perła, kotwica.
  //
  // Sceny są BEZ ZAIMKÓW — wśród wariantów jest chłopiec (wariant 5), więc „with her tail"
  // wyklułoby się w sprzeczność przy krzyżowaniu. Ta sama zasada co w `wrozkowe`.
  //
  // Wszystkie sceny są PRZYIMKOWE („beside", „among", „at"), bez czasownika pozy. Połowa
  // wariantów niesie już własne ułożenie ogona (spirala, łuk, zwinięty czubek), a scena
  // z własnym czasownikiem („diving", „leaping") biłaby się z nim przy krzyżowaniu.
  //
  // Świadomie NIE ma tu GŁĘBIN ANI NOCY — ciemna toń to gotowa czarna płachta, ta sama
  // porażka co nocne niebo w `magia`. Nie ma też gęstych łanów wodorostów ani ukwiałów:
  // pasma i macki wychodzą równoległym sztrychem, który w druku daje szarość (tak poległa
  // kora drzewa przy jaszczurkach w stylu nautical).
  //
  // Nie ma ŻADNEJ LINY ani drabinki sznurowej, mimo że wrak sam się o nie prosi — przy
  // pieskach `a rope swing` wyszło jako stryczek. Wrak występuje wyłącznie jako kadłub.
  morskie: [
    'beside a small sunken sailing ship with round portholes',
    'on a smooth round rock with foam curling round its base',
    'beside an open chest spilling round coins and strings of pearls',
    'at the gate of a palace of shells with tall spiral towers',
    'beside a giant open clam with one big round pearl inside',
    'among round jellyfish trailing long ribbon tentacles',
    'alongside a friendly dolphin curving through the water',
    'in a tide pool ringed with starfish and round pebbles',
    'beside a big anchor half buried in the sand',
    'on a sandbank at the water edge with a scattered line of shells',
    'beside a seahorse curled around a stem of coral',
    'under a cloud of round bubbles rising toward the bright surface'
  ],

  // ── Pojazdy ────────────────────────────────────────────────────────────────
  pole: [
    'cutting a wide stripe through a field of tall wheat',
    'rolling along the edge of a field past a wooden fence',
    'parked beside a barn with stacked hay bales',
    'working under a big sun with birds flying above',
    'unloading golden grain through its side chute',
    'resting at the edge of the field near a windmill'
  ],

  droga: [
    'driving along a winding road between rolling hills',
    'parked at a fuel station with a striped canopy',
    'crossing an arched bridge over a river',
    'rolling through a town street past shop awnings',
    'climbing a mountain road with pine trees beside it',
    'waiting at a level crossing with a striped barrier'
  ],

  budowa: [
    'working beside a heap of sand and stacked pipes',
    'next to a half-built brick wall with a ladder',
    'parked among traffic cones and warning signs',
    'digging beside a pile of boulders and a wheelbarrow',
    'under a tall crane with hanging hook and cables',
    'rolling over a dirt track past a site fence'
  ],

  // ── Wykop: pula DEDYKOWANA koparkom ───────────────────────────────────────
  // `budowa` ma sześć scen — przy serii 48 każda wypadłaby osiem razy (lekcja z kotów
  // w koszyku). Do tego trzy z nich szkodzą akurat koparce:
  //   • „under a tall crane with hanging hook and cables" — DŹWIG to najbliższy kuzyn
  //     koparki (też ramię, też coś na końcu), a liny wychodzą równoległym sztrychem;
  //   • „traffic cones and warning signs" — znak z napisem = śmieciowe litery;
  //   • „digging…", „working…" — czasownik bije się z wariantami, które mają własną
  //     robotę (młot kruszy skałę, chwytak trzyma kłodę).
  //
  // Sceny są PRZYIMKOWE i każda daje koparce MATERIAŁ albo CEL roboty: rów z rurami,
  // hałdę piasku, staw, drzewka do posadzenia. Dzięki temu „co ona tu robi" czyta się
  // samo, bez czasownika. Dwie są dla zabawy, nie z placu budowy: kość dinozaura
  // w wykopie i zamek z piasku — to one mają dać dziecku historyjkę, a nie tylko maszynę.
  //
  // Druga maszyna w kadrze jest JEDNA na dwanaście (wywrotka, scena 3) i stoi tam
  // świadomie wbrew zasadzie 4 z góry pliku: ładowanie wywrotki to najbardziej
  // rozpoznawalna robota koparki. Jeśli wywrotka zacznie wypierać koparkę — wyrzucić.
  // Nie ma tu rusztowania ani gruzu (gęsty sztrych), nocy ani wnętrza tunelu (czerń).
  // W scenie 11 jest „pail", nie „bucket" — „bucket" to w tej kategorii łyżka koparki.
  wykop: [
    'at the edge of a long trench with a row of big pipes lying beside it',
    'beside a tall heap of sand with a wheelbarrow and a shovel stuck in the top',
    'next to a small dump truck with a heaped load of earth',
    'in a quarry among big round boulders with stepped rock walls behind',
    'beside a half-built brick wall with a ladder and a stack of bricks',
    'on road works with striped barriers and a row of traffic cones',
    'beside a deep pit with a huge dinosaur bone sticking out of the earth',
    'at a freshly dug garden pond with reeds and two ducks watching',
    'beside a row of young trees with wrapped root balls waiting to be planted',
    'in front of a wooden site hut with a hard hat on a hook and a lunch box on the step',
    'on a sandy beach beside a big sandcastle with a toy spade and a pail',
    'on top of a round hill of earth with a little flag and clouds behind'
  ],

  przestworza: [
    'flying above a layer of round fluffy clouds',
    'parked on a runway beside a striped windsock',
    'passing a control tower with tall antennas',
    'flying over a patchwork of fields and a river',
    'climbing steeply with the sun behind it',
    'over snowy mountain peaks with birds below'
  ],

  kosmos: [
    'lifting off above swirling clouds of smoke',
    'passing a ringed planet with small moons',
    'drifting past a cluster of pointed stars',
    'landing on a crater-covered moon surface',
    'flying past a tailed comet',
    'docking beside a round space station'
  ],

  // ── Halloween: DOPEŁNIENIE kadru, nie czynność ─────────────────────────────
  // Kategoria miesza RZECZY (dynia-lampion) ze STWORAMI (duch, nietoperz) i POSTACIĄ
  // (wiedźma, wampirek), więc scena nie może mieć czasownika — „walking through" każe
  // dyni chodzić. Każda pozycja zaczyna się od przyimka i opisuje, CO STOI OBOK.
  // Osiem zamiast sześciu, bo przy serii 48 sześć scen daje sztampę (koty w koszyku).
  //
  // Świadomie bez słów „dark", „night", „black", „shadow": to są tokeny czerni, a model
  // i tak wie, że półksiężyc i latarnia znaczą wieczór. Pajęczyna jest jedna i narożna —
  // rozpięta na całym kadrze wyszłaby gęstym sztrychem, którego walidator nie widzi.
  // Kocioł stoi w SCENIE, nie w wariancie wiedźmy: inaczej byłby na co dwunastej sztuce
  // zamiast co ósmej, a wiedźma i tak go przyciąga sama.
  halloween: [
    'beside a row of carved pumpkins on a wooden porch step',
    'in front of a haunted house with a crooked tower and a round window',
    'under a big crescent moon with a few small stars',
    'among bare crooked trees with a picket fence and a signpost',
    'next to a bubbling cauldron on three legs with a wooden spoon',
    'with a cobweb strung in one corner and a bowl of wrapped candies',
    'at a garden gate hung with triangular bunting and a round paper lantern',
    'in a pumpkin patch with a wooden cart full of pumpkins'
  ],

  // ── Dzień Zmarłych (zestaw `muertos` w halloween): osobny świat ────────────
  // Weranda z dyniami i nawiedzony dom nie pasują do cukrowej czaszki — ta tradycja
  // ma własne rekwizyty: aksamitki (marigolds), wycinanki z papieru (papel picado),
  // ołtarzyk ze świecami, brukowana uliczka. Tak samo przyimkowo, bez czasowników,
  // bo wśród wariantów jest sama czaszka i stolik-ołtarz, które nigdzie nie idą.
  // Wycinanki opisane jako „cut-paper banners", nie „lace" — koronka to gęsty sztrych.
  muertos: [
    'on a path scattered with round marigold petals',
    'under strings of cut-paper banners hung between two poles',
    'beside a table altar with tall candles and a vase of marigolds',
    'in a cobbled street with a round arched doorway',
    'under a crescent moon with a few small stars',
    'next to a wrought-iron gate hung with paper flowers',
    'with a scattering of small candles and marigold heads around',
    'next to a wooden cart stacked with round sweet breads'
  ],

  // ── Wszystkich Świętych: dwie pule, bo kategoria ma dwa światy ─────────────
  // `zaduszki` — polski 1 listopada widziany oczami dziecka: znicze, chryzantemy,
  // kapliczka, alejka w liściach. Spokojnie, bez nagrobków z napisami (model generuje
  // śmieciowe litery, patrz heroic mandala-019) i bez słowa „cemetery", które ciągnie
  // w stronę straszenia — to sąsiad `halloween`, a tu ma być nastrój zadumy, nie grozy.
  // Przyimkowo, bo wśród wariantów są znicz i chryzantema, które nigdzie nie idą.
  zaduszki: [
    'beside a row of glowing grave lanterns on a stone ledge',
    'among pots of round chrysanthemum blooms',
    'in front of a small chapel with a round window and a bell',
    'on a path lined with tall bare trees and fallen leaves',
    'under a sky with a crescent moon and a few small stars',
    'beside a wooden cross with a garland of flowers wound around it',
    'at a stone gate with an iron fence and small candles on the posts',
    'with a procession of small lanterns carried on sticks in the distance'
  ],

  // `sakralne` — otoczenie dla ŚWIĘTYCH: witraż, łuk z kolumnami, promienie zza chmur.
  // Celowo bez kościoła jako budynku (święty stoi W oknie witrażowym, nie przed
  // kościołem) i bez zniczy — atrybut świętego ma być jedynym rekwizytem, który mówi,
  // kim jest; drugi mocny rekwizyt w kadrze rozmywałby rozpoznawalność.
  // Witraż to świetny materiał do kolorowania: dużo zamkniętych pól.
  sakralne: [
    'standing inside a tall arched stained-glass window with round panes',
    'in a stone archway with carved pillars on both sides',
    'under an arch of round clouds with straight rays of light behind',
    'in a meadow with small flowers and a low wooden fence',
    'under a sky with a crescent moon and a few small stars',
    'with a border of lilies and curling vines across the bottom'
  ],

  // ── Przedmioty i okazje ────────────────────────────────────────────────────
  swieto: [
    'on a table with ribbons and a folded party hat',
    'surrounded by round balloons on strings',
    'beside a wrapped gift box with a big bow',
    'under a string of triangular bunting flags',
    'on a decorated table with a vase of flowers',
    'with confetti and streamers falling around it'
  ],

  // ── Cukiernia: pula DEDYKOWANA tortom ─────────────────────────────────────
  // `swieto` (wyżej) ma sześć scen, dzieli je z urodzinami i andrzejkami, a każda z nich
  // to ta sama okazja: przyjęcie. Tu dwanaście scen = dwanaście OKOLICZNOŚCI, w jakich
  // tort naprawdę się pojawia: urodziny, wesele, herbatka, piknik, przyjęcie w ogrodzie,
  // witryna cukierni, kuchnia w trakcie pieczenia, pudełko z kokardą, święta.
  //
  // Wszystkie zaczynają się od „on"/„beside"/„under" i pasują także do KAWAŁKA tortu na
  // talerzyku (wariant 3). Nie ma w nich ludzi — goście przy stole zrobiliby z tego
  // `okolicznosciowe/urodziny`. Nie ma obrusa ani koca w kratę (co drugie pole wyszłoby
  // czarne), koronkowej serwetki (gęsty sztrych) ani sypiącego się konfetti (kropki) —
  // konfetti to „a few big stars". Nie ma też tabliczek, szyldów i bilecików: napis
  // w kadrze = śmieciowe litery.
  cukiernia: [
    'on a party table with round balloons on strings and a stack of wrapped presents',
    'on a cake stand in a bakery window under a striped awning',
    'on a kitchen counter beside a mixing bowl, a whisk and a piping bag',
    'on a picnic blanket in the grass with a wicker basket and two cups',
    'under a string of triangular bunting flags with paper party hats on the table',
    'on a table under a wedding arch of flowers with two tall glasses',
    'on a tea table beside a teapot, two cups and a plate of biscuits',
    'beside an open cake box with a big ribbon bow',
    'on a round tray with a cake server, small plates and forks',
    'on a garden table under a tree hung with round paper lanterns',
    'on a table with party poppers, curly streamers and a few big confetti stars',
    'on a table beside a small decorated Christmas tree and a few wrapped presents'
  ],

  // ── Lodziarnia: pula DEDYKOWANA lodom ─────────────────────────────────────
  // `kuchnia` (niżej) to talerzyk, deska, serwetka i kubek herbaty — świat jabłka
  // i ciasta, nie lodów. Lody to LATO: plaża, basen, wesołe miasteczko, budka z markizą.
  // Dwanaście scen, bo seria 48 na sześciu dałaby każdą osiem razy.
  //
  // Wszystkie przyimkowe i bez ludzi: rożek „wisi" w kadrze tak, jak w każdej
  // kolorowance z lodem, a ręka trzymająca go to pięć palców do zepsucia.
  // Jest wózek i budka, NIE MA furgonetki — lodziarka na kołach to wariant w
  // `pojazdy/samochody` i przejęłaby kadr. Nie ma też tortu ani stołu z przyjęcia
  // (`cukiernia`), żeby dwie sąsiednie kategorie nie dzieliły obrazka.
  // Scena 10 daje „smaki" jedynym sposobem, jaki zna kontur: owocami obok.
  lodziarnia: [
    'in front of an ice cream stand with a striped awning and a row of round tubs',
    'on a sandy beach with a parasol, a beach ball and waves behind',
    'beside an ice cream cart with two big wheels and an umbrella',
    'under a big smiling sun with round clouds',
    'on a cafe table under a parasol with two chairs',
    'beside a swimming pool with a rubber ring and a pair of sunglasses',
    'at a funfair with a ferris wheel and bunting flags behind',
    'in a park beside a bench and a fountain',
    'among palm trees with a deck chair and a pair of flip-flops',
    'surrounded by big strawberries, cherries and wafer rolls',
    'beside a freezer display case with rows of round tubs and an ice cream scoop',
    'with a rainbow behind and a few big stars and hearts around'
  ],

  kuchnia: [
    'on a round plate beside a folded napkin',
    'on a wooden board with a small knife beside it',
    'in a woven basket lined with a checkered cloth',
    'on a windowsill with a potted herb beside it',
    'on a tiered stand with doilies underneath',
    'beside a steaming mug on a saucer'
  ],

  // ── Obiekty nieruchome ─────────────────────────────────────────────────────
  // UWAGA: pula scen ma WBUDOWANY PODMIOT. Sceny zwierzęce zawierają czasowniki
  // ruchu ("walking", "sniffing", "curled up"), a pojazdowe czasowniki jazdy.
  // Przypisanie takiej puli do przedmiotu daje bzdurę — grzyb nie chodzi, a znak
  // drogowy nie jedzie autostradą. Poniższe pule opisują OTOCZENIE rzeczy, która stoi.
  przedmiot: [
    'resting on a wooden shelf beside a small potted plant',
    'standing on a table next to a folded cloth',
    'leaning against a stack of books',
    'sitting in an open box lined with tissue paper',
    'on a windowsill with curtains drawn back',
    'placed on a round mat with a ribbon beside it'
  ],

  runo: [
    'growing in a cluster among fallen leaves',
    'sprouting beside a mossy tree stump',
    'growing in a ring on the forest floor',
    'poking up between the roots of an old tree',
    'growing beside a curled fern frond',
    'standing in a patch of grass with a snail nearby'
  ],

  ulica: [
    'standing at the roadside with a tree behind it',
    'mounted on a post beside a zebra crossing',
    'at a corner beside a lamppost and a bench',
    'in front of a low fence with houses behind',
    'beside a bicycle rack and a litter bin',
    'at a junction with an arrow marking on the road'
  ],

  tory: [
    'running along rails through open countryside',
    'passing a small station with a platform canopy',
    'crossing a stone viaduct over a valley',
    'pulling into a station past a signal post',
    'winding through hills with a tunnel mouth ahead',
    'standing at a platform beside stacked luggage'
  ],

  brzeg: [
    'wading in shallow water among tall reeds',
    'standing on one leg on a sandbank',
    'at the edge of a lake with lily pads floating',
    'on a rock at the water line with ripples around',
    'beside a nest of piled twigs near the shore',
    'among grasses with the sun low over the water'
  ],

  // Neutralny krajobraz — dla kategorii, w których TEMATEM jest pora roku albo nastrój,
  // a nie obiekt. Scena nie może wtedy narzucać własnego bohatera.
  // ── Zawodowe: DOPEŁNIENIE kadru, nie miejsce pracy ─────────────────────────
  // Kusi, żeby dać tu warsztat, szpital i boisko — ale scena krzyżuje się z KAŻDYM
  // wariantem, a miejsce pracy jest przypisane do jednego zawodu. Astronauta w kuchni
  // i kucharz w kokpicie to gotowy odrzut. Miejsce siedzi więc w rekwizycie wariantu,
  // a te sześć pozycji to neutralne otoczenie, które pasuje do każdego zawodu
  // i daje dziecku dodatkowe duże kształty do zamalowania.
  zawodowe: [
    'under a sky with round fluffy clouds',
    'with a big smiling sun up in the corner',
    'with a garland of small stars strung overhead',
    'with a wide rainbow arching behind',
    'with simple rooftops along the horizon',
    'with a border of small flowers across the bottom'
  ],

  // ── Krainy: DOPEŁNIENIE kadru, nie scena ───────────────────────────────────
  // Pula wyjątkowa, bo w `magiczne-krainy` to WARIANT jest już pełną sceną (zamek,
  // wioska, port). Gdyby dołożyć do niego zwykłą scenę z `krajobraz`, kadr dostałby
  // dwa konkurujące miejsca naraz („zamek na wzgórzu, przy stawie z trzcinami").
  // Dlatego te sześć pozycji opisuje wyłącznie TŁO I POGODĘ wokół gotowego miejsca —
  // każda zaczyna się od przyimka i daje się dokleić do dowolnego wariantu.
  krainy: [
    'under a sky of big drifting clouds',
    'with rolling hills stretching away behind',
    'surrounded by tall pine trees',
    'with a river winding across the foreground',
    'under a crescent moon and scattered stars',
    'with a wide rainbow arching overhead'
  ],

  // ── Zima: neutralne tło dla motywu sezonowego ──────────────────────────────
  // Przyimkowo, bez czasowników, bo wśród wariantów są igloo, płatek śniegu i chatka,
  // które nigdzie nie idą. Osiem, nie sześć — seria 48 (lekcja z halloween).
  // Śnieg „a few big snowflakes", nigdy „falling snow" ani „blizzard": gęsta zamieć
  // to setki kropek-pól mniejszych od kredki, czyli sztrych, którego walidator nie widzi.
  // Bez „night" i „dark" (tokeny czerni) — księżyc sam mówi, że to wieczór.
  // ŚWIADOMIE nie ma tu chatki, karmnika ani sanek: są wariantami, a jako rekwizyt
  // sceny wychodziłyby podwójnie na jednej kartce.
  zima: [
    'on a snowy hill with a few big snowflakes drifting down',
    'beside a frozen pond with reeds poking out of the snow',
    'among snow-covered fir trees with a wooden fence half buried in snow',
    'next to a wooden signpost capped with snow and a lantern on a post',
    'under a crescent moon with a few small stars over snowy hills',
    'in a snowy village lane with a street lamp and a low stone wall',
    'at the foot of snow-capped mountains with a few rounded pine trees',
    'in a snowy garden with a bench covered in snow and a rowan bush with berry clusters'
  ],

  // `gwiazdka` — świąteczny świat dla zestawu `swieta` w zimie. Bez kominka z ogniem
  // (płomienie to lita czerń) i bez skarpet na gzymsie, bo skarpety są wariantem.
  gwiazdka: [
    'among wrapped presents with big ribbon bows',
    'under a garland of fir branches with round baubles and bows',
    'on a snowy roof with a brick chimney and a few big snowflakes',
    'under a sky with one big shining star and a few small stars',
    'next to a table with a plate of cookies and a glass of milk',
    'in a snowy village square with a tall decorated tree in the distance',
    'beside a frosted window with a candle on the sill',
    'among snow-covered fir trees with a lantern hanging on a branch'
  ],

  krajobraz: [
    'on a path winding between trees',
    'beside a pond ringed with reeds',
    'in front of rolling hills with a fence line',
    'near a wooden footbridge over a stream',
    'at the edge of a meadow with a lone tree',
    'beside a cottage with a smoking chimney'
  ],

  // ── Kwiatowe: pula DEDYKOWANA kategorii `rosliny/kwiat` ────────────────────
  // `ogrodek` (niżej) ma sześć scen i dzieli je z bukietem i dyniami; „tied with ribbon
  // and resting on a bench" robi z kwiatu BUKIET, czyli sąsiednią kategorię, a „climbing
  // a wooden trellis" pasuje tylko do pnącza. Tu dwanaście scen = dwanaście różnych
  // OKOLICZNOŚCI: grządka, parapet, łąka, deszcz, słońce z tęczą, prezent, staw, szklarnia,
  // balkon. Pogoda i okazja różnicują kadr mocniej niż kolejny kąt ogrodu.
  //
  // Wszystkie przyimkowe — kwiat nigdzie nie idzie. Każda zakłada, że roślina ROŚNIE
  // (w ziemi albo w doniczce), więc pasuje do każdego wariantu, także do wysokiej malwy.
  // Towarzysze są mali i bez skrzydeł: biedronka, żaba, ślimak. Motyla i pszczoły nie ma
  // świadomie — `zwierzeta/motyle` ma własną pulę `laka` pełną kwiatów i kadry by się zlały.
  // Przy prezencie jest balon, nie bilecik: bilecik to zaproszenie do śmieciowych liter.
  // Deszcz to „big raindrops", nie „pouring rain" — ulewa wychodzi równoległym sztrychem.
  kwiatowe: [
    'growing in a flower bed edged with round stones, with a garden trowel stuck in the soil',
    'in a clay pot on a windowsill with tied-back curtains',
    'in a meadow of short grass with a ladybird on a leaf and round clouds above',
    'beside a watering can tipping out a few big drops',
    'in the rain with big raindrops and a puddle with round ripples',
    'under a big smiling sun with a rainbow behind',
    'in an old rubber boot used as a planter beside a garden gate',
    'beside a picket fence with a birdhouse on a post',
    'in a pot with a big ribbon bow next to a wrapped present and a heart-shaped balloon',
    'beside a pond with a frog on a lily pad and two reeds',
    'in a greenhouse among seedling trays with a pair of garden gloves',
    'in a window box on a balcony with rooftops and a chimney behind'
  ],

  // ── Dyniowe: pula DEDYKOWANA kategorii `rosliny/dynie` ─────────────────────
  // `ogrodek` (niżej) to doniczka, konewka i pergola — wiosenny ogród kwiatowy, a dynia
  // to JESIEŃ. `halloween` ma już werandę z rzędem wyciętych dyń, wóz pełen dyń
  // i nawiedzony dom, więc tych trzech tu nie ma: dwie kategorie nie mogą dzielić kadru.
  //
  // Dwanaście scen w czterech światach: POLE (1–3), JESIENNY OGRÓD (4, 8, 11),
  // KUCHNIA I TARG (5, 6, 9, 12), PRÓG DOMU I WIECZÓR (7, 10). Księżyc jest w JEDNEJ —
  // tyle Halloween, ile obiecuje strona, i ani sceny więcej. Bez słów „night" i „dark".
  //
  // Wszystkie przyimkowe: dynia leży. Nie ma noża przy kuchennym stole (kolorowanka dla
  // malucha) ani tabliczki z ceną na targu (napis = śmieciowe litery). Kosz i koc bez
  // kratki — co drugie pole wyszłoby czarne. Jeż w scenie 8 to jedyna druga buzia w puli.
  dyniowe: [
    'in a pumpkin field with curling vines and a wooden fence behind',
    'in a wheelbarrow with a garden fork leaning beside it',
    'on a bale of hay with ears of corn and a sunflower',
    'among falling maple leaves and a few acorns',
    'on a kitchen table beside a pie on a plate and a wooden spoon',
    'on a market stall crate with apples and pears around',
    'on a doorstep beside a pair of rubber boots and a lantern',
    'under a tree beside a hedgehog and a few mushrooms',
    'in a big woven basket with apples and a few leaves',
    'under a crescent moon with a few small stars and one bat',
    'beside a rake, a pile of leaves and a straw hat hung on a fence post',
    'on a windowsill with a mug, a candle and a few big raindrops on the window'
  ],

  // ── Rośliny ────────────────────────────────────────────────────────────────
  ogrodek: [
    'growing from a clay pot with a small trowel beside it',
    'in a flower bed edged with round stones',
    'climbing a wooden trellis with curling tendrils',
    'in a watering can spilling a few drops',
    'tied with ribbon and resting on a bench',
    'under a garden arch with a butterfly nearby'
  ]
}

// Pula scen dla kategorii, które są WZORAMI, a nie obiektami (mandala, antystresowe).
// Tam druga oś nie jest sceną, tylko układem — obiekt nie stoi nigdzie.
export const UKLADY = [
  'arranged in concentric rings',
  'arranged in a symmetrical square frame',
  'radiating from a central rosette',
  'woven into an interlacing lattice',
  'spiralling outward from the centre',
  'mirrored along four axes'
]

// ── Struktury: druga oś DEDYKOWANA mandalom ─────────────────────────────────
// `UKLADY` się do nich nie nadaje, mimo że powstało właśnie dla wzorów. Cztery z sześciu
// pozycji — koncentryczne kręgi, rozeta w środku, spirala od środka, lustro w czterech
// osiach — to po prostu DEFINICJA mandali. Oś, która sześć razy mówi „okrągłe i symetryczne",
// nie różnicuje niczego, a piąta pozycja (kwadratowa ramka) mandali wprost przeczy.
//
// Prawdziwą różnicą między dwiema mandalami dla osoby z kredką jest GĘSTOŚĆ I STRUKTURA:
// ile pierścieni, czy środek jest otwarty, czy pola są na tyle szerokie, żeby dało się je
// zamalować. Stąd ta pula opisuje rozkład materii, nie kształt ogólny.
//
// Prawie każda pozycja niesie słowo trzymające SKALĘ POLA: wide, broad, plain, open, thick,
// simple. To jest tu robota najważniejsza — model puszczony luzem robi jednolitą koronkę,
// czyli obrazek ładny na ekranie i bezużyteczny na papierze.
//
// Pozycja 10 to odpowiedź na pomysł Jakuba z fraktalami. Fraktal wprost jest zły: dzieli
// detal w nieskończoność, więc pola schodzą poniżej grubości kredki, w druku wychodzi szara
// płachta, a mierzona trudność każdej sztuki utknęłaby na T10 i kategoria straciłaby gradient,
// po którym sortuje się galeria. Kontrolowana rekurencja — ten sam motyw w trzech rozmiarach —
// daje to samo wrażenie, a pola zostają.
//
// Pozycja 12 istnieje, bo model i tak nie zrobi symetrii dokładnej; nazwanie jej wprost
// przynajmniej pcha go w tę stronę.
// KAŻDA pozycja kończy się „the whole mandala inside the frame with a white margin".
// Dopisane po pilocie (15 szt., 2026-08-02) i z tego samego powodu, dla którego wróżki
// dostały „full body fills the frame": model kadruje kompozycję tak, że wzór wychodzi poza
// kartkę. Na pilocie mandala-001 w stylu heroic była ucięta ze wszystkich czterech stron —
// dla kolorowanki do druku to defekt, bo płatki przy krawędzi są niedomknięte i nie ma ich
// jak zamalować. Fraza siedzi w TEJ osi, nie w wariantach, bo obie dwunastki motywów
// (ornamentalna i tematyczna) dzielą tę pulę — jedna poprawka zamiast dwudziestu czterech.
export const STRUKTURY = [
  'with a large open centre and detail only in the outer rings, the whole mandala inside the frame with a white margin',
  'with a big central medallion and three wide plain bands around it, the whole mandala inside the frame with a white margin',
  'with six rings of the same motif shrinking toward the edge, the whole mandala inside the frame with a white margin',
  'with a heavy scalloped border framing a lighter interior, the whole mandala inside the frame with a white margin',
  'with eight broad wedge segments divided by thick lines, the whole mandala inside the frame with a white margin',
  'with alternating wide plain rings and narrow patterned rings, the whole mandala inside the frame with a white margin',
  'with a dense centre opening into simple wide shapes at the edge, the whole mandala inside the frame with a white margin',
  'set inside a square frame with the corners filled in, the whole mandala inside the frame with a white margin',
  'with twelve narrow petal segments meeting at a small hub, the whole mandala inside the frame with a white margin',
  'with the same motif repeated at three sizes, largest in the middle, the whole mandala inside the frame with a white margin',
  'with a thick unbroken outer ring holding the pattern in, the whole mandala inside the frame with a white margin',
  'with four quarters mirroring each other across two axes, the whole mandala inside the frame with a white margin'
]
