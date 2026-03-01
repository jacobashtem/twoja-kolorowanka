<script setup>
defineProps({
  /** Currently active tool */
  modelValue: { type: String, default: 'fill' },
  /** compact=true → mobile bar style (icon-only square), default → sidebar style (icon + label) */
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const tools = [
  { id: 'fill',   icon: '🪣',  label: 'Wypełnij' },
  { id: 'draw',   icon: '🖌️', label: 'Rysuj'    },
  { id: 'eraser', icon: '◻️',  label: 'Gumka'    },
]
</script>

<template>
  <!-- ---- Sidebar mode (desktop): icon + label, tall, flex-1 buttons ---- -->
  <div v-if="!compact" class="flex gap-2">
    <button
      v-for="t in tools"
      :key="t.id"
      @click="emit('update:modelValue', t.id)"
      :aria-pressed="modelValue === t.id"
      :title="t.label"
      class="flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      :class="modelValue === t.id
        ? 'bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
        : 'bg-white text-slate-500 border border-slate-200 shadow-sm hover:border-emerald-300 hover:text-emerald-600'"
    >
      <span class="text-xl mb-0.5">{{ t.icon }}</span>
      <span class="text-[9px] font-semibold uppercase tracking-wide">{{ t.label }}</span>
    </button>
  </div>

  <!-- ---- Compact mode (mobile bottom bar): icon-only, fixed square ---- -->
  <div v-else class="flex gap-1">
    <button
      v-for="t in tools"
      :key="t.id"
      @click="emit('update:modelValue', t.id)"
      :aria-pressed="modelValue === t.id"
      :title="t.label"
      class="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      :class="modelValue === t.id
        ? 'bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
        : 'bg-slate-100 text-slate-600'"
    >{{ t.icon }}</button>
  </div>
</template>
