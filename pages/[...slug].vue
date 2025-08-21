<script setup>
import { useWindowSize } from '@vueuse/core'
import heroDesktop   from '~/public/twoja-kolorowanka-hero.png'
import heroMobileImg from '~/public/twoja-kolorowanka-hero-mobile.png'
import { extractH2Blocks } from '@/utils/extractH2Blocks'
const FIRST_BATCH = 56
const STEP        = 8

const route = useRoute()
const slug  = Array.isArray(route.params.slug)
  ? route.params.slug.filter(Boolean)
  : route.params.slug ? [route.params.slug] : []

const currentPath = '/' + slug.join('/')
const currentTag  = slug.at(-1) || ''
const isLeaf      = computed(() => /^[0-9]+$/.test(currentTag))

const basePath = computed(() =>
  isLeaf.value ? '/' + slug.slice(0, -1).join('/') : currentPath)

const levelRegex = computed(() =>
  slug.length === 1
    ? `^${basePath.value}/[^/]+/[0-9]+$`
    : `^${basePath.value}/[0-9]+$`)

const byNum = (a, b) =>
  +(a._path.match(/\/(\d+)\/?$/)?.[1] || 0) - +(b._path.match(/\/(\d+)\/?$/)?.[1] || 0)

const { width } = useWindowSize()
const isMobile  = computed(() => width.value < 768)

const { data: docData } = await useAsyncData(`doc:${currentPath}`,
  () => queryContent(currentPath).findOne())
const doc = computed(() => docData.value)

const h2Blocks = computed(() => extractH2Blocks(doc.value?.body))

const { data: catData } = await useAsyncData(`cat:${basePath.value}`,
  () => queryContent(basePath.value).findOne())
const categoryDoc = computed(() => catData?.value)

const { data: sibsData } = await useAsyncData(`sibs:${basePath.value}`,
  () => queryContent().where({ _path: { $regex: `^${basePath.value}/[^/]+$` } }).find())
const siblings = computed(() =>
  (sibsData.value || []).filter(i => !i._path.endsWith('/index')))

const last = p => p.split('/').pop()

const childrenCategories = computed(() =>
  !isLeaf.value ? siblings.value.filter(i => !/^[0-9]+$/.test(last(i._path))) : [])

const variantsDirect = computed(() =>
  siblings.value.filter(i => /^[0-9]+$/.test(last(i._path))).sort(byNum))

const { data: rawGrand } = await useAsyncData(`grand:${currentPath}`,
  () => queryContent()
        .where({ _path: { $regex: levelRegex.value } })
        .only(['_path','image','title', 'alt'])
        .find())
const variantsGrand = computed(() => (rawGrand.value || []).sort(byNum))

const childrenVariants = computed(() =>
  slug.length === 1 ? variantsGrand.value : variantsDirect.value)

/* --- PROSTE: lista liści po tagach z frontmatter `tagsFilter` --- */
/* (MUSI być zdefiniowane PRZED `galleryVariants`) */
const tagsFilter = computed(() => {
  const t = doc.value?.tagsFilter
  if (Array.isArray(t)) return t.map(String).filter(Boolean)
  if (typeof t === 'string') return t.split(',').map(s => s.trim()).filter(Boolean)
  return []
})

const { data: tagRaw } = await useAsyncData(
  () => {
    if (!tagsFilter.value.length || isLeaf.value) return []
    return queryContent()
      .where({ tags: { $containsAny: tagsFilter.value } }) // tylko po tagach
      .where({ _path: { $regex: '^.+/[0-9]+/?$' } })       // tylko liście (numer na końcu)
      .only(['_path','image','title','alt'])
      .find()
  },
  {
    key: () => `tag:${tagsFilter.value.join(',')}:${isLeaf.value ? 'leaf' : 'cat'}`,
    watch: [tagsFilter, isLeaf]
  }
)

const galleryByTag = computed(() =>
  (tagRaw.value || []).sort(byNum).map(v => ({
    img: v.image, url: v._path, title: v.title, alt: v.alt || v.title
  }))
)
/* --- KONIEC bloku tagów --- */

const galleryVariants = computed(() => {
  if (!isLeaf.value && tagsFilter.value.length && galleryByTag.value.length) {
    return galleryByTag.value
  }
  return childrenVariants.value.map(v => ({
    img: v.image, url: v._path, title: v.title, alt: v.alt || v.title
  }))
})

