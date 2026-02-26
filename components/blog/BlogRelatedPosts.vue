<template>
  <section v-if="posts.length" class="mt-16 pt-12 border-t border-[#C8B4DC]/20">
    <h2 class="font-baloo text-[1.4rem] font-extrabold mb-6 text-[#2A1B3D]">Powiązane artykuły</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
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
