<template>
  <div class="wp-content font-quicksand text-[1.05rem] leading-[1.85] text-[#2A1B3D] max-w-[720px] mx-auto" v-html="content"></div>
</template>

<script setup>
defineProps({
  content: { type: String, default: '' },
})
</script>

<!-- Non-scoped style needed for v-html injected WordPress content -->
<style>
.wp-content h2 {
  font-family: 'Baloo 2', cursive;
  font-size: 1.5rem;
  font-weight: 800;
  margin-top: 2.2em;
  margin-bottom: 0.6em;
  color: #2A1B3D;
  position: relative;
  padding-left: 16px;
}
.wp-content h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(to bottom, #FF6B6B, #9B72CF);
}
.wp-content h3 {
  font-family: 'Baloo 2', cursive;
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1.8em;
  margin-bottom: 0.5em;
}
.wp-content h4 {
  font-family: 'Baloo 2', cursive;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.4em;
}
.wp-content p {
  margin-bottom: 1.3em;
}
.wp-content strong {
  font-weight: 700;
  color: #2A1B3D;
}
.wp-content a {
  color: #9B72CF;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.wp-content a:hover {
  color: #FF6B6B;
}
.wp-content ul,
.wp-content ol {
  padding-left: 1.5em;
  margin-bottom: 1.3em;
}
.wp-content li {
  margin-bottom: 0.5em;
}
.wp-content li::marker {
  color: #9B72CF;
}
.wp-content blockquote {
  border-left: 4px solid #9B72CF;
  padding: 16px 20px;
  margin: 2em 0;
  background: rgba(155, 114, 207, 0.04);
  border-radius: 0 10px 10px 0;
  color: #5C4A72;
  font-style: italic;
  font-size: 1.1rem;
}
.wp-content img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  margin: 1.5em 0;
  box-shadow: 0 2px 8px rgba(155, 114, 207, 0.08);
}
.wp-content figure {
  margin: 1.5em 0;
}
.wp-content figcaption {
  font-size: 0.85rem;
  color: #8B7BA5;
  text-align: center;
  margin-top: 8px;
}
</style>
