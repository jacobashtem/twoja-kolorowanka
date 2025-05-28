<script setup>

import { useWindowSize } from '@vueuse/core'
import heroDesktop   from '~/public/twoja-kolorowanka-hero.png'
import heroMobileImg from '~/public/twoja-kolorowanka-hero-mobile.png'

// — twoje istniejące reactive’y (route, slug, doc, breadcrumbs, variants itd.)
const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.filter(Boolean)
  : route.params.slug
    ? [ route.params.slug ]
    : []

const currentPath = '/' + slug.join('/')
const currentTag  = slug.at(-1) || ''

// responsywność
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

// główny dokument
const { data: docData } = await useAsyncData(
  `doc:${currentPath}`,
  () => queryContent(currentPath).findOne()
)
const doc = computed(() => docData.value)

// kategoria (index.md w folderze)
const basePath = computed(() =>
  /^[0-9]+$/.test(currentTag)
    ? '/' + slug.slice(0, -1).join('/')
    : currentPath
)
const { data: catData } = await useAsyncData(
  `catDoc:${basePath.value}`,
  () => queryContent(basePath.value).findOne()
)
const categoryDoc = computed(() => catData?.value)

// liść?
const isLeaf = computed(() => /^[0-9]+$/.test(currentTag))

// rodzeństwo (bez index.md)
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

// tylko kategorie (nie cyfrowe)
const childrenCategories = computed(() =>
  !isLeaf.value
    ? siblings.value.filter(i => !/^[0-9]+$/.test(lastSegment(i._path)))
    : []
)

// warianty bezpośrednie
const variantsDirect = computed(() =>
  siblings.value.filter(i => /^[0-9]+$/.test(lastSegment(i._path)))
)

// warianty z wnuków (tylko na root /zwierzeta)
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
const galleryVariants = computed(() =>
  childrenVariants.value.map(v => ({
    img: v.image,
    url: v._path,
    title: v.title
  }))
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
    ? cleanTitle(categoryDoc?.value?.title || slug[slug.length - 2])
    : cleanTitle(doc?.value?.title || slug.at(-1))
  return `Kolorowanka ${base}${positionIndicator.value}`
})

// przyciski PDF / druk
const imageUrl = computed(() => doc?.value?.image)
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

const showEditor = ref(false)
function openEditor() { showEditor.value = true }
function closeEditor() { showEditor.value = false }

// **podgląd PDF** (z Twojego kodu)
const showPreviewModal = ref(false)
function openPreviewModal() {
  if (!doc.value?.image) return
  showPreviewModal.value = true
}
useHead(() => {
  const seoObj = doc.value
  return {
    title: seoObj?.title,
    link: [ { rel: 'canonical', href: `https://instantroom.pl${seoObj?.canonical}` } ],
    meta: [
      { name: 'description', content: seoObj?.description },
      { name: 'keywords',    content: seoObj?.keywords },
      { name: 'robots',      content: seoObj?.robots },
      { property: 'og:type',        content: 'website' },
      { property: 'og:title',       content: seoObj?.title },
      { property: 'og:description', content: seoObj?.description },
      { property: 'og:url',         content: `https://twoja-kolorowanka.pl${seoObj?.canonical}` },
      { property: 'og:image',       content: `https://twoja-kolorowanka.pl${seoObj?.image}` },
      // { name: 'twitter:card',        content: f.twitterCard },
      // { name: 'twitter:site',        content: f.twitterSite },
      // { name: 'twitter:title',       content: f.title },
      // { name: 'twitter:description', content: f.description },
      // { name: 'twitter:image',       content: `https://instantroom.pl${f.image}` }
    ],
    script: [

    ]
  }
})
</script>

