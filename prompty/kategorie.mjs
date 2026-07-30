// KSIĘGA PROMPTÓW — rejestr wszystkich 75 kategorii z kolorowankami.
//
// Zasady i metoda pracy: docs/ksiega-promptow.md
// Pule scen: prompty/sceny.mjs
//
// Każda kategoria tematyczna ma dwie osie, które generator krzyżuje automatycznie:
//   warianty — 12 pozycji, CO to jest. Musi zmieniać KONTUR, nie umaszczenie.
//   sceny    — 6 pozycji, GDZIE i CO robi. Brane z puli wspólnej dla grupy.
//
// `warianty: []` znaczy "jeszcze nieopracowana" — generator odmówi z czytelnym błędem
// zamiast wyprodukować śmieci. To celowe: pusta kategoria ma boleć na wejściu, a nie
// po wydaniu kredytów.

import { SCENY, UKLADY } from './sceny.mjs'

// Domyślne grubości kreski wg odbiorcy — nie powtarzać ich w opisie wariantu.
const DLA_MALUCHA = 'very thick outlines, simple shapes, few details'
const DLA_DZIECKA = 'thick outlines, clear shapes'
const DEKORACYJNE = 'thick outlines, decorative but clear shapes'
const DLA_DOROSLEGO = 'fine even outlines, highly detailed, intricate symmetry'

