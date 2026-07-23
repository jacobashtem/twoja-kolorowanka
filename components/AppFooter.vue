<script setup>
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
   <footer class="bg-sec-500 mt-5 sm:mt-0">
        <nav aria-label="Popularne kategorie kolorowanek"
            class="mx-auto container max-w-6xl px-4 pt-8 text-sec-900">
            <p class="font-semibold mb-2 text-center md:text-left">Popularne kolorowanki:</p>
            <ul class="flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start text-base font-light">
                <li v-for="cat in footerCategories" :key="cat.url">
                    <NuxtLink class="hover:text-sec-800 transition-all" :to="cat.url">{{ cat.name }}</NuxtLink>
                </li>
            </ul>
        </nav>
        <div
            class="text-left items-baseline gap-2  bg-sec-500 px-4 flex flex-col flex-wrap md:flex-row justify-between  mx-auto container max-w-6xl text-sec-900 text-base font-light tracking-tight sm:mt-5 sm:text-xl lg:text-lg  py-8">
            <div class="w-full md:w-auto">
                <div class="flex-col gap-3 font-semibold">
                    <div class="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                        <NuxtLink class="hover:text-sec-800 transition-all" to="/regulamin">Regulamin</NuxtLink>
                        <NuxtLink  class="hover:text-sec-800 transition-all" to="/prawa-autorskie">Prawa autorskie</NuxtLink>
                        <NuxtLink class="hover:text-sec-800 transition-all" to="/polityka-prywatnosci">Polityka
                            prywatności</NuxtLink>
                        <NuxtLink class="hover:text-sec-800 transition-all" to="/obowiazek-informacyjny">RODO</NuxtLink>
                        <NuxtLink class="hover:text-sec-800 transition-all" to="/blog/">Blog</NuxtLink>
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