<script setup>
// definePageMeta({
//   layout: 'default'
// })
[
  useHead(() => {
  const canonical = 'https://twoja-kolorowanka.pl/'

  return {
    title: 'Kolorowanki do druku PDF – darmowe kolorowanki dla dzieci',
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: 'Pobierz darmowe kolorowanki do druku w formacie A4. Zwierzęta, bajki, pojazdy i edukacyjne malowanki – wszystko bez logowania i całkowicie za darmo!' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'keywords', content: 'kolorowanki do druku, darmowe kolorowanki PDF, kolorowanki dla dzieci, malowanki A4, bajki do kolorowania' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Kolorowanki do druku PDF – darmowe kolorowanki dla dzieci' },
      { property: 'og:description', content: 'Pobierz darmowe kolorowanki do druku w formacie A4. Zwierzęta, bajki, pojazdy i edukacyjne malowanki – wszystko bez logowania i całkowicie za darmo!' },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: 'https://twoja-kolorowanka.pl/logo-1.webp' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://twoja-kolorowanka.pl/#website",
              "url": "https://twoja-kolorowanka.pl/",
              "name": "Twoja Kolorowanka",
              "inLanguage": "pl-PL",
              "publisher": {
                "@id": "https://twoja-kolorowanka.pl/#organization"
              },
            },
            {
              "@type": "WebPage",
              "@id": "https://twoja-kolorowanka.pl/#webpage",
              "url": "https://twoja-kolorowanka.pl/",
              "name": "Kolorowanki do druku PDF – darmowe kolorowanki dla dzieci",
              "description": "Pobierz darmowe kolorowanki do druku w formacie A4. Zwierzęta, bajki, pojazdy i edukacyjne malowanki – wszystko bez logowania i całkowicie za darmo!",
              "isPartOf": { "@id": "https://twoja-kolorowanka.pl/#website" },
              "primaryImageOfPage": {
                "@id": "https://twoja-kolorowanka.pl/#primaryimage"
              },
              "datePublished": "2024-01-01",
              "dateModified": "2025-07-06",
              "inLanguage": "pl-PL"
            },
            {
              "@type": "ImageObject",
              "@id": "https://twoja-kolorowanka.pl/#primaryimage",
              "url": "https://twoja-kolorowanka.pl/og-default.jpg",
              "contentUrl": "https://twoja-kolorowanka.pl/og-default.jpg",
              "caption": "Kolorowanki do druku dla dzieci – darmowe PDF"
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://twoja-kolorowanka.pl/#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Strona główna",
                  "item": "https://twoja-kolorowanka.pl/"
                }
              ]
            },
            {
              "@type": "Organization",
              "@id": "https://twoja-kolorowanka.pl/#organization",
              "name": "Twoja Kolorowanka",
              "url": "https://twoja-kolorowanka.pl/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://twoja-kolorowanka.pl/logo.png"
              }
            }
          ]
        })
      }
    ]
  }
})

]  

