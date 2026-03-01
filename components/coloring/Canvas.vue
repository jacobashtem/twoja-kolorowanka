<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  svgUrl: String,
  tool: { type: String, default: 'fill' },
  selectedColor: { type: String, default: '#FF0000' },
  brushSize: { type: Number, default: 10 },
})

const emit = defineEmits(['ready', 'svgLoaded', 'change'])

const wrapperRef = ref(null)
const canvas = ref(null)
let ctx = null

// SVG state
let svgText = null
let svgAspect = 3 / 4 // default portrait (w/h), updated after parsing viewBox

// Canvas state
let imgDataInit = null              // initial (blank) state – used by reset()
const history = ref([])            // undo stack of ImageData snapshots
const HISTORY_LIMIT = 50

// Drawing state
const isDrawing = ref(false)
const lastPos = ref({ x: 0, y: 0 })

// UI state
const isLoading = ref(false)
const loadError = ref(false)

// Technical
const DPR = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
let hasInitialized = false          // true after first successful SVG render
let resizeObserver = null
let resizeTimer = null

// ============================================================
// SIZING
// ============================================================

function resizeCanvas() {
  if (!wrapperRef.value || !canvas.value || !ctx) return
  const rect = wrapperRef.value.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  let cw, ch
  const containerAspect = rect.width / rect.height
  if (containerAspect > svgAspect) {
    ch = Math.floor(Math.min(rect.height, 1400))
    cw = Math.floor(ch * svgAspect)
  } else {
    cw = Math.floor(Math.min(rect.width, 1400))
    ch = Math.floor(cw / svgAspect)
  }

  canvas.value.style.width  = cw + 'px'
  canvas.value.style.height = ch + 'px'
  canvas.value.width        = cw * DPR
  canvas.value.height       = ch * DPR
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(DPR, DPR)
  ctx.imageSmoothingEnabled = false
}

// ============================================================
// SVG LOADING & RENDERING
// ============================================================

async function fetchAndDrawSvg() {
  if (!props.svgUrl || !ctx || !canvas.value) return

  isLoading.value = true
  loadError.value = false

  try {
    if (!svgText) {
      const res = await fetch(props.svgUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      svgText = await res.text()

      // Parse viewBox → derive aspect ratio
      const vbMatch = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/)
      if (vbMatch) {
        const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number)
        if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
          svgAspect = parts[2] / parts[3]
          emit('svgLoaded', { aspect: svgAspect })
        }
      }
    }

    resizeCanvas()
    await renderSvg()
    emit('ready')
  } catch (err) {
    console.error('[ColoringCanvas] Failed to load SVG:', err)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

function renderSvg() {
  return new Promise((resolve) => {
    if (!svgText || !canvas.value || !ctx) return resolve()

    const blob = new Blob([svgText], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const img  = new Image()

    img.onload = () => {
      const cw = canvas.value.width  / DPR
      const ch = canvas.value.height / DPR

      // CRITICAL: white fill before SVG so flood-fill never hits transparent pixels
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, cw, ch)

      // Draw SVG centered, letterboxed within canvas
      const scale = Math.min(cw / img.width, ch / img.height)
      const w = img.width  * scale
      const h = img.height * scale
      const x = (cw - w) / 2
      const y = (ch - h) / 2
      ctx.drawImage(img, x, y, w, h)

      URL.revokeObjectURL(url)

      imgDataInit   = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
      history.value = [imgDataInit]
      resolve()
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve() }
    img.src = url
  })
}

// ============================================================
// RESIZE – preserve user's work
// ============================================================

async function handleResize() {
  if (!canvas.value || !ctx || !svgText) return

  const prevW    = canvas.value.width
  const prevH    = canvas.value.height
  const hasWork  = history.value.length > 1
  const savedUrl = hasWork ? canvas.value.toDataURL('image/png') : null

  resizeCanvas()

  // Nothing actually changed – skip expensive re-render
  if (canvas.value.width === prevW && canvas.value.height === prevH) return

  await renderSvg()

  if (savedUrl) {
    await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.value.width / DPR, canvas.value.height / DPR)
        // Old ImageData dims no longer valid – replace history with current state
        const restoredState = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
        history.value = [imgDataInit, restoredState]
        resolve()
      }
      img.onerror = resolve
      img.src = savedUrl
    })
  }
}

