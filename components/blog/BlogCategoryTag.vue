<template>
  <NuxtLink
    v-if="linkable"
    :to="`/blog/kategoria/${category.slug}/`"
    class="font-baloo font-bold uppercase tracking-wide rounded-full inline-flex items-center gap-1.5 no-underline transition-all duration-200 cursor-pointer leading-snug hover:scale-105"
    :style="tagStyle"
  >
    <span v-if="showEmoji">{{ category.emoji }}</span>
    {{ category.name }}
  </NuxtLink>
  <span
    v-else
    class="font-baloo font-bold uppercase tracking-wide rounded-full inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer leading-snug hover:scale-105"
    :style="tagStyle"
  >
    <span v-if="showEmoji">{{ category.emoji }}</span>
    {{ category.name }}
  </span>
</template>

<script setup>
import { getCategoryConfig } from '~/composables/useBlogCategories'

const props = defineProps({
  category: { type: Object, required: true },
  showEmoji: { type: Boolean, default: true },
  linkable: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
})

const config = computed(() => getCategoryConfig(props.category?.slug) || {})

const tagStyle = computed(() => ({
  background: config.value.tagBg || '#EDE9FE',
  color: config.value.tagColor || '#5B21B6',
  fontSize: props.size === 'small' ? '0.72rem' : '0.82rem',
  padding: props.size === 'small' ? '3px 10px' : '5px 14px',
}))
</script>
