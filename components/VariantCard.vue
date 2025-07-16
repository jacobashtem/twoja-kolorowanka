<template>
  <NuxtLink :to="item.url" class="aspect-square relative overflow-hidden rounded-xl shadow-xl group w-full" :class="bgClass">
    <svg
      class="absolute bottom-0 left-0 mb-8 scale-150 group-hover:scale-[1.65] transition-transform"
      viewBox="0 0 375 283"
      fill="none"
      style="opacity: 0.1;"
    >
      <rect x="159.52" y="175" width="152" height="152" rx="8" transform="rotate(-45 159.52 175)" fill="white" />
      <rect y="107.48" width="152" height="152" rx="8" transform="rotate(-45 0 107.48)" fill="white" />
    </svg>

    <div class="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform p-3">
      <img
        loading="lazy"
        class="max-w-full object-contain rounded-3xl bg-white min-w-64 min-h-64 max-h-64"
        :src="item.img"
        :alt="item.alt || item.title"
      />
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  bgClass: {
    type: String,
    default: 'bg-orange-500'
  }
})
</script>
