<template>
  <div>
    <div class="layout-masonry">
      <BlogCard
        v-if="posts[0]"
        :post="posts[0]"
        variant="tall"
        :excerpt-lines="4"
        class="masonry-tall"
      />
      <div class="right-stack">
        <BlogCard
          v-for="post in shortPosts"
          :key="post.id"
          :post="post"
          image-height="150px"
        />
      </div>
    </div>
    <div v-if="compactPosts.length" class="masonry-bottom">
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

<style scoped>
.layout-masonry {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.masonry-tall {
  grid-row: span 2;
}
.right-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.masonry-bottom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 22px;
}

@media (max-width: 900px) {
  .layout-masonry {
    grid-template-columns: 1fr;
  }
  .masonry-tall {
    grid-row: span 1;
  }
  .masonry-bottom {
    grid-template-columns: 1fr;
  }
}
</style>
