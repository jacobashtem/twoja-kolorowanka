<template>
  <section v-if="posts.length" class="blog-related">
    <h2 class="blog-related__title">Powiązane artykuły</h2>
    <div class="blog-related__grid">
      <BlogCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        image-height="170px"
      />
    </div>
  </section>
</template>

<script setup>
defineProps({
  posts: { type: Array, default: () => [] },
})
</script>

<style scoped>
.blog-related {
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid rgba(200, 180, 220, 0.2);
}
.blog-related__title {
  font-family: 'Baloo 2', cursive;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: var(--blog-text);
}
.blog-related__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

@media (max-width: 900px) {
  .blog-related__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .blog-related__grid {
    grid-template-columns: 1fr;
  }
}
</style>