// ============================================================
// COORDINATES
// ============================================================

function getDeviceCoords(e) {
  // getBoundingClientRect() reflects any CSS transform: scale() applied to an
  // ancestor, so scaleX naturally compensates for both DPR and zoom transform.
  const rect   = canvas.value.getBoundingClientRect()
  const scaleX = canvas.value.width  / rect.width
  const scaleY = canvas.value.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  }
}

function getLogicalCoords(e) {
  const { x, y } = getDeviceCoords(e)
  return { x: x / DPR, y: y / DPR }
}

// ============================================================
// FLOOD FILL
// ============================================================

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0]
}

function floodFill(px, py, fillColor) {
  const w = canvas.value.width
  const h = canvas.value.height
  const imgData = ctx.getImageData(0, 0, w, h)
  const pix = imgData.data

  const baseI = (py * w + px) * 4
  const r0 = pix[baseI], g0 = pix[baseI + 1], b0 = pix[baseI + 2]
  const [r1, g1, b1] = hexToRgb(fillColor)

  // Same color – nothing to do
  if (r0 === r1 && g0 === g1 && b0 === b1) return

  // Scanline flood fill (non-recursive, fast)
  const stack = [[px, py]]
  while (stack.length) {
    const [cx, cy] = stack.pop()
    let ny = cy
    while (ny >= 0 && match(cx, ny)) ny--
    ny++
    let reachL = false, reachR = false
    while (ny < h && match(cx, ny)) {
      paint(cx, ny)
      if (cx > 0 && match(cx - 1, ny)) { if (!reachL) stack.push([cx - 1, ny]); reachL = true } else reachL = false
      if (cx < w - 1 && match(cx + 1, ny)) { if (!reachR) stack.push([cx + 1, ny]); reachR = true } else reachR = false
      ny++
    }
  }

  ctx.putImageData(imgData, 0, 0)

  function match(x, y) {
    const i = (y * w + x) * 4
    // Exact color match + non-transparent (canvas is always white-backed so transparent = 0)
    return pix[i] === r0 && pix[i + 1] === g0 && pix[i + 2] === b0 && pix[i + 3] > 0
  }
  function paint(x, y) {
    const i = (y * w + x) * 4
    pix[i] = r1; pix[i + 1] = g1; pix[i + 2] = b1; pix[i + 3] = 255
  }
}

// ============================================================
// DRAW / ERASER
// ============================================================

function getDrawColor() {
  // Eraser draws with white (restores to white background)
  return props.tool === 'eraser' ? '#FFFFFF' : props.selectedColor
}

function drawDot(x, y) {
  ctx.beginPath()
  ctx.arc(x, y, props.brushSize / 2, 0, 2 * Math.PI)
  ctx.fillStyle = getDrawColor()
  ctx.fill()
  ctx.closePath()
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = getDrawColor()
  ctx.lineWidth   = props.brushSize
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.stroke()
  ctx.closePath()
}

// ============================================================
// HISTORY HELPERS
// ============================================================

function pushHistory() {
  history.value.push(ctx.getImageData(0, 0, canvas.value.width, canvas.value.height))
  // Cap to HISTORY_LIMIT – remove oldest entries (keep index 0 = initial state)
  if (history.value.length > HISTORY_LIMIT) {
    history.value.splice(1, history.value.length - HISTORY_LIMIT)
  }
}

// ============================================================
// EVENT HANDLERS
// ============================================================

function onCanvasClick(e) {
  if (props.tool !== 'fill') return
  const { x, y } = getDeviceCoords(e)
  floodFill(Math.floor(x), Math.floor(y), props.selectedColor)
  pushHistory()
  emit('change')
}

