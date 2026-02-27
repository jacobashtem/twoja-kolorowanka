<template>
  <div class="mx-auto px-2 sm:px-4 lg:px-8 max-w-7xl w-full pb-8">
    <div class="rounded-2xl shadow-xl bg-white overflow-hidden border border-coolGray-200">

      <!-- Toolbar -->
      <div class="bg-gradient-to-r from-sec-500 to-sec-600 px-4 py-3 sm:px-6 sm:py-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2 text-white">
            <UIcon name="material-symbols:palette" class="text-2xl" dynamic />
            <span class="font-baloo font-bold text-lg hidden sm:inline">Tryb kolorowania</span>
          </div>

          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <!-- Mode toggle buttons -->
            <div class="inline-flex rounded-xl overflow-hidden shadow-sm border border-white/20">
              <button
                @click="mode = 'fill'"
                class="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-bold transition-all duration-200"
                :class="mode === 'fill'
                  ? 'bg-white text-sec-600 shadow-inner'
                  : 'bg-white/10 text-white hover:bg-white/20'"
              >
                <UIcon name="ion:color-wand-sharp" class="text-lg" dynamic />
                <span class="hidden xs:inline">Wypełnij</span>
              </button>
              <button
                @click="mode = 'draw'"
                class="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-bold transition-all duration-200"
                :class="mode === 'draw'
                  ? 'bg-white text-sec-600 shadow-inner'
                  : 'bg-white/10 text-white hover:bg-white/20'"
              >
                <UIcon name="material-symbols:brush-sharp" class="text-lg" dynamic />
                <span class="hidden xs:inline">Rysuj</span>
              </button>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1">
              <button
                @click="undo"
                class="p-2 rounded-lg text-white hover:bg-white/20 transition-colors duration-150"
                title="Cofnij"
              >
                <UIcon name="material-symbols:undo" class="text-xl" dynamic />
              </button>
              <button
                @click="resetAll"
                class="p-2 rounded-lg text-white hover:bg-white/20 transition-colors duration-150"
                title="Wyczyść wszystko"
              >
                <UIcon name="bi:trash-fill" class="text-xl" dynamic />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content area -->
      <div class="flex flex-col lg:flex-row">

        <!-- Sidebar: Color Palette (desktop: left side, mobile: below toolbar) -->
        <div class="lg:w-64 xl:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-coolGray-200 bg-coolGray-100/50">
          <div class="p-4 sm:p-5">

            <!-- Selected color preview -->
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-xl border-2 border-coolGray-300 shadow-sm shrink-0"
                :style="{ backgroundColor: selectedColor }"
              />
              <div class="min-w-0">
                <p class="text-xs font-semibold text-coolGray-500 uppercase tracking-wide">Wybrany kolor</p>
                <p class="text-sm font-mono text-coolGray-700 truncate">{{ selectedColor }}</p>
              </div>
            </div>

            <!-- Color palette -->
            <div class="mb-4">
              <p class="text-xs font-semibold text-coolGray-500 uppercase tracking-wide mb-2">Paleta kolorów</p>
              <div class="grid grid-cols-9 sm:grid-cols-12 lg:grid-cols-7 gap-1.5">
                <button
                  v-for="c in COLORS" :key="c"
                  @click="selectedColor = c"
                  :style="{ backgroundColor: c }"
                  class="aspect-square rounded-lg cursor-pointer border border-black/10 transition-all duration-150 hover:scale-110 hover:shadow-md hover:z-10 relative"
                  :class="selectedColor === c
                    ? 'ring-2 ring-sec-500 ring-offset-2 scale-110 shadow-md z-10'
                    : ''"
                />
              </div>
            </div>

            <!-- Brush size (only in draw mode) -->
            <transition name="slide-fade">
              <div v-if="mode === 'draw'" class="mb-3">
                <div class="flex items-center justify-between mb-1.5">
                  <p class="text-xs font-semibold text-coolGray-500 uppercase tracking-wide">Rozmiar pędzla</p>
                  <span class="text-sm font-bold text-sec-600 bg-sec-100 px-2 py-0.5 rounded-full">{{ drawSize }}px</span>
                </div>
                <input
                  type="range" min="1" max="100" v-model="drawSize"
                  class="w-full h-2 bg-coolGray-200 rounded-full appearance-none cursor-pointer accent-sec-500"
                />
                <div class="flex items-center justify-center mt-2">
                  <div
                    class="rounded-full border border-coolGray-300 transition-all duration-150"
                    :style="{
                      width: Math.max(4, Math.min(drawSize, 60)) + 'px',
                      height: Math.max(4, Math.min(drawSize, 60)) + 'px',
                      backgroundColor: selectedColor
                    }"
                  />
                </div>
              </div>
            </transition>

          </div>
        </div>

        <!-- Canvas area -->
        <div class="flex-1 min-w-0">
          <div class="p-3 sm:p-4 lg:p-6">
            <div class="flex items-center justify-center">
              <div class="relative rounded-xl overflow-hidden shadow-lg border border-coolGray-200 bg-white">
                <canvas
                  ref="canvas"
                  class="block cursor-crosshair"
                  :class="mode === 'fill' ? 'cursor-cell' : 'cursor-crosshair'"
                  @click="onCanvasClick"
                  @pointerdown="onPointerDown"
                  @pointermove="onPointerMove"
                  @pointerup="onPointerUp"
                  @pointerleave="onPointerUp"
                />
              </div>
            </div>
            <p class="mt-3 text-center text-sm text-coolGray-400 font-medium">
              <span v-if="mode === 'fill'">Kliknij w obszar, aby go wypełnić kolorem</span>
              <span v-else>Przytrzymaj i rysuj po obrazku</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

