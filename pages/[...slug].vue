<script setup>
const route = useRoute()
const slug = Array.isArray(route.params.slug)
  ? route.params.slug
  : (route.params.slug ? [route.params.slug] : [])

const currentPath = '/' + slug.join('/')
const currentTag = slug.at(-1)

console.log("[SLUG]", slug)
console.log("[currentPath]", currentPath)
console.log("[TAG]", currentTag)

// 📄 Pobranie dokumentu index.md
const { data: doc } = await useAsyncData(`doc:${currentPath}`, () =>
  queryContent(currentPath).findOne()
)
watch(doc, () => {
  console.log("[DOC]", doc.value)
})

// 📁 Pobranie dzieci (subkategorii i wariantów bezpośrednich)
const { data: children } = await useAsyncData(`children:${currentPath}`, async () => {
  const results = await queryContent()
    .where({ _path: { $regex: `^${currentPath}/[^/]+$` } })
    .find()
  const filtered = results.filter(item => item._path !== currentPath)
  console.log("[CHILDREN]", filtered.map(c => c._path))
  return filtered
})

// 🎨 Pobranie losowych wpisów z tagiem, które nie są w `children`
const { data: tagged } = await useAsyncData(`tagged:${currentPath}`, async () => {
  const all = await queryContent().find()

  const filtered = all.filter(entry =>
    entry.tags?.includes(currentTag) &&
    !!entry.variant_of
  )

  const childrenMap = await queryContent()
    .where({ _path: { $regex: `^${currentPath}/[^/]+$` } })
    .find()
  const childrenPaths = childrenMap.map(c => c._path)

  const filteredUnique = filtered.filter(entry => !childrenPaths.includes(entry._path))

  const shuffled = filteredUnique.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, 20)

  console.log("[TAGGED FINAL]", selected.map(e => e._path))
  return selected
})

// 🧾 isLeaf: tylko konkretna kolorowanka (np. /koty/1)
const isLeaf = computed(() =>
  currentTag?.match(/^[0-9]+$/) ||
  ((children?.value?.length ?? 0) === 0 && (tagged?.value?.length ?? 0) === 0)
)
</script>

<template>
  <NuxtLayout>
    <UContainer>
      <Breadcrumbs />
      <div v-if="doc">
        <h1 class="text-2xl font-bold mb-2">{{ doc.title }}</h1>
        <p class="text-gray-600 mb-6">{{ doc.description }}</p>

        <template v-if="isLeaf">
          <p class="text-green-600 font-semibold">
            To jest ostatnia gałąź – konkretna kolorowanka.
          </p>
        </template>

        <template
          v-else-if="children && children.length > 0 &&
                     !(children.length === 1 && children[0]._path === currentPath + '/' + slug.at(-1))">
          <p class="mb-4">Dostępne podkategorie lub warianty:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="item in children" :key="item._path">
              <NuxtLink :to="item._path" class="text-blue-600 hover:underline">
                {{ item.title || item._path }}
              </NuxtLink>
            </li>
          </ul>
        </template>

        <template v-if="tagged && tagged.length > 0">
          <p class="mt-6 mb-4">Kolorowanki oznaczone tagiem „{{ currentTag }}”:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="item in tagged" :key="item._path">
              <NuxtLink :to="item._path" class="text-blue-600 hover:underline">
                {{ item.title || item._path }}
              </NuxtLink>
            </li>
          </ul>
        </template>
      </div>

      <p v-else class="text-red-600">Nie znaleziono strony.</p>
    </UContainer>
  </NuxtLayout>
</template>


