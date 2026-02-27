<template>
<div class="min-h-screen bg-gradient-to-b from-coolGray-100/50 to-white">

  <!-- Page header with title and back button -->
  <div class="bg-white border-b border-coolGray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div class="flex items-center gap-3 sm:gap-4">
        <NuxtLink
          v-if="isLeaf"
          :to="returnPath"
          class="shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sec-50 text-sec-600 hover:bg-sec-100 hover:text-sec-700 transition-colors duration-150 border border-sec-200"
          title="Powrót"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>

        <h1
          v-if="doc"
          class="font-modak text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-coolGray-800 leading-tight"
          :aria-label="fullTitle"
          v-rainbow-text="fullTitle"
        />
      </div>
    </div>
  </div>

  <ClientOnly>
    <!-- Canvas editor for leaf pages -->
    <div v-if="isLeaf" class="mt-4 sm:mt-6 lg:mt-8">
      <ColoringCanvas :svg-url="imageUrl"/>
    </div>

    <!-- Category/subcategory listing for non-leaf pages -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div v-if="!doc" class="text-center py-16">
        <p class="text-coolGray-500 text-lg">Nie znaleziono strony.</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Subcategories -->
        <div v-if="Array.isArray(childrenCategories) && childrenCategories.length">
          <h2 class="font-baloo font-bold text-xl sm:text-2xl text-coolGray-700 mb-4">Podkategorie</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NuxtLink
              v-for="c in childrenCategories" :key="c._path"
              :to="c._path"
              class="flex items-center gap-3 p-4 bg-white rounded-xl border border-coolGray-200 shadow-sm hover:shadow-md hover:border-sec-300 transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-tertiary-100 text-tertiary-600 flex items-center justify-center shrink-0 group-hover:bg-tertiary-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span class="font-semibold text-coolGray-700 group-hover:text-sec-600 transition-colors">
                {{ c.title || lastSegment(c._path) }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Variants listing -->
        <div v-if="Array.isArray(childrenVariants) && childrenVariants.length">
          <h2 class="font-baloo font-bold text-xl sm:text-2xl text-coolGray-700 mb-4">
            {{ childrenCategories?.length ? 'Warianty' : 'Dostępne kolorowanki' }}
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <NuxtLink
              v-for="(v, idx) in childrenVariants" :key="v._path"
              :to="'/koloruj' + v._path"
              class="group flex flex-col items-center p-4 bg-white rounded-xl border border-coolGray-200 shadow-sm hover:shadow-md transition-all duration-200"
              :class="[
                'hover:border-' + ['main', 'sec', 'tertiary', 'yellow'][idx % 4] + '-300'
              ]"
            >
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                :class="[
                  ['bg-main-400', 'bg-sec-400', 'bg-tertiary-400', 'bg-yellow-400'][idx % 4]
                ]"
              >
                {{ lastSegment(v._path) }}
              </div>
              <span class="text-sm text-coolGray-600 text-center font-medium line-clamp-2">
                {{ v.title || 'Wariant ' + lastSegment(v._path) }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>

  <UModal v-model="showPreviewModal" class="max-w-[90vw]">
    <div class="flex justify-center items-center min-h-[80vh] bg-coolGray-100 p-4">
      <div
        class="bg-white shadow-lg rounded-xl relative overflow-hidden"
        style="aspect-ratio: 1 / 1.414; width: min(100%, 600px);"
      >
        <img
          v-if="doc?.image"
          :src="doc.image"
          alt="Podgląd PDF"
          class="absolute inset-0 m-auto max-w-full max-h-full object-contain p-4"
        />
      </div>
    </div>
  </UModal>
</div>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useAsyncData, queryContent, useRoute } from '#imports'

const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.filter(Boolean)
  : route.params.slug
    ? [route.params.slug]
    : [];
const currentPath = '/' + slug.join('/');
const currentTag = slug.at(-1) || ''
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)
const returnPath = computed(() => {
  const parts = [...slug]
  return '/' + parts.join('/')
})
const { data: docData } = await useAsyncData(
  `doc:${currentPath}`,
  () => queryContent(currentPath).findOne()
)
const doc = computed(() => docData.value)

