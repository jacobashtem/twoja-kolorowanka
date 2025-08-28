<template>
  <UContainer class="mt-4 mb-6 sm:mb-20">
    <div class="w-full">
      <div class="mt-8 sm:mt-0 grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        <!-- Lewa kolumna: tekst -->
        <div class="order-2 lg:order-1 flex flex-col justify-center text-left z-10">
          <h1
            class="mt-0 sm:mt-8 font-extrabold uppercase leading-tight tracking-tight text"
            :class="{
              'text-3xl sm:text-4xl md:text-5xl lg:text-6xl': true
            }"
            :aria-label="`${h1.firstPartTitle} ${h1.seccondPartTitle}`"
          >
            <span
              class="inline-block"
              :class="isCategory 
                ? 'text-3xl md:text-5xl lg:text-6xl'
                : 'text-2xl xs:text-5xl md:text-5xl lg:text-6xl'"
            >
              {{ h1.firstPartTitle }} &nbsp;
            </span>
            <br />
            <span class="text-tertiary-500">
                {{ h1.seccondPartTitle }}
            </span>
          </h1>

          <p
            v-html="description"
            class="mt-4 text-base sm:text-lg md:text-2xl font-light text-black text-balance"
          />

          <div v-if="!isCategory" class="mt-6 sm:mt-8 flex flex-wrap gap-4">
            <NuxtLink
              to="/"
              class="rounded-sm p-3 grow text-center bg-main-500 text-white font-bold uppercase text-sm tracking-widest hover:bg-main-600 transition"
            >
              Przeglądaj kategorie
            </NuxtLink>
            <NuxtLink
              to="/"
              class="rounded-sm p-3 grow border border-main-500 text-main-500 font-bold uppercase text-sm tracking-widest hover:bg-main-500 hover:text-white transition"
            >
              Najpopularniejsze
            </NuxtLink>
          </div>
        </div>

        <!-- Prawa kolumna: obrazki -->
        <div class="order-1 md:order-2 relative flex items-center justify-end sm:m-10 hidden lg:flex">
          <div
            class="sm:absolute top-40 lg:-top-20 lg:left-0 w-40 sm:w-32 md:w-48 lg:w-64 rotate-12 rounded-lg border-black-700 border-b-4 border-r-8"
          >
            <img :src="heroImg1" alt="" />
          </div>
          <div
            class="sm:absolute max-md:top-0 md:bottom-44 lg:-bottom-20 lg:-right-16 w-40 sm:w-32 md:w-48 lg:w-64 bg-white-500 -rotate-12 rounded-lg border-black-700 border-r-4 border-b-8"
          >
            <img :src="heroImg2" alt="" />
          </div>
        </div>

      </div>
    </div>
  </UContainer>
</template>
<script setup>
const props = defineProps({
    isCategory: {
        type: Boolean,
        default: false
    },
    fullTitle: {
        type: String,
        default: 'Kolorowanki do druku'
    },
    h1: {
        type: Object,
        default: () => ({
            firstPartTitle: 'Kolorowanki',
            seccondPartTitle: 'do druku'
        })
    },
    heroImg1: {
        type: String,
        default: '/dinosaur.webp'
    },
    heroImg2: {
        type: String,
        default: '/princess.webp'
    },
    description: {
        type: String,
        default: 'Znajdziesz u nas tysiące darmowych kolorowanek do druku w formacie PDF. Możesz też je kolorować na naszej stronie online!'
    }
});

</script>
