<template>
  <div class="section-header">
    <div class="section-header__label">
      <div class="section-header__icon" :style="{ background: iconBg }">
        {{ emoji }}
      </div>
      <div>
        <div class="section-header__title">{{ title }}</div>
        <div v-if="subtitle" class="section-header__subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <NuxtLink
      v-if="categorySlug"
      :to="`/blog/kategoria/${categorySlug}/`"
      class="section-header__link"
      :style="{ color: linkColor, background: linkBg }"
    >
      <span>Wszystkie wpisy</span> →
    </NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  emoji: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  categorySlug: { type: String, default: '' },
  color: { type: String, default: '#9B72CF' },
})

const iconBg = computed(() => {
  const hex = props.color
  return `${hex}1A` // ~10% opacity via hex alpha
})

const linkColor = computed(() => props.color)
const linkBg = computed(() => `${props.color}14`)
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.section-header__label {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-header__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.section-header__title {
  font-family: 'Baloo 2', cursive;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--blog-text);
  line-height: 1.2;
}
.section-header__subtitle {
  font-size: 0.85rem;
  color: var(--blog-text-light);
  margin-top: 2px;
}
.section-header__link {
  font-family: 'Baloo 2', cursive;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 50px;
  padding: 8px 18px;
  transition: all 0.2s;
  white-space: nowrap;
}
.section-header__link:hover {
  gap: 8px;
  filter: brightness(0.9);
}
</style>
