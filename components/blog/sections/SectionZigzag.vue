<template>
  <div class="layout-zigzag">
    <div class="zigzag-row">
      <BlogCard
        v-for="post in row1"
        :key="post.id"
        :post="post"
        image-height="200px"
      />
    </div>
    <div class="zigzag-row zigzag-row--reverse">
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

<style scoped>
.layout-zigzag {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.zigzag-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: 22px;
}
.zigzag-row--reverse {
  grid-template-columns: 1fr 1fr 1.6fr;
}

@media (max-width: 900px) {
  .zigzag-row,
  .zigzag-row--reverse {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .zigzag-row,
  .zigzag-row--reverse {
    grid-template-columns: 1fr;
  }
}
</style>
