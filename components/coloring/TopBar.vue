<script setup>
defineProps({
  title:       { type: String,  default: 'Kolorowanka' },
  returnPath:  { type: String,  default: '/'           },
  zoomPercent: { type: Number,  default: 100           },
  canZoomOut:  { type: Boolean, default: true          },
  canZoomIn:   { type: Boolean, default: true          },
  saveStatus:  { type: String,  default: 'idle'        }, // 'idle' | 'saved'
})

defineEmits(['zoomIn', 'zoomOut', 'undo', 'reset', 'save'])
</script>

<template>
  <div class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">

    <!-- Left: back button + title -->
    <div class="flex items-center gap-3 min-w-0">
      <NuxtLink
        :to="returnPath"
        class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-2 text-slate-600 font-semibold text-sm transition-colors shrink-0"
      >
        ← Powrót
      </NuxtLink>
      <span class="text-slate-300 shrink-0">|</span>
      <span class="text-sm text-slate-500 font-medium truncate" :title="title">{{ title }}</span>
    </div>

    <!-- Right: zoom + undo + reset + save -->
    <div class="flex items-center gap-1.5 shrink-0">

      <!-- Zoom out -->
      <button
        @click="$emit('zoomOut')"
        :disabled="!canZoomOut"
        aria-label="Pomniejsz (Ctrl -)"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 font-bold text-lg transition-colors"
      >−</button>

      <!-- Zoom percent display -->
      <span class="text-xs font-semibold text-slate-500 min-w-[3rem] text-center tabular-nums select-none">
        {{ zoomPercent }}%
      </span>

      <!-- Zoom in -->
      <button
        @click="$emit('zoomIn')"
        :disabled="!canZoomIn"
        aria-label="Powiększ (Ctrl +)"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 font-bold text-lg transition-colors"
      >+</button>

      <span class="text-slate-200 mx-1">|</span>

      <!-- Undo -->
      <button
        @click="$emit('undo')"
        title="Cofnij (Ctrl+Z)"
        aria-label="Cofnij"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
      >↩</button>

      <!-- Reset / Clear all -->
      <button
        @click="$emit('reset')"
        title="Wyczyść wszystko"
        aria-label="Wyczyść"
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
      >🗑</button>

      <span class="text-slate-200 mx-1">|</span>

      <!-- Autosave indicator -->
      <Transition name="topbar-fade">
        <span
          v-if="saveStatus === 'saved'"
          class="text-[11px] text-emerald-600 font-semibold select-none"
        >✓ Zapisano</span>
      </Transition>

      <!-- Save / Download -->
      <button
        @click="$emit('save')"
        title="Zapisz jako PNG"
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_14px_rgba(16,185,129,0.4)] transition-all"
      >
        💾 Zapisz
      </button>
    </div>
  </div>
</template>

<style scoped>
.topbar-fade-enter-active,
.topbar-fade-leave-active {
  transition: opacity 0.3s ease;
}
.topbar-fade-enter-from,
.topbar-fade-leave-to {
  opacity: 0;
}
</style>
