<template>
  <nav aria-label="Breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList" v-if="breadcrumbs.length">
    <ol class="flex text-sm text-gray-500 my-4 flex-wrap">
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="flex items-center">
        <NuxtLink to="/" itemprop="item" class="text-gray-900 hover:underline">
          <span itemprop="name">Strona główna</span>
        </NuxtLink>
        <meta itemprop="position" content="1" />
      </li>

      <li v-for="(crumb, index) in breadcrumbs" :key="index" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="flex items-center">
        <span class="mx-2">/</span>
        <template v-if="index !== breadcrumbs.length - 1">
          <NuxtLink :to="crumb.path" itemprop="item" class="text-black hover:underline">
            <span itemprop="name">{{ crumb.name }}</span>
          </NuxtLink>
        </template>
        <template v-else>
          <span itemprop="name" class="font-semibold text-gray-900">{{ crumb.name }}</span>
        </template>
        <meta :itemprop="'position'" :content="index + 2" />
      </li>
    </ol>
  </nav>
</template>

<script setup>
const route = useRoute()

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const crumbs = []
  let path = ''
  for (const segment of segments) {
    path += '/' + segment
    crumbs.push({
      name: decodeURIComponent(segment),
      path
    })
  }
  return crumbs
})
</script>
