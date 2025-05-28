<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  as: {
    type: String,
    default: 'h2',
  },
  fontSize: {
    type: String,
    default: 'text-xl',
  },
  backgroundColor: {
    type: String,
    default: 'bg-black',
  },
  textColor: {
    type: String,
    default: 'text-white',
  },
  borderColor: {
    type: String,
    default: 'border-black',
  },
})
</script>

<template>
  <component :is="as" class="flex flex-row flex-nowrap items-center mt-12 mb-4 leading-tight tracking-tight">
    <span :class="['flex-grow block border-t', borderColor]"></span>
    <span
      :class="[
        'block px-4 py-2.5 rounded leading-none font-',
        fontSize,
        backgroundColor,
        textColor
      ]"
    >
      {{ text }}
    </span>
    <span :class="['flex-grow block border-t', borderColor]"></span>
  </component>
</template>