export const KATEGORIE = {

  // ══ ZWIERZĘTA DOMOWE ═══════════════════════════════════════════════════════
  // Wariant różnicujemy SYLWETKĄ i rekwizytem. Rasa wchodzi tylko wtedy, gdy zmienia
  // obrys (jamnik kontra buldog) — rasy różniące się wyłącznie umaszczeniem
  // (pers kontra syjam) ciągną model w realizm, a stamtąd w czarne łaty.
  'zwierzeta/koty': {
    warianty: [
      'a fluffy long-haired cat with a plumed tail',
      'a slender short-haired cat with tall pointed ears',
      'a round chubby cat with very short legs',
      'a kitten with an oversized head and big round eyes',
      'a cat with a folded-over ear and a small bell collar',
      'a curled-up cat sleeping in a perfect circle',
      'a cat wearing a bow on its collar',
      'a cat with a bushy tail held straight up',
      'a mother cat with a tiny kitten beside her',
      'a cat with tufted lynx-like ear tips',
      'a cat stretching with its back arched high',
      'a cat with one paw raised mid-step'
    ],
    biale: 'white ears, white paws, white tail',
    sceny: SCENY.dom, grubosc: DLA_DZIECKA, format: 'pion'
  },

  'zwierzeta/pieski': {
    warianty: [
      'a long-bodied dachshund with very short legs',
      'a fluffy puppy with floppy ears and a round belly',
      'a tall slender greyhound with a narrow waist',
      'a wrinkly-faced bulldog with a wide stance',
      'a curly-coated poodle with pompom tufts',
      'a shaggy sheepdog with hair over its eyes',
      'a pointy-eared spitz with a curled tail',
      'a dog with very long silky ears touching the ground',
      'a small dog wearing a knitted sweater',
      'a dog with a bandana tied round its neck',
      'a dog sitting with one ear up and one ear down',
      'a mother dog with a puppy tucked beside her'
    ],
    biale: 'white paws, white chest, white tail tip',
    sceny: SCENY.dom, grubosc: DLA_DZIECKA, format: 'pion'
  },

  'zwierzeta/kroliczki': {
    warianty: [
      'a rabbit with very long upright ears',
      'a lop-eared rabbit with ears hanging to the ground',
      'a round fluffy rabbit with a puff of a tail',
      'a baby bunny with oversized feet',
      'a rabbit with a ribbon tied in a bow on one ear',
      'a rabbit standing up on its hind legs, ears alert',
      'a rabbit with long whiskers and a twitching nose',
      'a rabbit wearing a flower crown',
      'a rabbit with one ear folded down',
      'a mother rabbit with a tiny bunny beside her',
      'a rabbit mid-hop with both ears streaming back',
      'a rabbit with a small basket held in its paws'
    ],
    biale: 'white ears, white paws, white tail',
    sceny: SCENY.dom, grubosc: DLA_DZIECKA, format: 'pion'
  },

  // Koniki mają WŁASNĄ pulę scen, nie `las` ani `dom` — stajnia, płot i pastwisko
  // nie pasują do żadnej grupy, a to one dają tej kategorii charakter.
  'zwierzeta/koniki': {
    warianty: [
      'a shaggy pony with a thick fringe falling over its eyes',
      'a wobbly-legged foal with an oversized head',
      'a horse with a long braided mane and ribbons',
      'a heavy draft horse with feathered hooves',
      'a slender horse with a very long flowing tail',
      'a chubby round pony with short sturdy legs',
      'a carousel horse on a spiral pole with a fancy saddle',
      'a horse wearing a wreath of daisies around its neck',
      'a mare with her small foal tucked beside her',
      'a saddled horse with a bridle and dangling reins',
      'a proud horse rearing up on its hind legs',
      'a pony wearing a knitted winter hat and scarf'
    ],
    biale: 'white mane, white tail, white hooves',
    sceny: [
      'grazing in a meadow full of tall flowers',
      'jumping over a wooden fence with hills behind',
      'drinking from a stream among reeds and pebbles',
      'standing under a big leafy tree',
      'galloping across an open field with clouds above',
      'looking out of a stable door over stacked hay bales'
    ],
    grubosc: DLA_DZIECKA, format: 'pion'
  },

  'zwierzeta/chomiki': { warianty: [], sceny: SCENY.dom, grubosc: DLA_MALUCHA, format: 'pion' },
  'zwierzeta/myszki': { warianty: [], sceny: SCENY.dom, grubosc: DLA_MALUCHA, format: 'pion' },
  'zwierzeta/swinki': { warianty: [], sceny: SCENY.dom, grubosc: DLA_MALUCHA, format: 'pion' },
  'myszki':           { warianty: [], sceny: SCENY.dom, grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ ZWIERZĘTA LEŚNE ════════════════════════════════════════════════════════
  'zwierzeta/lisy': {
    warianty: [
      'a fox with a huge bushy tail curled round its paws',
      'a fox cub with oversized ears and round cheeks',
      'a fox with a pointed narrow snout and alert ears',
      'a fox curled into a sleeping ball, nose under tail',
      'a fox wearing a scarf around its neck',
      'a fox mid-pounce with front paws forward',
      'a fox with a flower tucked behind one ear',
      'a fox sitting upright with its tail sweeping the ground',
      'a fox with tufted cheeks and long whiskers',
      'a fox with a tiny cub tucked beside it',
      'a fox stretching low with its back dipped',
      'a fox peeking with only its head and ears showing'
    ],
    biale: 'white tail tip, white chest, white paws',
    sceny: SCENY.las, grubosc: DLA_DZIECKA, format: 'pion'
  },

  'zwierzeta/wilki':       { warianty: [], sceny: SCENY.las, grubosc: DLA_DZIECKA, format: 'pion' },
  'zwierzeta/mis':         { warianty: [], sceny: SCENY.las, grubosc: DLA_MALUCHA, format: 'pion' },
  'zwierzeta/niedzwiedzie':{ warianty: [], sceny: SCENY.las, grubosc: DLA_DZIECKA, format: 'pion' },
  'zwierzeta/zajace':      { warianty: [], sceny: SCENY.las, grubosc: DLA_DZIECKA, format: 'pion' },
  // Sowa przysiada, nie brodzi w trawie — pula ptasia pasuje lepiej niż leśna.
  'zwierzeta/sowy':        { warianty: [], sceny: SCENY.niebo, grubosc: DEKORACYJNE, format: 'pion' },

  // ══ ZWIERZĘTA EGZOTYCZNE ═══════════════════════════════════════════════════
  'zwierzeta/lwy':     { warianty: [], sceny: SCENY.egzotyka, grubosc: DLA_DZIECKA, format: 'pion' },
  'zwierzeta/tygrysy': { warianty: [], sceny: SCENY.egzotyka, grubosc: DLA_DZIECKA, format: 'pion' },
  'zwierzeta/pandy':   { warianty: [], sceny: SCENY.egzotyka, grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ PTAKI ══════════════════════════════════════════════════════════════════
  'zwierzeta/ptaki':     { warianty: [], sceny: SCENY.niebo, grubosc: DLA_DZIECKA, format: 'pion' },
  'zwierzeta/papugi':    { warianty: [], sceny: SCENY.niebo, grubosc: DEKORACYJNE, format: 'pion' },
  'zwierzeta/pawie':     { warianty: [], sceny: SCENY.niebo, grubosc: DEKORACYJNE, format: 'pion' },
  // Flaming brodzi, nie pływa wśród koralowców — stąd `brzeg`, nie `woda`.
  'zwierzeta/flamingi':  { warianty: [], sceny: SCENY.brzeg, grubosc: DEKORACYJNE, format: 'pion' },
  'zwierzeta/pingwiny':  { warianty: [], sceny: SCENY.brzeg, grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ WODNE ══════════════════════════════════════════════════════════════════
  'zwierzeta/ryby': {
    warianty: [
      'a fish with wide flowing fan-shaped fins',
      'a round pufferfish with short spines',
      'a flat angelfish with tall pointed fins',
      'a long slender eel-like fish with a wavy body',
      'a fish with a forked tail and large round eye',
      'a seahorse with a curled tail and ridged back',
      'a clownfish with broad banded stripes drawn as outlines',
      'a fish with trailing whisker-like barbels',
      'a fish with a tall spiny dorsal fin',
      'a tiny fish with an oversized head',
      'a fish with overlapping scales drawn as thin outlines',
      'a pair of fish swimming nose to nose'
    ],
    sceny: SCENY.woda, grubosc: DLA_DZIECKA, format: 'poziom'
  },

  'zwierzeta/rekiny': { warianty: [], sceny: SCENY.woda, grubosc: DLA_DZIECKA, format: 'poziom' },
  'zwierzeta/zabki':  { warianty: [], sceny: SCENY.woda, grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ OWADY ══════════════════════════════════════════════════════════════════
  'zwierzeta/motyle': {
    warianty: [
      'a butterfly with broad rounded wings patterned in thin outlines',
      'a butterfly with long trailing swallowtail points',
      'a butterfly with narrow pointed wings and long antennae',
      'a butterfly with round eyespots drawn as outlines on each wing',
      'a butterfly with scalloped wing edges',
      'a moth with feathery comb-like antennae',
      'a butterfly with its wings folded upright together',
      'a butterfly with a lacy see-through wing pattern',
      'a butterfly with tiny wings and a plump body',
      'a caterpillar with a segmented ringed body',
      'a butterfly emerging beside an open chrysalis',
      'two butterflies with wings overlapping'
    ],
    sceny: SCENY.ogrod, grubosc: DEKORACYJNE, format: 'pion'
  },

  'zwierzeta/pszczoly':   { warianty: [], sceny: SCENY.ogrod, grubosc: DLA_MALUCHA, format: 'pion' },
  'zwierzeta/biedronki':  { warianty: [], sceny: SCENY.ogrod, grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ PREHISTORIA ════════════════════════════════════════════════════════════
  // PRZEPISANE ze starego wzorca jednoosiowego — poprzednio warianty były nazwami
  // gatunków wymieszanymi z ujęciami kamery ("stegosaurus side view").
  'zwierzeta/dinozaury': {
    // Dwanaście gatunków dobranych tak, żeby KAŻDY był rozpoznawalny po samym obrysie —
    // to ta sama zasada, która zadziałała przy jaszczurkach. Nie ma tu tyranozaura:
    // ma własną kategorię (zwierzeta/t-rex, 51 liści), więc wpuszczenie go tutaj
    // zjadałoby jej sens i dublowało najbardziej oczywisty kształt.
    warianty: [
      'a long-necked brachiosaurus with a tiny head reaching up high',
      'a stegosaurus with a double row of tall plates and a spiked tail',
      'a triceratops with three horns and a wide bony neck frill',
      'an ankylosaurus with an armoured knobbly back and a heavy club tail',
      'a spinosaurus with a tall sail on its back and a long narrow snout',
      // Grzebień wypadł nieczytelnie we WSZYSTKICH trzech stylach naraz, więc to wada
      // promptu, nie stylu — "tube crest" model rozumiał jako fakturę głowy. Stąd
      // porównanie do rogu: daje kształt, a nie nazwę anatomiczną.
      'a parasaurolophus with a long hollow crest sweeping back from its skull like a curved horn',
      'a pachycephalosaurus with a thick domed skull ringed with knobs',
      'a therizinosaurus with enormous curved claws on its front limbs',
      'a dilophosaurus with two thin crests standing on its head',
      'a pteranodon with wide leathery wings and a long backward crest',
      'a velociraptor with a raised sickle claw and a stiff feathered tail',
      'a round-bellied hatchling climbing out of a cracked egg'
    ],
    sceny: SCENY.prehistoria, grubosc: DLA_DZIECKA, format: 'poziom'
  },

  'zwierzeta/t-rex': { warianty: [], sceny: SCENY.prehistoria, grubosc: DLA_DZIECKA, format: 'poziom' },

  // ══ FANTASY ════════════════════════════════════════════════════════════════
  // PRZEPISANE. Ekosystem tematu wchodzi SCENĄ (tęcza, gwiazdy, zamek), a nie
  // doklejaniem "with stars around" do każdego wariantu — inaczej gwiazdy byłyby
  // na wszystkich dwunastu i przestałyby cokolwiek różnicować.
  'fantasy/jednorozce': {
    warianty: [
      'a unicorn with a long spiral horn and flowing mane',
      'a chubby baby unicorn with stubby legs',
      'a unicorn with feathered wings folded at its sides',
      'a unicorn with a braided mane threaded with ribbons',
      'a unicorn with a garland of flowers round its neck',
      'a unicorn rearing on its hind legs, mane streaming',
      'a unicorn with a very long tail sweeping the ground',
      'a unicorn with a star-shaped mark on its forehead',
      'a unicorn with a tiny foal beside it',
      'a unicorn wearing a delicate crown between its ears',
      'a unicorn with a short curly mane and round cheeks',
      'a unicorn lying down with its legs tucked under'
    ],
    biale: 'white mane, white tail, white hooves',
    sceny: SCENY.magia, grubosc: DEKORACYJNE, format: 'pion'
  },

  'fantasy/smoki': {
    warianty: [
      'a plump baby dragon with oversized wings',
      'a long serpentine dragon with a whiskered snout',
      'a dragon with a row of ridged spines down its back',
      'a dragon with wide bat-like wings spread out',
      'a horned dragon with a curled tail wrapped round itself',
      'a dragon hatchling climbing out of a cracked egg',
      'a dragon with a fan-shaped crest behind its head',
      'a four-legged dragon with stubby wings and a round belly',
      'a dragon with a long tail ending in an arrow tip',
      'a dragon curled asleep in a spiral',
      'a dragon with feathered wings and a slender neck',
      'a dragon perched on its hind legs with wings raised'
    ],
    sceny: SCENY.magia, grubosc: DEKORACYJNE, format: 'pion'
  },

  'fantasy/wrozki':          { warianty: [], sceny: SCENY.magia, grubosc: DEKORACYJNE, format: 'pion' },
  'fantasy/syrenki':         { warianty: [], sceny: SCENY.woda,  grubosc: DEKORACYJNE, format: 'pion' },
  'fantasy/elfy':            { warianty: [], sceny: SCENY.magia, grubosc: DEKORACYJNE, format: 'pion' },
  'ksiezniczki':             { warianty: [], sceny: SCENY.magia, grubosc: DEKORACYJNE, format: 'pion' },
  'dla-doroslych/jednorozce':{ warianty: [], sceny: SCENY.magia, grubosc: DLA_DOROSLEGO, format: 'pion' },

  // ══ POJAZDY ROLNICZE ═══════════════════════════════════════════════════════
  'pojazdy/kombajny': {
    warianty: [
      'a friendly cartoon combine harvester with a wide cutting header and a tall grain tank',
      'a small vintage combine harvester with a narrow header and a rounded cab',
      'a big modern combine harvester rolling on caterpillar tracks',
      'a combine harvester with a long unloading auger swung out to the side',
      'a combine harvester with a spinning reel of bars above the header',
      'a compact combine harvester with a striped sun canopy over the driver seat',
      'a combine harvester with a corn header of pointed snouts',
      'a combine harvester with a bulging full grain tank and the auger folded back',
      'a combine harvester with round headlights and a beacon lamp on the roof',
      'a combine harvester with a smiling farmer leaning out of the cab window',
      'a chunky toy-like combine harvester with big front drive wheels and a wide header',
      'a combine harvester with its header folded up for transport'
    ],
    sceny: SCENY.pole, grubosc: DLA_MALUCHA, format: 'poziom'
  },

  'pojazdy/traktory': { warianty: [], sceny: SCENY.pole, grubosc: DLA_MALUCHA, format: 'poziom' },
  'pojazdy/ciagniki': { warianty: [], sceny: SCENY.pole, grubosc: DLA_MALUCHA, format: 'poziom' },

  // ══ POJAZDY BUDOWLANE ══════════════════════════════════════════════════════
  // PRZEPISANE ze starego wzorca — poprzednio połowa wariantów to były ujęcia kamery.
  'pojazdy/koparki': {
    warianty: [
      'an excavator with a long jointed arm and a toothed bucket',
      'a small compact excavator with a short arm and rubber tracks',
      'a wheeled excavator with four chunky tyres',
      'an excavator with a gripping claw instead of a bucket',
      'an excavator with a breaker hammer on its arm',
      'an excavator with a smiling driver in a glass cab',
      'an excavator with its arm folded down flat',
      'an excavator with a very long reach arm',
      'a toy-like excavator with an oversized bucket',
      'an excavator with a beacon lamp on the cab roof',
      'an excavator with wide caterpillar tracks and a boxy body',
      'an excavator lifting its bucket high overhead'
    ],
    sceny: SCENY.budowa, grubosc: DLA_MALUCHA, format: 'poziom'
  },

  'pojazdy/czolgi': { warianty: [], sceny: SCENY.budowa, grubosc: DLA_MALUCHA, format: 'poziom' },

  // ══ POJAZDY DROGOWE ════════════════════════════════════════════════════════
  'pojazdy/samochody': {
    warianty: [
      'a rounded vintage car with big round headlights',
      'a boxy family hatchback with a roof rack',
      'a low sleek sports car with a rear spoiler',
      'a tall off-road car with chunky knobbly tyres',
      'a convertible with the roof folded down',
      'a tiny bubble car with two round windows',
      'a pickup with an open flat cargo bed',
      'a van with sliding side doors and a high roof',
      'a station wagon with a long back and roof bars',
      'a car with a smiling face in the front grille',
      'a car towing a small caravan',
      'a racing car with a low nose and wide wheels'
    ],
    sceny: SCENY.droga, grubosc: DLA_DZIECKA, format: 'poziom'
  },

  'pojazdy/tiry':        { warianty: [], sceny: SCENY.droga, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pojazdy/bmw':         { warianty: [], sceny: SCENY.droga, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pojazdy/bugattii':    { warianty: [], sceny: SCENY.droga, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pojazdy/lamborghini': { warianty: [], sceny: SCENY.droga, grubosc: DLA_DZIECKA, format: 'poziom' },
  // Pociąg jeździ po torach, nie po drodze — w puli `droga` czekałby na przejeździe
  // kolejowym, czyli sam na siebie.
  'pojazdy/pociagi':     { warianty: [], sceny: SCENY.tory,  grubosc: DLA_DZIECKA, format: 'poziom' },

  // ══ POWIETRZE I KOSMOS ═════════════════════════════════════════════════════
  'pojazdy/samoloty': { warianty: [], sceny: SCENY.przestworza, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pojazdy/rakiety':  { warianty: [], sceny: SCENY.kosmos,      grubosc: DLA_MALUCHA, format: 'pion' },
  'kosmos':           { warianty: [], sceny: SCENY.kosmos,      grubosc: DLA_DZIECKA, format: 'poziom' },

  // ══ ROŚLINY ════════════════════════════════════════════════════════════════
  'rosliny/kwiat':  { warianty: [], sceny: SCENY.ogrodek, grubosc: DEKORACYJNE, format: 'pion' },
  'rosliny/bukiet': { warianty: [], sceny: SCENY.ogrodek, grubosc: DEKORACYJNE, format: 'pion' },
  'rosliny/dynie':  { warianty: [], sceny: SCENY.ogrodek, grubosc: DLA_MALUCHA, format: 'pion' },
  // `runo`, nie `las` — leśne sceny zwierzęce każą grzybowi chodzić i węszyć.
  'rosliny/grzyby': { warianty: [], sceny: SCENY.runo,    grubosc: DLA_DZIECKA, format: 'pion' },

  // ══ JEDZENIE ═══════════════════════════════════════════════════════════════
  'jedzenie/torty':  { warianty: [], sceny: SCENY.swieto,  grubosc: DEKORACYJNE, format: 'pion' },
  'jedzenie/lody':   { warianty: [], sceny: SCENY.kuchnia, grubosc: DLA_MALUCHA, format: 'pion' },
  'jedzenie/jablka': { warianty: [], sceny: SCENY.kuchnia, grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ OKAZJE I PRZEDMIOTY ════════════════════════════════════════════════════
  'okolicznosciowe/urodziny':  { warianty: [], sceny: SCENY.swieto, grubosc: DEKORACYJNE, format: 'pion' },
  'okolicznosciowe/andrzejki': { warianty: [], sceny: SCENY.swieto, grubosc: DEKORACYJNE, format: 'pion' },
  'zabawki/prezenty':          { warianty: [], sceny: SCENY.swieto, grubosc: DLA_MALUCHA, format: 'pion' },
  'serce':                     { warianty: [], sceny: SCENY.swieto,   grubosc: DEKORACYJNE, format: 'pion' },
  // Dom to budynek — stoi w krajobrazie, nie rośnie w doniczce.
  'dom':                       { warianty: [], sceny: SCENY.krajobraz,grubosc: DLA_DZIECKA, format: 'poziom' },
  'telefon':                   { warianty: [], sceny: SCENY.przedmiot,grubosc: DLA_DZIECKA, format: 'pion' },
  'kredka':                    { warianty: [], sceny: SCENY.przedmiot,grubosc: DLA_MALUCHA, format: 'pion' },
  'zabawki/lalki':             { warianty: [], sceny: SCENY.przedmiot,grubosc: DEKORACYJNE, format: 'pion' },
  'znaki-drogowe':             { warianty: [], sceny: SCENY.ulica,    grubosc: DLA_MALUCHA, format: 'pion' },

  // ══ PORY ROKU ══════════════════════════════════════════════════════════════
  // Osobliwość: tu TEMATEM jest pora roku, więc oś wariantu to motyw sezonowy,
  // a scena musi być neutralna. Do opracowania własną pulą scen sezonowych.
  // `krajobraz` jest neutralny — nie narzuca własnego bohatera, bo tu bohaterem
  // jest motyw sezonowy z osi wariantów.
  'pory-roku/wiosna': { warianty: [], sceny: SCENY.krajobraz, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pory-roku/lato':   { warianty: [], sceny: SCENY.krajobraz, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pory-roku/jesien': { warianty: [], sceny: SCENY.krajobraz, grubosc: DLA_DZIECKA, format: 'poziom' },
  'pory-roku/zima':   { warianty: [], sceny: SCENY.krajobraz, grubosc: DLA_DZIECKA, format: 'poziom' },

  // ══ WZORY (nie obiekty) ════════════════════════════════════════════════════
  // Druga oś to UKŁAD, nie scena — ornament nigdzie nie stoi.
  'dla-doroslych/mandala': {
    warianty: [
      'a mandala of layered flower petals',
      'a mandala of interlocking geometric shapes',
      'a mandala of pointed star rays',
      'a mandala of curling leaves and vines',
      'a mandala of lotus petals and teardrops',
      'a mandala of lace-like scalloped arches',
      'a mandala of feathers fanning outward',
      'a mandala of paisley teardrop motifs',
      'a mandala of scales and fan shapes',
      'a mandala of knotwork loops',
      'a mandala of crescent moons and small stars',
      'a mandala of concentric beaded rings'
    ],
    sceny: UKLADY, grubosc: DLA_DOROSLEGO, format: 'kwadrat'
  },

  'dla-doroslych/antystresowe': { warianty: [], sceny: UKLADY, grubosc: DLA_DOROSLEGO, format: 'kwadrat' },

  // ══ MECHANICZNE ════════════════════════════════════════════════════════════
  // Te kategorie NIE mają własnego tematu — opisują sposób kolorowania. Temat
  // pożyczają z innych kategorii, a różnicuje je naniesiona siatka numerów albo kodów.
  // Wymagają osobnego podejścia; nie da się ich zrobić samym krzyżowaniem osi.
  'dla-doroslych/po-numerach': { warianty: [], sceny: UKLADY, grubosc: DLA_DOROSLEGO, format: 'pion' },
  'wedlug-kodu':               { warianty: [], sceny: UKLADY, grubosc: DLA_DZIECKA,   format: 'pion' },

  // ══ JASZCZURKI ═════════════════════════════════════════════════════════════
  // Była kategorią testową (wzorzec do kalibracji pipeline'u) i przy okazji dorobiła się
  // dość materiału, żeby wejść do serwisu — od 2026-07-30 jest pełnoprawną kategorią
  // pod /zwierzeta/jaszczurki/. Klucz musi być pełną ścieżką contentu jak reszta rejestru,
  // inaczej stat-kategorie raportuje ją jako sierotę „w księdze, ale nie ma w content".
  // Warianty zostają bez zmian: każdy opisuje inną SYLWETKĘ, co jest warunkiem
  // rozróżnialności przy stylach „zabawkowych" pokroju Whimsy Playland.
  'zwierzeta/jaszczurki': {
    warianty: [
      'a chameleon with a curled spiral tail and bulging eyes',
      'a gecko with wide round toe pads',
      'a frilled lizard with a wide neck frill spread out',
      'an iguana with a row of spines along its back',
      'a horned lizard with a flat round body',
      'a slender green lizard with a very long thin tail',
      'a bearded dragon with a spiky throat pouch',
      'a skink with a smooth glossy body and short legs',
      'a monitor lizard with a forked tongue out',
      'a tiny lizard with an oversized head',
      'a crested gecko with fringed eyebrows',
      'a lizard curled around a branch'
    ],
    sceny: SCENY.las, grubosc: DLA_DZIECKA, format: 'pion'
  }
}

// Ile kategorii jest gotowych — używane przez generator i raporty postępu.
export const postep = () => {
  const wszystkie = Object.entries(KATEGORIE)
  const gotowe = wszystkie.filter(([, c]) => c.warianty.length)
  return { gotowe: gotowe.length, wszystkie: wszystkie.length, nazwy: gotowe.map(([n]) => n) }
}