function onPointerDown(e) {
  if (props.tool !== 'draw' && props.tool !== 'eraser') return
  isDrawing.value = true
  // Save state BEFORE drawing (so undo restores to pre-stroke state)
  history.value.push(ctx.getImageData(0, 0, canvas.value.width, canvas.value.height))
  lastPos.value = getLogicalCoords(e)
  drawDot(lastPos.value.x, lastPos.value.y)
  canvas.value.setPointerCapture(e.pointerId)
}

function onPointerMove(e) {
  if (!isDrawing.value) return
  if (props.tool !== 'draw' && props.tool !== 'eraser') return
  const pos = getLogicalCoords(e)
  drawLine(lastPos.value.x, lastPos.value.y, pos.x, pos.y)
  lastPos.value = pos
}

function onPointerUp(e) {
  if (!isDrawing.value) return
  isDrawing.value = false
  try { canvas.value?.releasePointerCapture(e.pointerId) } catch {}
  emit('change')
}

// ============================================================
// EXPOSED API
// ============================================================

function undo() {
  if (history.value.length < 2) return
  history.value.pop()
  ctx.putImageData(history.value.at(-1), 0, 0)
}

function reset() {
  if (!imgDataInit) return
  ctx.putImageData(imgDataInit, 0, 0)
  history.value = [imgDataInit]
}

function saveAsImage() {
  return canvas.value?.toDataURL('image/png') ?? null
}

function loadFromDataUrl(dataUrl) {
  return new Promise((resolve) => {
    if (!ctx || !canvas.value || !imgDataInit) return resolve(false)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.value.width / DPR, canvas.value.height / DPR)
      const restored = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)
      history.value = [imgDataInit, restored]
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}

defineExpose({ undo, reset, saveAsImage, loadFromDataUrl })

// ============================================================
// LIFECYCLE
// ============================================================

onMounted(() => {
  nextTick(async () => {
    if (!canvas.value || !wrapperRef.value) return
    ctx = canvas.value.getContext('2d')

    // hasInitialized = false during initial fetch so ResizeObserver
    // doesn't fire a redundant re-render when the element first gets its size.
    resizeObserver = new ResizeObserver(() => {
      if (!hasInitialized) return
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 250)
    })
    resizeObserver.observe(wrapperRef.value)

    await fetchAndDrawSvg()
    hasInitialized = true
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  clearTimeout(resizeTimer)
})

watch(() => props.svgUrl, () => {
  svgText = null         // force re-fetch
  hasInitialized = false
  if (ctx) fetchAndDrawSvg().then(() => { hasInitialized = true })
})
</script>

<template>
  <div ref="wrapperRef" class="w-full h-full flex items-center justify-center relative">

    <!-- Loading overlay -->
    <Transition name="canvas-fade">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3"
      >
        <div class="w-9 h-9 rounded-full border-[3px] border-slate-200 border-t-emerald-500 animate-spin" />
        <span class="text-xs text-slate-400 font-medium">Wczytywanie kolorowanki…</span>
      </div>
    </Transition>

    <!-- Error overlay -->
    <div
      v-if="loadError && !isLoading"
      class="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-2"
    >
      <span class="text-3xl">😕</span>
      <span class="text-sm text-slate-500">Nie udało się wczytać kolorowanki</span>
      <button
        @click="fetchAndDrawSvg"
        class="mt-2 text-xs text-emerald-600 font-semibold hover:underline"
      >Spróbuj ponownie</button>
    </div>

    <!-- The actual canvas element -->
    <canvas
      ref="canvas"
      class="block max-w-full max-h-full"
      :style="{
        cursor: props.tool === 'eraser' ? 'cell' : 'crosshair',
        touchAction: 'none',
      }"
      @click="onCanvasClick"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    />
  </div>
</template>

<style scoped>
.canvas-fade-enter-active { transition: opacity 0.2s ease; }
.canvas-fade-leave-active { transition: opacity 0.3s ease; }
.canvas-fade-enter-from,
.canvas-fade-leave-to { opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 0.7s linear infinite; }
</style>
