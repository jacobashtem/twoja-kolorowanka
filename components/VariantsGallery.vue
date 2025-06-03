<template>
  <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
    <VariantCard
      v-for="(item, index) in items"
      :key="index"
      :item="item"
      :bg-class="bgColors[index % bgColors.length]"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const bgColors = [
  'bg-orange-500',
  'bg-tertiary-400',
  'bg-yellow-500',
  'bg-sec-500',
  'bg-main-500',
  'bg-coolGray-500'
]
</script>
