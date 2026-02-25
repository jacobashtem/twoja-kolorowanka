<template>
  <svg :width="size" :height="size" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(40, 65)">
      <g transform="rotate(-30)">
        <rect x="-4" y="-50" width="8" height="36" rx="2" fill="#FF6B6B"/>
        <polygon points="-4,-50 0,-58 4,-50" fill="#FFB3B3"/>
        <rect x="-4" y="-14" width="8" height="4" rx="1" fill="#E85555"/>
      </g>
      <g transform="rotate(-15)">
        <rect x="-4" y="-52" width="8" height="38" rx="2" fill="#FFAB76"/>
        <polygon points="-4,-52 0,-60 4,-52" fill="#FFD4AA"/>
        <rect x="-4" y="-14" width="8" height="4" rx="1" fill="#E8964A"/>
      </g>
      <g transform="rotate(0)">
        <rect x="-4" y="-54" width="8" height="40" rx="2" fill="#FFD93D"/>
        <polygon points="-4,-54 0,-62 4,-54" fill="#FFED8A"/>
        <rect x="-4" y="-14" width="8" height="4" rx="1" fill="#E8C325"/>
      </g>
      <g transform="rotate(15)">
        <rect x="-4" y="-50" width="8" height="36" rx="2" fill="#6BCB77"/>
        <polygon points="-4,-50 0,-58 4,-50" fill="#A7E8B0"/>
        <rect x="-4" y="-14" width="8" height="4" rx="1" fill="#4DAF5C"/>
      </g>
      <g transform="rotate(30)">
        <rect x="-4" y="-48" width="8" height="34" rx="2" fill="#4D96FF"/>
        <polygon points="-4,-48 0,-56 4,-48" fill="#93BFFF"/>
        <rect x="-4" y="-14" width="8" height="4" rx="1" fill="#3578DD"/>
      </g>
    </g>
    <circle cx="40" cy="10" r="3" fill="#FFD93D"/>
    <circle cx="22" cy="20" r="2" fill="#FF6B9D" opacity="0.6"/>
    <circle cx="58" cy="18" r="2" fill="#9B72CF" opacity="0.5"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 42 }
})
</script>
