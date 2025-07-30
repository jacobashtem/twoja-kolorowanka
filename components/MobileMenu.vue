<template>
  <div class="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col">
    <div class="flex items-center justify-between p-4 border-b">
      <span class="text-xl font-semibold">Menu</span>
      <button @click="emit('close')" aria-label="Zamknij">
        <UIcon name="ci:close-md" class="w-7 h-7" />
      </button>
    </div>
    <nav
      class="flex-1 px-4 py-2"
      itemscope
      itemtype="https://schema.org/SiteNavigationElement"
      aria-label="Site Navigation"
      id="site-navigation"
    >
      <ul class="space-y-2 mb-4">
        <li v-for="link in mainLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="block py-2 text-lg font-medium text-gray-800"
            itemprop="url"
            @click="emit('close')"
          >
            <span itemprop="name">{{ link.name }}</span>
          </NuxtLink>
        </li>
        <li>
           <SearchAutocomplete :categoryLinks="categoryLinks"  @result-selected="emit('close')" />
        </li>
        <li>
          <button
            class="flex items-center justify-between w-full text-lg font-semibold text-gray-800 py-2"
            @click="toggleCategories"
            :aria-expanded="showCategories"
            aria-controls="mobile-categories-list"
            type="button"
          >
            <span>Kolorowanki – lista</span>
            <UIcon :name="showCategories ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" dynamic />
          </button>
          <transition name="slide-fade">
            <div
              v-show="showCategories"
              id="mobile-categories-list"
              class="ml-3 pl-3 border-l border-gray-200"
              role="region"
              aria-label="Kategorie kolorowanek"
            >
              <CategoriesMenuMobile
                :categoryLinks="categoryLinks"
                @close="emit('close')"
              />
            </div>
          </transition>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CategoriesMenuMobile from '~/components/CategoriesMenuMobile.vue'

const props = defineProps({
  categoryLinks: Array,
  mainLinks: Array
})
const emit = defineEmits(['close'])

const showCategories = ref(false)
function toggleCategories() {
  showCategories.value = !showCategories.value
}
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