const faqs = [
  {
    question: "Czy kolorowanki na Twoja-Kolorowanka.pl są całkowicie darmowe?",
    answer: "<p>Tak! Wszystkie kolorowanki dostępne na Twoja-Kolorowanka.pl są <strong>100% darmowe</strong>. Nie pobieramy żadnych opłat ani nie wymagamy rejestracji – wystarczy kliknąć „Pobierz PDF” i od razu możesz wydrukować swoje ulubione wzory.</p>"
  },
  {
    question: "W jakim formacie pobiorę kolorowanki i jak je wydrukować?",
    answer: "<p>Kolorowanki pobierasz w formacie <strong>PDF</strong>, zoptymalizowanym do druku na kartce A4. Po pobraniu otwórz plik w dowolnym czytniku PDF (np. Adobe Reader) i wybierz opcję drukuj – wszystko jest gotowe do użycia.</p>"
  },
  {
    question: "Czy mogę wykorzystać kolorowanki w przedszkolu lub szkole?",
    answer: "<p>Oczywiście – nasze kolorowanki są przygotowane z myślą o edukacji i mogą być używane na zajęciach przedszkolnych, lekcjach plastyki czy warsztatach. Pliki PDF są łatwe w udostępnianiu i drukowaniu w większych nakładach.</p>"
  },
  {
    question: "Jakie kategorie kolorowanek znajdę na stronie?",
    answer: "<p>Masz do wyboru dziesiątki kategorii: <strong>zwierzęta</strong> (psy, koty, jednorożce), <strong>bajki</strong> (Frozen, Peppa Pig, Psi Patrol), <strong>pojazdy</strong> (samochody, traktory), <strong>edukacyjne</strong> (cyfry, litery, pory roku), a także wzory sezonowe i świąteczne.</p>"
  },
  {
    question: "Czy na Twoja-Kolorowanka.pl są dostępne interaktywne kolorowanki online?",
    answer: "<p>Tak – oprócz plików PDF oferujemy również prosty moduł <strong>kolorowania online</strong>. Wybierz obrazek i koloruj go bezpośrednio w przeglądarce, a potem pobierz gotowy wydruk lub screenshot.</p>"
  },
  {
    question: "Czy muszę podać e-mail lub założyć konto, żeby pobrać kolorowankę?",
    answer: "<p>Nie ma takiej potrzeby. Cały proces pobierania jest <strong>bez logowania</strong> i nie zbieramy adresów e-mail. Chronimy Twoją prywatność i skupiamy się na tym, co najważniejsze – kreatywnej zabawie.</p>"
  },
  {
    question: "Czy mogę zasugerować nowy motyw kolorowanki?",
    answer: "<p>Oczywiście! Jeśli masz pomysł na tematykę lub konkretny wzór, wyślij propozycję przez formularz kontaktowy lub na nasz Facebook. Baza jest stale aktualizowana – Twoja sugestia może trafić do kolejnych aktualizacji.</p>"
  },
  {
    question: "Jak często dodajecie nowe kolorowanki?",
    answer: "<p>Nowe wzory publikujemy co tydzień, uwzględniając sugestie użytkowników oraz kalendarz sezonowy. Dzięki temu zawsze znajdziesz u nas aktualne i ciekawe motywy – od Walentynek, przez Wielkanoc, aż po Boże Narodzenie.</p>"
  }
];

