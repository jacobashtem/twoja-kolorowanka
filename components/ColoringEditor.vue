<template>
  <div class="svg-coloring">
    <!-- Palette -->
    <div class="palette flex gap-2 mb-4">
      <button
        v-for="color in COLORS"
        :key="color"
        @click="selected = color"
        :style="{ backgroundColor: color }"
        class="w-8 h-8 rounded-full border"
        :class="{ 'outline-2 outline-offset-1 outline': color === selected }"
      />
    </div>

    <!-- Inline SVG -->
    <div class="svg-container inline-block">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
        <path d="M400,150 C320,150 260,210 260,290 C260,370 320,430 400,430 C480,430 540,370 540,290 C540,210 480,150 400,150 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
        <path d="M320,180 C290,160 260,170 250,200 C240,230 260,260 290,250 C320,240 330,210 320,180 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
        <path d="M480,180 C510,160 540,170 550,200 C560,230 540,260 510,250 C480,240 470,210 480,180 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
        <path d="M350,260 C340,260 330,270 330,280 C330,290 340,300 350,300 C360,300 370,290 370,280 C370,270 360,260 350,260 Z" fill="white" stroke="#000" stroke-width="2"/>
        <path d="M450,260 C440,260 430,270 430,280 C430,290 440,300 450,300 C460,300 470,290 470,280 C470,270 460,260 450,260 Z" fill="white" stroke="#000" stroke-width="2"/>
        <path d="M350,270 C345,270 340,275 340,280 C340,285 345,290 350,290 C355,290 360,285 360,280 C360,275 355,270 350,270 Z" fill="black"/>
        <path d="M450,270 C445,270 440,275 440,280 C440,285 445,290 450,290 C455,290 460,285 460,280 C460,275 455,270 450,270 Z" fill="black"/>
        <path d="M400,320 C390,320 380,330 380,340 C380,350 390,360 400,360 C410,360 420,350 420,340 C420,330 410,320 400,320 Z" fill="#A52A2A" stroke="#000" stroke-width="2"/>
        <path d="M370,380 C380,390 390,395 400,395 C410,395 420,390 430,380" fill="none" stroke="#000" stroke-width="2"/>
        <path d="M260,320 C230,340 210,380 220,420 C230,460 270,470 290,450 C310,430 300,390 290,370 C280,350 270,330 260,320 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
        <path d="M540,320 C570,340 590,380 580,420 C570,460 530,470 510,450 C490,430 500,390 510,370 C520,350 530,330 540,320 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
        <path d="M350,430 C330,450 320,480 330,510 C340,540 370,550 390,530 C410,510 400,480 390,460 C380,440 370,430 350,430 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
        <path d="M450,430 C470,450 480,480 470,510 C460,540 430,550 410,530 C390,510 400,480 410,460 C420,440 430,430 450,430 Z" fill="#D2B48C" stroke="#000" stroke-width="2"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Palette colors
const COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF',
  '#4B0082', '#9400D3', '#FF69B4', '#964B00', '#000000'
]

// Selected color for fill
const selected = ref(COLORS[0])
</script>

<script>
document.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'path') {
    e.target.setAttribute('fill', selected.value)
  }
})
</script>
