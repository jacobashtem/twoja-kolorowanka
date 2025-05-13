<script setup>
import { useWindowSize } from '@vueuse/core'
import heroDesktop   from '~/public/twoja-kolorowanka-hero.png'
import heroMobileImg from '~/public/twoja-kolorowanka-hero-mobile.png'
const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug
  : route.params.slug
    ? [route.params.slug]
    : []
const currentPath = '/' + slug.join('/')
const currentTag = slug.at(-1) || ''
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

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

//
// — 4. Podkategorie vs warianty
//
const childrenCategories = computed(() =>
  // pokazuj tylko gdy NIE jesteśmy na liściu
  isLeaf.value
    ? []
    : siblings.value.filter(i => !/^[0-9]+$/.test(lastSegment(i._path)))
)

const variantsDirect = computed(() =>
  // numericzne ścieżki z tego folderu
  siblings.value.filter(i => /^[0-9]+$/.test(lastSegment(i._path)))
)

//
// — 5. Lista wariantów w głębi /zwierzeta  (tylko na root /zwierzeta)
//
const { data: rawGrandkids } = await useAsyncData(
  `grandkids:${currentPath}`,
  () =>
    queryContent()
      .where({ _path: { $regex: `^${currentPath}/[^/]+/[0-9]+$` } })
      .find()
)
const variantsFromGrandkids = computed(() =>
  rawGrandkids.value || []
)

const childrenVariants = computed(() =>
  // jeżeli slug ma dokładnie 1 segment (tj. /zwierzeta) → bierz wnuki
  slug.length === 1 ? variantsFromGrandkids.value : variantsDirect.value
)

//
// — 6. Kolorowanki oznaczone tagiem
//
// const { data: rawTaggedData } = await useAsyncData(
//   `tagged:${currentTag}`,
//   () => queryContent().where({ tags: { $contains: currentTag } }).find()
// )
// const tagged = computed(() =>
//   (rawTaggedData.value || []).filter(i => i._path !== currentPath)
// )

//
// — 7. Numeracja wariantów + tytuł
//
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

// wyciągamy czysty tytuł kategorii (np. "Koty") i usuwamy frontmatterowy prefix "Kolorowanki"
function cleanTitle(t) {
  return t?.replace(/^Kolorowanki?\s*/i, '') || ''
}

const fullTitle = computed(() => {
  // na liściu bierzemy nazwę folderu lub categoryDoc.title,
  // na kategorii doc.title albo slug
  const base = isLeaf.value
    ? cleanTitle(categoryDoc.value?.title || slug[slug.length - 2])
    : cleanTitle(doc.value?.title || slug.at(-1))
  return `Kolorowanka ${base}${positionIndicator.value}`
})
const imageUrl = computed(() => doc.value?.image)

</script>

<template>
  <div>
    <div class="flex justify-center mt-8 md:mt-0 w-full">
<UContainer class="w-full">
  <h1
    v-if="doc"
    v-rainbow-text="fullTitle"
    class="font-modak text-2xl md:text-7xl flex gap-1 flex-wrap "
    :aria-label="fullTitle"
  >
  </h1>
  <Breadcrumbs />
</UContainer>


    </div>
  <div class="relative w-full max-w-7xl mx-auto mb-6">
    <img
      :src="isMobile ? heroMobileImg : heroDesktop"
      alt="Twoja kolorowanka"
      class="w-full h-auto block"
    />
    <div
      v-if="imageUrl"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <img style="max-height: 61%;
    margin-top: -11%;" :src="imageUrl" class="max-w-[60%] h-auto" />
    </div>
  </div>

    <UContainer>
      <p v-if="doc" class="text-gray-600 mb-6">{{ doc.description }}</p>
      <p v-else class="text-red-600">Nie znaleziono strony.</p>

      <!-- komunikat dla liścia -->
      <div v-if="isLeaf" class="text-green-600 font-semibold mb-6">
        To jest ostatnia gałąź – konkretna kolorowanka.
      </div>

      <!-- lista podkategorii + wariantów (tylko poza liściem) -->
      <div v-else>
        <div v-if="childrenCategories.length">
          <p class="mb-4">Podkategorie:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="c in childrenCategories" :key="c._path">
              <NuxtLink
                :to="c._path"
                class="text-blue-600 hover:underline"
              >{{ c.title || lastSegment(c._path) }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="childrenVariants.length" class="mt-4">
          <p class="mb-4">
            {{ childrenCategories.length ? 'Warianty:' : 'Dostępne kolorowanki:' }}
          </p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="v in childrenVariants" :key="v._path">
              <NuxtLink
                :to="v._path"
                class="text-blue-600 hover:underline"
              >{{ v.title || v._path }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- tagowane -->
      <!-- <div v-if="tagged.length" class="mt-6">
        <p class="mb-4">
          Kolorowanki oznaczone tagiem „{{ currentTag }}”:
        </p>
        <ul class="list-disc pl-5 space-y-1">
          <li v-for="t in tagged" :key="t._path">
            <NuxtLink
              :to="t._path"
              class="text-blue-600 hover:underline"
            >{{ t.title || t._path }}</NuxtLink>
          </li>
        </ul>
      </div> -->
    </UContainer>
  </div>
</template>
