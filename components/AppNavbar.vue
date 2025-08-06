<template>
  <nav class="flex relative justify-end lg:justify-end" aria-label="Main Navigation">
    <!-- Logo -->
    <NuxtLink to="/">
      <img class="absolute left-0 w-32 2xl:w-28 rounded-br-2xl " src="/logo-1.webp" alt="">
    </NuxtLink>

    <div class="px-4 sm:px-6 lg:px-8 pt-8 w-full">
      <!-- Desktop menu -->
      <div class="hidden md:flex space-x-6 justify-end" role="menubar" aria-label="Main Menu">
        <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-xl flex items-center">
          Strona główna
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
            class="w-6 h-6 transition-transform duration-300 absolute top-4 right-4"
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
  // Dodaj kolejne linki jeśli potrzebujesz
]

const categoryLinks = [
  {
    name: 'Fantasy',
    slug: 'fantasy',
    children: [
      { name: 'Jednorożce', slug: 'fantasy/jednorozce' },
      { name: 'Smoki', slug: 'fantasy/smoki' },
      { name: 'Wróżki', slug: 'fantasy/wrozki' }
    ]
  },
  {
    name: 'Pojazdy',
    slug: 'pojazdy',
    children: [
      { name: 'Samochody', slug: 'pojazdy/samochody' },
      { name: 'Traktory', slug: 'pojazdy/traktory' },
      { name: 'Pociągi', slug: 'pojazdy/pociagi' },
      { name: 'Kombajny', slug: 'pojazdy/kombajny' },
      { name: 'Koparki', slug: 'pojazdy/koparki' },
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
      { name: 'Pieski', slug: 'zwierzeta/pieski' },
      { name: 'Dinozaury', slug: 'zwierzeta/dinozaury' }
    ]
  }
]
</script>
