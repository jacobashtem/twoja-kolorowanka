<script setup>
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

const displaySrc = ref(svgPreview(props.src))
watch(() => props.src, s => { displaySrc.value = svgPreview(s) })
const onImgError = () => {
  if (displaySrc.value !== props.src) displaySrc.value = props.src
}
</script>

<template>
  <NuxtLink
    :to="url"
    class="relative block rounded-lg overflow-hidden group"
  >
    <img
      :src="displaySrc"
      :alt="alt || title"
      loading="lazy"
      @error="onImgError"
      class="w-full max-h-64"
    />
    <p
      class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-2xl text-center text-white font-roboto font-medium group-hover:bg-opacity-60 transition"
    >
      <span
        class="block max-w-[calc(100%-2rem)] px-4 py-2.5 rounded-lg leading-tight text-2xl bg-yellow-500 text-white"
      >
        {{ title }}
      </span>
    </p>
  </NuxtLink>
</template>
