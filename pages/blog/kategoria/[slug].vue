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
  <div class="bg-[#FDFBFF] min-h-screen font-quicksand text-[#2A1B3D] overflow-x-hidden">
    <!-- BG blobs -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.05] w-[500px] h-[500px] bg-[#FF6B6B] -top-[10%] -left-[5%]"></div>
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.05] w-[600px] h-[600px] bg-[#4D96FF] top-[40%] -right-[10%] [animation-delay:-8s]"></div>
      <div class="blog-blob absolute rounded-full blur-[80px] opacity-[0.05] w-[400px] h-[400px] bg-[#FFD93D] bottom-[5%] left-[30%] [animation-delay:-15s]"></div>
    </div>

    <div class="relative z-[1]">
      <BlogTopBar :active-slug="slug" />

      <div class="max-w-[1260px] mx-auto px-8 sm:px-4">
        <!-- Category hero banner -->
        <div
          class="mt-8 p-12 md:p-8 sm:p-6 rounded-3xl flex items-center gap-6 relative overflow-hidden flex-wrap md:flex-wrap"
          :style="heroBgStyle"
        >
          <div class="absolute -right-10 -bottom-10 w-[200px] h-[200px] rounded-full bg-[#6BCB77]/15 pointer-events-none"></div>
          <span class="text-[3.5rem] sm:text-[2.5rem] shrink-0">{{ catConfig?.emoji || '📁' }}</span>
          <div>
            <h1 class="font-baloo text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold mb-1.5">{{ categoryName }}</h1>
            <p v-if="wpCategory?.description" class="text-base text-[#5C4A72] leading-relaxed max-w-[500px]">{{ wpCategory.description }}</p>
            <p v-else class="text-base text-[#5C4A72] leading-relaxed max-w-[500px]">Artykuły z kategorii {{ categoryName }}</p>
          </div>
          <span v-if="total" class="ml-auto md:ml-0 shrink-0 font-baloo text-[0.85rem] font-bold py-1.5 px-4 rounded-full bg-white/70 text-[#5C4A72]">
            {{ total }} {{ total === 1 ? 'artykuł' : 'artykułów' }}
          </span>
        </div>

        <!-- Filter bar -->
        <div v-if="posts.length" class="flex items-center justify-between my-7">
          <span class="text-[0.9rem] text-[#8B7BA5]">Wyświetlanie {{ rangeStart }}-{{ rangeEnd }} z {{ total }} artykułów</span>
        </div>

        <!-- Error -->
        <div v-if="postsError" class="text-center py-10 text-[#5C4A72]">
          <p>Nie udało się załadować artykułów. Spróbuj odświeżyć stronę.</p>
        </div>

        <!-- Grid -->
        <div v-else-if="posts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlogCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            image-height="200px"
          />
        </div>

        <div v-else class="text-center py-10 text-[#5C4A72]">
          <p>Brak artykułów w tej kategorii.</p>
          <NuxtLink to="/blog/" class="text-[#9B72CF] font-semibold no-underline inline-block mt-3">← Wróć do bloga</NuxtLink>
        </div>

        <!-- Pagination -->
        <BlogPagination
          v-if="totalPages > 1"
          :current-page="page"
          :total-pages="totalPages"
          @page-change="onPageChange"
        />
      </div>

    </div>
  </div>
</template>

<style>
.blog-blob {
  animation: blogDrift 25s ease-in-out infinite;
}
@keyframes blogDrift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -40px); }
}
</style>
