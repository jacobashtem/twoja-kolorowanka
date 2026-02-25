<template>
  <div v-if="totalPages > 1" class="blog-pagination">
    <button
      class="blog-pagination__arrow"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </button>
    <button
      v-for="page in visiblePages"
      :key="page"
      class="blog-pagination__btn"
      :class="{ 'blog-pagination__btn--active': page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    <button
      class="blog-pagination__arrow"
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

<style scoped>
.blog-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 48px 0;
}
.blog-pagination__btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 2px solid rgba(200, 180, 220, 0.2);
  background: var(--blog-card);
  font-family: 'Baloo 2', cursive;
  font-size: 1rem;
  font-weight: 700;
  color: var(--blog-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.blog-pagination__btn:hover {
  transform: scale(1.1);
  border-color: var(--blog-lavender);
  color: var(--blog-lavender);
}
.blog-pagination__btn--active {
  background: linear-gradient(135deg, var(--blog-lavender), var(--blog-bubblegum));
  color: white;
  border-color: transparent;
  transform: scale(1.1);
}
.blog-pagination__arrow {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: transparent;
  font-size: 1.4rem;
  color: var(--blog-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.blog-pagination__arrow:hover:not(:disabled) {
  color: var(--blog-lavender);
  transform: scale(1.15);
}
.blog-pagination__arrow:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
