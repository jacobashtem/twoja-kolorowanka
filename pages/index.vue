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
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://twoja-kolorowanka.pl/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
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
          "url": "https://twoja-kolorowanka.pl/logo-1.webp",
          "contentUrl": "https://twoja-kolorowanka.pl/logo-1.webp",
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
    src: '/fantasy/jednorozce/26/jednorozce-26.svg',
    alt: "kolorowanki dla dziewcyznek do druku pdf",
    title: "Dla dziewczynek",
    url: "/dla-dziewczynek/"
  },
    {
    src: '/pojazdy/kombajny/15/kombajny-15.svg',
    alt: "kolorowanki dla chlopców do druku pdf",
    title: "Dla chlopcow",
    url: "/dla-chlopcow/"
  },
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
    {
    src: '/fantasy/jednorozce/26/jednorozce-26.svg',
    alt: "fantasy do druku pdf",
    title: "fantasy",
    url: "/fantasy/"
  },
  {
    src: '/fantasy/jednorozce/16/jednorozce-16.svg',
    alt: "jednorożce do druku pdf",
    title: "jednorożce",
    url: "/fantasy/jednorozce"
  },
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
      {
    src: '/fantasy/smoki/20/smoki-20.svg',
    alt: "kolorowanki smoki do druku",
    title: "smoki",
    url: "/fantasy/smoki"
  },
     {
    src: '/zwierzeta/motyle/20/motyle-20.svg',
    alt: "kolorowanki motyle do druku",
    title: "motyle",
    url: "/zwierzeta/motyle"
  },
       {
    src: '/pojazdy/samochody/26/samochody-26.svg',
    alt: "kolorowanki samochody do druku",
    title: "pojazdy",
    url: "/pojazdy/"
  },
     {
    src: '/pojazdy/samochody/1/samochody-1.svg',
    alt: "kolorowanki samochody do druku",
    title: "samochody",
    url: "/pojazdy/samochody"
  },
     {
    src: '/pojazdy/traktory/12/traktory-12.svg',
    alt: "kolorowanki traktory do druku",
    title: "traktory",
    url: "/pojazdy/traktory"
  },
     {
    src: '/pojazdy/pociagi/10/pociagi-10.svg',
    alt: "kolorowanki pociągi do druku",
    title: "pociągi",
    url: "/pojazdy/pociagi"
  },
    {
    src: '/pojazdy/kombajny/10/kombajny-10.svg',
    alt: "kolorowanki kombajny do druku",
    title: "kombajny",
    url: "/pojazdy/kombajny"
  },
      {
    src: '/pojazdy/koparki/10/koparki-10.svg',
    alt: "kolorowanki koparki do druku",
    title: "koparki",
    url: "/pojazdy/koparki"
  },
  {
    src: '/pojazdy/samoloty/10/samoloty-10.svg',
    alt: "kolorowanki samoloty do druku",
    title: "samoloty",
    url: "/pojazdy/samoloty"
  },
  {
    src: '/zwierzeta/dinozaury/1/dinozaury-1.svg',
    alt: "kolorowanki dinozaury do druku",
    title: "dinozaury",
    url: "/zwierzeta/dinozaury"
  },  {
    src: '/zwierzeta/t-rex/1/t-rex-1.svg',
    alt: "kolorowanki t-rex do druku",
    title: "t-rex",
    url: "/zwierzeta/t-rex"
  },
   {
    src: '/rosliny/kwiat/1/kwiat-1.svg',
    alt: "kolorowanki rosliny do druku",
    title: "rośliny",
    url: "/rosliny"
  },
     {
    src: '/rosliny/kwiat/4/kwiat-4.svg',
    alt: "kolorowanki kwiat do druku",
    title: "kwiat",
    url: "/rosliny/kwiat"
  },
  {
  src: '/fantasy/syrenki/1/syrenki-1.svg',
  alt: 'kolorowanki syrenki do druku',
  title: 'Syrenki',
  url: '/fantasy/syrenki'
},
{
  src: '/zwierzeta/mis/1/mis-1.svg',
  alt: 'kolorowanki misie do druku',
  title: 'Misie',
  url: '/zwierzeta/mis'
},
{
  src: '/zwierzeta/ryby/1/ryby-1.svg',
  alt: 'kolorowanki ryby do druku',
  title: 'Ryby',
  url: '/zwierzeta/ryby'
},
{
  src: '/zwierzeta/ptaki/1/ptaki-1.svg',
  alt: 'kolorowanki ptaki do druku',
  title: 'Ptaki',
  url: '/zwierzeta/ptaki'
},
{
  src: '/dla-doroslych/mandala/1/mandala-1.svg',
  alt: 'kolorowanki mandala do druku',
  title: 'Mandale',
  url: '/dla-doroslych/mandala'
},
{
  src: '/dla-doroslych/antystresowe/1/antystresowe-1.svg',
  alt: 'kolorowanki antystresowe do druku',
  title: 'Antystresowe',
  url: '/dla-doroslych/antystresowe'
}

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



const galleryVariantsList = computed(() => [
  galleryItems.value.slice(0, 4),
  galleryItems.value.slice(4, 8),
  galleryItems.value.slice(8, 12),
  galleryItems.value.slice(12, 16),
  galleryItems.value.slice(16, 20),
  galleryItems.value.slice(20, 24),
  galleryItems.value.slice(24, 28),
])
</script>
<template>
  <div class="index-page">
    <div class="mt-28">
      <Hero
        :h1="{ firstPartTitle: 'Darmowe kolorowanki', seccondPartTitle: 'do druku pdf' }"
        isCategory
      />
    </div>

    <UContainer>

      <!-- Pierwszy blok SEO -->
      <div class="flex flex-row flex-nowrap items-center mt-2 sm:mt-12 mb-4 leading-tight tracking-tight">
        <span class="flex-grow border-t border-black" aria-hidden="true"></span>
        <Heading
          :text="seoBlocks[0].heading"
          as="h2"
          backgroundColor="bg-sec-500"
          fontSize="text-xl sm:text-3xl"
          textColor="text-white"
        />
        <span class="flex-grow border-t border-black" aria-hidden="true"></span>
      </div>
      <div
        v-html="seoBlocks[0].text"
        class="mb-12 text-base sm:text-lg font-light sm:text-center mx-auto px-4 lg:px-8"
      ></div>
      <div
        v-for="(block, i) in seoBlocks.slice(1)"
        :key="i"
        class="mb-12"
      >
        <div class="flex flex-row flex-nowrap items-center mt-2 sm:mt-12 mb-4 leading-tight tracking-tight">
          <span class="flex-grow border-t border-black" aria-hidden="true"></span>
          <Heading
            :text="block.heading"
            as="h2"
            backgroundColor="bg-sec-500"
            fontSize="text-xl sm:text-3xl"
            textColor="text-white"
          />
          <span class="flex-grow border-t border-black" aria-hidden="true"></span>
        </div>
        <div
          v-html="block.text"
          class="text-base sm:text-xl font-light sm:text-center mx-auto px-4 lg:px-8 mb-6"
        ></div>

         <CategoryGallery  :items="galleryVariantsList[i]" />
      </div>
    </UContainer>

    <!-- FAQ na dole strony -->
    <FaqList :faqs="faqs" />
  </div>
</template>

