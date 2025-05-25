<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
    <div class="border rounded-lg shadow-sm bg-white">
      <!-- Toolbar -->
      <div class="flex items-center justify-between border-b p-4 flex-wrap wrap">
        <span class="block md:inline-block font-semibold text-lg">Tryb kolorowania</span>
        <div class="flex gap-2 items-center flex-wrap">
          <button @click="mode = 'fill'" :class="mode==='fill'?btnActive:btn">
            <UIcon name="ion:color-wand-sharp" class="text-2xl" dynamic /> Wypełnij
          </button>
          <button @click="mode = 'draw'" :class="mode==='draw'?btnActive:btn">
            <UIcon name="material-symbols:brush-sharp" class="text-2xl" dynamic /> Rysuj
          </button>
          <div>
            <UIcon name="material-symbols:undo" @click="undo" class="text-2xl cursor-pointer hover:opacity-30" dynamic />
            <UIcon name="bi:trash-fill" @click="resetAll" class="text-2xl cursor-pointer hover:opacity-30" dynamic />
          </div>
        </div>
      </div>

      <!-- Canvas + Palette -->
      <div class="p-4 grid lg:grid-cols-4 gap-6">
        <div class="lg:col-span-1">
          
          <h3 class="text-lg font-semibold mb-4">Paleta Kolorów</h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="c in COLORS" :key="c"
              @click="selectedColor = c"
              :style="{ backgroundColor: c }"
              class="w-6 h-6 rounded-lg cursor-pointer border transition-all hover:scale-110"
              :class="selectedColor === c ? 'ring-2 ring-offset-1 ring-black' : ''"
            />
          </div>
          <div class="my-4">
            <label class="block text-sm font-medium mb-1">Rozmiar pędzla: {{ drawSize }}px</label>
            <input type="range" min="1" max="100" v-model="drawSize" class="w-full" />
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm font-medium">Wybrany kolor:</p>
            <div class="flex items-center gap-2 mt-1">
              <div class="w-6 h-6 rounded border" :style="{ backgroundColor: selectedColor }" />
              <span class="text-sm font-mono">{{ selectedColor }}</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-3">
          <div class="flex items-center justify-center">
            <canvas
              ref="canvas"
              class="block mx-auto border"
              @click="onCanvasClick"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointerleave="onPointerUp"
            />
          </div>
          <p class="mt-4 text-center text-sm text-gray-600">💡 <strong>Tip:</strong> Kliknij lub rysuj!</p>
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

const btn       = 'flex gap-3 rounded-sm p-3 grow border text-center border-sec-500 text-sec-500 font-bold uppercase text-sm'
const btnActive = 'flex gap-3 items-center rounded-sm p-3 grow text-center bg-main-500 text-white font-bold uppercase text-sm tracking-widest'

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
canvas { display: block; }
.border { border: 1px solid #ccc; }
</style>
