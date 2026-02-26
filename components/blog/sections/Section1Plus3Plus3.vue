<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-[22px]">
      <BlogCard
        v-if="posts[0]"
        :post="posts[0]"
        variant="big"
        :excerpt-lines="3"
      />
      <div class="flex flex-col gap-[22px]">
        <BlogCardCompact
          v-for="post in sidePosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </div>
    <div v-if="bottomPosts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px] mt-[22px]">
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
