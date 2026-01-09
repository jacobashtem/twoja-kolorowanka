<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
    <div class="rounded-2xl shadow-xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      <!-- Header with tools -->
      <div class="bg-white/90 backdrop-blur-sm border-b-2 border-purple-200 p-4 md:p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 class="font-bold text-2xl text-purple-700 flex items-center gap-2">
            <UIcon name="material-symbols:palette" class="text-3xl" dynamic />
            Kreator Kolorowania
          </h2>

          <div class="flex gap-2 items-center flex-wrap">
            <!-- Mode buttons -->
            <button @click="mode = 'fill'" :class="mode==='fill'?btnActive:btn" class="transition-all duration-200">
              <UIcon name="ion:color-wand-sharp" class="text-xl" dynamic />
              <span class="hidden sm:inline">Wypełnij</span>
            </button>
            <button @click="mode = 'draw'" :class="mode==='draw'?btnActive:btn" class="transition-all duration-200">
              <UIcon name="material-symbols:brush-sharp" class="text-xl" dynamic />
              <span class="hidden sm:inline">Rysuj</span>
            </button>
            <button @click="mode = 'eraser'" :class="mode==='eraser'?btnActive:btn" class="transition-all duration-200">
              <UIcon name="mdi:eraser" class="text-xl" dynamic />
              <span class="hidden sm:inline">Gumka</span>
            </button>

            <!-- Action buttons -->
            <div class="flex gap-1 ml-2 border-l pl-2 border-purple-200">
              <button @click="undo" class="p-2 rounded-lg hover:bg-purple-100 transition-all duration-200 text-purple-600 disabled:opacity-30" :disabled="history.length < 2" title="Cofnij">
                <UIcon name="material-symbols:undo" class="text-2xl" dynamic />
              </button>
              <button @click="downloadImage" class="p-2 rounded-lg hover:bg-green-100 transition-all duration-200 text-green-600" title="Pobierz">
                <UIcon name="material-symbols:download" class="text-2xl" dynamic />
              </button>
              <button @click="resetAll" class="p-2 rounded-lg hover:bg-red-100 transition-all duration-200 text-red-600" title="Wyczyść wszystko">
                <UIcon name="bi:trash-fill" class="text-2xl" dynamic />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas + Palette -->
      <div class="p-4 md:p-6 grid lg:grid-cols-4 gap-6">
        <!-- Palette sidebar -->
        <div class="lg:col-span-1 order-2 lg:order-1">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg sticky top-4">
            <h3 class="text-lg font-bold mb-3 text-purple-700 flex items-center gap-2">
              <UIcon name="material-symbols:palette" class="text-xl" dynamic />
              Paleta Kolorów
            </h3>

            <!-- Color categories -->
            <div class="space-y-4">
              <div v-for="(group, name) in colorGroups" :key="name">
                <h4 class="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{{ name }}</h4>
                <div class="flex flex-wrap gap-1.5">
                  <div
                    v-for="c in group" :key="c"
                    @click="selectColor(c)"
                    :style="{ backgroundColor: c }"
                    class="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    :class="selectedColor === c ? 'ring-4 ring-purple-400 ring-offset-2 scale-110' : 'border-white/50'"
                    :title="c"
                  />
                </div>
              </div>
            </div>

            <!-- Brush size slider (only for draw mode) -->
            <div v-if="mode === 'draw' || mode === 'eraser'" class="mt-6">
              <label class="block text-sm font-semibold mb-2 text-gray-700">
                Rozmiar {{ mode === 'eraser' ? 'gumki' : 'pędzla' }}: {{ drawSize }}px
              </label>
              <input
                type="range"
                min="1"
                max="100"
                v-model.number="drawSize"
                class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <!-- Current color display -->
            <div class="mt-6 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <p class="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Wybrany kolor</p>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg border-2 border-white shadow-lg" :style="{ backgroundColor: selectedColor }" />
                <span class="text-xs font-mono bg-white px-2 py-1 rounded">{{ selectedColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Canvas area -->
        <div class="lg:col-span-3 order-1 lg:order-2">
          <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-center bg-white rounded-lg p-4 shadow-inner">
              <canvas
                ref="canvas"
                class="block mx-auto rounded-lg shadow-md transition-all duration-200 hover:shadow-xl"
                :class="mode === 'fill' ? 'cursor-crosshair' : mode === 'draw' ? 'cursor-cell' : 'cursor-not-allowed'"
                @click="onCanvasClick"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointerleave="onPointerUp"
              />
            </div>

            <!-- Tips -->
            <div class="mt-4 flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
              <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-blue-700">
                <UIcon name="material-symbols:info" class="text-lg" dynamic />
                <span><strong>Wypełnij:</strong> Kliknij w obszar</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg text-purple-700">
                <UIcon name="material-symbols:touch-app" class="text-lg" dynamic />
                <span><strong>Rysuj:</strong> Przeciągnij palcem/myszką</span>
              </div>
            </div>
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

// --- Color groups organized by category ---
const colorGroups = {
  'Podstawowe': ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#800080', '#FF69B4', '#964B00', '#000000', '#FFFFFF'],
  'Czerwone': ['#EC2527', '#D91E36', '#A62E32', '#EF3C46', '#B44426', '#931B1E', '#F26F68'],
  'Różowe': ['#E0398C', '#EC4394', '#DD64A5', '#DB778D', '#C296C5', '#BA539F', '#9D2482'],
  'Pomarańczowe': ['#F37123', '#F16824', '#F16A2D', '#F99B2A', '#FDBE17', '#FFCD37', '#FDD209', '#FCD55A'],
  'Żółte': ['#F7ED45', '#FBEE34'],
  'Zielone': ['#BACD3F', '#68AF46', '#54B948', '#6ABD46', '#169E49', '#06753D', '#8DC63F', '#3E8733', '#A4C400', '#C9E265'],
  'Niebieskie': ['#71CCDC', '#3CBEB7', '#00FFFF', '#1AA6B7', '#009688', '#40E0D0', '#1890CA', '#3C75BB', '#4455A4', '#024259', '#0066CC', '#00008B', '#5DA9E9'],
  'Fioletowe': ['#9060A8', '#6B449B', '#5A499E', '#C47EDB', '#583E98'],
  'Brązowe': ['#7D4829', '#AD732A', '#E89D5E', '#D8C077'],
  'Szare': ['#343433', '#4E4D4E', '#676868', '#979797', '#CECCCC', '#ECECEC']
}

const btn       = 'flex gap-2 items-center rounded-lg px-3 py-2 border-2 text-center border-purple-300 text-purple-700 font-semibold text-sm bg-white hover:bg-purple-50'
const btnActive = 'flex gap-2 items-center rounded-lg px-3 py-2 text-center bg-purple-600 text-white font-semibold text-sm shadow-lg'

// --- reactive state ---
const mode          = ref('fill')
const selectedColor = ref('#FF0000')
const drawSize      = ref(10)
const isDrawing     = ref(false)
const lastPos       = ref({ x: 0, y: 0 })
const history       = ref([])

// Helper to select color
function selectColor(color) {
  selectedColor.value = color
  if (mode.value === 'eraser') {
    mode.value = 'draw'
  }
}

const canvas       = ref(null)
let   ctx          = null
let   imgDataInit  = null

const { width: winWidth } = useWindowSize()
const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
const canvasWidth  = ref(0)
const canvasHeight = ref(0)

// --- resize & load background SVG ---
function resizeCanvas() {
  canvasWidth.value  = Math.min(800, winWidth.value * 0.75)
  canvasHeight.value = canvasWidth.value * 0.75
  const el = canvas.value
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
  if (mode.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,1)'
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = selectedColor.value
  }
  ctx.fill()
  ctx.closePath()
  ctx.globalCompositeOperation = 'source-over'
}
function drawLine(x1,y1,x2,y2){
  ctx.beginPath()
  ctx.moveTo(x1,y1)
  ctx.lineTo(x2,y2)
  if (mode.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = selectedColor.value
  }
  ctx.lineWidth   = drawSize.value
  ctx.lineCap     = 'round'
  ctx.stroke()
  ctx.closePath()
  ctx.globalCompositeOperation = 'source-over'
}

// --- event handlers ---
function onCanvasClick(e) {
  if (mode.value !== 'fill') return
  const { x,y } = getDeviceCoords(e)
  floodFill(Math.floor(x), Math.floor(y), selectedColor.value)
  history.value.push(ctx.getImageData(0,0,canvas.value.width,canvas.value.height))
}

function onPointerDown(e) {
  if (mode.value !== 'draw' && mode.value !== 'eraser') return
  isDrawing.value = true
  history.value.push(ctx.getImageData(0,0,canvas.value.width,canvas.value.height))
  lastPos.value = getLogicalCoords(e)
  drawDot(lastPos.value.x, lastPos.value.y)
  canvas.value.setPointerCapture(e.pointerId)
}
function onPointerMove(e) {
  if (!isDrawing.value || (mode.value!=='draw' && mode.value!=='eraser')) return
  const pos = getLogicalCoords(e)
  drawLine(lastPos.value.x, lastPos.value.y, pos.x, pos.y)
  lastPos.value = pos
}
function onPointerUp(e) {
  if (!isDrawing.value) return
  isDrawing.value = false
  canvas.value.releasePointerCapture(e.pointerId)
}

// --- undo / reset / download ---
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
function downloadImage() {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = 'moja-kolorowanka.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
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
canvas { display: block; }
.border { border: 1px solid #ccc; }
</style>
