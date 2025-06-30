<template>
    <div class="border-b border-black/10">
      <button @click="toggleAnswer" class="lg:text-xl question-btn flex w-full items-start gap-x-5 justify-between rounded-lg text-left text-lg font-bold text-slate-800 focus:outline-none p-5">
        <span>{{ question }}</span>
        <svg 
          :class="{'rotate-180': isOpen}" 
          stroke="currentColor" 
          fill="currentColor" 
          stroke-width="0" 
          viewBox="0 0 24 24" 
          class="mt-1.5 md:mt-0 flex-shrink-0 h-5 w-5 text-black" 
          height="1em" 
          width="1em" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
        </svg>
      </button>
      <div v-if="isOpen" class="answer pt-2 pb-5 px-5 text-xl lg:text-2xl mt-0 font-light text-black">
        {{ answer }}
      </div>
    </div>
  </template>
  
  <script setup>

  const props = defineProps({
    question: String,
    answer: String
  })
  
  const isOpen = ref(false)
  
  const toggleAnswer = () => {
    isOpen.value = !isOpen.value
  }
  </script>
  