<script setup>
// `zwiezla` obcina stopkę do tego, co musi zostać: linki prawne, copyright i kontakt.
// Znikają obie listy nawigacyjne (Popularne kolorowanki, Zestawy tematyczne) — razem
// kilkadziesiąt odnośników, które na stronie kolorowania zabierały wysokość płótnu.
// Regulamin, polityka prywatności i RODO zostają, bo muszą być osiągalne z każdej strony.
defineProps({
  zwiezla: { type: Boolean, default: false }
})

const footerZestawy = [
  { name: 'Wszystkie zestawy', url: '/kolorowanki/' },
  { name: 'Łatwe kolorowanki', url: '/kolorowanki/latwe-kolorowanki/' },
  { name: 'Dla 2-latka', url: '/kolorowanki/kolorowanki-dla-2-latka/' },
  { name: 'Dla 3-latka', url: '/kolorowanki/kolorowanki-dla-3-latka/' },
  { name: 'Dla 4-latka', url: '/kolorowanki/kolorowanki-dla-4-latka/' },
  { name: 'Dla 5-latka', url: '/kolorowanki/kolorowanki-dla-5-latka/' },
  { name: 'Dla 6-latka', url: '/kolorowanki/kolorowanki-dla-6-latka/' },
  { name: 'Dla 7-latka', url: '/kolorowanki/kolorowanki-dla-7-latka/' },
  { name: 'Dla dziewczynek 8 lat', url: '/kolorowanki/kolorowanki-dla-dziewczynek-8-lat/' },
  { name: 'Dla dziewczynek 9 lat', url: '/kolorowanki/kolorowanki-dla-dziewczynek-9-lat/' },
  { name: 'Dla dziewczynek 10 lat', url: '/kolorowanki/kolorowanki-dla-dziewczynek-10-lat/' },
  { name: 'Dla dziewczynek 11 lat', url: '/kolorowanki/kolorowanki-dla-dziewczynek-11-lat/' },
  { name: 'Dla dziewczyn od 12 lat', url: '/kolorowanki/kolorowanki-dla-dziewczyn-od-12-lat/' },
  { name: 'Do wydruku A4', url: '/kolorowanki/kolorowanki-do-wydruku-a4/' },
  { name: 'Pierwszy dzień szkoły', url: '/kolorowanki/pierwszy-dzien-szkoly/' },
]

const footerCategories = [
  { name: 'Zwierzęta', url: '/zwierzeta/' },
  { name: 'Pojazdy', url: '/pojazdy/' },
  { name: 'Fantasy', url: '/fantasy/' },
  { name: 'Dla dorosłych', url: '/dla-doroslych/' },
  { name: 'Dla dziewczynek', url: '/dla-dziewczynek/' },
  { name: 'Dla chłopców', url: '/dla-chlopcow/' },
  { name: 'Pory roku', url: '/pory-roku/' },
  { name: 'Okolicznościowe', url: '/okolicznosciowe/' },
  { name: 'Rośliny', url: '/rosliny/' },
  { name: 'Jedzenie', url: '/jedzenie/' },
  { name: 'Kosmos', url: '/kosmos/' },
  { name: 'Księżniczki', url: '/ksiezniczki/' },
  { name: 'Koty', url: '/zwierzeta/koty/' },
  { name: 'Dinozaury', url: '/zwierzeta/dinozaury/' },
  { name: 'Jednorożce', url: '/fantasy/jednorozce/' },
]
</script>

<template>
   <footer class="bg-sec-500" :class="zwiezla ? '' : 'mt-5 sm:mt-0'">
        <nav v-if="!zwiezla" aria-label="Popularne kategorie kolorowanek"
            class="mx-auto container max-w-6xl px-4 pt-8 text-white">
            <p class="font-semibold mb-2 text-center md:text-left">Popularne kolorowanki:</p>
            <ul class="flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start text-base font-light">
                <li v-for="cat in footerCategories" :key="cat.url">
                    <NuxtLink class="hover:text-coolGray-200 transition-all" :to="cat.url">{{ cat.name }}</NuxtLink>
                </li>
            </ul>
            <p class="font-semibold mb-2 mt-4 text-center md:text-left">Zestawy tematyczne:</p>
            <ul class="flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start text-base font-light">
                <li v-for="z in footerZestawy" :key="z.url">
                    <NuxtLink class="hover:text-coolGray-200 transition-all" :to="z.url">{{ z.name }}</NuxtLink>
                </li>
            </ul>
        </nav>
        <div
            class="text-left items-baseline gap-2  bg-sec-500 px-4 flex flex-col flex-wrap md:flex-row justify-between  mx-auto container max-w-6xl text-white text-base font-light tracking-tight lg:text-lg"
            :class="zwiezla ? 'py-2 text-sm sm:text-sm' : 'sm:mt-5 sm:text-xl py-8'">
            <div class="w-full md:w-auto">
                <div class="flex-col gap-3 font-semibold">
                    <div class="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/regulamin">Regulamin</NuxtLink>
                        <NuxtLink  class="hover:text-coolGray-200 transition-all" to="/prawa-autorskie">Prawa autorskie</NuxtLink>
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/polityka-prywatnosci">Polityka
                            prywatności</NuxtLink>
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/obowiazek-informacyjny">RODO</NuxtLink>
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/blog/">Blog</NuxtLink>
                    </div>
                </div>
                <p class="text-center md:text-left">© 2025 Twoja Kolorowanka. Wszystkie prawa zastrzeżone.</p>
            </div>
            <div class="w-full md:w-auto text-center md:text-left">Masz jakieś pytania lub sugestie?<br /> 
                Skontaktuj się z nami: <a class="font-semibold"
                    href="mailto:team@twoja-kolorowanka.pl">team@twoja-kolorowanka.pl</a></div>
        </div>
    </footer>
  </template>