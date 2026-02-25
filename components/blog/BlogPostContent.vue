<template>
  <div class="wp-content" v-html="content"></div>
</template>

<script setup>
defineProps({
  content: { type: String, default: '' },
})
</script>

<style scoped>
.wp-content {
  font-family: 'Quicksand', sans-serif;
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--blog-text);
  max-width: 720px;
  margin: 0 auto;
}

.wp-content :deep(h2) {
  font-family: 'Baloo 2', cursive;
  font-size: 1.5rem;
  font-weight: 800;
  margin-top: 2.2em;
  margin-bottom: 0.6em;
  color: var(--blog-text);
  position: relative;
  padding-left: 16px;
}
.wp-content :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(to bottom, var(--blog-coral), var(--blog-lavender));
}

.wp-content :deep(h3) {
  font-family: 'Baloo 2', cursive;
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.8em;
  margin-bottom: 0.5em;
}

.wp-content :deep(h4) {
  font-family: 'Baloo 2', cursive;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.4em;
}

.wp-content :deep(p) {
  margin-bottom: 1.3em;
}

.wp-content :deep(strong) {
  font-weight: 700;
  color: var(--blog-text);
}

.wp-content :deep(a) {
  color: var(--blog-lavender);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.wp-content :deep(a):hover {
  color: var(--blog-coral);
}

.wp-content :deep(ul),
.wp-content :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 1.3em;
}

.wp-content :deep(li) {
  margin-bottom: 0.5em;
}

.wp-content :deep(li)::marker {
  color: var(--blog-lavender);
}

.wp-content :deep(blockquote) {
  border-left: 4px solid var(--blog-lavender);
  padding: 16px 20px;
  margin: 2em 0;
  background: rgba(155, 114, 207, 0.04);
  border-radius: 0 var(--blog-radius-sm) var(--blog-radius-sm) 0;
  color: var(--blog-text-mid);
  font-style: italic;
  font-size: 1.1rem;
}

.wp-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--blog-radius);
  margin: 1.5em 0;
  box-shadow: var(--blog-shadow-sm);
}

.wp-content :deep(figure) {
  margin: 1.5em 0;
}

.wp-content :deep(figcaption) {
  font-size: 0.85rem;
  color: var(--blog-text-light);
  text-align: center;
  margin-top: 8px;
}
</style>