const seoBlocks = [{"heading": "Kolorowanki do druku PDF – świat kreatywności dla dzieci", "text": "<p><strong>Twoja Kolorowanka</strong> to skarbnica <strong>darmowych kolorowanek PDF do druku</strong>, stworzona z myślą o dzieciach, rodzicach i nauczycielach. Znajdziesz tu setki tematycznych ilustracji gotowych do pobrania w formacie A4 – od bajkowych postaci, przez zwierzęta, aż po edukacyjne arkusze. Każda kolorowanka to zaproszenie do świata wyobraźni, bez potrzeby logowania i całkowicie za darmo.</p>"}, {"heading": "Dlaczego dzieci kochają kolorowanki? Psychologia koloru i radości", "text": "<p>Kolorowanie pozwala dziecku być twórcą – to nie tylko rozrywka, ale także proces budowania tożsamości, wyrażania emocji i rozwijania cierpliwości. Kiedy maluch sięga po kredki, ćwiczy motorykę, planowanie i podejmowanie decyzji. Dzieci czują dumę z ukończonego obrazka, co wzmacnia pewność siebie. To bezpieczna alternatywa dla ekranów i sposób na ciche, skupione popołudnie.</p>"}, {"heading": "Darmowe kolorowanki PDF – bajki, edukacja i zabawa w jednym", "text": "<p>W naszej bibliotece znajdziesz <strong>kolorowanki z Frozen, Świnką Peppą, Pokemonami i Spidermanem</strong>, ale też dinozaury, pojazdy, litery, cyfry i mandale. Wszystkie ilustracje dostępne są w formacie PDF i zoptymalizowane do wydruku A4. Każdy plik został starannie przygotowany – z wyraźnym konturem i formatem przyjaznym dzieciom w różnym wieku.</p>"}, {"heading": "Zalety kolorowanek – 10 powodów, dla których warto je pobierać", "text": "<ul class=\"grid grid-cols-1 mb-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3 text-center text-base md:text-lg font-light max-w-5xl mx-auto\"><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-orange-500\">Rozwijają wyobraźnię</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-tertiary-400\">Ćwiczą motorykę małą</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-yellow-500\">Uspokajają i wyciszają</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-sec-500\">Uczą koncentracji</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-main-500\">Pomagają w nauce liter i cyfr</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-coolGray-500\">Wzmacniają koordynację ręka-oko</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-orange-500\">To świetna zabawa offline</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-tertiary-400\">Wspierają rozwój emocjonalny</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-yellow-500\">Są tanie i łatwe w użyciu</li><li class=\"bg-none text-black p-2 flex items-center justify-center font-medium rounded border-4 border-dotted border-sec-500\">Dają dzieciom poczucie sprawczości</li></ul><p class=\"text-center text-base md:text-lg font-light max-w-2xl mx-auto\">Kolorowanie to coś więcej niż hobby – to narzędzie rozwojowe.</p>"  
}, {"heading": "Jak działa Twoja Kolorowanka? Bez logowania, bez reklam, bez stresu", "text": "<p>Chcemy, by korzystanie z naszej strony było przyjemne i intuicyjne. Wybierasz kategorię, przeglądasz ilustracje, klikasz „<strong>Pobierz</strong>” i gotowe – <strong>plik PDF</strong> trafia na Twój dysk. Nie wymagamy konta, nie zasypujemy reklamami. Nasze kolorowanki są dostępne natychmiast, gotowe do druku w domu, w szkole lub na zajęciach terapeutycznych.</p>"}, {"heading": "Mikrofabuła: Zosia i jednorożec – jak kolorowanka stała się rytuałem", "text": "<p>Zosia ma cztery lata i każdego ranka po śniadaniu wybiera sobie nową kolorowankę. Jej ulubione to te z jednorożcami. Koloruje zawsze z mamą przy kuchennym stole – to ich wspólny rytuał. Dzięki temu Zosia ćwiczy rączkę, a mama ma chwilę na kawę. Ten prosty rytuał stał się ich najważniejszą częścią dnia – a wszystko zaczęło się od kliknięcia „Pobierz PDF”.</p>"}, {"heading": "Kolorowanki sezonowe i świąteczne – zawsze na czas!", "text": "<p>Co miesiąc dodajemy nowe ilustracje dostosowane do kalendarza: <strong>walentynki, Wielkanoc, Dzień Dinozaura, wakacje, Halloween, Boże Narodzenie</strong>. Dzięki temu dzieci mogą uczyć się o tradycjach i porach roku, bawiąc się kreatywnie. To idealne rozwiązanie do zajęć tematycznych w przedszkolach, szkołach i w domu.</p>"}, {"heading": "Dołącz do społeczności Twoja Kolorowanka – setki rodzin, jedna pasja", "text": "<p>Nasze kolorowanki pobierane są codziennie przez rodziny z całej Polski. Rodzice dzielą się pracami dzieci na Facebooku i Instagramie, a nauczyciele wykorzystują nasze materiały na lekcjach i warsztatach. Dołącz do tej rosnącej społeczności – kliknij, pobierz i przekonaj się, jak wielką radość może dać kilka kredek i kawałek papieru.</p>"}];
const galleryItems = ref([
  {
    src: '/koty/1/koty-1.svg',
    alt: "kolorowanki Koty do druku pdf",
    title: "Koty",
    url: "/zwierzeta/koty"
  },
    {
    src: '/koniki/1/koniki-1.svg',
    alt: "kolorowanki Koniki do druku pdf ",
    title: "Koniki",
    url: "/zwierzeta/koniki"
  },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Pusheen",
  //   title: "Pusheen",
  //   url: "/dla-dziewczynek/pusheen"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Psi Patrol",
  //   title: "Psi Patrol",
  //   url: "/bajki/psi-patrol"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Minecraft",
  //   title: "Minecraft",
  //   url: "/gry/minecraft"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Świąteczne",
  //   title: "Świąteczne",
  //   url: "/okazjonalne/swiateczne"
  // },
  {
    src: '/fantasy/jednorozce/16/jednorozce-16.svg',
    alt: "jednorożce do druku pdf",
    title: "jednorożce",
    url: "/fantasy/jednorozce"
  },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Toca Boca",
  //   title: "Toca Boca",
  //   url: "/gry/toca-boca"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Brawl Stars",
  //   title: "Brawl Stars",
  //   url: "/gry/brawl-stars"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Dla Dziewczynek",
  //   title: "Dla Dziewczynek",
  //   url: "/dla-dziewczynek"
  // },,
    {
    src: '/kroliczki/1/kroliczki-1.svg',
    alt: "kolorowanki kroliczki do druku",
    title: "Kroliczki",
    url: "/zwierzeta/kroliczki"
  },
  {
    src: '/pieski/26/pieski-26.svg',
    alt: "kolorowanki Pieski do druku",
    title: "Pieski",
    url: "/zwierzeta/pieski"
  },
    {
    src: '/fantasy/wrozki/20/wrozki-20.svg',
    alt: "kolorowanki wróżki do druku",
    title: "Wróżki",
    url: "/fantasy/wrozki"
  },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Stitch",
  //   title: "Stitch",
  //   url: "/bajki/stitch"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Pokemon",
  //   title: "Pokemon",
  //   url: "/gry/pokemon"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Barbie",
  //   title: "Barbie",
  //   url: "/dla-dziewczynek/barbie"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Dla Chłopców",
  //   title: "Dla Chłopców",
  //   url: "/dla-chlopcow"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Hello Kitty",
  //   title: "Hello Kitty",
  //   url: "/dla-dziewczynek/hello-kitty"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Koniki",
  //   title: "Koniki",
  //   url: "/natura/koniki"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Kwiat",
  //   title: "Kwiat",
  //   url: "/natura/kwiat"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Sonic",
  //   title: "Sonic",
  //   url: "/dla-chlopcow/sonic"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Traktor",
  //   title: "Traktor",
  //   url: "/pojazdy/traktor"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Księżniczki",
  //   title: "Księżniczki",
  //   url: "/dla-dziewczynek/ksiezniczki"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Peppa",
  //   title: "Peppa",
  //   url: "/bajki/peppa"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Samochód",
  //   title: "Samochód",
  //   url: "/pojazdy/samochod"
  // },
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Star Wars",
  //   title: "Star Wars",
  //   url: "/film/star-wars"
  // }
])
useHead(() => {
  const canonical = 'https://twoja-kolorowanka.pl'
  const image = `https://twoja-kolorowanka.pl/logo-1.webp`

  return {
    title: 'Kolorowanki dla dzieci do druku | Darmowe malowanki online',
    htmlAttrs: {
      lang: 'pl'
    },
    link: [
      { rel: 'canonical', href: canonical }
    ],
    meta: [
      { name: 'description', content: 'Darmowe kolorowanki do druku dla dzieci. Setki wzorów gotowych do pobrania!' },
      { name: 'keywords', content: 'kolorowanki, malowanki, dla dzieci, do druku, bajki, gry, darmowe kolorowanki' },
      { name: 'robots', content:  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },

      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Kolorowanki dla dzieci do druku | Darmowe malowanki online' },
      { property: 'og:description', content: 'Darmowe kolorowanki do druku z bajek, gier i filmów. Wydrukuj i baw się kolorowaniem!' },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: 'twoja-kolorowanka.pl' },
      { property: 'og:locale', content: 'pl_PL' },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Kolorowanki do druku za darmo | twoja-kolorowanka.pl' },
      { name: 'twitter:description', content: 'Setki kolorowanek gotowych do druku. Dla dzieci i całej rodziny. Pobierz za darmo!' },
      { name: 'twitter:image', content: image }
    ]
  }
})
const galleryVariantsCats = [
  { img: '/koty/1/koty-1.svg', url: '/zwierzeta/koty/1', title: 'Koty', alt: 'Kolorowanka koty' },
  { img: '/koty/2/koty-2.svg', url: '/zwierzeta/koty/2', title: 'Koty', alt: 'kolorowanka do druku koty PDF' },
  { img: '/koty/3/koty-3.svg', url: '/zwierzeta/koty/3', title: 'Koty', alt: 'koty kolorowanki dla dzieci' },
  { img: '/koty/4/koty-4.svg', url: '/zwierzeta/koty/4', title: 'Koty', alt: 'koty kolorowanka dla dzieci' },
  { img: '/koty/5/koty-5.svg', url: '/zwierzeta/koty/5', title: 'Koty', alt: 'koty do druku i pokolorowania' },
  { img: '/koty/6/koty-6.svg', url: '/zwierzeta/koty/6', title: 'Koty', alt: 'koty kolorowanka' },
  { img: '/koty/7/koty-7.svg', url: '/zwierzeta/koty/7', title: 'Koty', alt: 'Kolorowanki do druku koty' },
  { img: '/koty/8/koty-8.svg', url: '/zwierzeta/koty/8', title: 'Koty', alt: 'koty do druku i pokolorowania' }
];

