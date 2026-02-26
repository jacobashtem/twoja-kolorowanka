<template>
  <NuxtLink
    :to="`/blog/${post.slug}/`"
    class="group bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm grid grid-cols-[120px_1fr] max-sm:grid-cols-[100px_1fr] no-underline text-inherit transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
  >
    <div class="h-full min-h-[100px] overflow-hidden">
      <img
        v-if="post.thumbnail?.url"
        :src="post.thumbnail.url"
        :alt="post.thumbnail.alt || post.title"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.08]"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-4xl transition-transform duration-400 group-hover:scale-[1.08]"
        :style="placeholderStyle"
      >
        {{ post._mockEmoji || '📝' }}
      </div>
    </div>
    <div class="px-4 py-3.5 flex flex-col justify-center">
      <BlogCategoryTag
        v-if="post.category && showCategory"
        :category="post.category"
        :show-emoji="false"
        size="small"
      />
      <h3 class="font-baloo text-[0.92rem] font-bold leading-snug mb-1 text-[#2A1B3D] transition-colors duration-200 group-hover:text-[#9B72CF]">
        {{ post.title }}
      </h3>
      <p v-if="showExcerpt" class="text-xs leading-normal text-[#5C4A72] line-clamp-2">
        {{ post.excerpt }}
      </p>
      <div class="mt-1.5 text-xs text-[#8B7BA5]">
        <span>📅 {{ post.dateShort || post.dateFormatted }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, required: true },
  showExcerpt: { type: Boolean, default: true },
  showCategory: { type: Boolean, default: true },
})

const placeholderStyle = computed(() => ({
  background: props.post._mockGradient || 'linear-gradient(135deg, #DDD6FE, #C4B5FD)',
}))
</script>
