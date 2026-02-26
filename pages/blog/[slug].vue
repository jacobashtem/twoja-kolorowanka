<script setup>
import { useBlog } from '~/composables/useBlog'
import { getCategoryConfig } from '~/composables/useBlogCategories'

definePageMeta({
  layout: 'blog',
})

const route = useRoute()
const slug = route.params.slug

const { getPostBySlug, getPosts } = useBlog()

// Pobierz post
const { data: post, error: postError } = await useAsyncData(`post-${slug}`, () =>
  getPostBySlug(slug)
)

// SEO
useSeoMeta({
  title: () => post.value ? `${post.value.title} — Blog Twoja Kolorowanka` : 'Blog Twoja Kolorowanka',
  description: () => post.value?.excerpt || '',
  ogTitle: () => post.value?.title || '',
  ogDescription: () => post.value?.excerpt || '',
  ogImage: () => post.value?.thumbnail?.url || '/og-blog.jpg',
  ogType: 'article',
  articlePublishedTime: () => post.value?.date || '',
})

// Structured data
useHead({
  script: computed(() => {
    if (!post.value) return []
    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value.title,
        image: post.value.thumbnail?.url,
        datePublished: post.value.date,
        author: { '@type': 'Organization', name: 'Twoja Kolorowanka' },
      })
    }]
  })
})

// Powiazane posty
const { data: relatedPosts } = await useAsyncData(`related-${slug}`, async () => {
  if (!post.value?.category?.id) return []
  const result = await getPosts({
    categoryId: post.value.category.id,
    perPage: 3,
    exclude: [post.value.id],
  })
  return result.posts
}, { watch: [post] })

const catConfig = computed(() => {
  if (!post.value?.category?.slug) return null
  return getCategoryConfig(post.value.category.slug)
})

