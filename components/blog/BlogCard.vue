<template>
  <NuxtLink :to="`/blog/${post.slug}/`" class="blog-card" :class="[`blog-card--${variant}`]">
    <div class="blog-card__img" :style="imgStyle">
      <img
        v-if="post.thumbnail?.url"
        :src="post.thumbnail.url"
        :alt="post.thumbnail.alt || post.title"
        :width="post.thumbnail.width"
        :height="post.thumbnail.height"
        loading="lazy"
        class="blog-card__image"
      />
      <div v-else class="blog-card__placeholder" :style="placeholderStyle">
        {{ post._mockEmoji || '📝' }}
      </div>
    </div>
    <div class="blog-card__body">
      <BlogCategoryTag
        v-if="post.category"
        :category="post.category"
        :show-emoji="false"
        size="small"
      />
      <h3 class="blog-card__title" :class="{ 'blog-card__title--big': variant === 'big' || variant === 'tall' }">
        {{ post.title }}
      </h3>
      <p v-if="showExcerpt" class="blog-card__excerpt" :style="excerptClamp">
        {{ post.excerpt }}
      </p>
      <div class="blog-card__meta">
        <span v-if="showDate">📅 {{ post.dateShort || post.dateFormatted }}</span>
        <span v-if="showReadingTime">⏱ {{ post.readingTime }} min</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, required: true },
  variant: { type: String, default: 'default' }, // 'default' | 'big' | 'tall' | 'compact' | 'banner'
  imageHeight: { type: String, default: '' },
  showExcerpt: { type: Boolean, default: true },
  excerptLines: { type: Number, default: 2 },
  showReadingTime: { type: Boolean, default: true },
  showDate: { type: Boolean, default: true },
})

const imgStyle = computed(() => {
  if (props.imageHeight) {
    return { height: props.imageHeight }
  }
  return {}
})

const excerptClamp = computed(() => ({
  '-webkit-line-clamp': props.excerptLines,
}))

const placeholderStyle = computed(() => ({
  background: props.post._mockGradient || 'linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #C4B5FD 100%)',
}))
</script>

<style scoped>
.blog-card {
  background: var(--blog-card);
  border-radius: var(--blog-radius);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--blog-shadow-sm);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s;
  display: block;
  text-decoration: none;
  color: inherit;
}
.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--blog-shadow);
}
.blog-card__img {
  width: 100%;
  overflow: hidden;
  height: 170px;
}
.blog-card--big .blog-card__img {
  height: 100%;
  min-height: 380px;
}
.blog-card--tall .blog-card__img {
  height: 280px;
}
.blog-card--banner .blog-card__img {
  height: 100%;
  min-height: 220px;
}
.blog-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.blog-card:hover .blog-card__image {
  transform: scale(1.08);
}
.blog-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  transition: transform 0.4s;
}
.blog-card--big .blog-card__placeholder,
.blog-card--banner .blog-card__placeholder {
  font-size: 5rem;
}
.blog-card--tall .blog-card__placeholder {
  font-size: 5rem;
}
.blog-card:hover .blog-card__placeholder {
  transform: scale(1.08);
}
.blog-card__body {
  padding: 18px 20px 22px;
}
.blog-card__title {
  font-family: 'Baloo 2', cursive;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 8px;
  color: var(--blog-text);
  transition: color 0.2s;
}
.blog-card__title--big {
  font-size: 1.25rem;
}
.blog-card:hover .blog-card__title {
  color: var(--blog-lavender);
}
.blog-card__excerpt {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--blog-text-mid);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-card__meta {
  margin-top: 12px;
  font-size: 0.78rem;
  color: var(--blog-text-light);
  display: flex;
  gap: 12px;
}
</style>
