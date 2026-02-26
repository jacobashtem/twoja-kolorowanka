<script setup>
import { useBlog } from '~/composables/useBlog'

definePageMeta({
  layout: 'blog',
})

useSeoMeta({
  title: 'Blog — Twoja Kolorowanka',
  description: 'Porady, inspiracje i pomysły na kreatywne zabawy z dziećmi. Dowiedz się, jak kolorowanie wspiera rozwój Twojego dziecka.',
  ogTitle: 'Blog — Twoja Kolorowanka',
  ogDescription: 'Porady, inspiracje i pomysły na kreatywne zabawy z dziećmi.',
  ogImage: '/og-blog.jpg',
  ogType: 'website',
})

const { getPosts, getHomepagePosts } = useBlog()

// 1. Pobierz najnowszy post (hero)
const { data: heroData, error: heroError } = await useAsyncData('blog-hero', async () => {
  const result = await getPosts({ perPage: 1, page: 1 })
  return result.posts[0] || null
})

// 2. Pobierz posty per kategoria z deduplikacja
const { data: sections, error: sectionsError } = await useAsyncData('blog-sections', async () => {
  return await getHomepagePosts({
    featuredPostId: heroData.value?.id,
  })
})
</script>

<template>
  <div class="bg-[#FDFBFF] min-h-screen font-quicksand text-[#2A1B3D] overflow-x-hidden">
    <!-- Background blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.06] w-[500px] h-[500px] bg-[#FF6B6B] -top-[10%] -left-[5%]"></div>
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.06] w-[600px] h-[600px] bg-[#4D96FF] top-[30%] -right-[10%] [animation-delay:-8s]"></div>
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.06] w-[400px] h-[400px] bg-[#FFD93D] bottom-[10%] left-[20%] [animation-delay:-15s]"></div>
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.06] w-[350px] h-[350px] bg-[#6BCB77] top-[60%] left-[50%] [animation-delay:-20s]"></div>
    </div>

    <div class="relative z-[1]">
      <BlogTopBar />

      <!-- Hero -->
      <BlogHero v-if="heroData" :post="heroData" />
      <div v-else-if="heroError" class="max-w-[1260px] mx-auto my-10 px-8 text-center text-[#5C4A72]">
        <p>Nie udało się załadować najnowszego artykułu. Spróbuj odświeżyć stronę.</p>
      </div>

      <!-- Category sections -->
      <BlogHomepage v-if="sections" :sections="sections" />

      <!-- Footer -->
      <footer class="max-w-[1260px] mx-auto mt-20 px-8 py-10 text-center border-t border-[#C8B4DC]/20">
        <div class="font-baloo text-[1.6rem] font-extrabold bg-gradient-to-br from-[#FF6B6B] via-[#9B72CF] to-[#4D96FF] bg-clip-text text-transparent mb-2">✏️ Twoja Kolorowanka</div>
        <p class="text-[#8B7BA5] text-[0.9rem]">Darmowe kolorowanki do druku dla dzieci i dorosłych</p>
        <div class="flex justify-center flex-wrap gap-2 mt-4">
          <NuxtLink
            v-for="cat in ['zabawa', 'edukacja', 'wychowanie', 'inspiracje', 'zdrowie', 'kuchnia']"
            :key="cat"
            :to="`/blog/kategoria/${cat}/`"
            class="font-baloo text-[0.82rem] text-[#8B7BA5] no-underline py-1 px-3.5 rounded-full border border-[#C8B4DC]/25 transition-all duration-200 hover:border-[#9B72CF] hover:text-[#9B72CF] hover:bg-[#9B72CF]/5"
          >
            {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
          </NuxtLink>
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
.blog-blob {
  animation: blogDrift 25s ease-in-out infinite;
}
@keyframes blogDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.05); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
}
</style>