// Share functions
function shareOnFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
  window.open(url, '_blank', 'width=600,height=400')
}
function shareOnX() {
  const url = `https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.value?.title || '')}`
  window.open(url, '_blank', 'width=600,height=400')
}
function shareOnPinterest() {
  const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(post.value?.title || '')}&media=${encodeURIComponent(post.value?.thumbnail?.url || '')}`
  window.open(url, '_blank', 'width=600,height=400')
}
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
  } catch {
    // fallback - ignore
  }
}

// Disqus consent via Klaro
const klaroConsents = useState('klaro-consents', () => ({}))
const hasDisqusConsent = computed(() => klaroConsents.value?.disqus ?? false)

function openKlaroSettings() {
  if (typeof window !== 'undefined' && window.klaro) {
    window.klaro.show()
  }
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
      <BlogTopBar :active-slug="post?.category?.slug || ''" />

      <!-- 404 -->
      <div v-if="postError || !post" class="max-w-[820px] mx-auto my-20 px-8 text-center">
        <h1 class="font-baloo text-[2rem] mb-3">Nie znaleziono artykułu</h1>
        <p class="text-[#5C4A72] mb-6">Artykuł, którego szukasz, nie istnieje lub został usunięty.</p>
        <NuxtLink to="/blog/" class="text-[#9B72CF] font-semibold no-underline">← Wróć do bloga</NuxtLink>
      </div>

      <!-- Article -->
      <article v-else class="max-w-[820px] mx-auto px-8 sm:px-4 pt-10 pb-20">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 flex-wrap text-[0.85rem] text-[#8B7BA5] mb-8">
          <NuxtLink to="/" class="text-[#8B7BA5] no-underline transition-colors duration-200 hover:text-[#9B72CF]">🏠 Strona główna</NuxtLink>
          <span class="text-[#C8B4DC]/40">›</span>
          <NuxtLink to="/blog/" class="text-[#8B7BA5] no-underline transition-colors duration-200 hover:text-[#9B72CF]">Blog</NuxtLink>
          <span class="text-[#C8B4DC]/40">›</span>
          <NuxtLink
            v-if="post.category"
            :to="`/blog/kategoria/${post.category.slug}/`"
            class="text-[#8B7BA5] no-underline transition-colors duration-200 hover:text-[#9B72CF]"
          >
            {{ post.category.name }}
          </NuxtLink>
          <span v-if="post.category" class="text-[#C8B4DC]/40">›</span>
          <span class="text-[#5C4A72] font-semibold">{{ post.title.length > 40 ? post.title.slice(0, 40) + '...' : post.title }}</span>
        </nav>

        <!-- Header -->
        <header class="mb-9">
          <BlogCategoryTag
            v-if="post.category"
            :category="post.category"
            :linkable="true"
          />
          <h1 class="font-baloo text-[clamp(2rem,4.5vw,2.8rem)] font-extrabold leading-[1.15] mb-5 mt-4 text-[#2A1B3D]">{{ post.title }}</h1>
          <div class="flex items-center gap-5 flex-wrap text-[0.88rem] text-[#8B7BA5]">
            <span class="flex items-center gap-[5px]">📅 {{ post.dateFormatted }}</span>
            <span class="w-1 h-1 rounded-full bg-[#C8B4DC]/40"></span>
            <span class="flex items-center gap-[5px]">⏱ {{ post.readingTime }} min czytania</span>
            <template v-if="post.tags.length">
              <span class="w-1 h-1 rounded-full bg-[#C8B4DC]/40"></span>
              <span class="flex items-center gap-[5px]">🏷️ {{ post.tags.slice(0, 3).join(', ') }}</span>
            </template>
          </div>
        </header>

        <!-- Featured image -->
        <div class="w-full rounded-[20px] overflow-hidden mb-10 shadow">
          <img
            v-if="post.thumbnail?.url"
            :src="post.thumbnail.url"
            :alt="post.thumbnail.alt || post.title"
            :width="post.thumbnail.width"
            :height="post.thumbnail.height"
            class="w-full h-[400px] sm:h-[260px] object-cover"
          />
          <div v-else class="w-full h-[400px] sm:h-[260px] flex items-center justify-center text-[8rem] sm:text-[5rem] bg-gradient-to-br from-[#FDE68A] via-[#FBCFE8] to-[#C4B5FD]">
            {{ post._mockEmoji || '📝' }}
          </div>
        </div>

        <!-- Content -->
        <BlogPostContent :content="post.content" />

        <!-- Tags -->
        <div v-if="post.tags.length" class="flex items-center flex-wrap gap-2 pt-8 mt-10 border-t border-[#C8B4DC]/20">
          <span class="font-baloo text-[0.9rem] font-bold text-[#5C4A72] mr-1">🏷️ Tagi:</span>
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="py-[5px] px-3.5 rounded-full bg-[#9B72CF]/[0.06] border border-[#9B72CF]/15 font-baloo text-[0.8rem] font-semibold text-[#5C4A72]"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Share -->
        <div class="flex items-center gap-3 mt-6">
          <span class="font-baloo text-[0.9rem] font-bold text-[#5C4A72]">Udostępnij:</span>
          <ClientOnly>
            <button
              v-for="(btn, i) in [
                { label: 'f', title: 'Facebook', fn: shareOnFacebook },
                { label: '𝕏', title: 'X', fn: shareOnX },
                { label: '📌', title: 'Pinterest', fn: shareOnPinterest },
                { label: '🔗', title: 'Kopiuj link', fn: copyLink },
              ]"
              :key="i"
              :title="btn.title"
              class="w-[42px] h-[42px] rounded-full border-2 border-[#C8B4DC]/20 bg-white cursor-pointer flex items-center justify-center text-[1.1rem] text-[#5C4A72] transition-all duration-300 hover:scale-[1.15] hover:border-[#9B72CF] hover:text-[#9B72CF] hover:shadow-sm"
              @click="btn.fn"
            >
              {{ btn.label }}
            </button>
          </ClientOnly>
        </div>

        <!-- Comments -->
        <section class="mt-16 pt-12 border-t border-[#C8B4DC]/20">
          <h2 class="font-baloo text-[1.4rem] font-extrabold mb-6 text-[#2A1B3D]">Komentarze</h2>
          <ClientOnly>
            <template v-if="hasDisqusConsent">
              <DisqusComments :identifier="`/blog/${slug}/`" :url="`https://twoja-kolorowanka.pl/blog/${slug}/`" />
            </template>
            <div v-else class="text-center py-10 px-6 bg-[#F8F5FF] rounded-2xl border border-[#C8B4DC]/20">
              <p class="text-[#5C4A72] mb-1 font-semibold">Komentarze wymagają zgody na pliki cookie Disqus</p>
              <p class="text-[#8B7BA5] text-sm mb-4">Aby zobaczyć i dodawać komentarze, zaakceptuj usługę Disqus w ustawieniach prywatności.</p>
              <button
                class="py-2.5 px-6 rounded-full bg-[#9B72CF] text-white font-baloo font-bold text-sm transition-all duration-200 hover:bg-[#7B5AAF] hover:shadow-md cursor-pointer"
                @click="openKlaroSettings"
              >
                Zmień ustawienia prywatności
              </button>
            </div>
            <template #fallback>
              <p class="text-[#8B7BA5] text-sm">Ładowanie komentarzy...</p>
            </template>
          </ClientOnly>
        </section>

        <!-- Related posts -->
        <BlogRelatedPosts v-if="relatedPosts" :posts="relatedPosts" />
      </article>

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
