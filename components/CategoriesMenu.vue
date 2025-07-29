<template>
  <div class="relative" ref="wrapper">
    <button
      class="text-xl font-medium flex items-center gap-1 text-gray-800 focus:outline-none"
      @mouseenter="showMenu"
      @mouseleave="hideMenu"
      @focus="showMenu"
      @blur="hideMenu"
      type="button"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-controls="desktop-categories-list"
    >
      Kolorowanki – lista
      <UIcon
        :name="open ? 'mdi:chevron-up' : 'mdi:chevron-down'"
        class="w-5 h-5 transition-transform"
      />
    </button>

    <!-- Dropdown -->
    <div
      v-show="open"
      id="desktop-categories-list"
      class="absolute left-0 top-full mt-1 z-50 bg-white shadow-xl border rounded-xl px-6 py-4 w-64 overflow-y-auto transition-all duration-200"
      style="max-width: 90vw;"
      @mouseenter="showMenu"
      @mouseleave="hideMenu"
      @focusin="showMenu"
      @focusout="hideMenu"
      role="region"
      aria-label="Kategorie kolorowanek"
    >
      <nav
        itemscope
        itemtype="https://schema.org/SiteNavigationElement"
        aria-label="Kategorie kolorowanek"
      >
        <ul class="space-y-3">
          <li v-for="category in categoryLinks" :key="category.slug">
            <NuxtLink
              :to="`/${category.slug}/`"
              class="text-base font-semibold text-gray-900 mb-2 hover:text-blue-700 transition-colors"
              itemprop="url"
            >
              <span itemprop="name">{{ category.name }}</span>
            </NuxtLink>
            <ul class="mt-1 pl-3 border-l border-gray-200 space-y-1" itemscope itemtype="https://schema.org/SiteNavigationElement">
              <li v-for="sub in category.children" :key="sub.slug">
                <NuxtLink
                  :to="`/${sub.slug}/`"
                  class="block py-0.5 text-gray-700 hover:text-blue-600 text-[15px] transition-colors pl-3"
                  itemprop="url"
                >
                  <span itemprop="name">{{ sub.name }}</span>
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
let timer = null

const showMenu = () => {
  clearTimeout(timer)
  open.value = true
}
const hideMenu = () => {
  timer = setTimeout(() => {
    open.value = false
  }, 120)
}

defineProps({
  categoryLinks: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
:global(html), :global(body) {
  overflow-x: hidden !important;
}
</style>
