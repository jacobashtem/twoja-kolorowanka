<script setup>
useHead({
    title: 'Twoja kolorowanka title',
    description: 'Twoja kolorowanka description',
})
const galleryItems = ref([
  {
    src: '/dinosaur.webp',
    alt: 'Dinozaury',
    title: 'Dinozaury',
  },
  {
    src: '/category/foka.jpg',
    alt: 'Foka',
    title: 'Foki',
  },
  {
    src: '/category/golab.png',
    alt: 'golebie',
    title: 'Ptaki',
  },
  {
    src: '/category/grzyb.png',
    alt: 'Planter Stand with Pots',
    title: 'Grzyby',
  },
  {
    src: '/category/horse.jpg',
    alt: 'Hanging Planters',
    title: 'Konie',
  },
  {
    src: '/category/jednorozec.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Planter Stand with Pots',
  },
  {
    src: '/category/lew.jpg',
    alt: 'Hanging Planters',
    title: 'Lwy',
  },
  {
    src: '/category/malpa.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Małpy',
  },
  {
    src: '/category/motyl.jpg',
    alt: 'Hanging Planters',
    title: 'Motyle',
  },
  {
    src: '/category/myszka.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Myszki',
  },
  {
    src: '/category/niedzwiedz.jpg',
    alt: 'Hanging Planters',
    title: 'Niedźwiedź',
  },
  {
    src: '/category/papuga.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Papugi',
  },
  {
    src: '/category/prosiaczek.jpg',
    alt: 'Hanging Planters',
    title: 'Prosiaczek',
  },
  {
    src: '/category/psi-patrol.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Psi patrol',
  },
  {
    src: '/category/puchatek.jpg',
    alt: 'Hanging Planters',
    title: 'Puchatek',
  },
  {
    src: '/category/rabbit.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Królik',
  },
  {
    src: '/category/slon.jpg',
    alt: 'Hanging Planters',
    title: 'Słonie',
  },
  {
    src: '/category/szop.jpg',
    alt: 'Planter Stand with Pots',
    title: 'Szopy',
  },{
    src: '/category/foka.jpg',
    alt: 'Foka',
    title: 'Foki',
  },
  {
    src: '/category/golab.png',
    alt: 'golebie',
    title: 'Ptaki',
  },
])

  
</script>
<template>
    <Hero />
    <UContainer>
        <Heading text="Kolorowanka do druku" :as="'h1'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
        <p class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
            Znajdziesz tu szeroki wybór <span class="font-semibold">darmowych kolorowanek do druku</span>, które z łatwością pobierzesz i wydrukujesz na domowej drukarce. Nasza kolekcja obejmuje zarówno proste malowanki dla najmłodszych, jak i bardziej zaawansowane wzory dla starszych dzieci i dorosłych. Usiądź wygodnie i rozpocznij z nami swoją <span class="font-semibold">kolorową przygodę!</span>
        </p>
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
</template>