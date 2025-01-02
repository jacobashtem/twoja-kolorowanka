<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: 'public/dinosaur.webp',
  },
  alt: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '/',
  },
})
</script>

<template>
  <NuxtLink
    :to="url"
    class="relative block rounded-lg overflow-hidden group"
  >
    <img
      :src="src"
      :alt="alt"
      class="w-full"
    />
    <p
      class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-2xl text-center text-white font-roboto font-medium group-hover:bg-opacity-60 transition"
    >
      <span
        class="flex-none block mx-4 px-4 py-2.5 rounded-lg leading-none text-2xl bg-yellow-500 text-white"
      >
        {{ title }}
      </span>
    </p>
  </NuxtLink>
</template>
