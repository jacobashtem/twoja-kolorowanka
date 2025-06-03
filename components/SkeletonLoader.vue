<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'gallery', // 'gallery' or 'item'
  },
  count: {
    type: Number,
    default: 4,
  },
})
</script>

<template>
  <div v-if="type === 'gallery'" class="flex flex-col md:grid md:grid-cols-4 gap-7">
    <div 
      v-for="i in count" 
      :key="i" 
      class="relative block rounded-lg overflow-hidden bg-gray-200 animate-pulse"
      style="aspect-ratio: 1/1;"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-3/4 h-8 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
  
  <div v-else-if="type === 'item'" class="animate-pulse">
    <div class="h-48 bg-gray-200 rounded-lg w-full"></div>
    <div class="h-4 bg-gray-200 rounded mt-2 w-3/4 mx-auto"></div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