const galleryVariantsCatsSec = [
  { img: '/koty/9/koty-9.svg', url: '/zwierzeta/koty/9', title: 'Koty', alt: 'koty do druku dla dzieci PDF' },
  { img: '/koty/10/koty-10.svg', url: '/zwierzeta/koty/10', title: 'Koty', alt: 'kolorowanka PDF koty do wydruku' },
  { img: '/koty/11/koty-11.svg', url: '/zwierzeta/koty/11', title: 'Koty', alt: 'kolorowanka koty do pobrania A4' },
  { img: '/koty/12/koty-12.svg', url: '/zwierzeta/koty/12', title: 'Koty', alt: 'koty malowanki edukacyjne' },
  { img: '/koty/13/koty-13.svg', url: '/zwierzeta/koty/13', title: 'Koty', alt: 'koty do druku PDF dla przedszkolaków' },
  { img: '/koty/14/koty-14.svg', url: '/zwierzeta/koty/14', title: 'Koty', alt: 'kolorowanki koty w stylu kawaii' },
  { img: '/koty/15/koty-15.svg', url: '/zwierzeta/koty/15', title: 'Koty', alt: 'kolorowanka do druku koty A4' },
  { img: '/koty/16/koty-16.svg', url: '/zwierzeta/koty/16', title: 'Koty', alt: 'kolorowanki PDF kotki do pokolorowania' }
];