const props = defineProps({ svgUrl: String })

// --- full color palette ---
const COLORS = [
  '#FF0000','#FFA500','#FFFF00','#00FF00','#0000FF','#800080','#FF69B4','#964B00','#000000',
  '#FFFFFF','#343433','#4E4D4E','#676868','#979797','#CECCCC','#ECECEC',
  '#EC2527','#D91E36','#A62E32','#EF3C46','#B44426','#931B1E','#F26F68','#7D4829','#AD732A',
  '#E0398C','#EC4394','#DD64A5','#DB778D','#C296C5','#BA539F','#9D2482','#9060A8','#6B449B','#5A499E',
  '#F37123','#F16824','#F16A2D','#F99B2A','#FDBE17','#FFCD37','#FDD209','#FCD55A',
  '#F7ED45','#FBEE34','#BACD3F','#68AF46','#54B948',
  '#6ABD46','#169E49','#06753D','#8DC63F','#3E8733','#A4C400','#C9E265',
  '#71CCDC','#3CBEB7','#00FFFF','#1AA6B7','#009688','#40E0D0',
  '#1890CA','#3C75BB','#4455A4','#024259','#0066CC','#00008B','#5DA9E9',
  '#E89D5E','#D8C077','#C47EDB','#583E98'
]

// --- reactive state ---
const mode          = ref('fill')
const selectedColor = ref(COLORS[0])
const drawSize      = ref(10)
const isDrawing     = ref(false)
const lastPos       = ref({ x: 0, y: 0 })
const history       = ref([])

const canvas       = ref(null)
let   ctx          = null
let   imgDataInit  = null

const { width: winWidth } = useWindowSize()
const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
const canvasWidth  = ref(0)
const canvasHeight = ref(0)

// --- resize & load background SVG ---
function resizeCanvas() {
  const el = canvas.value
  if (!el) return
  const parent = el.parentElement
  const maxW = Math.min(800, parent ? parent.clientWidth - 4 : winWidth.value * 0.75)
  canvasWidth.value  = maxW
  canvasHeight.value = maxW * 0.75
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

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #40ceac;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #40ceac;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

canvas {
  touch-action: none;
}
</style>
