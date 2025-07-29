<template>
  <div>
    <ul class="space-y-2">
      <li v-for="cat in categoryLinks" :key="cat.slug">
        <button
          class="flex items-center justify-between w-full text-lg font-semibold text-gray-800 py-2"
          @click="toggle(cat.slug)"
          :aria-expanded="openCategory === cat.slug"
          :aria-controls="`cat-list-${cat.slug}`"
          type="button"
        >
          <span>{{ cat.name }}</span>
          <UIcon :name="openCategory === cat.slug ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-5 h-5" dynamic />
        </button>
        <transition name="slide-fade">
          <ul
            v-show="openCategory === cat.slug"
            :id="`cat-list-${cat.slug}`"
            class="ml-3 pl-3 border-l border-gray-200 space-y-1"
            itemscope
            itemtype="https://schema.org/SiteNavigationElement"
          >
            <li v-for="sub in cat.children" :key="sub.slug">
              <NuxtLink
                :to="`/${sub.slug}/`"
                class="block py-1 text-gray-700 hover:text-blue-600 text-base"
                itemprop="url"
                @click="emit('close')"
              >
                <span itemprop="name">{{ sub.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  categoryLinks: Array
})
const emit = defineEmits(['close'])
const openCategory = ref(null)
function toggle(slug) {
  openCategory.value = openCategory.value === slug ? null : slug
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
