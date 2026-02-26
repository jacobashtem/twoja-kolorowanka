<template>
  <div>
    <section
      v-for="cat in homepageCategories"
      :key="cat.slug"
      class="blog-section max-w-[1260px] mx-auto pt-16 px-8 sm:px-4 reveal"
      :class="{ 'mt-14': cat.bgColor && cat.bgColor !== 'transparent' }"
      :style="sectionBgStyle(cat)"
      :ref="el => setSectionRef(cat.slug, el)"
    >
      <BlogSectionHeader
        :emoji="cat.emoji"
        :title="cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1)"
        :subtitle="sectionSubtitle(cat.slug)"
        :category-slug="cat.slug"
        :color="cat.color"
      />

      <SectionZigzag
        v-if="cat.layoutType === 'zigzag'"
        :posts="sections[cat.slug] || []"
      />
      <SectionMasonry
        v-else-if="cat.layoutType === 'masonry-plus-compact'"
        :posts="sections[cat.slug] || []"
      />
      <SectionGrid3x2
        v-else-if="cat.layoutType === 'grid-3x2'"
        :posts="sections[cat.slug] || []"
      />
      <Section1Plus3Plus3
        v-else-if="cat.layoutType === '1-plus-3-plus-3'"
        :posts="sections[cat.slug] || []"
      />
      <SectionSlider
        v-else-if="cat.layoutType === 'slider'"
        :posts="sections[cat.slug] || []"
      />
      <SectionBannerGrid
        v-else-if="cat.layoutType === 'banner-plus-grid'"
        :posts="sections[cat.slug] || []"
      />
    </section>
  </div>
</template>

<script setup>
import { getHomepageCategories } from '~/composables/useBlogCategories'

defineProps({
  sections: { type: Object, default: () => ({}) },
})

const homepageCategories = getHomepageCategories()
const sectionRefs = {}

function setSectionRef(slug, el) {
  if (el) sectionRefs[slug] = el
}

function sectionBgStyle(cat) {
  if (cat.bgColor && cat.bgColor !== 'transparent') {
    return { background: cat.bgColor, borderRadius: '24px', padding: '40px' }
  }
  return {}
}

const subtitles = {
  zabawa: 'Gry, wyzwania i pomysły na wolny czas',
  edukacja: 'Nauka przez zabawę z kolorowankami',
  wychowanie: 'Jak wspierać malucha przez kreatywne zabawy',
  zdrowie: 'Praktyczne wskazówki na co dzień',
  inspiracje: 'Pomysły na kreatywne zabawy i projekty',
  rodzic: 'Codzienne wyzwania i radości rodzicielstwa',
}

function sectionSubtitle(slug) {
  return subtitles[slug] || ''
}

// Scroll-reveal animation with IntersectionObserver
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

  nextTick(() => {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
  })
})
</script>

<style>
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.6s, transform 0.6s;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
