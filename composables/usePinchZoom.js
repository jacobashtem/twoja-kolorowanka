import { ref, onUnmounted } from 'vue'

export function usePinchZoom(options = {}) {
  const { min = 0.5, max = 3, sensitivity = 1 } = options

  const zoom    = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  let el = null
  let activeTouches = []
  let lastPinchDist  = 0
  let lastPanX       = 0
  let lastPanY       = 0
  let isPinching     = false
  let isPanning      = false

  function clamp(v, lo, hi) {
    return Math.min(Math.max(v, lo), hi)
  }

  function getTouchDist(a, b) {
    const dx = a.clientX - b.clientX
    const dy = a.clientY - b.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function getTouchMidpoint(a, b) {
    return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
  }

  function onTouchStart(e) {
    activeTouches = Array.from(e.touches)

    if (activeTouches.length === 2) {
      isPinching    = true
      isPanning     = false
      lastPinchDist = getTouchDist(activeTouches[0], activeTouches[1])
      e.preventDefault()
    } else if (activeTouches.length === 1 && zoom.value > 1) {
      isPanning = true
      isPinching = false
      lastPanX  = activeTouches[0].clientX
      lastPanY  = activeTouches[0].clientY
    }
  }

  function onTouchMove(e) {
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

      const maxOffset = (zoom.value - 1) * 150
      offsetX.value = clamp(offsetX.value + dx, -maxOffset, maxOffset)
      offsetY.value = clamp(offsetY.value + dy, -maxOffset, maxOffset)
    }
  }

  function onTouchEnd(e) {
    activeTouches = Array.from(e.touches)

    if (activeTouches.length < 2) {
      isPinching = false
      if (activeTouches.length === 1 && zoom.value > 1) {
        isPanning = true
        lastPanX  = activeTouches[0].clientX
        lastPanY  = activeTouches[0].clientY
      }
    }
    if (activeTouches.length === 0) {
      isPanning = false
      if (zoom.value <= 1) {
        zoom.value = 1
        offsetX.value = 0
        offsetY.value = 0
      }
    }
  }

  function onWheel(e) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoom.value = clamp(+(zoom.value + delta).toFixed(2), min, max)
    if (zoom.value <= 1) { offsetX.value = 0; offsetY.value = 0 }
  }

  function attachTo(element) {
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
