<template>
  <div class="coloring-app w-full px-2 sm:px-4 pb-4">

    <!-- Floating Toolbar -->
    <div class="max-w-5xl mx-auto mb-3">
      <div class="toolbar-glass rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-2 flex-wrap">

        <!-- Left: Mode Toggle -->
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-xl overflow-hidden shadow-sm bg-white/60 border border-white/40">
            <button
              @click="mode = 'fill'"
              class="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 text-sm font-bold transition-all duration-200 rounded-l-xl"
              :class="mode === 'fill'
                ? 'bg-gradient-to-r from-sec-500 to-sec-400 text-white shadow-md'
                : 'text-coolGray-600 hover:bg-white/80'"
            >
              <UIcon name="ion:color-wand-sharp" class="text-lg" dynamic />
              <span class="hidden xs:inline">Wypełnij</span>
            </button>
            <button
              @click="mode = 'draw'"
              class="flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 text-sm font-bold transition-all duration-200 rounded-r-xl"
              :class="mode === 'draw'
                ? 'bg-gradient-to-r from-tertiary-500 to-tertiary-400 text-white shadow-md'
                : 'text-coolGray-600 hover:bg-white/80'"
            >
              <UIcon name="material-symbols:brush-sharp" class="text-lg" dynamic />
              <span class="hidden xs:inline">Rysuj</span>
            </button>
          </div>
        </div>

        <!-- Center: Brush Size (draw mode only) -->
        <transition name="slide-fade">
          <div v-if="mode === 'draw'" class="flex items-center gap-2 sm:gap-3 flex-1 justify-center max-w-xs">
            <div
              class="w-5 h-5 rounded-full border-2 border-coolGray-300 shrink-0"
              :style="{ backgroundColor: selectedColor }"
            />
            <input
              type="range" min="1" max="80" v-model="drawSize"
              class="brush-slider flex-1 h-2 rounded-full appearance-none cursor-pointer"
            />
            <span class="text-xs font-bold text-coolGray-500 bg-white/70 px-2 py-1 rounded-full min-w-[40px] text-center">{{ drawSize }}px</span>
          </div>
        </transition>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-1">
          <button
            @click="undo"
            class="p-2.5 rounded-xl text-coolGray-500 hover:text-sec-600 hover:bg-white/80 transition-all duration-150"
            title="Cofnij"
          >
            <UIcon name="material-symbols:undo" class="text-xl" dynamic />
          </button>
          <button
            @click="resetAll"
            class="p-2.5 rounded-xl text-coolGray-500 hover:text-main-500 hover:bg-white/80 transition-all duration-150"
            title="Wyczyść wszystko"
          >
            <UIcon name="bi:trash-fill" class="text-xl" dynamic />
          </button>
        </div>
      </div>
    </div>

    <!-- Canvas Area - big and centered -->
    <div class="max-w-5xl mx-auto mb-3">
      <div class="canvas-container rounded-2xl overflow-hidden shadow-xl bg-white border-2 border-coolGray-200/60">
        <div class="flex items-center justify-center p-2 sm:p-3">
          <canvas
            ref="canvas"
            class="block rounded-xl"
            :class="mode === 'fill' ? 'cursor-cell' : 'cursor-crosshair'"
            @click="onCanvasClick"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerUp"
          />
        </div>
      </div>
      <p class="mt-2 text-center text-sm text-coolGray-400 font-medium">
        <span v-if="mode === 'fill'">Kliknij w obszar, aby go wypełnić kolorem</span>
        <span v-else>Przytrzymaj i rysuj po obrazku</span>
      </p>
    </div>

    <!-- Color Palette - big beautiful buttons at the bottom -->
    <div class="max-w-5xl mx-auto">
      <div class="palette-glass rounded-2xl px-3 py-3 sm:px-5 sm:py-4">
        <!-- Selected color preview + label -->
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md border-2 border-white shrink-0 transition-colors duration-200"
            :style="{ backgroundColor: selectedColor }"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-coolGray-500 uppercase tracking-wider">Paleta kolorów</p>
            <p class="text-xs font-mono text-coolGray-400 truncate">{{ selectedColor }}</p>
          </div>
        </div>

        <!-- Color Groups -->
        <div class="color-grid">
          <button
            v-for="c in COLORS" :key="c"
            @click="selectedColor = c"
            :style="{ backgroundColor: c }"
            class="color-btn"
            :class="selectedColor === c ? 'color-btn-active' : ''"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

const props = defineProps({ svgUrl: String })

