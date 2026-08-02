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

  // ── Przedmioty i okazje ────────────────────────────────────────────────────
  swieto: [
    'on a table with ribbons and a folded party hat',
    'surrounded by round balloons on strings',
    'beside a wrapped gift box with a big bow',
    'under a string of triangular bunting flags',
    'on a decorated table with a vase of flowers',
    'with confetti and streamers falling around it'
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
  krajobraz: [
    'on a path winding between trees',
    'beside a pond ringed with reeds',
    'in front of rolling hills with a fence line',
    'near a wooden footbridge over a stream',
    'at the edge of a meadow with a lone tree',
    'beside a cottage with a smoking chimney'
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
