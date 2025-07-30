<template>
  <div class="flex flex-col items-center py-10 px-2">
    <h1   class=" text-tertiary-500 mt-16 text-center font-modak text-4xl md:text-7xl flex gap-1 flex-wrap"
          :aria-label="'Wyszukiwarka Kolorowanek'" >
      Wyszukiwarka kolorowanek
    </h1>
    <div v-if="query && visibleResults.length" class="w-full">
      <div class="mb-4 text-gray-700 text-center">
        Znaleziono <b>{{ allResults.length }}</b> wynik{{ allResults.length === 1 ? '' : 'ów' }} dla "<b>{{ query }}</b>"
      </div>
        <div class="flex justify-center mt-20 2xl:mt-8 w-full">
      <UContainer class="w-full">
      <VariantsGallery :items="mappedResults" />
      </UContainer>
      </div>
      <!-- Załaduj więcej -->
      <div class="flex flex-col items-center mt-8">
        <button
          v-if="visibleCount < allResults.length"
          @click="loadMore"
          class="my-4 rounded-sm p-3 grow border text-center border-main-500 text-main-500 font-bold uppercase text-sm tracking-widest hover:bg-main-500 hover:text-white transition"
        >
          Załaduj więcej kolorowanek
        </button>
      </div>
    </div>
    <!-- Brak wyników -->
    <div v-else-if="query" class="text-center mt-10 text-xl text-gray-600">
      <p>Brak wyników dla "<b>{{ query }}</b>"</p>
      <div class="mt-2 text-sm text-gray-400">Spróbuj wpisać inną frazę, np. „smoki” lub „zwierzęta”.</div>
    </div>
  </div>
</template>

<script setup>
import Fuse from 'fuse.js'
import VariantsGallery from '~/components/VariantsGallery.vue' // upewnij się że importujesz!

useHead(() => {
  const canonical = 'https://twoja-kolorowanka.pl/search'
  return {
    title: 'Szukaj kolorowanek do druku PDF – znajdź malowanki dla dzieci',
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: 'Wyszukiwarka kolorowanek PDF do druku. Wpisz dowolne hasło, np. zwierzęta, pojazdy, bajki i pobierz za darmo kolorowanki bez logowania. Ponad 1000 darmowych malowanek dla dzieci!' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'keywords', content: 'wyszukiwarka kolorowanek, kolorowanki do druku, darmowe kolorowanki PDF, bajki, zwierzęta, malowanki dla dzieci' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Szukaj kolorowanek do druku PDF – znajdź malowanki dla dzieci' },
      { property: 'og:description', content: 'Wyszukiwarka kolorowanek PDF do druku. Wpisz np. zwierzęta, pojazdy, bajki i pobierz za darmo kolorowanki bez logowania.' },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: 'https://twoja-kolorowanka.pl/logo-1.webp' },
      { name: 'twitter:card', content: 'summary_large_image' }
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
              },
              "publisher": {
                "@id": "https://twoja-kolorowanka.pl/#organization"
              }
            },
            {
              "@type": "WebPage",
              "@id": "https://twoja-kolorowanka.pl/search#webpage",
              "url": canonical,
              "name": "Wyszukiwarka kolorowanek PDF – darmowe kolorowanki do druku",
              "description": "Wyszukaj i pobierz kolorowanki do druku w PDF – bajki, zwierzęta, pojazdy, postacie i wiele więcej. Ponad 1000 malowanek dla dzieci!",
              "isPartOf": { "@id": "https://twoja-kolorowanka.pl/#website" },
              "primaryImageOfPage": {
                "@id": "https://twoja-kolorowanka.pl/logo-1.webp"
              },
              "datePublished": "2024-01-01",
              "dateModified": "2025-07-30",
              "inLanguage": "pl-PL"
            },
            {
              "@type": "ImageObject",
              "@id": "https://twoja-kolorowanka.pl/logo-1.webp",
              "url": "https://twoja-kolorowanka.pl/logo-1.webp",
              "contentUrl": "https://twoja-kolorowanka.pl/logo-1.webp",
              "caption": "Wyszukiwarka kolorowanek do druku PDF"
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://twoja-kolorowanka.pl/search#breadcrumb",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Strona główna",
                  "item": "https://twoja-kolorowanka.pl/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Szukaj",
                  "item": canonical
                }
              ]
            },
            {
              "@type": "Organization",
              "@id": "https://twoja-kolorowanka.pl/#organization",
              "name": "Twoja Kolorowanka",
              "url": "https://twoja-kolorowanka.pl/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://twoja-kolorowanka.pl/logo.png"
              }
            }
          ]
        })
      }
    ]
  }
})


const FIRST_BATCH = 56
const STEP = 8

const route = useRoute()
const router = useRouter()
const query = ref(route.query.q ?? '')

watch(() => route.query.q, (val) => { query.value = val ?? '' })

const { data: allDocs } = await useAsyncData('all-leaves', () =>
  queryContent().where({ _path: { $regex: '/[0-9]+$' } }).find()
)

const fuse = computed(() => new Fuse(allDocs.value || [], {
  keys: [
    { name: 'title', weight: 0.8 },
    { name: 'alt', weight: 0.7 },
    { name: 'description', weight: 0.4 },
    { name: 'tags', weight: 0.5 }
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
}))

const allResults = computed(() => {
  if (!query.value || !allDocs.value) return []
  return fuse.value.search(query.value).map(r => r.item)
})

const visibleCount = ref(FIRST_BATCH)
const visibleResults = computed(() => allResults.value.slice(0, visibleCount.value))

function loadMore() {
  visibleCount.value = Math.min(visibleCount.value + STEP, allResults.value.length)
}
watch(query, () => { visibleCount.value = FIRST_BATCH })

function submit(e) {
  e.preventDefault()
  router.push({ path: '/search', query: { q: query.value } })
  visibleCount.value = FIRST_BATCH
}

// MAPPING DLA VariantsGallery!
const mappedResults = computed(() =>
  visibleResults.value.map(item => ({
    img: item.image,
    url: item._path,
    title: item.title,
    alt: item.alt || item.title
  }))
)
</script>
