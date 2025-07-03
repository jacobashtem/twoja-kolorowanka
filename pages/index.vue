<script setup>
// definePageMeta({
//   layout: 'default'
// })

useHead({
    title: 'Twoja kolorowanka title',
    description: 'Twoja kolorowanka description',
})
const galleryItems = ref([
  {
    src: '/koty/1/koty-1.svg',
    alt: "Koty",
    title: "Koty",
    url: "/zwierzeta/koty"
  },
    {
    src: '/koniki/1/koniki-1.svg',
    alt: "Koniki",
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
  // {
  //   src: '/category/foka.jpg',
  //   alt: "Jednorożec",
  //   title: "Jednorożec",
  //   url: "/dla-dziewczynek/jednorozec"
  // },
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
    alt: "kroliczki",
    title: "Kroliczki",
    url: "/zwierzeta/kroliczki"
  },
  {
    src: '/pieski/26/pieski-26.svg',
    alt: "Pieski",
    title: "Pieski",
    url: "/zwierzeta/pieski"
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
      { name: 'description', content: 'Darmowe kolorowanki do druku dla dzieci. Wydrukuj ulubione postacie z bajek, gier i filmów. Setki wzorów gotowych do pobrania!' },
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

</script>
<template>
  <div class="index-page">
    <Hero />
    <UContainer>
      <Heading text="Kolorowanka do druku" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-2xl md:text-3xl" />
      <p class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
        Nasze malowanki to idealna propozycja dla dzieci, dorosłych, nauczycieli, przedszkoli i wszystkich, którzy kochają kreatywną zabawę z kartką i kredkami. Każda kolorowanka jest dostępna jako gotowy plik A4 do druku – wystarczy kliknąć i cieszyć się wspólnym kolorowaniem!
      </p>
      <div>
        <h1 class="text-3xl font-bold mb-4">Najważniejsze kategorie</h1>
      </div>
      <CategoryGallery 
        :items="galleryItems.slice(0,23)"
      />

    </UContainer>
  </div>
</template>