const galleryVariantsUnicorns = [
  { img: '/fantasy/jednorozce/1/jednorozce-1.svg', url: '/fantasy/jednorozce/1', title: 'jednorozce', alt: 'Kolorowanka jednorozce' },
  { img: '/fantasy/jednorozce/2/jednorozce-2.svg', url: '/fantasy/jednorozce/2', title: 'jednorozce', alt: 'kolorowanka do druku jednorozce PDF' },
  { img: '/fantasy/jednorozce/3/jednorozce-3.svg', url: '/fantasy/jednorozce/3', title: 'jednorozce', alt: 'jednorozce kolorowanki dla dzieci' },
  { img: '/fantasy/jednorozce/4/jednorozce-4.svg', url: '/fantasy/jednorozce/4', title: 'jednorozce', alt: 'jednorozce kolorowanka dla dzieci' },
  { img: '/fantasy/jednorozce/5/jednorozce-5.svg', url: '/fantasy/jednorozce/5', title: 'jednorozce', alt: 'jednorozce do druku i pokolorowania' },
  { img: '/fantasy/jednorozce/6/jednorozce-6.svg', url: '/fantasy/jednorozce/6', title: 'jednorozce', alt: 'jednorozce kolorowanka' },
  { img: '/fantasy/jednorozce/7/jednorozce-7.svg', url: '/fantasy/jednorozce/7', title: 'jednorozce', alt: 'Kolorowanki do druku jednorozce' },
  { img: '/fantasy/jednorozce/8/jednorozce-8.svg', url: '/fantasy/jednorozce/8', title: 'jednorozce', alt: 'jednorozce do druku i pokolorowania' }
];

const galleryVariantsUnicornsSec = [
  { img: '/fantasy/jednorozce/9/jednorozce-9.svg', url: '/fantasy/jednorozce/9', title: 'Jednorożce', alt: 'kolorowanki jednorożce do druku PDF' },
  { img: '/fantasy/jednorozce/10/jednorozce-10.svg', url: '/fantasy/jednorozce/10', title: 'Jednorożce', alt: 'jednorożce do kolorowania dla dzieci' },
  { img: '/fantasy/jednorozce/11/jednorozce-11.svg', url: '/fantasy/jednorozce/11', title: 'Jednorożce', alt: 'darmowe kolorowanki PDF jednorożce A4' },
  { img: '/fantasy/jednorozce/12/jednorozce-12.svg', url: '/fantasy/jednorozce/12', title: 'Jednorożce', alt: 'malowanka jednorożce do pobrania i druku' },
  { img: '/fantasy/jednorozce/13/jednorozce-13.svg', url: '/fantasy/jednorozce/13', title: 'Jednorożce', alt: 'jednorożce kolorowanki PDF dla przedszkolaków' },
  { img: '/fantasy/jednorozce/14/jednorozce-14.svg', url: '/fantasy/jednorozce/14', title: 'Jednorożce', alt: 'kolorowanka do druku z jednorożcem A4' },
  { img: '/fantasy/jednorozce/15/jednorozce-15.svg', url: '/fantasy/jednorozce/15', title: 'Jednorożce', alt: 'jednorożce do wydruku i kolorowania' },
  { img: '/fantasy/jednorozce/16/jednorozce-16.svg', url: '/fantasy/jednorozce/16', title: 'Jednorożce', alt: 'kolorowanki magiczne jednorożce PDF do druku' }
];


