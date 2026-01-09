<template>
  <client-only>
    <div class="flex items-center justify-center p-4">
      <div class="w-full max-w-[420px] mx-auto">
        <!-- Current Color Display -->
        <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-1 mb-6">
          <div class="bg-white rounded-xl p-6">
            <h2 class="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wybierz Kolor
            </h2>
            <div
              class="w-full h-40 rounded-xl border-4 border-white shadow-2xl transition-all duration-300 hover:scale-105"
              :style="{ backgroundColor: value, boxShadow: `0 20px 60px ${value}80` }"
            />
            <div class="mt-4 text-center">
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Wybrany kolor
              </p>
              <p class="text-lg font-mono font-bold text-gray-800 bg-gray-100 rounded-lg py-2 px-4 inline-block">
                {{ value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Palette Container -->
        <div class="relative">
          <div
            ref="container"
            class="relative bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl overflow-hidden cursor-pointer border-2 border-purple-200"
            :style="{
              height: isExpanded ? 'auto' : '100px',
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
            }"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
            @click="onContainerClick"
          >
            <!-- Current Color Box -->
            <div class="p-5 text-center">
              <div
                class="w-full h-16 rounded-xl shadow-lg mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 hover:scale-105"
                :style="{
                  backgroundColor: value,
                  boxShadow: `0 10px 30px ${value}60`
                }"
              >
                <span class="drop-shadow-lg">Paleta Kolorów</span>
              </div>
              <div class="flex items-center justify-center gap-2">
                <UIcon
                  :name="isMobile ? 'material-symbols:touch-app' : 'material-symbols:arrow-downward'"
                  class="text-purple-500 text-xl animate-bounce"
                  dynamic
                />
                <p class="text-sm font-semibold text-purple-600">
                  {{ isMobile ? 'Dotknij aby rozwinąć' : 'Najedź aby rozwinąć' }}
                </p>
              </div>
            </div>

            <!-- Swatches -->
            <transition name="fade-slide">
              <div v-if="isExpanded" class="px-5 pb-5">
                <div class="grid grid-cols-8 gap-2.5">
                  <button
                    v-for="color in colors"
                    :key="color"
                    class="w-10 h-10 rounded-xl shadow-lg border-3 transition-all duration-200 hover:scale-125 hover:shadow-2xl hover:z-10 active:scale-95"
                    :class="value === color ? 'ring-4 ring-purple-500 ring-offset-2 scale-110' : 'border-white'"
                    :style="{
                      backgroundColor: color,
                      boxShadow: value === color ? `0 8px 25px ${color}80` : `0 4px 12px ${color}40`
                    }"
                    @click.stop="selectColor(color)"
                    :title="color"
                  />
                </div>
              </div>
            </transition>
          </div>

          <!-- Tip -->
          <div class="mt-4 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
              <UIcon name="material-symbols:info" class="text-purple-600 text-lg" dynamic />
              <p class="text-sm font-medium text-purple-700">
                {{ isMobile
                  ? 'Dotknij palety i wybierz kolor'
                  : 'Najedź na paletę i kliknij kolor' }}
              </p>
            </div>
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
  if (typeof window === 'undefined') return
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  if (typeof window === 'undefined') return
  window.addEventListener('resize', updateIsMobile)
})
onUnmounted(() => {
  if (typeof window === 'undefined') return
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