const basePath = computed(() =>
  /^[0-9]+$/.test(currentTag)
    ? '/' + slug.slice(0, -1).join('/')
    : currentPath
)
const { data: catData } = await useAsyncData(
  `catDoc:${basePath.value}`,
  () => queryContent(basePath.value).findOne()
)
const categoryDoc = computed(() => catData.value)

const isLeaf = computed(() => /^[0-9]+$/.test(currentTag))

const { data: rawSibsData } = await useAsyncData(
  `siblings:${basePath.value}`,
  () =>
    queryContent()
      .where({ _path: { $regex: `^${basePath.value}/[^/]+$` } })
      .find()
)
const rawSiblings = computed(() => rawSibsData.value || [])
const siblings = computed(() =>
  rawSiblings.value.filter(i => !i._path.endsWith('/index'))
)

function lastSegment(path) {
  return path.split('/').pop()
}

const childrenCategories = computed(() =>
  !isLeaf.value
    ? siblings.value.filter(i => !/^[0-9]+$/.test(lastSegment(i._path)))
    : []
)

const variantsDirect = computed(() =>
  siblings.value.filter(i => /^[0-9]+$/.test(lastSegment(i._path)))
)

const { data: rawGrandkids } = await useAsyncData(
  `grandkids:${currentPath}`,
  () =>
    queryContent()
      .where({ _path: { $regex: `^${currentPath}/[^/]+/[0-9]+$` } })
      .find()
)
const variantsFromGrandkids = computed(() => rawGrandkids.value || [])
const childrenVariants = computed(() =>
  slug.length === 1
    ? variantsFromGrandkids.value
    : variantsDirect.value
)

const currentIndex = computed(() => {
  if (!isLeaf.value) return null
  const idx = variantsDirect.value.findIndex(i => i._path === currentPath)
  return idx >= 0 ? idx + 1 : null
})
const totalCount = computed(() =>
  isLeaf.value ? variantsDirect.value.length : 0
)
const positionIndicator = computed(() =>
  isLeaf.value && totalCount.value > 1
    ? ` (${currentIndex.value}/${totalCount.value})`
    : ''
)
function cleanTitle(t) {
  return t?.replace(/^Kolorowanki?\s*/i, '') || ''
}
const fullTitle = computed(() => {
  const base = isLeaf.value
    ? cleanTitle(categoryDoc.value?.title || slug[slug.length - 2])
    : cleanTitle(doc.value?.title || slug.at(-1))
  return `Kolorowanka ${base}${positionIndicator.value}`
})

const imageUrl = computed(() => doc.value?.image)
function printPdf() {
  const pdfUrl = doc.value?.pdf
  if (!pdfUrl) return
  window.open(pdfUrl, '_blank')
}
function downloadPdf() {
  const pdfUrl = doc.value?.pdf
  if (!pdfUrl) return
  const a = document.createElement('a')
  a.href = pdfUrl
  a.download = pdfUrl.split('/').pop()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const showPreviewModal = ref(false)
function openPreviewModal() {
  if (!doc.value?.image) return
  showPreviewModal.value = true
}
[useHead(() => {
  const seoObj = doc.value
   const canonical = `https://twoja-kolorowanka.pl${seoObj?.canonical || currentPath}`
  return {
    title: seoObj?.title,
    link: [ { rel: 'canonical', href: canonical } ],
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: seoObj?.description },
      { name: 'keywords',    content: seoObj?.keywords },
      { property: 'og:type',        content: 'website' },
      { property: 'og:title',       content: seoObj?.title },
      { property: 'og:description', content: seoObj?.description },
      { property: 'og:url',         content: `https://twoja-kolorowanka.pl${seoObj?.canonical}` },
      { property: 'og:image',       content: `https://twoja-kolorowanka.pl${seoObj?.image}` },
    ],
    script: [

    ]
  }
})]

</script>
