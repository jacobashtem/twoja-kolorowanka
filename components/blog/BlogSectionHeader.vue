<template>
  <div class="flex items-center justify-between mb-7">
    <div class="flex items-center gap-3">
      <div
        class="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl"
        :style="{ background: iconBg }"
      >
        {{ emoji }}
      </div>
      <div>
        <div class="font-baloo text-2xl font-extrabold text-[#2A1B3D] leading-tight">{{ title }}</div>
        <div v-if="subtitle" class="text-sm text-[#8B7BA5] mt-0.5">{{ subtitle }}</div>
      </div>
    </div>
    <NuxtLink
      v-if="categorySlug"
      :to="`/blog/kategoria/${categorySlug}/`"
      class="font-baloo text-sm font-bold no-underline flex items-center gap-1 rounded-full py-2 px-4 transition-all duration-200 whitespace-nowrap hover:gap-2 hover:brightness-90"
      :style="{ color: linkColor, background: linkBg }"
    >
      <span>Wszystkie wpisy</span> →
    </NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  emoji: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  categorySlug: { type: String, default: '' },
  color: { type: String, default: '#9B72CF' },
})

const iconBg = computed(() => `${props.color}1A`)
const linkColor = computed(() => props.color)
const linkBg = computed(() => `${props.color}14`)
</script>
