<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** Currently selected color hex */
  color: { type: String, required: true },
  /** Currently selected brush size */
  brushSize: { type: Number, required: true },
  /** Larger dots and spacing for mobile drawer */
  mobile: { type: Boolean, default: false },
})

const emit = defineEmits(['update:color', 'update:brushSize'])

// ---- Palette data ----
const { QUICK_COLORS, BRUSH_SIZES, COLOR_CATEGORIES } = useColorPalette()
const categoryEntries = computed(() => Object.entries(COLOR_CATEGORIES))

// ---- Accordion state ----
const activeCategory = ref(null)

function toggleCategory(name) {
  activeCategory.value = activeCategory.value === name ? null : name
}

// ---- Size helpers ----
const quickDotSize = computed(() => props.mobile ? 40 : 36)
const paletteDotSize = computed(() => props.mobile ? 34 : 30)

function brushCircleSize(s) {
  return Math.max(4, Math.round(s * 0.7))
}

// ---- Color dot style ----
function dotStyle(c, selected, size) {
  return {
    width: size + 'px',
    height: size + 'px',
    borderRadius: '50%',
    backgroundColor: c,
    border: selected
      ? '3px solid #10B981'
      : c === '#FFFFFF' ? '1.5px solid #D1D5DB' : '2px solid transparent',
    boxShadow: selected
      ? '0 0 0 2px #10B981, 0 2px 8px rgba(16,185,129,0.3)'
      : '0 1px 3px rgba(0,0,0,0.12)',
    transform: selected ? 'scale(1.15)' : 'scale(1)',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
    flexShrink: '0',
  }
}
</script>

<template>
  <div class="flex flex-col" :class="mobile ? 'gap-5' : 'gap-5 p-5'">

    <!-- ---- Szybki wybór ---- -->
    <section>
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
        Szybki wybór
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in QUICK_COLORS"
          :key="c"
          @click="emit('update:color', c)"
          :aria-label="`Kolor ${c}`"
          :aria-checked="color === c"
          role="radio"
          class="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full"
          :style="dotStyle(c, color === c, quickDotSize)"
        />
      </div>
    </section>

    <!-- ---- Paleta kolorów (accordion) ---- -->
    <section>
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Paleta kolorów
      </div>

      <div class="flex flex-col gap-0.5">
        <div v-for="[name, colors] in categoryEntries" :key="name">

          <!-- Category header -->
          <button
            @click="toggleCategory(name)"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 focus:outline-none"
            :class="activeCategory === name
              ? 'bg-emerald-50'
              : 'hover:bg-slate-50'"
          >
            <!-- 5 tiny preview dots -->
            <div class="flex gap-1 shrink-0">
              <div
                v-for="c in colors.slice(0, 5)"
                :key="c"
                class="w-3 h-3 rounded-full shrink-0"
                :style="{
                  backgroundColor: c,
                  border: c === '#FFFFFF' ? '1px solid #ddd' : 'none',
                }"
              />
            </div>

            <span class="text-xs text-slate-600 font-medium">{{ name }}</span>

            <!-- Chevron -->
            <span
              class="ml-auto text-[10px] text-slate-400 shrink-0"
              :style="{
                transform: activeCategory === name ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                display: 'inline-block',
              }"
            >▼</span>
          </button>

          <!-- Expanded colors -->
          <Transition name="accordion">
            <div v-if="activeCategory === name" class="px-2 pb-2 pt-1">
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="c in colors"
                  :key="c"
                  @click="emit('update:color', c)"
                  :aria-label="`Kolor ${c}`"
                  :aria-checked="color === c"
                  role="radio"
                  class="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full"
                  :style="dotStyle(c, color === c, paletteDotSize)"
                />
              </div>
            </div>
          </Transition>

        </div>
      </div>
    </section>

    <!-- ---- Rozmiar pędzla ---- -->
    <section>
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
        Rozmiar pędzla
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="s in BRUSH_SIZES"
          :key="s"
          @click="emit('update:brushSize', s)"
          :title="`${s}px`"
          class="flex items-center justify-center rounded-xl transition-all duration-150 focus:outline-none"
          :class="[
            mobile ? 'w-12 h-12' : 'w-11 h-11',
            brushSize === s
              ? 'bg-emerald-50 border-2 border-emerald-500'
              : 'bg-white border border-slate-200 hover:border-emerald-300',
          ]"
        >
          <div
            class="rounded-full"
            :style="{
              width: brushCircleSize(s) + 'px',
              height: brushCircleSize(s) + 'px',
              backgroundColor: brushSize === s ? '#10B981' : '#94A3B8',
            }"
          />
        </button>
      </div>
    </section>

  </div>
</template>

<style scoped>
.accordion-enter-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 300px;
}
.accordion-leave-active {
  transition: max-height 0.15s ease, opacity 0.15s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-leave-from {
  max-height: 300px;
  opacity: 1;
}
</style>
