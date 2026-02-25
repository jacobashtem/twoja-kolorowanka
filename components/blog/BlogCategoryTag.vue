<template>
  <NuxtLink
    v-if="linkable"
    :to="`/blog/kategoria/${category.slug}/`"
    class="blog-cat-tag"
    :style="tagStyle"
  >
    <span v-if="showEmoji" class="blog-cat-tag__emoji">{{ category.emoji }}</span>
    {{ category.name }}
  </NuxtLink>
  <span v-else class="blog-cat-tag" :style="tagStyle">
    <span v-if="showEmoji" class="blog-cat-tag__emoji">{{ category.emoji }}</span>
    {{ category.name }}
  </span>
</template>

<script setup>
import { getCategoryConfig } from '~/composables/useBlogCategories'

const props = defineProps({
  category: { type: Object, required: true },
  showEmoji: { type: Boolean, default: true },
  linkable: { type: Boolean, default: false },
  size: { type: String, default: 'default' }, // 'small' | 'default'
})

const config = computed(() => getCategoryConfig(props.category?.slug) || {})

const tagStyle = computed(() => ({
  background: config.value.tagBg || '#EDE9FE',
  color: config.value.tagColor || '#5B21B6',
  fontSize: props.size === 'small' ? '0.72rem' : '0.82rem',
  padding: props.size === 'small' ? '3px 10px' : '5px 14px',
}))
</script>

<style scoped>
.blog-cat-tag {
  font-family: 'Baloo 2', cursive;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  line-height: 1.4;
}
.blog-cat-tag:hover {
  transform: scale(1.05);
}
</style>
