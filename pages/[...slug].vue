<script setup>
definePageMeta({ layout: 'default' })

import { ref, computed, defineAsyncComponent } from 'vue'
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
const categoryDoc = computed(() => catData.value)

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

// przyciski PDF / druk
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

const showEditor = ref(false)
function openEditor() { showEditor.value = true }
function closeEditor() { showEditor.value = false }

// **podgląd PDF** (z Twojego kodu)
const showPreviewModal = ref(false)
function openPreviewModal() {
  if (!doc.value?.image) return
  showPreviewModal.value = true
}
</script>

<template>
  <div>
    <div class="flex justify-center mt-8 w-full">
      <UContainer class="w-full">
        <h1
          v-if="doc"
          v-rainbow-text="fullTitle"
          class="mt-16 font-modak text-4xl md:text-7xl flex gap-1 flex-wrap"
          :aria-label="fullTitle"
        />
        <ClientOnly><Breadcrumbs /></ClientOnly>
      </UContainer>
    </div>

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
        <div v-if="childrenCategories.length" class="mb-6">
          <p class="mb-2 font-semibold">Podkategorie:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="c in childrenCategories" :key="c._path">
              <NuxtLink :to="c._path" class="text-blue-600 hover:underline">
                {{ c.title || lastSegment(c._path) }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="childrenVariants.length">
          <p class="mb-2 font-semibold">
            {{ childrenCategories.length ? 'Warianty:' : 'Dostępne kolorowanki:' }}
          </p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="v in childrenVariants" :key="v._path">
              <NuxtLink :to="v._path" class="text-blue-600 hover:underline">
                {{ v.title || lastSegment(v._path) }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </template>
    </UContainer>
    </ClientOnly>
    <!-- PREVIEW MODAL -->
    <UModal v-model="showPreviewModal" class="max-w-[90vw]">
      <div class="flex justify-center items-center min-h-[80vh] bg-gray-100 p-4">
        <div
          class="bg-white shadow-md relative overflow-hidden"
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
