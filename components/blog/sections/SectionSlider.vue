<template>
  <div class="relative">
    <button
      class="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-[18px] z-10 w-12 h-12 rounded-full bg-white border-2 border-[#C8B4DC]/20 shadow items-center justify-center text-[1.4rem] text-[#5C4A72] cursor-pointer transition-all duration-300 hover:scale-[1.12] hover:shadow-lg hover:text-[#FFAB76] hover:border-[#FFAB76]"
      @click="scrollPrev"
      aria-label="Poprzedni"
    >
      &#8249;
    </button>
    <button
      class="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-[18px] z-10 w-12 h-12 rounded-full bg-white border-2 border-[#C8B4DC]/20 shadow items-center justify-center text-[1.4rem] text-[#5C4A72] cursor-pointer transition-all duration-300 hover:scale-[1.12] hover:shadow-lg hover:text-[#FFAB76] hover:border-[#FFAB76]"
      @click="scrollNext"
      aria-label="Następny"
    >
      &#8250;
    </button>
    <div
      ref="trackRef"
      class="flex gap-[22px] overflow-x-auto snap-x snap-mandatory scrollbar-none cursor-grab select-none pb-2"
      :class="{ '!cursor-grabbing': isDragging }"
      @mousedown="onMouseDown"
      @touchstart.passive="onTouchStart"
    >
      <div v-for="post in posts" :key="post.id" class="min-w-[300px] max-w-[300px] shrink-0 snap-start">
        <BlogCard :post="post" image-height="200px" />
      </div>
    </div>
    <div class="flex justify-center gap-2 mt-5">
      <button
        v-for="(_, i) in dotsCount"
        :key="i"
        class="w-[10px] h-[10px] rounded-full border-none cursor-pointer transition-all duration-300"
        :class="i === activeDot ? 'bg-[#FFAB76] scale-[1.3]' : 'bg-[#FFAB76]/25'"
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

<style>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
