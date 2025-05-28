<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  slugHandler: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="flex flex-col md:grid md:grid-cols-4 gap-7">
    <template v-if="!slugHandler">
      <GalleryItem
        v-for="(item, index) in items"
        :key="index"
        :src="item.src"
        :alt="item.alt"
        :title="item.title"
        :url="item.url"
      />
    </template>
    <template v-else>
    <GalleryItem
      v-for="(item, index) in items"
      :key="index"
      :src="item.heroImg1"
      :alt="item.alt"
      :title="item.categoryName"
      :url="item._path"
    />
    </template>
  </div>
</template>
