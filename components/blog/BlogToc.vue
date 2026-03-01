<template>
  <nav
    v-if="headings.length >= 2"
    class="rounded-2xl border border-[#C8B4DC]/20 bg-white/80 backdrop-blur-sm p-5 shadow-sm"
    aria-label="Spis treści"
  >
    <p class="font-baloo text-[0.9rem] font-extrabold text-[#2A1B3D] mb-3 flex items-center gap-2">
      <span class="text-[#9B72CF]">☰</span> Spis treści
    </p>

    <ul class="space-y-[2px]">
      <li v-for="item in headings" :key="item.id">
        <a
          :href="`#${item.id}`"
          class="block text-[0.8rem] leading-[1.45] py-[4px] pr-1 rounded-lg transition-all duration-200 no-underline"
          :class="[
            item.level === 3 ? 'pl-4' : 'pl-2',
            activeId === item.id
              ? 'text-[#9B72CF] font-semibold bg-[#9B72CF]/[0.07]'
              : 'text-[#8B7BA5] hover:text-[#5C4A72] hover:bg-[#F8F5FF]',
          ]"
          @click.prevent="scrollTo(item.id)"
        >{{ item.text }}</a>
      </li>
    </ul>

    <div class="mt-4 h-[3px] rounded-full bg-[#C8B4DC]/20 overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#9B72CF] transition-[width] duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  headings: { type: Array, default: () => [] },
})

const activeId = ref('')
const progress = ref(0)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
  )

  props.headings.forEach((h) => {
    const el = document.getElementById(h.id)
    if (el) observer.observe(el)
  })

  function onScroll() {
    const el = document.documentElement
    const total = el.scrollHeight - el.clientHeight
    progress.value = total > 0 ? Math.round((el.scrollTop / total) * 100) : 0
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  onUnmounted(() => {
    observer.disconnect()
    window.removeEventListener('scroll', onScroll)
  })
})

function scrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  activeId.value = id
}
</script>
