<template>
    <nav class="text-sm text-gray-500 my-4" v-if="breadcrumbs.length">
      <NuxtLink to="/" class="text-blue-600 hover:underline">Strona główna</NuxtLink>
      <span v-for="(crumb, index) in breadcrumbs" :key="index">
        <span class="mx-2">/</span>
        <NuxtLink
          v-if="index !== breadcrumbs.length - 1"
          :to="crumb.path"
          class="text-blue-600 hover:underline"
        >
          {{ crumb.name }}
        </NuxtLink>
        <span v-else class="font-semibold text-gray-900">{{ crumb.name }}</span>
      </span>
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
        name: segment,
        path
      })
    }
    return crumbs
  })
  </script>
  