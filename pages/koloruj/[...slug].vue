<template>
  <div>
  <NuxtLayout :name="isLeaf ? 'coloring' : 'default'">

    <ClientOnly v-if="isLeaf">
      <ColoringPage
        :svg-url="imageUrl"
        :title="fullTitle"
        :return-path="returnPath"
      />
    </ClientOnly>

    <template v-else>
      <div class="flex justify-center mt-8 w-full">
        <UContainer class="w-full">
          <h1
            v-if="doc"
            class="mt-16 font-modak text-4xl md:text-7xl flex gap-1 flex-wrap"
            :aria-label="fullTitle"
          />
        </UContainer>
      </div>

      <ClientOnly>
        <div class="container mx-auto mt-12">
          <div v-if="!doc" class="text-red-600">Nie znaleziono strony.</div>

          <div v-else class="space-y-6">
            <div v-if="Array.isArray(childrenCategories) && childrenCategories.length">
              <p class="font-semibold text-lg mb-2">Podkategorie:</p>
              <ul class="space-y-1 list-disc list-inside">
                <li v-for="c in childrenCategories" :key="c._path">
                  <NuxtLink :to="c._path" class="text-blue-600 hover:underline">
                    {{ c.title || lastSegment(c._path) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <div v-if="Array.isArray(childrenVariants) && childrenVariants.length">
              <p class="font-semibold text-lg mb-2">
                {{ childrenCategories?.length ? 'Warianty:' : 'Dostępne kolorowanki:' }}
              </p>
              <ul class="space-y-1 list-disc list-inside">
                <li v-for="v in childrenVariants" :key="v._path">
                  <NuxtLink :to="v._path" class="text-blue-600 hover:underline">
                    {{ v.title || lastSegment(v._path) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ClientOnly>
    </template>

  </NuxtLayout>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAsyncData, queryContent, useRoute, navigateTo, useHead } from '#imports'

definePageMeta({ layout: false })

const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug.filter(Boolean)
  : route.params.slug
    ? [route.params.slug]
    : []

const currentPath = '/' + slug.join('/')
const currentTag = slug.at(-1) || ''
const isLeaf = computed(() => /^[0-9]+$/.test(currentTag))

const returnPath = computed(() => {
  if (isLeaf.value) {
    return '/' + slug.join('/')
  }
  return '/'
})

const basePath = computed(() =>
  isLeaf.value
    ? '/' + slug.slice(0, -1).join('/')
    : currentPath
)

const { data: docData } = await useAsyncData(
  `doc:${currentPath}`,
  () => queryContent(currentPath).findOne()
)
const doc = computed(() => docData.value)

const { data: catData } = await useAsyncData(
  `catDoc:${basePath.value}`,
  () => queryContent(basePath.value).findOne()
)
const categoryDoc = computed(() => catData.value)

// Kategorie /koloruj/[coś-bez-liczby] nie istnieją jako porządne strony –
// przekieruj na odpowiednik bez prefiksu /koloruj/
if (!isLeaf.value && slug.length > 1) {
  await navigateTo('/' + slug.join('/'), { replace: true })
}

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

// Nowa logika wykrywania głębokości ścieżek
const levelRegex = computed(() =>
  childrenCategories.value.length > 0
    ? `^${basePath.value}/[^/]+/[0-9]+$`
    : `^${basePath.value}/[0-9]+$`
)

const { data: rawGrandkids } = await useAsyncData(
  `grandkids:${currentPath}`,
  () =>
    queryContent()
      .where({ _path: { $regex: levelRegex.value } })
      .find()
)
const variantsFromGrandkids = computed(() => rawGrandkids.value || [])

const childrenVariants = computed(() =>
  isLeaf.value
    ? variantsDirect.value
    : variantsFromGrandkids.value
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

// Oczyszczona funkcja do linków
const fixImageUrl = (imgUrl) => {
  if (!imgUrl) return ''
  
  let clean = imgUrl.replace(/\/+/g, '/')
  if (!clean.startsWith('/')) {
    clean = '/' + clean
  }

  const category = slug[0]
  if (!category) return clean

  const duplicatePattern = new RegExp(`^\\/${category}\\/${category}\\/`)
  if (duplicatePattern.test(clean)) {
    clean = clean.replace(`/${category}`, '')
  }

  return clean
}

// Zastosowanie dla obrazka przekazywanego do ColoringPage
const imageUrl = computed(() => fixImageUrl(doc.value?.image))

useHead(() => {
  const seoObj = doc.value
  const canonical = `https://twoja-kolorowanka.pl${seoObj?.canonical || currentPath}`
  return {
    title: seoObj?.title,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: seoObj?.description },
      { name: 'keywords', content: seoObj?.keywords },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: seoObj?.title },
      { property: 'og:description', content: seoObj?.description },
      { property: 'og:url', content: `https://twoja-kolorowanka.pl${seoObj?.canonical}` },
      { property: 'og:image', content: `https://twoja-kolorowanka.pl${fixImageUrl(seoObj?.image)}` },
    ],
  }
})
</script>