const galleryVariantsHorses= [
  { img: '/koniki/1/koniki-1.svg', url: '/fantasy/koniki/1', title: 'koniki', alt: 'Kolorowanka koniki' },
  { img: '/koniki/2/koniki-2.svg', url: '/fantasy/koniki/2', title: 'koniki', alt: 'kolorowanka do druku koniki PDF' },
  { img: '/koniki/3/koniki-3.svg', url: '/fantasy/koniki/3', title: 'koniki', alt: 'koniki kolorowanki dla dzieci' },
  { img: '/koniki/4/koniki-4.svg', url: '/fantasy/koniki/4', title: 'koniki', alt: 'koniki kolorowanka dla dzieci' },
  { img: '/koniki/5/koniki-5.svg', url: '/fantasy/koniki/5', title: 'koniki', alt: 'koniki do druku i pokolorowania' },
  { img: '/koniki/6/koniki-6.svg', url: '/fantasy/koniki/6', title: 'koniki', alt: 'koniki kolorowanka' },
  { img: '/koniki/7/koniki-7.svg', url: '/fantasy/koniki/7', title: 'koniki', alt: 'Kolorowanki do druku koniki' },
  { img: '/koniki/8/koniki-8.svg', url: '/fantasy/koniki/8', title: 'koniki', alt: 'koniki do druku i pokolorowania' }
];

const galleryVariantsDogs = [
  { img: '/pieski/1/pieski-1.svg', url: '/zwierzeta/pieski/1', title: 'pieski', alt: 'Kolorowanka pieski' },
  { img: '/pieski/2/pieski-2.svg', url: '/zwierzeta/pieski/2', title: 'pieski', alt: 'kolorowanka do druku pieski PDF' },
  { img: '/pieski/3/pieski-3.svg', url: '/zwierzeta/pieski/3', title: 'pieski', alt: 'pieski kolorowanki dla dzieci' },
  { img: '/pieski/4/pieski-4.svg', url: '/zwierzeta/pieski/4', title: 'pieski', alt: 'pieski kolorowanka dla dzieci' },
  { img: '/pieski/5/pieski-5.svg', url: '/zwierzeta/pieski/5', title: 'pieski', alt: 'pieski do druku i pokolorowania' },
  { img: '/pieski/6/pieski-6.svg', url: '/zwierzeta/pieski/6', title: 'pieski', alt: 'pieski kolorowanka' },
  { img: '/pieski/7/pieski-7.svg', url: '/zwierzeta/pieski/7', title: 'pieski', alt: 'Kolorowanki do druku pieski' },
  { img: '/pieski/8/pieski-8.svg', url: '/zwierzeta/pieski/8', title: 'pieski', alt: 'pieski do druku i pokolorowania' }
];

const galleryVariantsDogsSec = [
  { img: '/pieski/9/pieski-9.svg', url: '/zwierzeta/pieski/9', title: 'Pieski', alt: 'kolorowanki pieski do druku PDF' },
  { img: '/pieski/10/pieski-10.svg', url: '/zwierzeta/pieski/10', title: 'Pieski', alt: 'malowanka pieski do pobrania A4' },
  { img: '/pieski/11/pieski-11.svg', url: '/zwierzeta/pieski/11', title: 'Pieski', alt: 'darmowa kolorowanka pieski do wydruku' },
  { img: '/pieski/12/pieski-12.svg', url: '/zwierzeta/pieski/12', title: 'Pieski', alt: 'pieski do druku dla dzieci PDF' },
  { img: '/pieski/13/pieski-13.svg', url: '/zwierzeta/pieski/13', title: 'Pieski', alt: 'kolorowanka do druku pieski A4' },
  { img: '/pieski/14/pieski-14.svg', url: '/zwierzeta/pieski/14', title: 'Pieski', alt: 'kolorowanki PDF z pieskami do pokolorowania' },
  { img: '/pieski/15/pieski-15.svg', url: '/zwierzeta/pieski/15', title: 'Pieski', alt: 'kolorowanki pieski dla przedszkolaków' },
  { img: '/pieski/16/pieski-16.svg', url: '/zwierzeta/pieski/16', title: 'Pieski', alt: 'pieski do kolorowania i druku dla dzieci' }
];

