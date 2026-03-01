<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import ColoringCanvas from './Canvas.vue'

const props = defineProps({
  svgUrl:     String,
  title:      { type: String, default: 'Kolorowanka' },
  returnPath: { type: String, default: '/'           },
})

const isMobile = useMediaQuery('(max-width: 767px)')

// ---- State ----
const tool          = ref('fill')      // fill | draw | eraser
const selectedColor = ref('#FF0000')
const brushSize     = ref(10)
const drawerOpen    = ref(false)
const canvasRef     = ref(null)

// Canvas area – measured to calculate paper dimensions
const canvasAreaRef = ref(null)
const { width: areaW, height: areaH } = useElementSize(canvasAreaRef)

// Mobile canvas container – pinch / wheel attach target
const mobileCanvasRef = ref(null)

// SVG aspect ratio (updated when SVG is parsed)
const svgAspect = ref(3 / 4)

function onSvgLoaded({ aspect }) {
  svgAspect.value = aspect
}

// Paper dimensions – fit SVG aspect ratio within canvas area
const paperWidth = computed(() => {
  const w = areaW.value || 520
  const h = areaH.value || 700
  const a = svgAspect.value
  return Math.round((w * 0.9) / (h * 0.9) > a ? h * 0.9 * a : w * 0.9)
})
const paperHeight = computed(() => Math.round(paperWidth.value / svgAspect.value))

// ---- Zoom (shared state, different sources on desktop/mobile) ----
const desktopZoom = ref(1)

// Mobile pinch-to-zoom composable
const { zoom: mobileZoom, offsetX, offsetY, attachTo, resetZoom } = usePinchZoom({ min: 0.5, max: 3 })

// Desktop: wheel on canvas area
function onDesktopWheel(e) {
  if (!e.ctrlKey && !e.metaKey) return
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  desktopZoom.value = Math.min(Math.max(+(desktopZoom.value + delta).toFixed(2), 0.5), 3)
}

const zoomPercent = computed(() => Math.round(desktopZoom.value * 100))
function zoomIn()  { desktopZoom.value = Math.min(+(desktopZoom.value + 0.25).toFixed(2), 3) }
function zoomOut() { desktopZoom.value = Math.max(+(desktopZoom.value - 0.25).toFixed(2), 0.5) }

// Attach pinch handler when the mobile canvas container mounts
watch(mobileCanvasRef, (el) => {
  if (el) attachTo(el)
}, { immediate: true })

function mobileZoomIn()    { mobileZoom.value = Math.min(+(mobileZoom.value + 0.25).toFixed(2), 3) }
function mobileZoomOut()   { mobileZoom.value = Math.max(+(mobileZoom.value - 0.25).toFixed(2), 0.5) }

// ---- Etap 7: pinch hint auto-hides after 3 s ----
const showPinchHint = ref(false)
let hintTimer = null
watch(isMobile, (mobile) => {
  clearTimeout(hintTimer)
  if (mobile) {
    showPinchHint.value = true
    hintTimer = setTimeout(() => { showPinchHint.value = false }, 3000)
  }
}, { immediate: true })

// ---- Autosave to localStorage (Etap 6) ----
const saveKey = computed(() => {
  if (!props.svgUrl) return null
  // stable short key derived from URL
  return 'tk_c_' + props.svgUrl.replace(/[^a-z0-9]/gi, '_').slice(-40)
})

// 'idle' | 'saved'
const saveStatus = ref('idle')
let saveStatusTimer = null
let autosaveTimer   = null

function scheduleSave() {
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(commitSave, 1500)
}

function commitSave() {
  if (!saveKey.value) return
  const dataUrl = canvasRef.value?.saveAsImage()
  if (!dataUrl) return
  try {
    localStorage.setItem(saveKey.value, dataUrl)
    saveStatus.value = 'saved'
    clearTimeout(saveStatusTimer)
    saveStatusTimer = setTimeout(() => { saveStatus.value = 'idle' }, 2500)
  } catch {
    // localStorage full – silent fail
  }
}

function onCanvasChange() {
  scheduleSave()
}

// After canvas renders SVG, try restoring saved work
async function onCanvasReady() {
  if (!saveKey.value) return
  const saved = localStorage.getItem(saveKey.value)
  if (!saved) return
  await nextTick()
  await canvasRef.value?.loadFromDataUrl(saved)
}

onUnmounted(() => {
  clearTimeout(autosaveTimer)
  clearTimeout(saveStatusTimer)
  clearTimeout(hintTimer)
})

