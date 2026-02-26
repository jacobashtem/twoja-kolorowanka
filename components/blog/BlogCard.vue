<template>
  <NuxtLink
    :to="`/blog/${post.slug}/`"
    class="group bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm block no-underline text-inherit transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
  >
    <div class="w-full overflow-hidden" :style="imgContainerStyle">
      <img
        v-if="post.thumbnail?.url"
        :src="post.thumbnail.url"
        :alt="post.thumbnail.alt || post.title"
        :width="post.thumbnail.width"
        :height="post.thumbnail.height"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.08]"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center transition-transform duration-400 group-hover:scale-[1.08]"
        :class="placeholderSizeClass"
        :style="placeholderStyle"
      >
        {{ post._mockEmoji || '📝' }}
      </div>
    </div>
    <div class="px-5 pt-4 pb-5">
      <BlogCategoryTag
        v-if="post.category"
        :category="post.category"
        :show-emoji="false"
        size="small"
      />
      <h3
        class="font-baloo font-bold leading-snug mb-2 text-[#2A1B3D] transition-colors duration-200 group-hover:text-[#9B72CF]"
        :class="variant === 'big' || variant === 'tall' ? 'text-xl' : 'text-base'"
      >
        {{ post.title }}
      </h3>
      <p
        v-if="showExcerpt"
        class="text-sm leading-relaxed text-[#5C4A72] line-clamp-2"
        :style="excerptClamp"
      >
        {{ post.excerpt }}
      </p>
      <div class="mt-3 text-xs text-[#8B7BA5] flex gap-3">
        <span v-if="showDate">📅 {{ post.dateShort || post.dateFormatted }}</span>
        <span v-if="showReadingTime">⏱ {{ post.readingTime }} min</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, required: true },
  variant: { type: String, default: 'default' },
  imageHeight: { type: String, default: '' },
  showExcerpt: { type: Boolean, default: true },
  excerptLines: { type: Number, default: 2 },
  showReadingTime: { type: Boolean, default: true },
  showDate: { type: Boolean, default: true },
})

const imgContainerStyle = computed(() => {
  if (props.variant === 'big') return { height: '100%', minHeight: '380px' }
  if (props.variant === 'tall') return { height: '280px' }
  if (props.variant === 'banner') return { height: '100%', minHeight: '220px' }
  if (props.imageHeight) return { height: props.imageHeight }
  return { height: '170px' }
})

const placeholderSizeClass = computed(() => {
  if (props.variant === 'big' || props.variant === 'tall' || props.variant === 'banner') return 'text-7xl'
  return 'text-5xl'
})

const excerptClamp = computed(() => ({
  '-webkit-line-clamp': props.excerptLines,
}))

const placeholderStyle = computed(() => ({
  background: props.post._mockGradient || 'linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #C4B5FD 100%)',
}))
</script>
