<template>
  <div class="flex flex-col gap-[22px]">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-[22px]">
      <BlogCard
        v-for="post in row1"
        :key="post.id"
        :post="post"
        image-height="200px"
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.6fr] gap-[22px]">
      <BlogCard
        v-for="post in row2"
        :key="post.id"
        :post="post"
        image-height="200px"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: { type: Array, required: true },
})

const row1 = computed(() => props.posts.slice(0, 3))
const row2 = computed(() => props.posts.slice(3, 6))
</script>
