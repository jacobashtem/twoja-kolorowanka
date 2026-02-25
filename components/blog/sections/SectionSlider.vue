<template>
  <div class="slider-wrapper">
    <button
      class="slider-arrow slider-arrow--prev"
      @click="scrollPrev"
      aria-label="Poprzedni"
    >
      ‹
    </button>
    <button
      class="slider-arrow slider-arrow--next"
      @click="scrollNext"
      aria-label="Następny"
    >
      ›
    </button>
    <div
      ref="trackRef"
      class="slider-track"
      :class="{ 'slider-track--grabbing': isDragging }"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
    >
      <div v-for="post in posts" :key="post.id" class="slider-card">
        <BlogCard :post="post" image-height="200px" />
      </div>
    </div>
    <div class="slider-dots">
      <button
        v-for="(_, i) in dotsCount"
        :key="i"
        class="slider-dot"
        :class="{ 'slider-dot--active': i === activeDot }"
        @click="scrollToDot(i)"
        :aria-label="`Strona ${i + 1}`"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: { type: Array, required: true },
})

const trackRef = ref(null)
const isDragging = ref(false)
const activeDot = ref(0)
const cardWidth = 322 // 300 + 22 gap

const dotsCount = computed(() => {
  if (!trackRef.value) return 4
  const visible = Math.floor(trackRef.value.clientWidth / cardWidth) || 3
  return Math.max(1, (props.posts?.length || 0) - visible + 1)
})

function scrollPrev() {
  if (!trackRef.value) return
  trackRef.value.scrollBy({ left: -cardWidth, behavior: 'smooth' })
}

function scrollNext() {
  if (!trackRef.value) return
  trackRef.value.scrollBy({ left: cardWidth, behavior: 'smooth' })
}

function scrollToDot(i) {
  if (!trackRef.value) return
  trackRef.value.scrollTo({ left: i * cardWidth, behavior: 'smooth' })
}

// Track scroll position for dots
function updateDots() {
  if (!trackRef.value) return
  activeDot.value = Math.round(trackRef.value.scrollLeft / cardWidth)
}

// Drag-to-scroll (desktop)
let dragStartX = 0
let dragScrollLeft = 0

function onMouseDown(e) {
  isDragging.value = true
  dragStartX = e.pageX - trackRef.value.offsetLeft
  dragScrollLeft = trackRef.value.scrollLeft

  const onMouseMove = (e) => {
    if (!isDragging.value) return
    e.preventDefault()
    const x = e.pageX - trackRef.value.offsetLeft
    const walk = (x - dragStartX) * 1.5
    trackRef.value.scrollLeft = dragScrollLeft - walk
  }

  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// Touch swipe
let touchStartX = 0
let touchScrollLeft = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].pageX
  touchScrollLeft = trackRef.value.scrollLeft

  const onTouchMove = (e) => {
    const x = e.touches[0].pageX
    trackRef.value.scrollLeft = touchScrollLeft - (x - touchStartX)
  }

  const onTouchEnd = () => {
    trackRef.value.removeEventListener('touchmove', onTouchMove)
    trackRef.value.removeEventListener('touchend', onTouchEnd)
  }

  trackRef.value.addEventListener('touchmove', onTouchMove, { passive: true })
  trackRef.value.addEventListener('touchend', onTouchEnd)
}

onMounted(() => {
  if (trackRef.value) {
    trackRef.value.addEventListener('scroll', updateDots, { passive: true })
  }
})

onUnmounted(() => {
  if (trackRef.value) {
    trackRef.value.removeEventListener('scroll', updateDots)
  }
})
</script>

<style scoped>
.slider-wrapper {
  position: relative;
}
.slider-track {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  user-select: none;
  padding-bottom: 8px;
}
.slider-track::-webkit-scrollbar {
  display: none;
}
.slider-track--grabbing {
  cursor: grabbing;
}
.slider-card {
  min-width: 300px;
  max-width: 300px;
  flex-shrink: 0;
  scroll-snap-align: start;
}
.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--blog-card);
  border: 2px solid rgba(200, 180, 220, 0.2);
  box-shadow: var(--blog-shadow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: var(--blog-text-mid);
  z-index: 10;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slider-arrow:hover {
  transform: translateY(-50%) scale(1.12);
  box-shadow: var(--blog-shadow-lg);
  color: var(--blog-peach);
  border-color: var(--blog-peach);
}
.slider-arrow--prev {
  left: -18px;
}
.slider-arrow--next {
  right: -18px;
}
.slider-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.slider-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 171, 118, 0.25);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}
.slider-dot--active {
  background: var(--blog-peach);
  transform: scale(1.3);
}

@media (max-width: 900px) {
  .slider-arrow {
    display: none;
  }
}
</style>