const similarGalleryVariants = computed(() =>
  galleryVariants.value.filter(v => v.url !== currentPath).slice(0, 8))
const visibleCount = ref(0)
watchEffect(() => {
  visibleCount.value = Math.min(FIRST_BATCH, galleryVariants.value.length)
})

const visibleGalleryVariants = computed(() =>
  galleryVariants.value.slice(FIRST_BATCH, visibleCount.value))

function loadMore () {
  visibleCount.value = Math.min(
    visibleCount.value + STEP,
    galleryVariants.value.length
  )
}

watch(() => currentPath, () => {
  visibleCount.value = Math.min(FIRST_BATCH, galleryVariants.value.length)
})
watchEffect(() => {
  if (doc.value === null) {
    showError(createError({ statusCode: 404, statusMessage: 'Nie znaleziono' }))
  }
})
const currentIndex = computed(() => {
  if (!isLeaf.value) return null
  const i = variantsDirect.value.findIndex(v => v._path === currentPath)
  return i >= 0 ? i + 1 : null
})
const totalCount = computed(() => (isLeaf.value ? variantsDirect.value.length : 0))
const posInd = computed(() =>
  isLeaf.value && totalCount.value > 1 ? ` (${currentIndex.value}/${totalCount.value})` : '')

const clean = t => t?.replace(/^Kolorowanki?\s*/i, '') || ''
const fullTitle = computed(() => {
  const base = isLeaf.value
    ? clean(categoryDoc?.value?.title || slug[slug.length - 2])
    : clean(doc?.value?.title || slug.at(-1))
  return `Kolorowanka ${base}${posInd.value}`
})

const imageUrl        = computed(() => doc?.value?.image)
const printPdf        = () => { const u = doc.value?.pdf; if (u) window.open(u, '_blank') }
const downloadPdf     = () => { const u = doc.value?.pdf; if (!u) return; const a = Object.assign(document.createElement('a'), { href: u, download: u.split('/').pop() }); document.body.appendChild(a); a.click(); document.body.removeChild(a) }
const showPreviewModal = ref(false)
const openPreviewModal = () => { if (doc.value?.image) showPreviewModal.value = true }

[useHead(() => {
  const seoObj = doc.value
  const canonical = `https://twoja-kolorowanka.pl${seoObj?.canonical || currentPath}`;
  return {
    title: seoObj?.title,
    link: [ { rel: 'canonical', href: canonical } ],
    meta: [
      { name: 'description', content: seoObj?.description },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'keywords',    content: seoObj?.keywords },
      { property: 'og:type',        content: 'website' },
      { property: 'og:title',       content: seoObj?.title },
      { property: 'og:description', content: seoObj?.description },
      { property: 'og:url',         content: `https://twoja-kolorowanka.pl${seoObj?.canonical}` },
      { property: 'og:image',       content: `https://twoja-kolorowanka.pl${seoObj?.image}` },
    ],
    script: [
    {
  type: 'application/ld+json',
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://twoja-kolorowanka.pl/#website",
        "url": "https://twoja-kolorowanka.pl/",
        "name": "Twoja Kolorowanka",
        "inLanguage": "pl-PL",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://twoja-kolorowanka.pl/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `https://twoja-kolorowanka.pl${currentPath}/#webpage`,
        "url": `https://twoja-kolorowanka.pl${currentPath}/`,
        "description": doc.value?.description || 'twoja-kolorowanka.pl',
        "name": doc.value?.title || fullTitle.value,
        "isPartOf": { "@id": "https://twoja-kolorowanka.pl/#website" },
        "headline": doc.value?.title || fullTitle.value,
        "primaryImageOfPage": {
          "@id": `https://twoja-kolorowanka.pl${doc.value?.image || '/img/heroImg1.jpg'}`
        },
        "datePublished": doc.value?.date || "2024-01-01",
        "dateModified": "2025-06-30",
        "inLanguage": "pl-PL",
         ...(isLeaf.value && doc.value?.image && doc.value?.pdf
        ? {
            mainEntity: [
              {
                "@type": "ImageObject",
                "@id": `https://twoja-kolorowanka.pl${doc.value.image}`
              },
              {
                "@type": "CreativeWork",
                "name": doc.value.title,
                "url": `https://twoja-kolorowanka.pl${doc.value.pdf}`
              }
            ]
          }
        : {})
      },
      {
        "@type": "ImageObject",
        "@id": `https://twoja-kolorowanka.pl${doc.value?.image || '/img/heroImg1.jpg'}`,
        "url": `https://twoja-kolorowanka.pl${doc.value?.image || '/img/heroImg1.jpg'}`,
        "contentUrl": `https://twoja-kolorowanka.pl${doc.value?.image || '/img/heroImg1.jpg'}`,
        "caption": doc.value?.title || "Kolorowanki zwierzęta do druku"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://twoja-kolorowanka.pl${currentPath}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Strona główna",
            "item": "https://twoja-kolorowanka.pl/"
          },
          ...slug.map((segment, index) => {
            const fullPath = '/' + slug.slice(0, index + 1).join('/');
            return {
              "@type": "ListItem",
              "position": index + 2,
              "name": decodeURIComponent(segment),
              "item": `https://twoja-kolorowanka.pl${fullPath}/`
            };
          })
        ]
      },
      ...(Array.isArray(doc.value?.faqs) && doc.value.faqs.length > 0
          ? [
              {
                "@type": "FAQPage",
                "@id": `https://twoja-kolorowanka.pl${currentPath}/#faq`,
                "mainEntity": doc.value.faqs.map(faq => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              }
            ]
          : [])
          
    ]
  })
}

    ]
  }
    })]  
