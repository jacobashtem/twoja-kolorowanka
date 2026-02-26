<template>
  <nav
    class="sticky top-0 z-50 bg-[rgba(255,251,245,0.88)] backdrop-blur-xl border-b border-[rgba(200,180,220,0.15)] py-2.5 transition-shadow duration-300"
    :class="{ 'shadow-[0_4px_20px_rgba(90,50,130,0.08)]': isScrolled }"
  >
    <div class="max-w-[1260px] mx-auto px-8 max-sm:px-4 flex items-center gap-5">
      <NuxtLink to="/" class="flex items-center gap-2.5 no-underline flex-shrink-0 transition-transform duration-200 hover:scale-[1.03]">
        <BlogLogo :size="38" />
        <div class="flex flex-col leading-none max-sm:hidden">
          <span class="font-baloo text-[0.72rem] font-bold text-[#8B7BA5] tracking-wide">TWOJA</span>
          <span class="font-baloo text-lg font-extrabold bg-gradient-to-br from-[#FF6B6B] to-[#9B72CF] bg-clip-text text-transparent -mt-0.5">Kolorowanka</span>
        </div>
      </NuxtLink>
      <div class="flex gap-2 overflow-x-auto scrollbar-none flex-1 py-1">
        <NuxtLink
          to="/blog/"
          class="inline-flex items-center gap-1.5 py-[7px] px-4 rounded-full border-2 border-transparent font-baloo text-sm font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 no-underline hover:bg-[rgba(155,114,207,0.08)] hover:text-[#9B72CF]"
          :class="!activeSlug ? 'bg-[#2A1B3D] text-white border-[#2A1B3D]' : 'bg-transparent text-[#5C4A72]'"
        >
          🌈 Wszystkie
        </NuxtLink>
        <NuxtLink
          v-for="cat in sortedCategories"
          :key="cat.slug"
          :to="`/blog/kategoria/${cat.slug}/`"
          class="inline-flex items-center gap-1.5 py-[7px] px-4 rounded-full border-2 border-transparent font-baloo text-sm font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 no-underline hover:bg-[rgba(155,114,207,0.08)] hover:text-[#9B72CF]"
          :class="activeSlug === cat.slug ? 'bg-[#2A1B3D] text-white border-[#2A1B3D]' : 'bg-transparent text-[#5C4A72]'"
        >
          {{ cat.emoji }} {{ cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1) }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { getSortedCategories } from '~/composables/useBlogCategories'

defineProps({
  activeSlug: { type: String, default: '' },
})

const sortedCategories = getSortedCategories()
const isScrolled = ref(false)

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>
