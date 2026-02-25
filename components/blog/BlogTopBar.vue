<template>
  <nav class="blog-topbar" :class="{ 'blog-topbar--scrolled': isScrolled }">
    <div class="blog-topbar__inner">
      <NuxtLink to="/blog/" class="blog-topbar__logo">
        <BlogLogo :size="38" />
        <div class="blog-topbar__logo-text">
          <span class="blog-topbar__logo-top">TWOJA</span>
          <span class="blog-topbar__logo-bottom">Kolorowanka</span>
        </div>
      </NuxtLink>
      <div class="blog-topbar__scroll" ref="scrollContainer">
        <NuxtLink
          to="/blog/"
          class="blog-topbar__chip"
          :class="{ 'blog-topbar__chip--active': !activeSlug }"
        >
          🌈 Wszystkie
        </NuxtLink>
        <NuxtLink
          v-for="cat in sortedCategories"
          :key="cat.slug"
          :to="`/blog/kategoria/${cat.slug}/`"
          class="blog-topbar__chip"
          :class="{ 'blog-topbar__chip--active': activeSlug === cat.slug }"
        >
          {{ cat.emoji }} {{ cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1) }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { getSortedCategories } from '~/composables/useBlogCategories'

defineProps({
  activeSlug: { type: String, default: '' },
})

const sortedCategories = getSortedCategories()
const isScrolled = ref(false)

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 20
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<style scoped>
.blog-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 251, 245, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(200, 180, 220, 0.15);
  padding: 10px 0;
  transition: box-shadow 0.3s;
}
.blog-topbar--scrolled {
  box-shadow: 0 4px 20px rgba(90, 50, 130, 0.08);
}
.blog-topbar__inner {
  max-width: 1260px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.blog-topbar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.blog-topbar__logo:hover {
  transform: scale(1.03);
}
.blog-topbar__logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.blog-topbar__logo-top {
  font-family: 'Baloo 2', cursive;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--blog-text-light);
  letter-spacing: 0.5px;
}
.blog-topbar__logo-bottom {
  font-family: 'Baloo 2', cursive;
  font-size: 1.15rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--blog-coral), var(--blog-lavender));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: -2px;
}
.blog-topbar__scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  padding: 4px 0;
}
.blog-topbar__scroll::-webkit-scrollbar {
  display: none;
}
.blog-topbar__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: 50px;
  border: 2px solid transparent;
  background: transparent;
  font-family: 'Baloo 2', cursive;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--blog-text-mid);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  text-decoration: none;
}
.blog-topbar__chip:hover {
  background: rgba(155, 114, 207, 0.08);
  color: var(--blog-lavender);
}
.blog-topbar__chip--active {
  background: var(--blog-text);
  color: white;
  border-color: var(--blog-text);
}

@media (max-width: 600px) {
  .blog-topbar__inner {
    padding: 0 16px;
  }
  .blog-topbar__logo-text {
    display: none;
  }
}
</style>
