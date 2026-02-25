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
  <div class="blog-page">
    <!-- Background blobs -->
    <div class="page-bg-shapes">
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
    </div>

    <div class="content-wrapper">
      <BlogTopBar />

      <!-- Hero -->
      <BlogHero v-if="heroData" :post="heroData" />
      <div v-else-if="heroError" class="blog-error">
        <p>Nie udało się załadować najnowszego artykułu. Spróbuj odświeżyć stronę.</p>
      </div>

      <!-- Category sections -->
      <BlogHomepage v-if="sections" :sections="sections" />

      <!-- Footer -->
      <footer class="blog-footer">
        <div class="blog-footer__logo">✏️ Twoja Kolorowanka</div>
        <p class="blog-footer__text">Darmowe kolorowanki do druku dla dzieci i dorosłych</p>
        <div class="blog-footer__cats">
          <NuxtLink to="/blog/kategoria/zabawa/">Zabawa</NuxtLink>
          <NuxtLink to="/blog/kategoria/edukacja/">Edukacja</NuxtLink>
          <NuxtLink to="/blog/kategoria/wychowanie/">Wychowanie</NuxtLink>
          <NuxtLink to="/blog/kategoria/inspiracje/">Inspiracje</NuxtLink>
          <NuxtLink to="/blog/kategoria/zdrowie/">Zdrowie</NuxtLink>
          <NuxtLink to="/blog/kategoria/kuchnia/">Kuchnia</NuxtLink>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  background: var(--blog-bg);
  min-height: 100vh;
  font-family: 'Quicksand', sans-serif;
  color: var(--blog-text);
  overflow-x: hidden;
}

/* BG Blobs */
.page-bg-shapes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.06;
  animation: drift 25s ease-in-out infinite;
}
.bg-blob:nth-child(1) { width: 500px; height: 500px; background: var(--blog-coral); top: -10%; left: -5%; }
.bg-blob:nth-child(2) { width: 600px; height: 600px; background: var(--blog-sky); top: 30%; right: -10%; animation-delay: -8s; }
.bg-blob:nth-child(3) { width: 400px; height: 400px; background: var(--blog-sunny); bottom: 10%; left: 20%; animation-delay: -15s; }
.bg-blob:nth-child(4) { width: 350px; height: 350px; background: var(--blog-mint); top: 60%; left: 50%; animation-delay: -20s; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.05); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

/* Error */
.blog-error {
  max-width: 1260px;
  margin: 40px auto;
  padding: 0 32px;
  text-align: center;
  color: var(--blog-text-mid);
}

/* Footer */
.blog-footer {
  max-width: 1260px;
  margin: 80px auto 0;
  padding: 40px 32px;
  text-align: center;
  border-top: 1px solid rgba(200, 180, 220, 0.2);
}
.blog-footer__logo {
  font-family: 'Baloo 2', cursive;
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--blog-coral), var(--blog-lavender), var(--blog-sky));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
.blog-footer__text {
  color: var(--blog-text-light);
  font-size: 0.9rem;
}
.blog-footer__cats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.blog-footer__cats a {
  font-family: 'Baloo 2', cursive;
  font-size: 0.82rem;
  color: var(--blog-text-light);
  text-decoration: none;
  padding: 4px 14px;
  border-radius: 50px;
  border: 1px solid rgba(200, 180, 220, 0.25);
  transition: all 0.2s;
}
.blog-footer__cats a:hover {
  border-color: var(--blog-lavender);
  color: var(--blog-lavender);
  background: rgba(155, 114, 207, 0.05);
}
</style>
