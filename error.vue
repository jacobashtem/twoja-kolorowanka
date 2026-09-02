<!-- error.vue -->
<script setup>
const props = defineProps({ error: Object })

const route = useRoute()
const siteUrl = 'https://twoja-kolorowanka.pl'
const pathWithSlash = computed(() => route.path.endsWith('/') ? route.path : route.path + '/')

const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() =>
  is404.value ? '404 — Nie znaleziono strony | Twoja Kolorowanka'
              : 'Błąd | Twoja Kolorowanka'
)
const description = computed(() =>
  is404.value
    ? 'Ups! Szukana strona nie istnieje lub została przeniesiona. Wróć na stronę główną albo skorzystaj z wyszukiwarki.'
    : 'Coś poszło nie tak. Spróbuj odświeżyć stronę albo wrócić na stronę główną.'
)

// `noindex` TYLKO w prerenderze (import.meta.server). Strona bledu pojawia sie tez po
// stronie klienta, gdy hydratacja POPRAWNEJ strony wywali sie na dowolnym bledzie JS —
// Nuxt do konca hydratacji kieruje kazdy blad do handleVueError, ktory ustawia
// payload.error i renderuje ten komponent. Renderer Google wykonuje JS i honoruje
// podmieniony meta robots, wiec jeden nieudany chunk u Googlebota wyindeksowal
// istniejaca kategorie (/pojazdy/czolgi/, 31.08.2026, GSC: „wykluczona przez noindex").
// Prawdziwe 404 nic nie traca: 404.html powstaje w prerenderze, czyli po stronie serwera.
const robots = import.meta.server
  ? [{ name: 'robots', content: 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }]
  : []

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    ...robots,
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:url', content: siteUrl + pathWithSlash.value }
  ],
  // Dla 404 nie dodajemy canonical — nie ma sensu kanoniczować strony błędu
})
</script>

<template>
    <AppHeader />
  <div class="min-h-screen grid place-items-center p-6">
    <div class="max-w-xl text-center">
      <h1 class="text-4xl font-bold mb-3">
        {{ is404 ? 'Nie znaleziono strony' : 'Coś poszło nie tak' }}
      </h1>
      <p class="text-gray-600 mb-6">
        {{ is404
          ? 'Szukana strona nie istnieje lub została przeniesiona. Wróć na stronę główną albo skorzystaj z wyszukiwarki.'
          : 'Spróbuj odświeżyć stronę lub wróć na stronę główną.' }}
      </p>

      <div class="flex items-center justify-center gap-3">
        <NuxtLink to="/" class="inline-block px-4 py-2 rounded border hover:bg-gray-50">
          Strona główna
        </NuxtLink>
      </div>
    </div>
  </div>
   <AppFooter />
</template>
