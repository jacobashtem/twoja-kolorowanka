<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
      <BlogCard
        v-if="posts[0]"
        :post="posts[0]"
        variant="tall"
        :excerpt-lines="4"
        class="md:row-span-2"
      />
      <div class="flex flex-col gap-[22px]">
        <BlogCard
          v-for="post in shortPosts"
          :key="post.id"
          :post="post"
          image-height="150px"
        />
      </div>
    </div>
    <div v-if="compactPosts.length" class="grid grid-cols-1 md:grid-cols-3 gap-[22px] mt-[22px]">
      <BlogCardCompact
        v-for="post in compactPosts"
        :key="post.id"
        :post="post"
        :show-excerpt="false"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: { type: Array, required: true },
})

const shortPosts = computed(() => props.posts.slice(1, 3))
const compactPosts = computed(() => props.posts.slice(3, 6))
</script>
