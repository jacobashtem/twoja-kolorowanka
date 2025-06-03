<template>
    <nav class="flex relative justify-end lg:justify-end" aria-label="Main Navigation">
        <NuxtLink to="/">
            <img class="absolute left-0 w-32 2xl:w-28 rounded-br-2xl " src="/logo-1.webp" alt="">
        </NuxtLink>
        <div class="px-4 sm:px-6 lg:px-8 pt-8">
            <div class="hidden md:flex space-x-6" role="menubar" aria-label="Main Menu">
                <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-xl">
                    Strona główna
                </NuxtLink>
                <NuxtLink to="/" class="text-gray-600 text-xl hover:text-gray-900 transition-colors duration-200">
                    Kategorie kolorowanek
                </NuxtLink>
                <NuxtLink to="/"
                    class="text-gray-600 text-xl hover:text-gray-900 transition-colors duration-200">
                    Blog
                </NuxtLink>
            </div>

            <!-- Hamburger na mobile -->
            <div class="flex md:hidden">
                <button type="button"
                    class="z-[51] inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                    @click="toggleMenu">
                    <UIcon v-if="!menuOpen" width="36" height="36" name="ci:hamburger-md" dynamic
                        class="w-6 h-6 transition-transform duration-300 absolute top-4 right-4" />
                    <UIcon v-else class="w-6 h-6 transition-transform duration-300 absolute top-4 right-4" width="36"
                        height="36" name="ci:close-md" dynamic />
                </button>
            </div>
        </div>

        <!-- Menu mobilne, wyświetlane w zależności od stanu 'menuOpen' -->
        <transition enter-active-class="transition ease-out duration-300 transform"
            enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-200 transform" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2">
            <div v-if="menuOpen"
                class="shadow-lg z-50 absolute md:hidden px-2 pt-2 pr-12 pb-3 space-y-1 bg-white border-t border-gray-200">
                <NuxtLink to="/"
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                    Strona główna
                </NuxtLink>
                <NuxtLink to="/zwierzeta"
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                    Kategorie kolorowanek
                </NuxtLink>
                <NuxtLink to="/"
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                    Blog
                </NuxtLink>
            </div>
        </transition>
    </nav>
</template>

<script setup lang="ts">
// import Icon from '@iconify/vue';

const menuOpen = ref(false)
const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
}
</script>
