<script setup>
import { useWindowSize } from '@vueuse/core'
import heroDesktop   from '~/public/twoja-kolorowanka-hero.png'
import heroMobileImg from '~/public/twoja-kolorowanka-hero-mobile.png'

/* ─────────  STAŁE  ───────── */
const FIRST_BATCH = 56   // ile miniatur od razu
const STEP        = 8    // paczka przy kliknięciu

/* ─────────  ŚCIEŻKA  ───────── */
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

/* sort numeryczny */
const byNum = (a, b) =>
  +(a._path.match(/\/(\d+)\/?$/)?.[1] || 0) -
  +(b._path.match(/\/(\d+)\/?$/)?.[1] || 0)

/* ─────────  DANE  ───────── */
const { width } = useWindowSize()
const isMobile  = computed(() => width.value < 768)

/* plik doc */
const { data: docData } = await useAsyncData(`doc:${currentPath}`,
  () => queryContent(currentPath).findOne())
const doc = computed(() => docData.value)

/* dokument kategorii */
const { data: catData } = await useAsyncData(`cat:${basePath.value}`,
  () => queryContent(basePath.value).findOne())
const categoryDoc = computed(() => catData?.value)

/* siblings */
const { data: sibsData } = await useAsyncData(`sibs:${basePath.value}`,
  () => queryContent().where({ _path: { $regex: `^${basePath.value}/[^/]+$` } }).find())
const siblings = computed(() =>
  (sibsData.value || []).filter(i => !i._path.endsWith('/index')))

/* kategorie i warianty */
const last = p => p.split('/').pop()

const childrenCategories = computed(() =>
  !isLeaf.value ? siblings.value.filter(i => !/^[0-9]+$/.test(last(i._path))) : [])

const variantsDirect = computed(() =>
  siblings.value.filter(i => /^[0-9]+$/.test(last(i._path))).sort(byNum))

/* wnuki (root) */
const { data: rawGrand } = await useAsyncData(`grand:${currentPath}`,
  () => queryContent()
        .where({ _path: { $regex: levelRegex.value } })
        .only(['_path','image','title', 'alt'])
        .find())
const variantsGrand = computed(() => (rawGrand.value || []).sort(byNum))

const childrenVariants = computed(() =>
  slug.length === 1 ? variantsGrand.value : variantsDirect.value)

const galleryVariants = computed(() =>
  childrenVariants.value.map(v => ({ img: v.image, url: v._path, title: v.title , alt:  v.alt || v.title })))

const similarGalleryVariants = computed(() =>
  galleryVariants.value.filter(v => v.url !== currentPath).slice(0, 8))
/* ─────────  LAZY LOAD  ───────── */
const visibleCount = ref(0)                          // inicjalnie 0
watchEffect(() => {                                  // gdy pojawi się lista
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

/* ─────────  TITLE / INDEX  ───────── */
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

/* ─ utilsy PDF / modale ─ */
const imageUrl        = computed(() => doc?.value?.image)
const printPdf        = () => { const u = doc.value?.pdf; if (u) window.open(u, '_blank') }
const downloadPdf     = () => { const u = doc.value?.pdf; if (!u) return; const a = Object.assign(document.createElement('a'), { href: u, download: u.split('/').pop() }); document.body.appendChild(a); a.click(); document.body.removeChild(a) }
const showPreviewModal = ref(false)
const openPreviewModal = () => { if (doc.value?.image) showPreviewModal.value = true }

/* ────────────────────────
   SEO meta
   ──────────────────────── */
/* ─────────  SEO  ───────── */
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
        "inLanguage": "pl-PL"
      },
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `https://twoja-kolorowanka.pl${currentPath}/#webpage`,
        "url": `https://twoja-kolorowanka.pl${currentPath}/`,
        "description": doc.value?.description || 'twoja-kolorowanka.pl',
        "name": doc.value?.title || fullTitle.value,
        "isPartOf": { "@id": "https://twoja-kolorowanka.pl/#website" },
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
        <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[0]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
          <p v-if="doc?.seoBlocks" v-html="doc.seoBlocks[0].text ||''" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8"/>
        <div>
        </div>
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
    <UContainer v-else>
      <template v-if="!doc">
        <p class="text-red-600">Nie znaleziono strony.</p>
      </template>

      <template v-else>
          <CategoryGallery v-if="childrenCategories.length" class="mb-8" :items="childrenCategories" slugHandler/>
          <VariantsGallery v-else :items="galleryVariants.slice(0,8)" />

        <div v-if="childrenVariants.length">
            <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[1]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <p v-if="doc?.seoBlocks" v-html="doc.seoBlocks[1].text ||''" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </p>
          <!-- <code>{{ galleryVariants }}</code> -->
            <VariantsGallery :items="galleryVariants.slice(8,16)" />
        </div>
        <div>
          <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[2]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <div v-html="doc.seoBlocks[2].text || 'Wybierz kategorię, aby zobaczyć dostępne kolorowanki.'" v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </div>
          <VariantsGallery :items="galleryVariants.slice(16,24)" />
        </div>
          <div>
          <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[3]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <div v-if="doc?.seoBlocks"
               v-html="doc.seoBlocks[3].text ||''"
               class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </div>
          <VariantsGallery :items="galleryVariants.slice(24,32)" />
        </div>
                <div>
          <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[4]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <div v-html="doc.seoBlocks[4].text ||''" v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </div>
          <VariantsGallery :items="galleryVariants.slice(32,40)" />
        </div>
        <div>
          <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[5]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <div v-html="doc.seoBlocks[5].text || ''" v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </div>
          <VariantsGallery :items="galleryVariants.slice(40,48)" />
        </div>
          <div>
          <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[6]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <div v-html="doc.seoBlocks[6].text ||''" v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </div>
          <VariantsGallery :items="galleryVariants.slice(48,56)" />
          <ClientOnly>
            <VariantsGallery :items="visibleGalleryVariants"  class="mt-6"/>
              <div class="flex flex-col items-center">
              <!-- <LoadingSpinner v-if="loading" size="md" color="primary" text="Ładowanie..." /> -->
              <button
                 v-if="visibleCount < galleryVariants.length"
    @click="loadMore"
                class="my-4 rounded-sm p-3 grow border text-center border-main-500 text-main-500 font-bold uppercase text-sm tracking-widest hover:bg-main-500 hover:text-white transition"
              >
                Załaduj więcej kolorowanek
              </button>
              </div>
          </ClientOnly>
        </div>

      </template>

      <template v-if="doc?.faqs?.length">
        <FaqList :faqs="doc?.faqs" />
      </template>
      <Heading v-if="doc?.seoBlocks" :text="doc?.seoBlocks[7]?.heading || ''" :as="'h2'" :backgroundColor="'bg-sec-500'" fontSize="text-3xl" />
               <div v-html="doc.seoBlocks[7].text ||''" v-if="doc?.seoBlocks" class="mb-12 text-xl font-light text-center mx-auto px-4 lg:px-8">
          </div>
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

