import { ref, onUnmounted } from 'vue'

interface PinchZoomOptions {
  /** Minimum zoom value */
  min?: number
  /** Maximum zoom value */
  max?: number
  /** Zoom sensitivity (higher = faster zoom per pinch) */
  sensitivity?: number
}

/**
 * Composable for pinch-to-zoom + single-finger pan on a target element.
 *
 * Usage:
 *   const { zoom, offsetX, offsetY, attachTo } = usePinchZoom({ min: 0.5, max: 3 })
 *   onMounted(() => attachTo(containerRef.value))
 */
export function usePinchZoom(options: PinchZoomOptions = {}) {
  const { min = 0.5, max = 3, sensitivity = 1 } = options

  const zoom    = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  // Internal tracking
  let el: HTMLElement | null = null
  let activeTouches: Touch[] = []
  let lastPinchDist  = 0
  let lastPanX       = 0
  let lastPanY       = 0
  let isPinching     = false
  let isPanning      = false

  // ---- Helpers ----

  function clamp(v: number, lo: number, hi: number) {
    return Math.min(Math.max(v, lo), hi)
  }

  function getTouchDist(a: Touch, b: Touch) {
    const dx = a.clientX - b.clientX
    const dy = a.clientY - b.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function getTouchMidpoint(a: Touch, b: Touch) {
    return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
  }

  // ---- Touch handlers ----

  function onTouchStart(e: TouchEvent) {
    activeTouches = Array.from(e.touches)

    if (activeTouches.length === 2) {
      // Start pinch
      isPinching    = true
      isPanning     = false
      lastPinchDist = getTouchDist(activeTouches[0], activeTouches[1])
      e.preventDefault()
    } else if (activeTouches.length === 1 && zoom.value > 1) {
      // Start pan (only when zoomed in)
      isPanning = true
      isPinching = false
      lastPanX  = activeTouches[0].clientX
      lastPanY  = activeTouches[0].clientY
    }
  }

  function onTouchMove(e: TouchEvent) {
    activeTouches = Array.from(e.touches)

    if (isPinching && activeTouches.length === 2) {
      e.preventDefault()

      const dist = getTouchDist(activeTouches[0], activeTouches[1])
      const ratio = dist / lastPinchDist
      lastPinchDist = dist

      zoom.value = clamp(+(zoom.value * (1 + (ratio - 1) * sensitivity)).toFixed(3), min, max)

    } else if (isPanning && activeTouches.length === 1 && zoom.value > 1) {
      e.preventDefault()

      const dx = activeTouches[0].clientX - lastPanX
      const dy = activeTouches[0].clientY - lastPanY
      lastPanX = activeTouches[0].clientX
      lastPanY = activeTouches[0].clientY

      // Limit pan so the canvas doesn't disappear off screen
      const maxOffset = (zoom.value - 1) * 150 // rough limit
      offsetX.value = clamp(offsetX.value + dx, -maxOffset, maxOffset)
      offsetY.value = clamp(offsetY.value + dy, -maxOffset, maxOffset)
    }
  }

  function onTouchEnd(e: TouchEvent) {
    activeTouches = Array.from(e.touches)

    if (activeTouches.length < 2) {
      isPinching = false
      if (activeTouches.length === 1 && zoom.value > 1) {
        // Switch from pinch to pan
        isPanning = true
        lastPanX  = activeTouches[0].clientX
        lastPanY  = activeTouches[0].clientY
      }
    }
    if (activeTouches.length === 0) {
      isPanning = false
      // Snap back offset when zoom returns to 1
      if (zoom.value <= 1) {
        zoom.value = 1
        offsetX.value = 0
        offsetY.value = 0
      }
    }
  }

  // ---- Mouse wheel (desktop Ctrl+scroll) ----

  function onWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoom.value = clamp(+(zoom.value + delta).toFixed(2), min, max)
    if (zoom.value <= 1) { offsetX.value = 0; offsetY.value = 0 }
  }

  // ---- Attach / detach ----

  function attachTo(element: HTMLElement | null) {
    if (!element) return
    detach()
    el = element
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true  })
    el.addEventListener('wheel',      onWheel,      { passive: false })
  }

  function detach() {
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove',  onTouchMove)
    el.removeEventListener('touchend',   onTouchEnd)
    el.removeEventListener('wheel',      onWheel)
    el = null
  }

  function resetZoom() {
    zoom.value    = 1
    offsetX.value = 0
    offsetY.value = 0
  }

  onUnmounted(detach)

  return { zoom, offsetX, offsetY, attachTo, detach, resetZoom }
}
