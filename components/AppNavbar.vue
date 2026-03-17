<template>
  <nav class="px-4 sm:px-6 lg:px-8 pt-6 relative" aria-label="Main Navigation">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 shrink-0 no-underline">
        <BlogLogo :size="36" />
          <div class="flex flex-col leading-none max-sm:hidden">
          <span class="font-baloo text-[0.72rem] font-bold text-[#8B7BA5] tracking-wide">TWOJA</span>
          <span class="font-baloo text-lg font-extrabold bg-gradient-to-br from-[#FF6B6B] to-[#9B72CF] bg-clip-text text-transparent -mt-0.5">Kolorowanka</span>
        </div>
      </NuxtLink>

      <!-- Desktop menu -->
      <div class="hidden md:flex items-center space-x-6" role="menubar" aria-label="Main Menu">
        <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-xl flex items-center">
          Strona główna
        </NuxtLink>
        <NuxtLink to="/blog/" class="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-xl flex items-center">
          Blog
        </NuxtLink>
        <SearchAutocomplete :categoryLinks="categoryLinks" />
        <CategoriesMenu :categoryLinks="categoryLinks" />
      </div>

      <!-- Hamburger (mobile) -->
      <div class="flex md:hidden">
        <button
          type="button"
          class="z-[51] inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
          @click="toggleMenu"
        >
          <UIcon
            v-if="!menuOpen"
            width="36"
            height="36"
            name="ci:hamburger-md"
            dynamic
            class="w-6 h-6 transition-transform duration-300"
          />
        </button>
      </div>
    </div>

    <!-- MOBILE MENU -->
    <MobileMenu
      v-if="menuOpen"
      :categoryLinks="categoryLinks"
      :mainLinks="mainLinks"
      @close="menuOpen = false"
    />
  </nav>
</template>

<script setup>

const menuOpen = ref(false)
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const mainLinks = [
  { name: 'Strona główna', to: '/' },
  { name: 'Blog', to: '/blog/' },
]

const categoryLinks = [
  {
    name: 'Fantasy',
    slug: 'fantasy',
    children: [
      { name: 'Jednorożce', slug: 'fantasy/jednorozce' },
      { name: 'Smoki', slug: 'fantasy/smoki' },
      { name: 'Syrenki', slug: 'fantasy/syrenki' },
      { name: 'Elfy', slug: 'fantasy/elfy' },
      { name: 'Wróżki', slug: 'fantasy/wrozki' }
    ]
  },
  {
    name: 'Pojazdy',
    slug: 'pojazdy',
    children: [
      { name: 'BMW', slug: 'pojazdy/bmw' },
      { name: 'Samochody', slug: 'pojazdy/samochody' },
      { name: 'Traktory', slug: 'pojazdy/traktory' },
      { name: 'Pociągi', slug: 'pojazdy/pociagi' },
      { name: 'Kombajny', slug: 'pojazdy/kombajny' },
      { name: 'Koparki', slug: 'pojazdy/koparki' },
      { name: 'Lamborghini', slug: 'pojazdy/lamborghini' },
      { name: 'Rakiety', slug: 'pojazdy/rakiety' },
      { name: 'Tiry', slug: 'pojazdy/tiry' },
      { name: 'Czołgi', slug: 'pojazdy/czolgi' },
      { name: 'Samoloty', slug: 'pojazdy/samoloty' },
    ]
  },
  {
    name: 'Zwierzęta',
    slug: 'zwierzeta',
    children: [
      { name: 'Koniki', slug: 'zwierzeta/koniki' },
      { name: 'Koty', slug: 'zwierzeta/koty' },
      { name: 'Króliczki', slug: 'zwierzeta/kroliczki' },
      { name: 'Motyle', slug: 'zwierzeta/motyle' },
      { name: 'Misie', slug: 'zwierzeta/mis' },
      { name: 'Pieski', slug: 'zwierzeta/pieski' },
      { name: 'Ryby', slug: 'zwierzeta/ryby' },
      { name: 'Dinozaury', slug: 'zwierzeta/dinozaury' },
      { name: 'Lisy', slug: 'zwierzeta/lisy' },
      { name: 'Ptaki', slug: 'zwierzeta/ptaki' },
      { name: 'Rekiny', slug: 'zwierzeta/rekiny' },
      { name: 'Pingwiny', slug: 'zwierzeta/pingwiny' },
      { name: 'Wilki', slug: 'zwierzeta/wilki' },
      { name: 'Biedronki', slug: 'zwierzeta/biedronki' },
      { name: 'Lwy', slug: 'zwierzeta/lwy' },
      { name: 'Sowy', slug: 'zwierzeta/sowy' },
      { name: 'Świnki', slug: 'zwierzeta/swinki' },
      { name: 'Pandy', slug: 'zwierzeta/pandy' },
      { name: 'Pszczoły', slug: 'zwierzeta/pszczoly' },
      { name: 'Tygrysy', slug: 'zwierzeta/tygrysy' },
      { name: 'Myszki', slug: 'zwierzeta/myszki' },
      { name: 'T-rex', slug: 'zwierzeta/t-rex' }
    ]
  },
  {
    name: 'Rośliny',
    slug: 'rosliny',
    children: [
      { name: 'Kwiat', slug: 'rosliny/kwiat' },
      { name: 'Dynie', slug: 'rosliny/dynie' },
      { name: 'Grzyby', slug: 'rosliny/grzyby' },
    ]
  },
  {
    name: 'Jedzenie',
    slug: 'jedzenie',
    children: [
      { name: 'Lody', slug: 'jedzenie/lody' },
      { name: 'Torty', slug: 'jedzenie/torty' },
      { name: 'Jabłka', slug: 'jedzenie/jablka' },
    ]
  },
  {
    name: 'Pory roku',
    slug: 'pory-roku',
    children: [
      { name: 'Wiosna', slug: 'pory-roku/wiosna' },
      { name: 'Jesień', slug: 'pory-roku/jesien' },
      { name: 'Zima', slug: 'pory-roku/zima' },
      { name: 'Lato', slug: 'pory-roku/lato' },
    ]
  },
  {
    name: 'Dla dorosłych',
    slug: 'dla-doroslych',
    children: [
      { name: 'Mandale', slug: 'dla-doroslych/mandala' },
      { name: 'Antystresowe', slug: 'dla-doroslych/antystresowe' },
    ]
  },
  {
    name: 'Dla dziewczynek',
    slug: 'dla-dziewczynek',
  },
  {
    name: 'Dla chlopcow',
    slug: 'dla-chlopcow',
  }
]
</script>
