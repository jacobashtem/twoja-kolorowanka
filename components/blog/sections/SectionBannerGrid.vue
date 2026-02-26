<template>
  <div>
    <!-- Banner card -->
    <NuxtLink
      v-if="bannerPost"
      :to="`/blog/${bannerPost.slug}/`"
      class="group grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden bg-gradient-to-br from-[#CCFBF1] via-[#A7F3D0] to-[#BAE6FD] shadow cursor-pointer transition-all duration-300 no-underline text-inherit hover:-translate-y-1 hover:shadow-lg"
    >
      <div class="flex items-center justify-center min-h-[220px] overflow-hidden">
        <img
          v-if="bannerPost.thumbnail?.url"
          :src="bannerPost.thumbnail.url"
          :alt="bannerPost.thumbnail.alt || bannerPost.title"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
        />
        <div v-else class="text-[6rem] transition-transform duration-400 group-hover:scale-105">
          {{ bannerPost._mockEmoji || '🌸' }}
        </div>
      </div>
      <div class="p-9 px-8 flex flex-col justify-center">
        <BlogCategoryTag
          v-if="bannerPost.category"
          :category="bannerPost.category"
          :show-emoji="false"
          size="small"
        />
        <h3 class="font-baloo text-2xl font-extrabold mb-2.5 mt-2.5 text-[#2A1B3D] leading-snug">{{ bannerPost.title }}</h3>
        <p class="text-[#5C4A72] leading-relaxed text-[0.95rem]">{{ bannerPost.excerpt }}</p>
        <div class="mt-4 text-[0.78rem] text-[#8B7BA5] flex gap-3">
          <span>📅 {{ bannerPost.dateShort || bannerPost.dateFormatted }}</span>
          <span>⏱ {{ bannerPost.readingTime }} min</span>
        </div>
      </div>
    </NuxtLink>

    <!-- 4-grid -->
    <div v-if="gridPosts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[22px] mt-[22px]">
      <BlogCard
        v-for="post in gridPosts"
        :key="post.id"
        :post="post"
        image-height="155px"
        :excerpt-lines="2"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: { type: Array, required: true },
})

const bannerPost = computed(() => props.posts[0] || null)
const gridPosts = computed(() => props.posts.slice(1, 5))
</script>