// --- full color palette (organized by hue groups) ---
const COLORS = [
  // Neutrals
  '#FFFFFF','#ECECEC','#CECCCC','#979797','#676868','#4E4D4E','#343433','#000000',
  // Reds & pinks
  '#FF0000','#EC2527','#D91E36','#A62E32','#931B1E','#EF3C46','#F26F68','#FF69B4',
  '#E0398C','#EC4394','#DD64A5','#DB778D',
  // Purples
  '#800080','#C296C5','#BA539F','#9D2482','#C47EDB','#9060A8','#6B449B','#5A499E','#583E98',
  // Blues
  '#0000FF','#00008B','#4455A4','#3C75BB','#0066CC','#5DA9E9','#1890CA','#024259',
  // Teals & cyans
  '#00FFFF','#71CCDC','#3CBEB7','#1AA6B7','#009688','#40E0D0',
  // Greens
  '#00FF00','#54B948','#6ABD46','#68AF46','#169E49','#06753D','#8DC63F','#3E8733','#A4C400','#BACD3F','#C9E265',
  // Yellows
  '#FFFF00','#FBEE34','#F7ED45','#FDD209','#FCD55A','#FFCD37','#FDBE17',
  // Oranges & browns
  '#FFA500','#F99B2A','#F37123','#F16824','#F16A2D','#B44426','#AD732A','#964B00','#7D4829',
  '#E89D5E','#D8C077',
]

// --- reactive state ---
const mode          = ref('fill')
const selectedColor = ref(COLORS[8]) // red
const drawSize      = ref(10)
const isDrawing     = ref(false)
const lastPos       = ref({ x: 0, y: 0 })
const history       = ref([])

const canvas       = ref(null)
let   ctx          = null
let   imgDataInit  = null

const { width: winWidth, height: winHeight } = useWindowSize()
const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
const canvasWidth  = ref(0)
const canvasHeight = ref(0)

// --- resize & load background SVG ---
function resizeCanvas() {
  const el = canvas.value
  if (!el) return
  const parent = el.parentElement
  // Use much more space - up to 1100px width, and calculate height from viewport
  const maxW = Math.min(1100, parent ? parent.clientWidth - 16 : winWidth.value - 32)
  // Taller aspect ratio to maximize canvas size
  const maxH = Math.max(400, winHeight.value - 340)
  canvasWidth.value  = maxW
  canvasHeight.value = Math.min(maxW * 0.75, maxH)
  el.width  = canvasWidth.value * DPR
  el.height = canvasHeight.value * DPR
  el.style.width  = canvasWidth.value + 'px'
  el.style.height = canvasHeight.value + 'px'
  ctx.setTransform(1,0,0,1,0,0)
  ctx.scale(DPR, DPR)
  ctx.imageSmoothingEnabled = false
}

async function loadSvgToCanvas() {
  if (!props.svgUrl || !ctx) return
  const res  = await fetch(props.svgUrl)
  const text = await res.text()
  const blob = new Blob([text], { type: 'image/svg+xml' })
  const url  = URL.createObjectURL(blob)
  const img  = new Image()
  img.onload = () => {
    ctx.clearRect(0,0,canvas.value.width,canvas.value.height)
    const scale = Math.min(canvasWidth.value / img.width, canvasHeight.value / img.height)
    const w = img.width * scale, h = img.height * scale
    const x = (canvasWidth.value - w)/2, y = (canvasHeight.value - h)/2
    ctx.drawImage(img, x, y, w, h)
    URL.revokeObjectURL(url)
    imgDataInit   = ctx.getImageData(0,0,canvas.value.width,canvas.value.height)
    history.value = [imgDataInit]
  }
  img.src = url
}

// --- coordinate helpers ---
function getDeviceCoords(e) {
  const rect   = canvas.value.getBoundingClientRect()
  const scaleX = canvas.value.width  / rect.width
  const scaleY = canvas.value.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY
  }
}
function getLogicalCoords(e) {
  const { x, y } = getDeviceCoords(e)
  return { x: x / DPR, y: y / DPR }
}

