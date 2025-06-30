<template>
    <div class="bg-white">
      <section class="max-w-6xl mx-auto pb-24">
        <div class="text-center lg:text-left flex items-center justify-center flex-col gap-y-2 py-5">
          <h2 class="text-3xl lg:text-4xl xl:text-5xl font-bold leading-none">
            <span class="font-extrabold text-transparent bg-sec-500 text-white px-6">Najczęściej</span> zadawane pytania
          </h2>
          <p class="text-xl lg:text-2xl mt-3 font-light">Wszystko co musisz wiedzieć</p>
        </div>
        <div class="w-full px-7 md:px-10 xl:px-2 py-4">
          <div class="mx-auto w-full max-w-6xl border border-slate-400/20 rounded-lg bg-white">
            <FaqItem 
              v-for="(faq, index) in visibleFaqs" 
              :key="index" 
              :question="faq.question" 
              :answer="faq.answer" 
            />
          </div>
  
          <!-- <div class="flex justify-center mt-6"> -->
            <!-- <UButton @click="toggleFaqs" variant="solid" class="focus:shadow-outline focus:outline-none tracking-wide font-semibold bg-sunsetOrange-500 hover:bg-sunsetOrange-700 text-gray-100 py-4 rounded-lg transition-all duration-300 ease-in-out text-lg px-4">
              <UIcon width="24" height="24" :name="buttonIcon" dynamic /> 
              {{ buttonLabel }}
            </UButton> -->
          <!-- </div> -->
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    faqs: {
      type: Array,
      default: () => []
    },
  })
  const showAllFaqs = ref(false);
  
  const visibleFaqs = computed(() => {
    return showAllFaqs.value ? props.faqs : props.faqs.slice(0, 6);
  });
  
  const toggleFaqs = () => {
    showAllFaqs.value = !showAllFaqs.value;
  };
  
  const buttonLabel = computed(() => (showAllFaqs.value ? 'Zwiń pytania' : 'Pokaż więcej pytań'));
  
  const buttonIcon = computed(() => (!showAllFaqs.value ? 'mdi:chevron-double-down' : 'mdi:chevron-double-up'));
  </script>
  