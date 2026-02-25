<template>
  <NuxtLink :to="`/blog/${post.slug}/`" class="blog-card-compact">
    <div class="blog-card-compact__img">
      <img
        v-if="post.thumbnail?.url"
        :src="post.thumbnail.url"
        :alt="post.thumbnail.alt || post.title"
        loading="lazy"
        class="blog-card-compact__image"
      />
      <div v-else class="blog-card-compact__placeholder" :style="placeholderStyle">
        {{ post._mockEmoji || '📝' }}
      </div>
    </div>
    <div class="blog-card-compact__body">
      <BlogCategoryTag
        v-if="post.category && showCategory"
        :category="post.category"
        :show-emoji="false"
        size="small"
      />
      <h3 class="blog-card-compact__title">{{ post.title }}</h3>
      <p v-if="showExcerpt" class="blog-card-compact__excerpt">{{ post.excerpt }}</p>
      <div class="blog-card-compact__meta">
        <span>📅 {{ post.dateShort || post.dateFormatted }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, required: true },
  showExcerpt: { type: Boolean, default: true },
  showCategory: { type: Boolean, default: true },
})

const placeholderStyle = computed(() => ({
  background: props.post._mockGradient || 'linear-gradient(135deg, #DDD6FE, #C4B5FD)',
}))
</script>

<style scoped>
.blog-card-compact {
  background: var(--blog-card);
  border-radius: var(--blog-radius);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--blog-shadow-sm);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s;
  display: grid;
  grid-template-columns: 120px 1fr;
  text-decoration: none;
  color: inherit;
}
.blog-card-compact:hover {
  transform: translateY(-5px);
  box-shadow: var(--blog-shadow);
}
.blog-card-compact__img {
  height: 100%;
  min-height: 100px;
  overflow: hidden;
}
.blog-card-compact__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.blog-card-compact:hover .blog-card-compact__image {
  transform: scale(1.08);
}
.blog-card-compact__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  transition: transform 0.4s;
}
.blog-card-compact:hover .blog-card-compact__placeholder {
  transform: scale(1.08);
}
.blog-card-compact__body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.blog-card-compact__title {
  font-family: 'Baloo 2', cursive;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
  margin-bottom: 4px;
  color: var(--blog-text);
  transition: color 0.2s;
}
.blog-card-compact:hover .blog-card-compact__title {
  color: var(--blog-lavender);
}
.blog-card-compact__excerpt {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--blog-text-mid);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-card-compact__meta {
  margin-top: 6px;
  font-size: 0.78rem;
  color: var(--blog-text-light);
}

@media (max-width: 600px) {
  .blog-card-compact {
    grid-template-columns: 100px 1fr;
  }
}
</style>
