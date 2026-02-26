<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 my-12">
    <button
      class="w-11 h-11 rounded-[14px] border-none bg-transparent text-xl text-[#8B7BA5] cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-[#9B72CF] hover:scale-110 disabled:opacity-30 disabled:cursor-default disabled:hover:scale-100"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </button>
    <button
      v-for="page in visiblePages"
      :key="page"
      class="w-11 h-11 rounded-[14px] border-2 font-baloo text-base font-bold cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110 hover:border-[#9B72CF] hover:text-[#9B72CF]"
      :class="page === currentPage
        ? 'bg-gradient-to-br from-[#9B72CF] to-[#FF6B9D] text-white border-transparent scale-110'
        : 'bg-white text-[#8B7BA5] border-[rgba(200,180,220,0.2)]'"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    <button
      class="w-11 h-11 rounded-[14px] border-none bg-transparent text-xl text-[#8B7BA5] cursor-pointer flex items-center justify-center transition-all duration-200 hover:text-[#9B72CF] hover:scale-110 disabled:opacity-30 disabled:cursor-default disabled:hover:scale-100"
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
    >
      ›
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage

  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)

  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

function goToPage(page) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('page-change', page)
}
</script>