// ---- Canvas actions ----
function handleUndo()  { canvasRef.value?.undo() }

function handleReset() {
  canvasRef.value?.reset()
  // Clear autosaved progress when user explicitly resets
  if (saveKey.value) localStorage.removeItem(saveKey.value)
  saveStatus.value = 'idle'
}

function handleSave() {
  const dataUrl = canvasRef.value?.saveAsImage()
  if (!dataUrl) return
  const a = document.createElement('a')
  a.href     = dataUrl
  a.download = 'kolorowanka.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ---- Keyboard shortcuts ----
useEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z')                  { e.preventDefault(); handleUndo() }
    if (e.key === '0')                  { e.preventDefault(); desktopZoom.value = 1 }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn() }
    if (e.key === '-')                  { e.preventDefault(); zoomOut() }
  }
})
</script>

<template>
  <!-- ===================== DESKTOP (≥768px) ===================== -->
  <div v-if="!isMobile" class="flex h-full overflow-hidden">

    <!-- LEFT SIDEBAR -->
    <aside class="w-[300px] shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

      <!-- Sidebar header: mode badge + tool buttons -->
      <div class="p-5 pb-4 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg shadow-sm shrink-0">
            🎨
          </div>
          <div class="min-w-0">
            <div class="font-extrabold text-sm text-slate-900 leading-tight">Tryb kolorowania</div>
            <div class="text-xs text-slate-400">Twoja Kolorowanka</div>
          </div>
        </div>
        <ColoringToolbar v-model="tool" />
      </div>

      <!-- Scrollable palette -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <ColoringPaletteContent
          :color="selectedColor"
          :brush-size="brushSize"
          @update:color="selectedColor = $event"
          @update:brush-size="brushSize = $event"
        />
      </div>

      <!-- Current color preview (sticky bottom) -->
      <div class="p-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
        <div
          class="w-11 h-11 rounded-[14px] shadow-md shrink-0"
          :style="{
            backgroundColor: selectedColor,
            border: selectedColor === '#FFFFFF' ? '2px solid #E2E8F0' : '2px solid transparent',
          }"
        />
        <div class="min-w-0">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Wybrany kolor</div>
          <div class="text-sm font-bold text-slate-600 font-mono">{{ selectedColor }}</div>
        </div>
      </div>
    </aside>

    <!-- RIGHT: TopBar + Canvas area -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">

      <ColoringTopBar
        :title="title"
        :return-path="returnPath"
        :zoom-percent="zoomPercent"
        :can-zoom-out="desktopZoom > 0.5"
        :can-zoom-in="desktopZoom < 3"
        :save-status="saveStatus"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @undo="handleUndo"
        @reset="handleReset"
        @save="handleSave"
      />

      <!-- Canvas area – wheel zoom attached here -->
      <div
        ref="canvasAreaRef"
        class="flex-1 overflow-hidden flex items-center justify-center relative"
        style="background: radial-gradient(circle at 20% 50%, rgba(16,185,129,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.03) 0%, transparent 50%), #F8FAFC;"
        @wheel="onDesktopWheel"
      >
        <!-- Subtle dot grid overlay -->
        <div
          class="absolute inset-0 pointer-events-none"
          style="opacity: 0.3; background-image: radial-gradient(circle, #CBD5E1 0.5px, transparent 0.5px); background-size: 24px 24px;"
        />

        <!-- Canvas paper with zoom -->
        <div
          class="relative bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
          :style="{
            width: paperWidth + 'px',
            height: paperHeight + 'px',
            transform: `scale(${desktopZoom})`,
            transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
          }"
        >
          <ColoringCanvas
            ref="canvasRef"
            :svg-url="svgUrl"
            :tool="tool"
            :selected-color="selectedColor"
            :brush-size="brushSize"
            @svg-loaded="onSvgLoaded"
            @ready="onCanvasReady"
            @change="onCanvasChange"
          />
        </div>

        <!-- Autosave indicator -->
        <Transition name="fade">
          <div
            v-if="saveStatus === 'saved'"
            class="absolute bottom-4 left-4 text-[11px] text-emerald-600 font-semibold bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-emerald-100 select-none pointer-events-none"
          >
            ✓ Zapisano automatycznie
          </div>
        </Transition>

        <!-- Desktop zoom hint (Ctrl+scroll) -->
        <div class="absolute bottom-4 right-4 text-[11px] text-slate-400 select-none pointer-events-none">
          Ctrl + scroll aby przybliżyć
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== MOBILE (<768px) ===================== -->
  <div v-else class="flex flex-col h-full overflow-hidden relative bg-slate-50">

    <!-- Compact mobile top bar -->
    <div class="h-11 bg-white border-b border-slate-100 flex items-center justify-between px-3 shrink-0 z-10">
      <div class="flex items-center gap-2 min-w-0">
        <NuxtLink
          :to="returnPath"
          class="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 text-sm shrink-0"
          aria-label="Powrót"
        >←</NuxtLink>
        <span class="text-sm font-semibold text-slate-600 truncate">🎨 {{ title }}</span>
      </div>
      <div class="flex gap-1.5 shrink-0">
        <button @click="handleUndo" class="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 text-sm" aria-label="Cofnij">↩</button>
        <button @click="handleSave" class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-sm" aria-label="Zapisz">💾</button>
      </div>
    </div>

    <!-- Canvas area – pinch-to-zoom / pan attached here -->
    <div
      ref="mobileCanvasRef"
      class="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative bg-white"
      style="touch-action: none;"
    >
      <div
        class="w-full h-full"
        :style="{
          transform: `scale(${mobileZoom}) translate(${offsetX / mobileZoom}px, ${offsetY / mobileZoom}px)`,
          transition: 'transform 0.05s linear',
          transformOrigin: 'center center',
          willChange: 'transform',
        }"
      >
        <ColoringCanvas
          ref="canvasRef"
          :svg-url="svgUrl"
          :tool="tool"
          :selected-color="selectedColor"
          :brush-size="brushSize"
          @svg-loaded="onSvgLoaded"
          @ready="onCanvasReady"
          @change="onCanvasChange"
        />
      </div>

      <!-- Pinch-to-zoom hint (auto-hides after 3s) -->
      <Transition name="fade">
        <div
          v-if="mobileZoom === 1 && showPinchHint"
          class="absolute bottom-[136px] left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div class="bg-slate-900/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
            🔍 Rozsuń palce, aby przybliżyć
          </div>
        </div>
      </Transition>

      <!-- Mobile autosave indicator -->
      <Transition name="fade">
        <div
          v-if="saveStatus === 'saved'"
          class="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] text-emerald-700 font-semibold bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow border border-emerald-100 pointer-events-none select-none"
        >
          ✓ Zapisano
        </div>
      </Transition>
    </div>

    <!-- Floating bottom bar -->
    <div class="absolute bottom-[60px] left-3 right-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2.5 shadow-xl border border-white/50 flex items-center gap-2">

      <ColoringToolbar v-model="tool" :compact="true" />

      <!-- Color picker button -->
      <button
        @click="drawerOpen = true"
        class="flex-1 h-11 rounded-[14px] bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 px-3 min-w-0"
        aria-label="Otwórz paletę kolorów"
      >
        <div
          class="w-6 h-6 rounded-full shadow-sm shrink-0"
          :style="{
            backgroundColor: selectedColor,
            border: selectedColor === '#FFFFFF' ? '1.5px solid #D1D5DB' : '1.5px solid transparent',
          }"
        />
        <span class="text-xs font-bold text-slate-500">Kolor</span>
        <span class="text-[10px] text-slate-400">▲</span>
      </button>

      <!-- Zoom reset (tap to go back to 100%) + zoom buttons -->
      <div class="flex gap-1 shrink-0">
        <button
          @click="resetZoom"
          v-if="mobileZoom !== 1"
          class="h-9 px-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold"
          aria-label="Resetuj zoom"
        >{{ Math.round(mobileZoom * 100) }}%</button>
        <button @click="mobileZoomOut" class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold" aria-label="Pomniejsz">−</button>
        <button @click="mobileZoomIn"  class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold" aria-label="Powiększ">+</button>
      </div>
    </div>

    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
        @click="drawerOpen = false"
      />
    </Transition>

    <!-- Mobile color drawer (bottom sheet) -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Paleta kolorów"
      :style="{
        transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      }"
    >
      <!-- Sticky handle + header -->
      <div class="sticky top-0 bg-white pt-3 px-5 z-10">
        <div class="flex justify-center mb-2">
          <div class="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
          <span class="text-base font-bold text-slate-800">Paleta kolorów</span>
          <button
            @click="drawerOpen = false"
            class="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 text-lg"
            aria-label="Zamknij paletę"
          >✕</button>
        </div>
      </div>

      <div class="px-5 pb-8 pt-3">
        <ColoringPaletteContent
          :color="selectedColor"
          :brush-size="brushSize"
          :mobile="true"
          @update:color="selectedColor = $event; drawerOpen = false"
          @update:brush-size="brushSize = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
