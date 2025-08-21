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
  <div class="flex flex-row flex-nowrap items-center mt-2 sm:mt-12 mb-4 leading-tight tracking-tight">
    <!-- Linia z lewej -->
    <span
      :class="['flex-grow block border-t', borderColor]"
      aria-hidden="true"
    ></span>

    <!-- Tylko tekst nagłówka wewnątrz semanticznego komponentu (h2/h3/etc.) -->
    <component
      :is="as"
      class="px-4 py-2.5 rounded leading-none font-semibold"
      :class="[fontSize, backgroundColor, textColor]"
    >
      {{ text }}
    </component>

    <!-- Linia z prawej -->
    <span
      :class="['flex-grow block border-t', borderColor]"
      aria-hidden="true"
    ></span>
  </div>
</template>
