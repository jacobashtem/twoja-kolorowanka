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

// 2. Pobierz najnowsze posty (pod hero, z wykluczeniem hero)
const { data: latestPosts } = await useAsyncData('blog-latest', async () => {
  const excludeIds = heroData.value?.id ? [heroData.value.id] : []
  const result = await getPosts({ perPage: 6, page: 1, exclude: excludeIds })
  return result.posts
})

// 3. Pobierz posty per kategoria z deduplikacja
const { data: sections } = await useAsyncData('blog-sections', async () => {
  const excludeIds = [
    ...(heroData.value?.id ? [heroData.value.id] : []),
    ...(latestPosts.value || []).map(p => p.id),
  ]
  return await getHomepagePosts({
    featuredPostId: heroData.value?.id,
    excludeIds,
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

      <!-- Blog H1 header -->
      <div class="max-w-[1260px] mx-auto pt-10 pb-2 px-8 max-sm:px-4 max-sm:pt-6 text-center">
        <h1 class="font-baloo text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight text-[#2A1B3D]">
          Blog <span class="bg-gradient-to-br from-[#FF6B6B] to-[#9B72CF] bg-clip-text text-transparent">Twoja Kolorowanka</span>
        </h1>
        <p class="text-[#5C4A72] text-base sm:text-lg mt-1.5 mb-0">Porady, inspiracje i pomysły na kreatywne zabawy z dziećmi</p>
      </div>

      <!-- Hero -->
      <BlogHero v-if="heroData" :post="heroData" />
      <div v-else-if="heroError" class="max-w-[1260px] mx-auto my-10 px-8 text-center text-[#5C4A72]">
        <p>Nie udało się załadować najnowszego artykułu. Spróbuj odświeżyć stronę.</p>
      </div>

      <!-- Najnowsze wpisy -->
      <section v-if="latestPosts?.length" class="max-w-[1260px] mx-auto pt-12 px-8 sm:px-4">
        <BlogSectionHeader
          emoji="🆕"
          title="Najnowsze wpisy"
          subtitle="Świeże artykuły z naszego bloga"
          color="#4D96FF"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          <BlogCard
            v-for="post in latestPosts"
            :key="post.id"
            :post="post"
            image-height="190px"
          />
        </div>
      </section>

      <!-- Category sections -->
      <BlogHomepage v-if="sections" :sections="sections" />

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
