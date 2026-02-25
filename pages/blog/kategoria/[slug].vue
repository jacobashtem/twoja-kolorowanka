<script setup>
import { useBlog } from '~/composables/useBlog'
import { getCategoryConfig } from '~/composables/useBlogCategories'

definePageMeta({
  layout: 'blog',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const page = computed(() => parseInt(route.query.strona) || 1)
const perPage = 12

const catConfig = getCategoryConfig(slug)

const { getPosts, getCategories } = useBlog()

// Pobierz kategorie WP i znajdz ID
const { data: wpCategories } = await useAsyncData('wp-categories', () =>
  getCategories()
)

const wpCategory = computed(() =>
  (wpCategories.value || []).find(c => c.slug === slug)
)

// Pobierz posty
const { data: result, error: postsError } = await useAsyncData(
  `cat-${slug}-page-${page.value}`,
  () => getPosts({
    categoryId: wpCategory.value?.id,
    page: page.value,
    perPage,
  }),
  { watch: [page] }
)

const posts = computed(() => result.value?.posts || [])
const total = computed(() => result.value?.total || 0)
const totalPages = computed(() => result.value?.totalPages || 0)

const categoryName = computed(() => {
  if (wpCategory.value?.name) return wpCategory.value.name
  return slug.charAt(0).toUpperCase() + slug.slice(1)
})

const rangeStart = computed(() => (page.value - 1) * perPage + 1)
const rangeEnd = computed(() => Math.min(page.value * perPage, total.value))

// SEO
useSeoMeta({
  title: () => `${categoryName.value} — Blog Twoja Kolorowanka`,
  description: () => wpCategory.value?.description || `Artykuły z kategorii ${categoryName.value}`,
  ogTitle: () => `${categoryName.value} — Blog Twoja Kolorowanka`,
  ogType: 'website',
})

const heroBgStyle = computed(() => {
  const color = catConfig?.color || '#9B72CF'
  const bgColor = catConfig?.bgColor || '#F5F0FF'
  const bg = bgColor === 'transparent' ? '#F5F0FF' : bgColor
  return {
    background: `linear-gradient(135deg, ${bg}, ${bg}dd, ${color}15)`,
  }
})

function onPageChange(newPage) {
  router.push({ query: { strona: newPage > 1 ? newPage : undefined } })
}
</script>

<template>
  <div class="blog-category-page">
    <div class="page-bg">
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
    </div>

    <div class="content-wrapper">
      <BlogTopBar :active-slug="slug" />

      <div class="category-wrapper">
        <!-- Category hero banner -->
        <div
          class="cat-hero"
          :style="heroBgStyle"
        >
          <span class="cat-hero__emoji">{{ catConfig?.emoji || '📁' }}</span>
          <div class="cat-hero__text">
            <h1>{{ categoryName }}</h1>
            <p v-if="wpCategory?.description">{{ wpCategory.description }}</p>
            <p v-else>Artykuły z kategorii {{ categoryName }}</p>
          </div>
          <span v-if="total" class="cat-hero__count">{{ total }} {{ total === 1 ? 'artykuł' : 'artykułów' }}</span>
        </div>

        <!-- Filter bar -->
        <div v-if="posts.length" class="filter-bar">
          <span class="filter-bar__count">Wyświetlanie {{ rangeStart }}-{{ rangeEnd }} z {{ total }} artykułów</span>
        </div>

        <!-- Error -->
        <div v-if="postsError" class="blog-error">
          <p>Nie udało się załadować artykułów. Spróbuj odświeżyć stronę.</p>
        </div>

        <!-- Grid -->
        <div v-else-if="posts.length" class="cat-grid">
          <BlogCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            image-height="200px"
          />
        </div>

        <div v-else class="blog-empty">
          <p>Brak artykułów w tej kategorii.</p>
          <NuxtLink to="/blog/">← Wróć do bloga</NuxtLink>
        </div>

        <!-- Pagination -->
        <BlogPagination
          v-if="totalPages > 1"
          :current-page="page"
          :total-pages="totalPages"
          @page-change="onPageChange"
        />
      </div>

      <!-- Footer -->
      <footer class="blog-footer">
        <div class="blog-footer__logo">✏️ Twoja Kolorowanka</div>
        <p class="blog-footer__text">Darmowe kolorowanki do druku dla dzieci i dorosłych</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.blog-category-page {
  background: var(--blog-bg);
  min-height: 100vh;
  font-family: 'Quicksand', sans-serif;
  color: var(--blog-text);
  overflow-x: hidden;
}
.page-bg {
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
  opacity: 0.05;
  animation: drift 25s ease-in-out infinite;
}
.bg-blob:nth-child(1) { width: 500px; height: 500px; background: var(--blog-coral); top: -10%; left: -5%; }
.bg-blob:nth-child(2) { width: 600px; height: 600px; background: var(--blog-sky); top: 40%; right: -10%; animation-delay: -8s; }
.bg-blob:nth-child(3) { width: 400px; height: 400px; background: var(--blog-sunny); bottom: 5%; left: 30%; animation-delay: -15s; }
@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -40px); }
}
.content-wrapper { position: relative; z-index: 1; }
.category-wrapper {
  max-width: 1260px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Category hero */
.cat-hero {
  margin-top: 32px;
  padding: 48px;
  border-radius: var(--blog-radius-xl);
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;
}
.cat-hero::after {
  content: '';
  position: absolute;
  right: -40px;
  bottom: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(107, 203, 119, 0.15);
  pointer-events: none;
}
.cat-hero__emoji {
  font-size: 3.5rem;
  flex-shrink: 0;
}
.cat-hero__text h1 {
  font-family: 'Baloo 2', cursive;
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 800;
  margin-bottom: 6px;
}
.cat-hero__text p {
  font-size: 1rem;
  color: var(--blog-text-mid);
  line-height: 1.5;
  max-width: 500px;
}
.cat-hero__count {
  margin-left: auto;
  flex-shrink: 0;
  font-family: 'Baloo 2', cursive;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--blog-text-mid);
}

/* Filter bar */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28px 0 24px;
}
.filter-bar__count {
  font-size: 0.9rem;
  color: var(--blog-text-light);
}

/* Grid */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Error / Empty */
.blog-error,
.blog-empty {
  text-align: center;
  padding: 40px;
  color: var(--blog-text-mid);
}
.blog-empty a {
  color: var(--blog-lavender);
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  margin-top: 12px;
}

/* Footer */
.blog-footer {
  max-width: 1260px;
  margin: 0 auto;
  padding: 40px 32px;
  text-align: center;
  border-top: 1px solid rgba(200, 180, 220, 0.2);
}
.blog-footer__logo {
  font-family: 'Baloo 2', cursive;
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--blog-coral), var(--blog-lavender), var(--blog-sky));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}
.blog-footer__text {
  color: var(--blog-text-light);
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .cat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cat-hero {
    flex-wrap: wrap;
    padding: 32px;
  }
  .cat-hero__count {
    margin-left: 0;
  }
}
@media (max-width: 600px) {
  .category-wrapper {
    padding: 0 16px;
  }
  .cat-grid {
    grid-template-columns: 1fr;
  }
  .cat-hero {
    padding: 24px;
  }
  .cat-hero__emoji {
    font-size: 2.5rem;
  }
}
</style>
