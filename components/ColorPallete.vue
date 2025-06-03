<template>
  <client-only>
    <div class="flex items-center justify-center p-4">
      <div class="w-full max-w-[360px] mx-auto">
        <!-- Current Color Display -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 class="text-xl font-bold text-center mb-4">Color Picker Demo</h2>
          <div
            class="w-full h-32 rounded-lg border-2 border-gray-200"
            :style="{ backgroundColor: value }"
          />
          <p class="text-center mt-2 text-sm text-gray-600">
            Selected: {{ value }}
          </p>
        </div>

        <!-- Palette Container -->
        <div class="relative">
          <div
            ref="container"
            class="relative bg-white rounded-t-3xl shadow-lg overflow-hidden cursor-pointer"
            :style="{
              height: isExpanded ? 'auto' : '80px',
              transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)'
            }"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
            @click="onContainerClick"
          >
            <!-- Current Color Box -->
            <div class="p-4 text-center">
              <div
                class="w-full h-12 rounded-lg shadow-md mx-auto mb-2 flex items-center justify-center text-white font-medium text-sm"
                :style="{ backgroundColor: value }"
              >Current Color</div>
              <p class="text-xs text-gray-500">
                {{ isMobile ? 'Tap to expand' : 'Hover to expand' }}
              </p>
            </div>

            <!-- Swatches -->
            <transition name="fade-slide">
              <div v-if="isExpanded" class="px-4 pb-4">
                <div class="grid grid-cols-8 gap-2">
                  <button
                    v-for="color in colors"
                    :key="color"
                    class="w-8 h-8 rounded-lg shadow-md border border-gray-200 transition-transform duration-300 ease-out hover:scale-125 hover:shadow-xl active:scale-90"
                    :style="{ backgroundColor: color }"
                    @click.stop="selectColor(color)"
                  />
                </div>
              </div>
            </transition>
          </div>

          <!-- Tip -->
          <div class="mt-4 text-center text-xs text-gray-500">
            <p>
              {{ isMobile
                ? 'Tap the palette to expand, then tap a color'
                : 'Hover over the palette and click a color' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  colors: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])

const value = ref(props.modelValue)
const isExpanded = ref(false)
const isMobile = ref(false)

function updateIsMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

function selectColor(color) {
  value.value = color
  emit('update:modelValue', color)
  if (isMobile.value) isExpanded.value = false
}
function onContainerClick() {
  if (isMobile.value) isExpanded.value = !isExpanded.value
}
function onMouseEnter() {
  if (!isMobile.value) isExpanded.value = true
}
function onMouseLeave() {
  if (!isMobile.value) isExpanded.value = false
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