<template>
  <div>
    <div class="flex justify-center mt-8 w-full">
      <UContainer class="w-full">
        <h1
          v-if="doc && isLeaf"
          v-rainbow-text="fullTitle"
          class="mt-16 font-modak text-4xl md:text-7xl flex gap-1 flex-wrap"
          :aria-label="fullTitle"
        />
        <ClientOnly>
          <div class="flex items-center justify-between">
            <Breadcrumbs />
              <NuxtLink
                v-if="isLeaf"
                :to="slug.length > 1 ? `/${slug.slice(0, -1).join('/')}` : '/'"
                class="flex items-center gap-2 mb-6  bg-white border rounded px-4 py-2 hover:bg-gray-100"
              >
              <img src="/vectors/return.svg" class="w-16 h-16" alt="Koloruj online" />
                Powrót
              </NuxtLink>
          </div>
        </ClientOnly>
      </UContainer>
    </div>
    <template v-if="!isLeaf">
      <Hero :hero-img1="doc?.heroImg1" :hero-img2="doc?.heroImg2" :description="doc?.description" :h1="{firstPartTitle: doc?.h1First, seccondPartTitle: doc?.h1Sec}" isCategory />
      <UContainer>
          <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[0]?.heading || ''" :as="'h1'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
          <p v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
            {{ doc?.seoBlocks[0]?.text || 'Wybierz kategorię, aby zobaczyć dostępne kolorowanki.' }}
          </p>
          <div>
        </div>
      </UContainer>
    </template>

    <!-- PRZYCISKI na liściu -->
    <UContainer v-if="isLeaf" class="mb-6 mt-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink
          :to="`/koloruj/${slug.join('/')}`"
          class="flex items-center gap-2 bg-white border rounded px-4 py-2 hover:bg-gray-100"
        >
          <img src="/vectors/crayons.svg" class="w-16 h-16" alt="Koloruj online" />
          Koloruj online!
        </NuxtLink>

        <button
          @click="openPreviewModal"
          class="flex items-center gap-2 bg-white border rounded px-4 py-2 hover:bg-gray-100"
        >
          <img src="/vectors/preview.svg" class="w-16 h-16" alt="Podgląd" />
          Podejrzyj kolorowankę
        </button>

        <button
          @click="printPdf"
          class="flex items-center gap-2 bg-white border rounded px-4 py-2 hover:bg-gray-100"
        >
          <img src="/vectors/printer.svg" class="w-16 h-16" alt="Drukuj" />
          Drukuj
        </button>

        <button
          @click="downloadPdf"
          class="flex items-center gap-2 bg-white border rounded px-4 py-2 hover:bg-gray-100"
        >
          <img src="/vectors/download.svg" class="w-16 h-16" alt="Pobierz" />
          Pobierz
        </button>
      </div>
    </UContainer>

    

    <!-- TŁO + SVG LIŚCIA -->
    <ClientOnly>
      <UContainer v-if="isLeaf" class="mb-6">
        <div class="relative w-full mx-auto">
          <img
            :src="isMobile ? heroMobileImg : heroDesktop"
            alt="Twoja kolorowanka"
            class="w-full h-auto"
          />
          <div
            v-if="imageUrl"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <img
              :src="imageUrl"
              class="max-w-[60%] h-auto"
              style="max-height:61%; margin-top:-11%;"
            />
          </div>
        </div>
      </UContainer>
          <!-- TREŚĆ KATEGORII / ROOT -->
    <UContainer v-else>
      <template v-if="!doc">
        <p class="text-red-600">Nie znaleziono strony.</p>
      </template>

      <template v-else>
          <CategoryGallery class="mb-8" :items="childrenCategories" slugHandler/>

        <div v-if="childrenVariants.length">
            <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[1]?.heading || ''" :as="'h1'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <p v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
            {{ doc?.seoBlocks[1]?.text || 'Wybierz kategorię, aby zobaczyć dostępne kolorowanki.' }}
          </p>
            <VariantsGallery :items="galleryVariants" />
        </div>
      </template>
    </UContainer>
    </ClientOnly>

    <UModal v-model="showPreviewModal" class="max-w-[90vw]">
      <div class="flex justify-center items-center min-h-[80vh] bg-gray-100 p-4">
        <div
          class="bg-white shadow-md relative overflow-hidden"
          style="aspect-ratio: 1 / 1.414; width: min(100%, 600px);"
        >
          <img
            v-if="doc?.image"
            :src="doc?.image"
            alt="Podgląd PDF"
            class="absolute inset-0 m-auto max-w-full max-h-full object-contain p-4"
          />
        </div>
      </div>
    </UModal>

    <!-- **EDYTOR** – ładowany dopiero po kliknięciu -->
    <!-- <Suspense>
      <template #fallback>
        <div v-if="showEditor" class="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div class="text-white">Ładowanie edytora…</div>
        </div>
      </template>

      <template #default>
        <ColoringEditor
          v-if="showEditor"
          :svg="doc.image"
          @close="closeEditor"
        />
      </template>
    </Suspense> -->
  </div>
</template>