// --- floodFill implementation ---
function floodFill(x,y,fillColor){
  const w = canvas.value.width, h = canvas.value.height
  const imgData = ctx.getImageData(0,0,w,h), pix = imgData.data
  const stack = [[x,y]], baseI = (y*w+x)*4
  const r0=pix[baseI],g0=pix[baseI+1],b0=pix[baseI+2]
  const [r1,g1,b1] = hexToRgb(fillColor)
  if (r0===r1 && g0===g1 && b0===b1) return
  while(stack.length){
    const [cx,cy] = stack.pop()
    let ny = cy
    while(ny>=0 && match(cx,ny)) ny--
    ny++
    let reachL=false,reachR=false
    while(ny<h && match(cx,ny)){
      paint(cx,ny)
      if(cx>0  && match(cx-1,ny)){ if(!reachL) stack.push([cx-1,ny]); reachL=true } else reachL=false
      if(cx<w-1&& match(cx+1,ny)){ if(!reachR) stack.push([cx+1,ny]); reachR=true } else reachR=false
      ny++
    }
  }
  ctx.putImageData(imgData,0,0)
  function match(x,y){
    const i=(y*w+x)*4
    return pix[i]===r0 && pix[i+1]===g0 && pix[i+2]===b0 && pix[i+3]!==0
  }
  function paint(x,y){
    const i=(y*w+x)*4
    pix[i]=r1; pix[i+1]=g1; pix[i+2]=b1; pix[i+3]=255
  }
}

// --- draw helpers ---
function drawDot(x,y){
  ctx.beginPath()
  ctx.arc(x,y,drawSize.value/2,0,2*Math.PI)
  ctx.fillStyle = selectedColor.value
  ctx.fill()
  ctx.closePath()
}
function drawLine(x1,y1,x2,y2){
  ctx.beginPath()
  ctx.moveTo(x1,y1)
  ctx.lineTo(x2,y2)
  ctx.strokeStyle = selectedColor.value
  ctx.lineWidth   = drawSize.value
  ctx.lineCap     = 'round'
  ctx.stroke()
  ctx.closePath()
}

// --- event handlers ---
function onCanvasClick(e) {
  if (mode.value !== 'fill') return
  const { x,y } = getDeviceCoords(e)
  floodFill(Math.floor(x), Math.floor(y), selectedColor.value)
  history.value.push(ctx.getImageData(0,0,canvas.value.width,canvas.value.height))
}

function onPointerDown(e) {
  if (mode.value !== 'draw') return
  isDrawing.value = true
  history.value.push(ctx.getImageData(0,0,canvas.value.width,canvas.value.height))
  lastPos.value = getLogicalCoords(e)
  drawDot(lastPos.value.x, lastPos.value.y)
  canvas.value.setPointerCapture(e.pointerId)
}
function onPointerMove(e) {
  if (!isDrawing.value || mode.value!=='draw') return
  const pos = getLogicalCoords(e)
  drawLine(lastPos.value.x, lastPos.value.y, pos.x, pos.y)
  lastPos.value = pos
}
function onPointerUp(e) {
  if (!isDrawing.value) return
  isDrawing.value = false
  canvas.value.releasePointerCapture(e.pointerId)
}

// --- undo / reset ---
function undo() {
  if (history.value.length < 2) return
  history.value.pop()
  ctx.putImageData(history.value.at(-1), 0, 0)
}
function resetAll() {
  if (!imgDataInit) return
  ctx.putImageData(imgDataInit, 0, 0)
  history.value = [imgDataInit]
}

// --- util ---
function hexToRgb(hex){
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  return m
    ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)]
    : [0,0,0]
}

// --- lifecycle ---
onMounted(() => {
  nextTick(() => {
    if (!canvas.value) return
    ctx = canvas.value.getContext('2d')
    resizeCanvas()
    loadSvgToCanvas()
  })
})
watch(winWidth, () => {
  if (!ctx) return
  resizeCanvas()
  loadSvgToCanvas()
})
watch(() => props.svgUrl, () => {
  if (!ctx) return
  loadSvgToCanvas()
})
</script>

<style scoped>
.toolbar-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.palette-glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
}

.canvas-container {
  background: repeating-conic-gradient(#f8f8f8 0% 25%, #fff 0% 50%) 50% / 20px 20px;
}

/* Color grid - responsive big buttons */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
@media (min-width: 640px) {
  .color-grid {
    gap: 7px;
  }
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}
@media (min-width: 480px) {
  .color-btn {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }
}
@media (min-width: 640px) {
  .color-btn {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }
}
@media (min-width: 1024px) {
  .color-btn {
    width: 40px;
    height: 40px;
  }
}

.color-btn:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 10;
  border-color: rgba(255, 255, 255, 0.8);
}

.color-btn-active {
  transform: scale(1.15);
  box-shadow:
    0 0 0 3px #40ceac,
    0 4px 12px rgba(64, 206, 172, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
}
.color-btn-active:hover {
  transform: scale(1.25);
}

/* Brush slider */
.brush-slider {
  background: linear-gradient(to right, #e5e7eb, #9060a8);
}
.brush-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b45eb2, #9060a8);
  cursor: pointer;
  border: 2.5px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}
.brush-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.brush-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b45eb2, #9060a8);
  cursor: pointer;
  border: 2.5px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

canvas {
  touch-action: none;
}
</style>
