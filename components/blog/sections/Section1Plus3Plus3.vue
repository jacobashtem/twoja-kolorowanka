<template>
  <div>
    <div class="layout-1plus3">
      <BlogCard
        v-if="posts[0]"
        :post="posts[0]"
        variant="big"
        :excerpt-lines="3"
      />
      <div class="side-triple">
        <BlogCardCompact
          v-for="post in sidePosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </div>
    <div v-if="bottomPosts.length" class="bottom-row">
      <BlogCard
        v-for="post in bottomPosts"
        :key="post.id"
        :post="post"
        image-height="150px"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: { type: Array, required: true },
})

const sidePosts = computed(() => props.posts.slice(1, 4))
const bottomPosts = computed(() => props.posts.slice(4, 7))
</script>

<style scoped>
.layout-1plus3 {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 22px;
}
.side-triple {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 22px;
}

@media (max-width: 900px) {
  .layout-1plus3 {
    grid-template-columns: 1fr;
  }
  .bottom-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .bottom-row {
    grid-template-columns: 1fr;
  }
}
</style>