</script>

<template>
  <div>
    <div class="flex justify-center mt-20 2xl:mt-8 w-full">
      <UContainer class="w-full">

        <h1
          v-if="doc && isLeaf"
          class=" text-tertiary-500 mt-16 font-modak text-4xl md:text-7xl flex gap-1 flex-wrap"
          :aria-label="fullTitle"
        >
          {{ doc?.description }}
        </h1>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
          <Breadcrumbs />
          <NuxtLink
            v-if="isLeaf"
            :to="slug.length > 1 ? `/${slug.slice(0, -1).join('/')}` : '/'"
            class="flex items-center gap-2 mb-6 bg-white border rounded px-4 py-2 hover:bg-gray-100"
          >
            <img src="/vectors/return.svg" class="w-16 h-16" alt="Koloruj online" />
            Powrót
          </NuxtLink>
        </div>

      </UContainer>
    </div>
    <template v-if="!isLeaf">
      <Hero :hero-img1="doc?.heroImg1" :hero-img2="doc?.heroImg2" :description="doc?.description" :h1="{firstPartTitle: doc?.h1First, seccondPartTitle: doc?.h1Sec}" isCategory />
      <UContainer>
           <CategoryGallery v-if="childrenCategories.length" class="mb-8" :items="childrenCategories" slugHandler/>
<template v-for="(block, i) in h2Blocks" :key="i">
  <!-- nagłówek -->
  <Heading
    :text="block.heading"
    as="h2"
    backgroundColor="bg-sec-500"
    fontSize="text-3xl"
  />
<ContentRendererMarkdown :value="{ type: 'root', children: block.nodes }" class="prose mb-12 text-base sm:text-xl  font-light sm:text-center mx-auto px-4 lg:px-8 max-w-full" />

  <VariantsGallery :items="galleryVariants.slice(i * 8, (i + 1) * 8)" />
</template>
        <ClientOnly>
          <VariantsGallery :items="visibleGalleryVariants" class="mt-6"/>
          <div class="flex flex-col items-center">
            <button
              v-if="visibleCount < galleryVariants.length"
              @click="loadMore"
              class="my-4 rounded-sm p-3 grow border text-center border-main-500 text-main-500 font-bold uppercase text-sm tracking-widest hover:bg-main-500 hover:text-white transition"
            >
              Załaduj więcej kolorowanek
            </button>
          </div>
        </ClientOnly>
      </UContainer>
    </template>

    <UContainer v-if="isLeaf" class="mb-6 mt-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink
          :to="`/koloruj/${slug.join('/')}`"
          rel="nofollow"
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

    <UContainer v-if="isLeaf" class="mb-6">
      <div class="relative w-full mx-auto">
        <img
          :src="isMobile ? heroMobileImg : heroDesktop"
          :alt="doc?.alt"
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
    <UContainer v-if="isLeaf" class="mb-6">
      <Heading text="Podobne kolorowanki" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
      <VariantsGallery :items="similarGalleryVariants" />
    </UContainer>



    
    <UContainer v-if="doc?.faqs?.length">
      <FaqList :faqs="doc?.faqs" />
    </UContainer>

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
  </div>
</template>
