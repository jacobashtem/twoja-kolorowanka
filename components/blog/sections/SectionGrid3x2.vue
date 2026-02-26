<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
    <BlogCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      image-height="170px"
    />
  </div>
</template>

<script setup>
defineProps({
  posts: { type: Array, required: true },
})
</script>
