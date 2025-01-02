<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="flex flex-col md:grid md:grid-cols-4 gap-7">
    <GalleryItem
      v-for="(item, index) in items"
      :key="index"
      :src="item.src"
      :alt="item.alt"
      :title="item.title"
    />
  </div>
</template>
