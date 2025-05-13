<script setup>
useHead({
    title: 'Twoja kolorowanka title',
    description: 'Twoja kolorowanka description',
})
const galleryItems = ref([
  {
    src: '/category/foka.jpg',
    alt: "Koty",
    title: "Koty",
    url: "/zwierzeta/koty"
  },
  {
    src: '/category/foka.jpg',
    alt: "Pusheen",
    title: "Pusheen",
    url: "/dla-dziewczynek/pusheen"
  },
  {
    src: '/category/foka.jpg',
    alt: "Psi Patrol",
    title: "Psi Patrol",
    url: "/bajki/psi-patrol"
  },
  {
    src: '/category/foka.jpg',
    alt: "Minecraft",
    title: "Minecraft",
    url: "/gry/minecraft"
  },
  {
    src: '/category/foka.jpg',
    alt: "Świąteczne",
    title: "Świąteczne",
    url: "/okazjonalne/swiateczne"
  },
  {
    src: '/category/foka.jpg',
    alt: "Jednorożec",
    title: "Jednorożec",
    url: "/dla-dziewczynek/jednorozec"
  },
  {
    src: '/category/foka.jpg',
    alt: "Toca Boca",
    title: "Toca Boca",
    url: "/gry/toca-boca"
  },
  {
    src: '/category/foka.jpg',
    alt: "Brawl Stars",
    title: "Brawl Stars",
    url: "/gry/brawl-stars"
  },
  {
    src: '/category/foka.jpg',
    alt: "Dla Dziewczynek",
    title: "Dla Dziewczynek",
    url: "/dla-dziewczynek"
  },
  {
    src: '/category/foka.jpg',
    alt: "Pies",
    title: "Pies",
    url: "/zwierzeta/pies"
  },
  {
    src: '/category/foka.jpg',
    alt: "Stitch",
    title: "Stitch",
    url: "/bajki/stitch"
  },
  {
    src: '/category/foka.jpg',
    alt: "Pokemon",
    title: "Pokemon",
    url: "/gry/pokemon"
  },
  {
    src: '/category/foka.jpg',
    alt: "Barbie",
    title: "Barbie",
    url: "/dla-dziewczynek/barbie"
  },
  {
    src: '/category/foka.jpg',
    alt: "Dla Chłopców",
    title: "Dla Chłopców",
    url: "/dla-chlopcow"
  },
  {
    src: '/category/foka.jpg',
    alt: "Hello Kitty",
    title: "Hello Kitty",
    url: "/dla-dziewczynek/hello-kitty"
  },
  {
    src: '/category/foka.jpg',
    alt: "Koniki",
    title: "Koniki",
    url: "/natura/koniki"
  },
  {
    src: '/category/foka.jpg',
    alt: "Kwiat",
    title: "Kwiat",
    url: "/natura/kwiat"
  },
  {
    src: '/category/foka.jpg',
    alt: "Sonic",
    title: "Sonic",
    url: "/dla-chlopcow/sonic"
  },
  {
    src: '/category/foka.jpg',
    alt: "Traktor",
    title: "Traktor",
    url: "/pojazdy/traktor"
  },
  {
    src: '/category/foka.jpg',
    alt: "Księżniczki",
    title: "Księżniczki",
    url: "/dla-dziewczynek/ksiezniczki"
  },
  {
    src: '/category/foka.jpg',
    alt: "Peppa",
    title: "Peppa",
    url: "/bajki/peppa"
  },
  {
    src: '/category/foka.jpg',
    alt: "Samochód",
    title: "Samochód",
    url: "/pojazdy/samochod"
  },
  {
    src: '/category/foka.jpg',
    alt: "Star Wars",
    title: "Star Wars",
    url: "/film/star-wars"
  }
])
</script>
<template>
  <!-- <NuxtLayout> -->
    <Hero />
    <UContainer>
        <Heading text="Kolorowanka do druku" :as="'h1'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
        <p class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
            Znajdziesz tu szeroki wybór <span class="font-semibold">darmowych kolorowanek do druku</span>, które z łatwością pobierzesz i wydrukujesz na domowej drukarce. Nasza kolekcja obejmuje zarówno proste malowanki dla najmłodszych, jak i bardziej zaawansowane wzory dla starszych dzieci i dorosłych. Usiądź wygodnie i rozpocznij z nami swoją <span class="font-semibold">kolorową przygodę!</span>
        </p>
        <div>
        <h1 class="text-3xl font-bold mb-4">Najważniejsze kategorie</h1>
      </div>
        <CategoryGallery :items="galleryItems.slice(0,23)" />
        <!-- <div class="columns-1 md:columns-2 xl:columns-3 gap-7 ">
      <div class=" break-inside-avoid mb-8">
      <img class="h-auto max-w-full rounded-lg" src="https://pagedone.io/asset/uploads/1688031162.jpg" alt="Gallery image" />
      </div>
      <div class=" break-inside-avoid  mb-8">
      <img class="h-auto max-w-full rounded-lg" src="https://pagedone.io/asset/uploads/1688031232.jpg" alt="Gallery image" />
      </div>
      <div class=" break-inside-avoid  mb-8">
      <img class="h-auto max-w-full rounded-lg" src="https://pagedone.io/asset/uploads/1688031357.jpg" alt="Gallery image" />
      </div>
      <div class=" break-inside-avoid  mb-8">
      <img class="h-auto max-w-full rounded-lg" src="https://pagedone.io/asset/uploads/1688031375.jpg" alt="Gallery image" />
      </div>
      <div class=" break-inside-avoid  mb-8">
      <img class="h-auto max-w-full rounded-lg" src="https://pagedone.io/asset/uploads/1688031396.jpg" alt="Gallery image" />
      </div>
      <div class=" break-inside-avoid  mb-8">
      <img class="h-auto max-w-full rounded-lg" src="https://pagedone.io/asset/uploads/1688031414.png" alt="Gallery image" />
      </div>
      </div> -->
    </UContainer>
  <!-- </NuxtLayout> -->
</template>