const galleryVariantsRabbits = [
  { img: '/kroliczki/1/kroliczki-1.svg', url: '/fantasy/kroliczki/1', title: 'kroliczki', alt: 'Kolorowanka kroliczki' },
  { img: '/kroliczki/2/kroliczki-2.svg', url: '/fantasy/kroliczki/2', title: 'kroliczki', alt: 'kolorowanka do druku kroliczki PDF' },
  { img: '/kroliczki/3/kroliczki-3.svg', url: '/fantasy/kroliczki/3', title: 'kroliczki', alt: 'kroliczki kolorowanki dla dzieci' },
  { img: '/kroliczki/4/kroliczki-4.svg', url: '/fantasy/kroliczki/4', title: 'kroliczki', alt: 'kroliczki kolorowanka dla dzieci' },
  { img: '/kroliczki/5/kroliczki-5.svg', url: '/fantasy/kroliczki/5', title: 'kroliczki', alt: 'kroliczki do druku i pokolorowania' },
  { img: '/kroliczki/6/kroliczki-6.svg', url: '/fantasy/kroliczki/6', title: 'kroliczki', alt: 'kroliczki kolorowanka' },
  { img: '/kroliczki/7/kroliczki-7.svg', url: '/fantasy/kroliczki/7', title: 'kroliczki', alt: 'Kolorowanki do druku kroliczki' },
  { img: '/kroliczki/8/kroliczki-8.svg', url: '/fantasy/kroliczki/8', title: 'kroliczki', alt: 'kroliczki do druku i pokolorowania' }
];

const galleryVariantsList = [galleryVariantsCats, galleryVariantsDogs, galleryVariantsHorses, galleryVariantsUnicorns, galleryVariantsRabbits, galleryVariantsCatsSec,galleryVariantsDogsSec,galleryVariantsUnicornsSec]
</script>
<template>
  <div class="index-page">
    <Hero
      :h1="{ firstPartTitle: 'Darmowe kolorowanki', seccondPartTitle: 'do druku pdf' }"
      isCategory
    />

    <UContainer>

      <!-- Pierwszy blok SEO -->
      <div class="flex flex-row flex-nowrap items-center mt-12 mb-4 leading-tight tracking-tight">
        <span class="flex-grow border-t border-black" aria-hidden="true"></span>
        <Heading
          :text="seoBlocks[0].heading"
          as="h2"
          backgroundColor="bg-sec-500"
          fontSize="text-3xl"
          textColor="text-white"
        />
        <span class="flex-grow border-t border-black" aria-hidden="true"></span>
      </div>
      <div
        v-html="seoBlocks[0].text"
        class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8"
      ></div>

      <!-- Galeria kategorii -->
      <h2 class="text-3xl font-bold mb-4 text-center">
        Najważniejsze kategorie
      </h2>
      <CategoryGallery :items="galleryItems.slice(0,23)" />

      <!-- Kolejne bloki SEO + dynamiczne galerie wariantów -->
      <div
        v-for="(block, i) in seoBlocks.slice(1)"
        :key="i"
        class="mb-12"
      >
        <div class="flex flex-row flex-nowrap items-center mt-12 mb-4 leading-tight tracking-tight">
          <span class="flex-grow border-t border-black" aria-hidden="true"></span>
          <Heading
            :text="block.heading"
            as="h2"
            backgroundColor="bg-sec-500"
            fontSize="text-3xl"
            textColor="text-white"
          />
          <span class="flex-grow border-t border-black" aria-hidden="true"></span>
        </div>
        <div
          v-html="block.text"
          class="text-xl font-light text-center mx-auto px-4 lg:px-8 mb-6"
        ></div>

        <!-- Wstaw galerię tylko jeśli tablica nie jest pusta -->
        <VariantsGallery
          v-if="galleryVariantsList[i]?.length"
          :items="galleryVariantsList[i]"
        />
      </div>
    </UContainer>

    <!-- FAQ na dole strony -->
    <FaqList :faqs="faqs" />
  </div>
</template>

