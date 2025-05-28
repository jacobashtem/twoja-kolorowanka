<template>
    <UContainer class="mt-4 mb-20">
        <div class="w-full">
            <div class="mt-8 sm:mt-0 grid grid-cols-1 gap-8 md:grid-cols-2">
                <!-- Left Section: Text Content -->
                <div class="order-2 md:order-1 flex flex-col justify-center text-left lg:text-left md:text-left z-10">
                    <h2
                        v-if="!isCategory"
                        class="mt-0 sm:mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-8xl font-extrabold uppercase leading-tight tracking-tight">
                        <span class="inline-block text-5xl md:text-5xl lg:text-7xl">Wydrukuj.</span><br />
                        <span class="text-tertiary-500">Koloruj.</span>
                    </h2>
                    <h2 class="mt-0 sm:mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-8xl font-extrabold uppercase leading-tight tracking-tight" v-else>
                        <span class="inline-block text-3xl md:text-5xl lg:text-7xl">{{h1.firstPartTitle}}</span><br />
                        <span class="text-tertiary-500">{{ h1.seccondPartTitle }}</span>
                    </h2>
                    <p
                        class="max-w-80 2xl:max-w-full mt-4 text-base sm:text-lg md:text-2xl font-light text-black text-balance">
                        {{ description ? description : 'Darmowe kolorowanki do wydruku dla dzieci i dorosłych. Prosto i bez kruczków.' }}
                    </p>
                    <div class="mt-6 sm:mt-8 flex flex-wrap gap-4" v-if="!isCategory">
                        <NuxtLink to="/"
                            class="rounded-sm p-3 grow text-center bg-main-500 text-white font-bold uppercase text-sm tracking-widest hover:bg-main-600 transition">
                            Przeglądaj kategorie
                        </NuxtLink>
                        <NuxtLink to="/"
                            class="rounded-sm p-3 grow border text-center border-main-500 text-main-500 font-bold uppercase text-sm tracking-widest hover:bg-main-500 hover:text-white transition">
                            Najpopularniejsze
                        </NuxtLink>
                    </div>
                </div>
                <div class="gap-8 sm:gap-0 justify-end relative flex items-center sm:m-10 order-1 md:order-2">
                    <div
                        class="sm:absolute top-40 lg:-top-20 lg:left-0 w-40 sm:w-32 md:w-48 lg:w-64 rotate-12 rounded-lg border-black-700 border-b-4 border-r-8">
                        <img :src="heroImg1" alt="">
                    </div>
                    <div
                        class="sm:absolute  max-md:top-0 md:bottom-44 lg:-bottom-20 lg lg:-right-16 w-40 md:w-48 sm:w-32 lg:w-64 bg-white-500 -rotate-12 rounded-lg border-black-700 border-r-4 border-b-8">
                        <img :src="heroImg2" alt="">
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
        default: 'Darmowe kolorowanki do wydruku dla dzieci i dorosłych. Prosto i bez kruczków.'
    }
});

</script>

<style scoped>
/* Możesz dodać style specyficzne tylko dla tego komponentu */
</style>