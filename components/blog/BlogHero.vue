<template>
  <section v-if="post" class="blog-hero">
    <NuxtLink :to="`/blog/${post.slug}/`" class="blog-hero__card">
      <div class="blog-hero__image">
        <img
          v-if="post.thumbnail?.url"
          :src="post.thumbnail.url"
          :alt="post.thumbnail.alt || post.title"
          :width="post.thumbnail.width"
          :height="post.thumbnail.height"
          class="blog-hero__img"
        />
        <div v-else class="blog-hero__placeholder" :style="placeholderStyle">
          {{ post._mockEmoji || '🦕' }}
        </div>
      </div>
      <div class="blog-hero__body">
        <div v-if="post.category" class="blog-hero__cat-tag" :style="{ color: post.category.color }">
          <span class="blog-hero__dot" :style="{ background: post.category.color }"></span>
          {{ post.category.name }}
        </div>
        <h1 class="blog-hero__title">{{ post.title }}</h1>
        <p class="blog-hero__excerpt">{{ post.excerpt }}</p>
        <div class="blog-hero__meta">
          <span>📅 {{ post.dateFormatted }}</span>
          <span>⏱ {{ post.readingTime }} min czytania</span>
        </div>
        <span class="blog-hero__btn">
          Czytaj artykuł <span class="blog-hero__arrow">→</span>
        </span>
      </div>
    </NuxtLink>
  </section>
</template>

<script setup>
const props = defineProps({
  post: { type: Object, default: null },
})

const placeholderStyle = computed(() => ({
  background: props.post?._mockGradient || 'linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #C4B5FD 100%)',
}))
</script>

<style scoped>
.blog-hero {
  max-width: 1260px;
  margin: 0 auto;
  padding: 40px 32px 0;
}
.blog-hero__card {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  border-radius: var(--blog-radius-xl);
  overflow: hidden;
  background: var(--blog-card);
  box-shadow: var(--blog-shadow-lg);
  cursor: pointer;
  transition: transform 0.4s, box-shadow 0.4s;
  text-decoration: none;
  color: inherit;
  animation: heroIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
.blog-hero__card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(90, 50, 130, 0.16);
}
@keyframes heroIn {
  from { opacity: 0; transform: translateY(40px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.blog-hero__image {
  position: relative;
  min-height: 440px;
  overflow: hidden;
}
.blog-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}
.blog-hero__card:hover .blog-hero__img {
  transform: scale(1.05);
}
.blog-hero__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  transition: transform 0.6s;
}
.blog-hero__card:hover .blog-hero__placeholder {
  transform: scale(1.05);
}
.blog-hero__body {
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.blog-hero__cat-tag {
  font-family: 'Baloo 2', cursive;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.blog-hero__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.blog-hero__title {
  font-family: 'Baloo 2', cursive;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.15;
  color: var(--blog-text);
}
.blog-hero__excerpt {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--blog-text-mid);
  margin-bottom: 28px;
  max-width: 420px;
}
.blog-hero__meta {
  display: flex;
  gap: 20px;
  font-size: 0.85rem;
  color: var(--blog-text-light);
}
.blog-hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 12px 28px;
  border-radius: 50px;
  background: linear-gradient(135deg, var(--blog-coral), var(--blog-peach));
  color: white;
  font-family: 'Baloo 2', cursive;
  font-size: 1rem;
  font-weight: 700;
  width: fit-content;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.blog-hero__card:hover .blog-hero__btn {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 24px rgba(255, 107, 107, 0.4);
}
.blog-hero__arrow {
  transition: transform 0.2s;
}
.blog-hero__card:hover .blog-hero__arrow {
  transform: translateX(4px);
}

@media (max-width: 900px) {
  .blog-hero__card {
    grid-template-columns: 1fr;
  }
  .blog-hero__image {
    min-height: 280px;
  }
  .blog-hero__body {
    padding: 28px 24px 32px;
  }
}
@media (max-width: 600px) {
  .blog-hero {
    padding: 20px 16px 0;
  }
}
</style>
