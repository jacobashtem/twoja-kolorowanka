<template>
  <section v-if="post" class="max-w-[1260px] mx-auto pt-10 px-8 max-sm:px-4 max-sm:pt-5">
    <NuxtLink
      :to="`/blog/${post.slug}/`"
      class="group grid grid-cols-[1.3fr_1fr] max-md:grid-cols-1 rounded-[32px] overflow-hidden bg-white shadow-lg cursor-pointer no-underline text-inherit transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(90,50,130,0.16)] animate-[heroIn_0.8s_ease-out_both]"
    >
      <div class="relative min-h-[440px] max-md:min-h-[280px] overflow-hidden">
        <img
          v-if="post.thumbnail?.url"
          :src="post.thumbnail.url"
          :alt="post.thumbnail.alt || post.title"
          :width="post.thumbnail.width"
          :height="post.thumbnail.height"
          class="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-[8rem] transition-transform duration-600 group-hover:scale-105"
          :style="placeholderStyle"
        >
          {{ post._mockEmoji || '🦕' }}
        </div>
      </div>
      <div class="p-12 max-md:px-6 max-md:py-7 flex flex-col justify-center">
        <div
          v-if="post.category"
          class="font-baloo text-[0.8rem] font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5"
          :style="{ color: post.category.color }"
        >
          <span class="w-2 h-2 rounded-full" :style="{ background: post.category.color }"></span>
          {{ post.category.name }}
        </div>
        <h1 class="font-baloo text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold mb-4 leading-tight text-[#2A1B3D]">
          {{ post.title }}
        </h1>
        <p class="text-base leading-relaxed text-[#5C4A72] mb-7 max-w-[420px]">
          {{ post.excerpt }}
        </p>
        <div class="flex gap-5 text-sm text-[#8B7BA5]">
          <span>📅 {{ post.dateFormatted }}</span>
          <span>⏱ {{ post.readingTime }} min czytania</span>
        </div>
        <span class="inline-flex items-center gap-2 mt-6 py-3 px-7 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFAB76] text-white font-baloo text-base font-bold w-fit shadow-[0_4px_16px_rgba(255,107,107,0.3)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-[0_6px_24px_rgba(255,107,107,0.4)]">
          Czytaj artykuł <span class="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </NuxtLink>
  </section>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, default: null },
})

const placeholderStyle = computed(() => ({
  background: props.post?._mockGradient || 'linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #C4B5FD 100%)',
}))
</script>

<style>
@keyframes heroIn {
  from { opacity: 0; transform: translateY(40px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
