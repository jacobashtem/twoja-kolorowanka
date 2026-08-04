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

import { SCENY, UKLADY, STRUKTURY } from './sceny.mjs'

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

  // Psy: dwanaście SYLWETEK, każda rozpoznawalna z samego obrysu. Rasa wchodzi tylko wtedy,
  // gdy zmienia kształt — jamnik kontra buldog tak, labrador kontra golden nie.
  // ŚWIADOMIE NIE MA ras definiowanych umaszczeniem: dalmatyńczyk, doberman, rottweiler
  // i border collie to „biały pies w czarne łaty", a łaty model zamalowuje (tak poległy
  // koty w pierwszym podejściu).
  // Odrzucone jako zbyt subtelne dla whimsy — styl gubi cechy poniżej poziomu sylwetki
  // (jaszczurki: „fringed eyebrows" i „smooth glossy" dały tego samego gadzika):
  // jedno ucho w górę drugie w dół, chusta na szyi, „pies z długim pyskiem".
  // Husky ODPADŁ z innego powodu — to pułapka sąsiedniego obiektu, model rysuje wilka.
  // Szpic zostaje, bo ogon zwinięty na grzbiecie jest kotwicą, której wilk nie ma.
  'zwierzeta/pieski': {
    warianty: [
      'a long-bodied dachshund with very short legs and a narrow pointed snout',
      'a round fluffy puppy with floppy ears and a soft heavy belly',
      'a tall slender greyhound with a deep chest and a narrow tucked waist',
      'a wrinkly-faced bulldog with a broad head and a wide low stance',
      'a curly-coated poodle with pompom tufts on its legs and the tip of its tail',
      'a shaggy sheepdog with long hair falling right over its eyes',
      'a pointy-eared spitz with a thick tail curled up over its back',
      'a hound with very long silky ears hanging all the way down to the ground',
      // „domed round head" WYLECIAŁO (wersja z 2026-07-31): kopulasta głowa plus wielkie
      // uszy to opis myszy i królika, nie chihuahuy — wszystkie 3 sprawdzone sztuki zgubiły
      // gatunek (dwa króliczki i mysz). Kotwicą psią jest SPICZASTY PYSK, którego nie ma
      // ani królik, ani mysz.
      'a tiny dog with huge upright ears, a sharply pointed muzzle and a thin tail curving upward',
      'a scruffy wire-haired terrier with a square beard and bushy eyebrows',
      'a dog wearing a knitted sweater with a rolled collar',
      'a mother dog with a puppy tucked in beside her'
    ],
    biale: 'white paws, white chest, white tail tip',
    sceny: SCENY.podworko, grubosc: DLA_DZIECKA, format: 'pion'
  },

  // Króliki: cztery RASY, dwie pozy, trzy rekwizyty, trzy sylwetki wieku/rodziny.
  // Rasa wchodzi wyłącznie wtedy, gdy widać ją w obrysie: angora (chmura futra),
  // baran (uszy w dół), lionhead (kryza wokół głowy), karzełek (krótkie uszy, wielka
  // głowa). ŚWIADOMIE NIE MA ras definiowanych umaszczeniem — holenderski, kalifornijski,
  // himalajski i angielski srokacz to „biały królik w czarne łaty", a łaty model
  // zamalowuje (tak poległy koty w pierwszym podejściu).
  // Odrzucone jako zbyt subtelne dla stylu whimsy: długie wąsy, jedno ucho złożone,
  // „okrągły puchaty" (to opis każdego królika, nie wariantu).
  // Ławka rezerwowych, gdyby któryś wariant nie chwycił: olbrzym belgijski (długie
  // ciężkie ciało) i baran angielski (uszy wleczone po ziemi).
  'zwierzeta/kroliczki': {
    warianty: [
      'a rabbit with very long ears standing straight up',
      'a lop-eared rabbit with both ears hanging past its cheeks',
      'an angora rabbit shaped like a cloud of long shaggy fur, face hidden in the fluff',
      'a lionhead rabbit with a thick mane of fur ringing its head',
      'a dwarf rabbit with a tiny round body, short ears and an oversized head',
      'a baby bunny with oversized hind feet',
      'a mother rabbit with a tiny bunny tucked beside her',
      'a rabbit mid-hop with both ears streaming back',
      'a rabbit sitting up on its hind legs with front paws tucked, ears alert',
      'a rabbit with a wide ribbon tied in a bow on one ear',
      'a rabbit wearing a crown of daisies',
      'a rabbit holding a wicker basket in its paws'
    ],
    biale: 'white ears, white paws, white tail',
    sceny: SCENY.zagroda, grubosc: DLA_DZIECKA, format: 'pion',

    // ── Drugi zestaw wariantów: --zestaw=natura ───────────────────────────────
    // Bajkowa dwunastka wyżej ZOSTAJE bez zmian. Ten zestaw stoi obok niej, nie zamiast.
    //
    // Skąd się wziął: w serii `heroic` dwie sztuki (007 i 008) wyszły jako prawdziwe
    // króliki, a nie maskotki. Obie miały wariant opisany POZĄ ze zwierzęcego repertuaru
    // („mid-hop with ears streaming back", „sitting up on hind legs, ears alert") i obie
    // trafiły na scenę przyrodniczą (nora, klatka ze słomą). Kontrdowód z tego samego
    // przebiegu: whimsy-008 dostało ten SAM wariant „mid-hop", ale ze sceną herbatki —
    // i wyszło pełne kawaii. Czyli realizmu nie psuje styl, tylko dwie rzeczy w promptcie:
    // zdrobnienia (oversized, tiny, baby) i rekwizyt w łapkach.
    //
    // Stąd zasady tego zestawu: zero zdrobnień, zero wstążek i koszyków, każdy wariant to
    // poza, którą królik naprawdę przyjmuje. Jedyny „rekwizyt" to liść pod łapami — to
    // zachowanie zwierzęcia, nie antropomorfizm.
    //
    // Warianty różnicuje WYŁĄCZNIE sylwetka, bo whimsy gubi cechy subtelne (jaszczurki:
    // „fringed eyebrows" i „smooth glossy" dały tego samego generycznego gadzika). Bochenek,
    // flop, sploot, słupek i binky mają pięć zupełnie różnych obrysów i to je ratuje.
    //
    // Trzy pozy leżące mają dopisane „body filling the width of the picture", bo whimsy
    // potrafi zrobić zwierzę małe wobec sceny, a w kadrze pionowym rozwalony królik jest
    // na to najbardziej narażony. Pozy pionowe tego nie potrzebują i nie dostają.
    zestawy: {
      natura: {
        warianty: [
          'a rabbit settled into a rounded loaf shape with its feet tucked out of sight',
          'a rabbit flopped over on its side with both hind legs stretched straight out, its body filling the width of the picture',
          'a rabbit lying belly-down with its hind legs splayed out behind it, its body filling the width of the picture',
          'a rabbit sitting back on its haunches with its front paws on the ground and both ears upright',
          'a rabbit stretched out at full length with its front legs reaching forward and its back long and low, its body filling the width of the picture',
          'a rabbit grooming itself with one ear pulled down between its front paws',
          'a rabbit mid-hop with its hind feet off the ground and its ears swept back',
          'a rabbit crouched low with its ears laid flat along its back',
          'a rabbit curled asleep with its nose tucked in against its flank',
          'a rabbit nibbling a leaf held down under both front paws, head lowered',
          'a rabbit standing tall on its hind legs with its nose lifted and its whiskers fanned wide',
          'a rabbit twisting in mid-air with its body kinked and all four feet off the ground'
        ],
        // Z puli `zagroda` wypadają dwie sceny: herbatka i sznurek z praniem. To one
        // najmocniej ciągną do antropomorfizmu — na herbatce poległ nawet wariant,
        // który w innej scenie dał realistycznego królika. Reszta puli zostaje.
        sceny: SCENY.zagroda.filter(s => !/tea party|laundry line/.test(s))
      }
    }
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
  // Motyle: oś wariantu to KSZTAŁT SKRZYDŁA, nie deseń na nim. Style zabawkowe gubią wszystko
  // poniżej poziomu sylwetki (jaszczurki: „fringed eyebrows" i „smooth glossy" dały tego samego
  // generycznego gadzika), a deseń jest właśnie tam. Zaokrąglone, jaskółczy ogon, wąskie
  // szpiczaste, ząbkowane, złożone pionowo, malutkie przy grubym odwłoku — to sześć różnych
  // obrysów. Gąsienica, poczwarka i para motyli dokładają trzy kolejne.
  //
  // Trzy warianty przepisane 2026-08-02, każdy z innego powodu:
  //  1 i 4 — WYLECIAŁY dopiski „patterned in thin outlines" i „drawn as outlines". To resztki
  //    po walce z czernią wbudowanego stylu „Line art". Przy stylach panelowych ta pułapka NIE
  //    wraca (koty na whimsy: pręgi i łaty rysowane konturem, nie zamalowywane), a zasada brzmi
  //    „walka z czernią = walka z jakością" — te słowa nie robią już nic poza zjadaniem promptu.
  //  8 — „a lacy see-through wing pattern" to deseń, czyli dokładnie ta oś, której whimsy nie
  //    utrzyma. Zastąpione PODZIAŁEM skrzydła grubymi żyłkami: to struktura widoczna w obrysie,
  //    a przy okazji duże zamknięte pola, czyli lepszy materiał i do kredki, i do flood filla.
  'zwierzeta/motyle': {
    warianty: [
      'a butterfly with very broad rounded wings and a small narrow body',
      'a butterfly with long trailing swallowtail points',
      'a butterfly with narrow pointed wings and long antennae',
      'a butterfly with one large round eyespot on each wing',
      'a butterfly with scalloped wing edges',
      'a moth with feathery comb-like antennae',
      'a butterfly with its wings folded upright together',
      'a butterfly with wings divided into large open panes by thick veins',
      'a butterfly with tiny wings and a plump body',
      'a caterpillar with a segmented ringed body',
      'a butterfly emerging beside an open chrysalis',
      'two butterflies with wings overlapping'
    ],
    // `laka`, nie `ogrod`: sześć scen ogrodu na serię 48 sztuk dałoby osiem powtórzeń każdej,
    // a `ogrod` ma w dodatku ul, który przy motylu przywołuje pszczołę.
    sceny: SCENY.laka, grubosc: DEKORACYJNE, format: 'pion'
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
  // Jednorożce: KAŻDY z dwunastu wariantów wymienia SPIRALNY RÓG. To nie jest powtórka
  // przez nieuwagę, tylko ta sama kotwica, którą przy kombajnach był heder (6/6 poprawnych
  // maszyn po poprawce). Sąsiadem jednorożca jest koń, a koniki to osobna kategoria tego
  // samego serwisu — wariant bez rogu w opisie da po prostu konia. Stara wersja tej listy
  // wymieniała róg tylko w jednej pozycji na dwanaście.
  // Druga oś to `SCENY.tecza`, gdzie każda scena też niesie rekwizyt spoza stajni.
  //
  // Odrzucone jako zbyt subtelne dla stylów zabawkowych — te gubią wszystko poniżej
  // poziomu sylwetki (jaszczurki: „fringed eyebrows" dało generycznego gadzika):
  // gwiazdka na czole (to w dodatku umaszczenie, a plamy model zamalowuje) i „delikatna
  // korona między uszami".
  'fantasy/jednorozce': {
    warianty: [
      'a unicorn with a long spiral horn and a mane flowing in waves down its neck',
      'a chubby baby unicorn with stubby legs, an oversized head and a short blunt horn',
      'a unicorn with a spiral horn and big feathered wings spread wide',
      'a unicorn with a spiral horn and its mane braided into one thick plait with ribbons',
      'a unicorn with a spiral horn rearing up on its hind legs, mane streaming back',
      'a unicorn with a spiral horn and a very long tail sweeping along the ground',
      'a unicorn with a spiral horn lying down with its legs folded under it',
      'a unicorn with a spiral horn and a mane falling in broad rainbow stripes',
      'a unicorn with a spiral horn and a thick garland of flowers round its neck',
      'a unicorn with a spiral horn and a tiny foal with a bud horn beside it',
      'a unicorn with a spiral horn and a short curly mane in tight ringlets',
      'a unicorn with a spiral horn mid-leap with all four hooves off the ground'
    ],
    biale: 'white mane, white tail, white hooves',
    sceny: SCENY.tecza, grubosc: DEKORACYJNE, format: 'pion'
  },

  // Smoki: KAŻDY wariant wymienia ROGI. Ta sama kotwica co heder przy kombajnach i róg
  // przy jednorożcach, ale tu sąsiad jest najgroźniejszy z dotychczasowych, bo są to DWIE
  // istniejące kategorie serwisu: `zwierzeta/dinozaury` i `zwierzeta/jaszczurki`.
  //
  // Stara lista zderzała się z dinozaurami w czterech miejscach na dwanaście:
  //   „a row of ridged spines down its back"  → stegozaur ma podwójny rząd płyt
  //   „wide bat-like wings spread out"        → pteranodon ma błoniaste skrzydła
  //   „a fan-shaped crest behind its head"    → dilofozaur i parazaurolof mają grzebienie
  //   „a horned dragon"                       → triceratops ma trzy rogi
  // Sama cecha nie wystarczała, bo każdą z nich dinozaur też ma. Dopiero POŁĄCZENIE
  // rogów ze skrzydłami błoniastymi jest wyłącznie smocze — żaden dinozaur nie jest
  // skrzydlatym czworonogiem. Wariant 2 nie ma skrzydeł, więc niesie drugą wyłączność:
  // wąsy i rogi jak poroże, czyli smok wschodni, którego z gadem nie da się pomylić.
  //
  // Warianty różnicuje wyłącznie SYLWETKA — style zabawkowe gubią wszystko poniżej niej.
  'fantasy/smoki': {
    warianty: [
      'a plump baby dragon with a big round head, tiny horn buds and oversized membrane wings',
      'a long serpentine dragon with no wings, a whiskered snout and antler-like horns',
      'a four-legged dragon with curled ram-like horns and wide membrane wings spread out',
      'a dragon with swept-back horns and a very long neck held in a high curve',
      'a dragon hatchling with soft nubbin horns climbing out of a cracked egg',
      'a horned dragon curled into a tight spiral with its tail resting over its snout',
      'a dragon with two curved horns and a wide fan of skin framing its head',
      'a stocky dragon with short horns, a round belly and stubby wings too small to fly',
      'a dragon with tall straight horns and a long tail ending in an arrow-shaped tip',
      'a dragon with two slim horns, a slender neck and broad feathered wings',
      'a dragon with horns lowered, rearing on its hind legs with membrane wings raised high',
      'a two-headed dragon with a pair of horns on each head and one set of membrane wings'
    ],
    sceny: SCENY.smocze, grubosc: DEKORACYJNE, format: 'pion'
  },

  // Wróżki: PIERWSZA kategoria z postacią ludzką. Dwie rzeczy działają tu inaczej niż
  // przy zwierzętach i maszynach.
  //
  // 1. WŁOSY TO NOWE CZARNE ŁATY. Długa rozpuszczona fryzura to dla modelu jedna wielka
  //    ciemna plama — ten sam mechanizm, przez który poległy koty w pierwszym podejściu.
  //    Dlatego dziesięć z dwunastu wariantów ma włosy zamknięte w OKREŚLONYM KSZTAŁCIE:
  //    bob, warkocz, kucyki, upięte loki, krótkie, pod czapką albo kapturem. To nie jest
  //    ubóstwo pomysłu, tylko ta sama zasada co „white mane" przy koniach — dać modelowi
  //    kontur do narysowania zamiast masy do wypełnienia.
  //
  // 2. SĄSIADEM JEST MOTYL, nie inna wróżka. `zwierzeta/motyle` ma 91 liści w serwisie,
  //    a same skrzydła to opis motyla. Wyłączna jest dopiero POSTAĆ ze skrzydłami, dlatego
  //    każdy wariant zaczyna się od „a tiny fairy" — i słowo „tiny" niesie drugą robotę:
  //    trzyma skalę, bez której wyjdzie zwykła dziewczynka z doczepionymi skrzydłami.
  //
  // Oś sylwetki to KSZTAŁT SKRZYDEŁ (ważka, ćma, płatki, liść, wachlarz) plus jeden
  // element ubioru. Wariant 10 to chłopiec — kategoria nie ma być wyłącznie dziewczęca.
  //
  // 3. `full body fills the frame` W KAŻDYM WARIANCIE — dopisane po pilocie (12 szt.).
  //    Diagnoza z materiału: im mniejsza postać w kadrze, tym gorsza twarz. Przy dużej
  //    figurze oczy wychodziły ze źrenicami i rzęsami, przy małej jako puste owale,
  //    a ramiona kończyły się bez dłoni. To nie jest instrukcja dla operatora kamery,
  //    tylko fraza, której generator używa od zawsze w stałej KONTUR — tu musi stać
  //    w wariancie, bo `--goly` nie wysyła KONTUR w ogóle.
  //    UWAGA na napięcie z „tiny": „tiny" opisuje skalę W ŚWIECIE, „fills the frame"
  //    kadrowanie. Skalę trzymają dodatkowo sceny, gdzie rekwizyt jest większy od postaci.
  'fantasy/wrozki': {
    warianty: [
      'a tiny fairy with four long narrow dragonfly wings and short bobbed hair, full body fills the frame',
      'a tiny fairy with two broad rounded wings and a dress made of flower petals, full body fills the frame',
      'a tiny fairy with leaf-shaped wings and one long thick braid down her back, full body fills the frame',
      'a tiny fairy with soft rounded moth wings and a fluffy collar round her neck, full body fills the frame',
      'a tiny fairy with pointed leaf wings, a pointed hood and curled-toe shoes, full body fills the frame',
      'a tiny fairy with wings like a fanned-out flower and a very long trailing skirt, full body fills the frame',
      'a tiny fairy with small round wings, a round face and pigtails standing out sideways, full body fills the frame',
      'a tiny fairy with tall narrow wings held upright and a wand with a star on the tip, full body fills the frame',
      'a tiny fairy with wings and curly hair piled high, sitting with her knees drawn up, full body fills the frame',
      'a tiny fairy boy with pointed wings, cropped hair and a belted tunic, full body fills the frame',
      'a tiny fairy with wings and a hat made from an upturned flower, full body fills the frame',
      'a tiny fairy with wings and a hooded cloak, carrying a small round lantern, full body fills the frame'
    ],
    sceny: SCENY.wrozkowe, grubosc: DEKORACYJNE, format: 'pion'
  },
  // Syrenki: druga kategoria z postacią LUDZKĄ, więc obowiązują obie lekcje z wróżek —
  // włosy zamknięte w kształcie i `full body fills the frame` w każdym wariancie.
  //
  // SĄSIAD JEST TU POTRÓJNY i wszyscy trzej istnieją w serwisie albo czekają w rejestrze:
  //   `zwierzeta/ryby`   — sam ogon z płetwą to opis ryby
  //   `fantasy/wrozki`   — drobna postać z ozdobami; słowo „wings" przywołałoby ją wprost
  //   `ksiezniczki`      — dziewczynka w stroju; „gown", „crown" i „shoes" należą do niej
  // Kotwicą jest samo słowo `mermaid` i NIC PONADTO. Pierwsza wersja tej listy powtarzała
  // `fish tail` we wszystkich dwunastu wariantach, przez analogię do hedera przy kombajnach.
  // Jakub to zakwestionował i miał rację — analogia nie trzyma w obie strony:
  //   • heder był potrzebny, bo słowo „kombajn" NIE wystarczało, model i tak dawał traktory.
  //     Tymczasem „mermaid" to jedno z najlepiej wyuczonych pojęć w modelach graficznych,
  //     a rybi ogon należy do DEFINICJI tego słowa, nie jest jego detalem.
  //   • „fish" to słowo należące do SĄSIADA. Odganialiśmy rybę, wstawiając token „ryba"
  //     do każdego promptu — dokładnie ten mechanizm, przed którym ostrzega rozdział 4.
  // Ogon jest nadal opisany w każdym wariancie, ale wyłącznie jako KSZTAŁT (oś sylwetki),
  // nigdy jako gatunek. Z tego samego powodu wypadł „seahorse tip" — konik morski jest
  // wariantem w `zwierzeta/ryby`, więc przywoływałby tamtą kategorię.
  //
  // Korony nie ma nigdzie: syrenka w koronie to księżniczka z ogonem, a to osobna
  // kategoria. Zamiast niej opaska z muszli, spinka i sznur pereł.
  //
  // Oś sylwetki to KSZTAŁT OGONA (wachlarz, welon, spirala, widelec, czubek jak u konika
  // morskiego, krótki dziecięcy) plus fryzura o określonym obrysie. Whimsy gubi wszystko
  // poniżej poziomu sylwetki — przy jaszczurkach „fringed eyebrows" dało generycznego gadzika
  // — więc żaden wariant nie różnicuje się fakturą łusek ani wzorem na płetwie.
  //
  // POZY LEŻĄCE ODPADŁY ŚWIADOMIE. Przy króliczkach flop i sploot wyszły jako zwierzę do góry
  // nogami albo od tyłu; whimsy ich nie zna. Ogon układa się więc w spiralę i w łuk (warianty
  // 4 i 12), czyli pionowo, bo takie pozy przechodziły.
  //
  // Wariant 5 to chłopiec, tak samo jak dziesiąty u wróżek — kategoria nie ma być wyłącznie
  // dziewczęca. Stąd też sceny w `morskie` są bez zaimków.
  //
  // ── WNIOSKI Z SELEKCJI 48/72 (2026-08-04) — do przepisania przed następną serią ──
  //
  // 1. MASA CIAŁA NIE JEST OSIĄ SYLWETKI PRZY POSTACI LUDZKIEJ. Wariant 9 („a plump
  //    mermaid… a round face") i 2 („a chubby little mermaid child") wzięły się stąd,
  //    że u jednorożców i smoków tusza świetnie różnicuje obrys — „a chubby baby unicorn",
  //    „a stocky dragon with a round belly". Przeniesione na człowieka czyta się zupełnie
  //    inaczej i Jakub zgłosił to sam. Przy dziecku (wariant 2) jeszcze uchodzi, bo to
  //    trop bobasa; przy dorosłej postaci nie. Whimsy dodatkowo zaokrągla wszystko,
  //    czego nie musi. Różnicować włosami, kształtem ogona, strojem i rekwizytem.
  //
  // 2. RYBICH CECH NIE DOKLEJAĆ DO LUDZKIEJ POŁOWY. Najsłabszy wariant (11, 2/6) miał
  //    „a tall ridged fin down her back", czyli płetwę grzbietową na ludzkich plecach.
  //    Ogon jest miejscem na wariacje płetw — tors nie jest.
  //
  // 3. DRUGA POSTAĆ W KADRZE KOSZTUJE. Wariant 10 (syrenka z bobasem) i scena z delfinem
  //    poszły po 50%, przy średniej 67%. Każda dodatkowa istota to druga twarz do
  //    zepsucia, a twarze są tu najtrudniejsze — to ta sama lekcja co przy wróżkach.
  //
  // 4. Najlepszy wariant (4, 6/6) to ogon zwinięty w spiralę plus bob. Zwarta sylwetka
  //    i włosy o zamkniętym kształcie — dokładnie to, co miało działać.
  //
  // `biale` wypełnione zgodnie z checklistą: włosy i łuski to dla modelu partie z natury
  // ciemne, dokładnie jak grzywa u koni. Uwaga — `--goly` tego pola NIE wysyła, a przy kotach
  // okazało się, że pod stylami panelowymi problem i tak nie wraca (to była właściwość
  // wbudowanego „Line art"). Pole jest tu na wypadek serii bez `--goly`.
  'fantasy/syrenki': {
    warianty: [
      'a mermaid with a long tail ending in a wide fan-shaped fluke, a shell top and one thick braid, full body fills the frame',
      'a chubby little mermaid child with a short stubby tail, an oversized head and two bunches of hair, full body fills the frame',
      'a mermaid with a long tail trailing veil-like fins, a shell top and hair in a high bun, full body fills the frame',
      'a mermaid with a tail curled into a spiral, a shell top and short bobbed hair, full body fills the frame',
      'a merman boy with a broad strong tail, cropped hair and a belt of shells, full body fills the frame',
      'a mermaid with a tail edged with scalloped frills, a shell top and a wide shell headband, full body fills the frame',
      'a mermaid with a long tail ending in a deeply forked fluke and two long braids, full body fills the frame',
      'a mermaid with a slender tail tapering to a tightly curled tip and hair in a topknot, full body fills the frame',
      'a plump mermaid with a short broad tail, a round face, short curly hair and a small round hand mirror, full body fills the frame',
      'a mermaid with a long tail and a tiny merbaby with a stubby tail beside her, full body fills the frame',
      'a mermaid with a tail and a tall ridged fin down her back, a shell top and a long plait bound with ribbon, full body fills the frame',
      'a mermaid with a long tail curved in a high arc, a strand of pearls and a long ponytail, full body fills the frame'
    ],
    biale: 'white hair, white scales, white tail fin',
    sceny: SCENY.morskie, grubosc: DEKORACYJNE, format: 'pion'
  },
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
  // Mandala: JEDYNA dotąd kategoria bez bohatera. Nie ma sylwetki do trzymania ani sceny,
  // w której coś stoi, więc obie osie znaczą tu co innego niż wszędzie indziej:
  // oś pierwsza to SŁOWNIK ORNAMENTU (z czego zbudowany jest wzór), druga to STRUKTURA
  // (jak gęsto rozłożona jest materia) — patrz `STRUKTURY` w sceny.mjs.
  //
  // GŁÓWNE RYZYKO TEJ KATEGORII TO CZERŃ, i jest inne niż przy zwierzętach. Tam czerń brała
  // się z tła albo z umaszczenia; tutaj bierze się z tego, że PRAWDZIWA sztuka mandalowa ma
  // co drugi segment zamalowany na czarno. Model poproszony o mandalę ma pełne prawo narysować
  // ozdobną grafikę zamiast niepokolorowanej kolorowanki. Dlatego z pilota wykluczone są style,
  // które lite plamy dawały już na zwierzętach (elegant-contemporary 13–15%, rustic-elegance).
  //
  // Motywy dobrane pod POLE DO ZAMALOWANIA, nie pod urodę na ekranie. Wypadły trzy z poprzedniej
  // wersji: „concentric beaded rings" (koraliki to pola wielkości ziarna, a do tego to struktura,
  // nie motyw — należała do drugiej osi), „small stars" (to samo, stąd teraz gwiazdy ośmioramienne)
  // oraz jeden z dwóch bliźniaczych opisów łezek — „lotus petals and teardrops" bił się z „paisley
  // teardrop motifs", a lotos ma własną, mocniejszą cechę: warstwy.
  // Doszły witraże: gruby ołów między szybkami to najlepszy możliwy materiał na kolorowankę,
  // bo daje duże, jednoznacznie zamknięte pola.
  'dla-doroslych/mandala': {
    warianty: [
      'a mandala of layered flower petals',
      'a mandala of interlocking triangles and diamonds',
      'a mandala of pointed star rays',
      'a mandala of curling leaves and vines',
      'a mandala of lotus petals opening in tiers',
      'a mandala of lace-like scalloped arches',
      'a mandala of feathers fanning outward',
      'a mandala of paisley teardrop motifs',
      'a mandala of fish scales and folding fans',
      'a mandala of celtic knotwork loops',
      'a mandala of crescent moons and eight-pointed stars',
      'a mandala of stained-glass panes divided by thick leading'
    ],
    sceny: STRUKTURY, grubosc: DLA_DOROSLEGO, format: 'kwadrat',

    // ── Drugi zestaw: --zestaw=tematyczne ─────────────────────────────────────
    // Dwunastka wyżej jest czysto ornamentalna i to ona odpowiada frazie „mandala".
    // Ten zestaw stoi obok niej, nie zamiast, i jest ZAKŁADEM, nie pewniakiem.
    //
    // Powód biznesowy: w kolorowankach dla dorosłych najlepiej sprzedają się mandale
    // TEMATYCZNE — rozpoznawalny motyw zbudowany z ornamentu (sowa, drzewo życia, słońce
    // i księżyc). Mają własne frazy w wyszukiwarce, których sam ornament nie złapie.
    //
    // Powód ostrożności: to zadanie DWUKROTNIE trudniejsze od zwykłej mandali, bo obraz musi
    // być naraz rozpoznawalnym obiektem i symetrycznym wzorem. Model ma dwa sposoby, żeby to
    // spartaczyć: narysować zwykłe zwierzę z ornamentem w tle albo utopić temat w koronce.
    // Dlatego każdy wariant nazywa wprost, że sylwetka ma być ZBUDOWANA z ornamentu.
    //
    // Sowa i motyl są tu świadomie, mimo że serwis ma `zwierzeta/motyle` — mandala z motyla
    // to inny produkt i inna fraza niż kolorowanka z motylem, a symetria dwuosiowa motyla
    // jest dla tego zadania idealna.
    zestawy: {
      tematyczne: {
        warianty: [
          'a mandala shaped like an owl, its body built from ornamental rings',
          'a mandala shaped like a butterfly, its wings built from ornamental panels',
          'a mandala shaped like a tree of life, its branches curving into a circle',
          'a mandala of a sun and a crescent moon sharing one round frame',
          'a mandala shaped like an elephant head, its ears built from ornamental panels',
          'a mandala of ocean waves, shells and starfish in ornamental rings',
          'a mandala shaped like a rose seen from directly above, petal on petal',
          'a mandala of a horse head built from ornamental scrollwork',
          'a mandala of snowflake arms meeting at a six-sided hub',
          'a mandala shaped like a peacock tail fanned into a full circle',
          'a mandala of hot air balloons and clouds in ornamental rings',
          'a mandala shaped like a cat face, its fur built from ornamental scrolls'
        ]
      }
    }
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
