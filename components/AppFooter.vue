<template>
   <footer class="bg-sec-500 mt-5 sm:mt-0">
        <div
            class="text-left items-baseline gap-2  bg-sec-500 px-4 flex flex-col flex-wrap md:flex-row justify-between  mx-auto container max-w-6xl text-white text-base font-light tracking-tight sm:mt-5 sm:text-xl lg:text-lg  py-8">
            <div class="w-full md:w-auto">
                <div class="flex-col gap-3 font-semibold">
                    <div class="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/regulamin">Regulamin</NuxtLink>
                        <NuxtLink  class="hover:text-coolGray-200 transition-all" to="/prawa-autorskie">Prawa autorskie</NuxtLink>
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/polityka-prywatnosci">Polityka
                            prywatności</NuxtLink>
                        <NuxtLink class="hover:text-coolGray-200 transition-all" to="/obowiazek-informacyjny">RODO</NuxtLink>
                    </div>
                </div>
                <p class="text-center md:text-left">© 2025 Twoja Kolorowanka. Wszystkie prawa zastrzeżone.</p>
            </div>
            <div class="w-full md:w-auto text-center md:text-left">Masz jakieś pytania lub sugestie?<br /> 
                Skontaktuj się z nami: <a class="font-semibold"
                    href="mailto:team@instantroom.pl">team@twoja-kolorowanka.pl</a></div>
        </div>
    </footer>
  </template>