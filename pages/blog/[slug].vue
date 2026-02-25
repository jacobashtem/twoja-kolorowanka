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
</script>

<template>
  <div class="blog-post-page">
    <div class="page-bg">
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
      <div class="bg-blob"></div>
    </div>

    <div class="content-wrapper">
      <BlogTopBar :active-slug="post?.category?.slug || ''" />

      <!-- 404 -->
      <div v-if="postError || !post" class="blog-error">
        <h1>Nie znaleziono artykułu</h1>
        <p>Artykuł, którego szukasz, nie istnieje lub został usunięty.</p>
        <NuxtLink to="/blog/" class="blog-error__link">← Wróć do bloga</NuxtLink>
      </div>

      <!-- Article -->
      <article v-else class="article-wrapper">
        <!-- Breadcrumbs -->
        <nav class="article-breadcrumbs">
          <NuxtLink to="/">🏠 Strona główna</NuxtLink>
          <span class="sep">›</span>
          <NuxtLink to="/blog/">Blog</NuxtLink>
          <span class="sep">›</span>
          <NuxtLink
            v-if="post.category"
            :to="`/blog/kategoria/${post.category.slug}/`"
          >
            {{ post.category.name }}
          </NuxtLink>
          <span v-if="post.category" class="sep">›</span>
          <span class="current">{{ post.title.length > 40 ? post.title.slice(0, 40) + '...' : post.title }}</span>
        </nav>

        <!-- Header -->
        <header class="article-header">
          <BlogCategoryTag
            v-if="post.category"
            :category="post.category"
            :linkable="true"
          />
          <h1 class="article-title">{{ post.title }}</h1>
          <div class="article-meta">
            <span class="meta-item">📅 {{ post.dateFormatted }}</span>
            <span class="meta-divider"></span>
            <span class="meta-item">⏱ {{ post.readingTime }} min czytania</span>
            <template v-if="post.tags.length">
              <span class="meta-divider"></span>
              <span class="meta-item">🏷️ {{ post.tags.slice(0, 3).join(', ') }}</span>
            </template>
          </div>
        </header>

        <!-- Featured image -->
        <div class="article-featured-img">
          <img
            v-if="post.thumbnail?.url"
            :src="post.thumbnail.url"
            :alt="post.thumbnail.alt || post.title"
            :width="post.thumbnail.width"
            :height="post.thumbnail.height"
            class="article-featured-img__image"
          />
          <div v-else class="article-featured-img__placeholder">
            {{ post._mockEmoji || '📝' }}
          </div>
        </div>

        <!-- Content -->
        <BlogPostContent :content="post.content" />

        <!-- Tags -->
        <div v-if="post.tags.length" class="article-tags">
          <span class="article-tags__label">🏷️ Tagi:</span>
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="article-tags__pill"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Share -->
        <div class="article-share">
          <span class="article-share__label">Udostępnij:</span>
          <ClientOnly>
            <button class="share-btn" title="Facebook" @click="shareOnFacebook">f</button>
            <button class="share-btn" title="X" @click="shareOnX">𝕏</button>
            <button class="share-btn" title="Pinterest" @click="shareOnPinterest">📌</button>
            <button class="share-btn" title="Kopiuj link" @click="copyLink">🔗</button>
          </ClientOnly>
        </div>

        <!-- Related posts -->
        <BlogRelatedPosts v-if="relatedPosts" :posts="relatedPosts" />
      </article>

      <!-- Footer -->
      <footer class="blog-footer">
        <div class="blog-footer__logo">✏️ Twoja Kolorowanka</div>
        <p class="blog-footer__text">Darmowe kolorowanki do druku dla dzieci i dorosłych</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.blog-post-page {
  background: var(--blog-bg);
  min-height: 100vh;
  font-family: 'Quicksand', sans-serif;
  color: var(--blog-text);
  overflow-x: hidden;
}

/* BG */
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

/* Error */
.blog-error {
  max-width: 820px;
  margin: 80px auto;
  padding: 0 32px;
  text-align: center;
}
.blog-error h1 {
  font-family: 'Baloo 2', cursive;
  font-size: 2rem;
  margin-bottom: 12px;
}
.blog-error p {
  color: var(--blog-text-mid);
  margin-bottom: 24px;
}
.blog-error__link {
  color: var(--blog-lavender);
  font-weight: 600;
  text-decoration: none;
}

/* Article */
.article-wrapper {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 32px 80px;
}

/* Breadcrumbs */
.article-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--blog-text-light);
  margin-bottom: 32px;
}
.article-breadcrumbs a {
  color: var(--blog-text-light);
  text-decoration: none;
  transition: color 0.2s;
}
.article-breadcrumbs a:hover {
  color: var(--blog-lavender);
}
.article-breadcrumbs .sep {
  color: rgba(200, 180, 220, 0.4);
}
.article-breadcrumbs .current {
  color: var(--blog-text-mid);
  font-weight: 600;
}

/* Header */
.article-header {
  margin-bottom: 36px;
}
.article-title {
  font-family: 'Baloo 2', cursive;
  font-size: clamp(2rem, 4.5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
  margin-top: 16px;
  color: var(--blog-text);
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: var(--blog-text-light);
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.meta-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(200, 180, 220, 0.4);
}

/* Featured image */
.article-featured-img {
  width: 100%;
  border-radius: var(--blog-radius-lg);
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: var(--blog-shadow);
}
.article-featured-img__image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}
.article-featured-img__placeholder {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  background: linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #C4B5FD 100%);
}

/* Tags */
.article-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 32px;
  margin-top: 40px;
  border-top: 1px solid rgba(200, 180, 220, 0.2);
}
.article-tags__label {
  font-family: 'Baloo 2', cursive;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--blog-text-mid);
  margin-right: 4px;
}
.article-tags__pill {
  padding: 5px 14px;
  border-radius: 50px;
  background: rgba(155, 114, 207, 0.06);
  border: 1px solid rgba(155, 114, 207, 0.15);
  font-family: 'Baloo 2', cursive;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--blog-text-mid);
}

/* Share */
.article-share {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.article-share__label {
  font-family: 'Baloo 2', cursive;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--blog-text-mid);
}
.share-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid rgba(200, 180, 220, 0.2);
  background: var(--blog-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: var(--blog-text-mid);
}
.share-btn:hover {
  transform: scale(1.15);
  border-color: var(--blog-lavender);
  color: var(--blog-lavender);
  box-shadow: var(--blog-shadow-sm);
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

@media (max-width: 600px) {
  .article-wrapper {
    padding: 24px 16px 60px;
  }
  .article-featured-img__image,
  .article-featured-img__placeholder {
    height: 260px;
  }
  .article-featured-img__placeholder {
    font-size: 5rem;
  }
}
</style>
