<template>
  <div class="grid-3x2">
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

<style scoped>
.grid-3x2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

@media (max-width: 900px) {
  .grid-3x2 {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .grid-3x2 {
    grid-template-columns: 1fr;
  }
}
</style>
