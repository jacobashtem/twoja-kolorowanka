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

  dom: [
    'sitting in a sunny window with a potted plant',
    'curled up on a soft cushion beside a basket',
    'playing with a ball of yarn on a rug',
    'peeking out of a wicker basket full of blankets',
    'sitting beside a food bowl and a squeaky toy',
    'napping under a wooden chair with a rug beneath'
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
