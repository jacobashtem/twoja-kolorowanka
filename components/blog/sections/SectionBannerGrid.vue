<template>
  <div>
    <!-- Banner card -->
    <NuxtLink
      v-if="bannerPost"
      :to="`/blog/${bannerPost.slug}/`"
      class="banner-card"
    >
      <div class="banner-card__img">
        <img
          v-if="bannerPost.thumbnail?.url"
          :src="bannerPost.thumbnail.url"
          :alt="bannerPost.thumbnail.alt || bannerPost.title"
          loading="lazy"
          class="banner-card__image"
        />
        <div v-else class="banner-card__placeholder">
          {{ bannerPost._mockEmoji || '🌸' }}
        </div>
      </div>
      <div class="banner-card__body">
        <BlogCategoryTag
          v-if="bannerPost.category"
          :category="bannerPost.category"
          :show-emoji="false"
          size="small"
        />
        <h3 class="banner-card__title">{{ bannerPost.title }}</h3>
        <p class="banner-card__excerpt">{{ bannerPost.excerpt }}</p>
        <div class="banner-card__meta">
          <span>📅 {{ bannerPost.dateShort || bannerPost.dateFormatted }}</span>
          <span>⏱ {{ bannerPost.readingTime }} min</span>
        </div>
      </div>
    </NuxtLink>

    <!-- 4-grid -->
    <div v-if="gridPosts.length" class="four-grid">
      <BlogCard
        v-for="post in gridPosts"
        :key="post.id"
        :post="post"
        image-height="155px"
        :excerpt-lines="2"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: { type: Array, required: true },
})

const bannerPost = computed(() => props.posts[0] || null)
const gridPosts = computed(() => props.posts.slice(1, 5))
</script>

<style scoped>
.banner-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: var(--blog-radius);
  overflow: hidden;
  background: linear-gradient(135deg, #CCFBF1, #A7F3D0, #BAE6FD);
  box-shadow: var(--blog-shadow);
  cursor: pointer;
  transition: all 0.35s;
  text-decoration: none;
  color: inherit;
}
.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--blog-shadow-lg);
}
.banner-card__img {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  overflow: hidden;
}
.banner-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.banner-card:hover .banner-card__image {
  transform: scale(1.05);
}
.banner-card__placeholder {
  font-size: 6rem;
  transition: transform 0.4s;
}
.banner-card:hover .banner-card__placeholder {
  transform: scale(1.05);
}
.banner-card__body {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.banner-card__title {
  font-family: 'Baloo 2', cursive;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  margin-top: 10px;
  color: var(--blog-text);
  line-height: 1.3;
}
.banner-card__excerpt {
  color: var(--blog-text-mid);
  line-height: 1.6;
  font-size: 0.95rem;
}
.banner-card__meta {
  margin-top: 16px;
  font-size: 0.78rem;
  color: var(--blog-text-light);
  display: flex;
  gap: 12px;
}
.four-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-top: 22px;
}

@media (max-width: 900px) {
  .banner-card {
    grid-template-columns: 1fr;
  }
  .four-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .four-grid {
    grid-template-columns: 1fr;
  }
}
</style>
