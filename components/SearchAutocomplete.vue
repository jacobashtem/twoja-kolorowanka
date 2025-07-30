<script setup>
import { useDebounce } from '@vueuse/core'

const emit = defineEmits(['result-selected'])

const props = defineProps({
  categoryLinks: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const autocompleteRef = ref(null)
const searchQuery = ref('')
const debouncedSearchQuery = useDebounce(searchQuery, 100)
const showResults = ref(false)
const activeResultIndex = ref(-1)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  if (!autocompleteRef.value) return
  if (!autocompleteRef.value.contains(event.target)) {
    showResults.value = false
  }
}

function getAllCategoryOptions(categoryLinks) {
  const options = []
  for (const category of categoryLinks) {
    options.push({
      name: category.name,
      slug: category.slug,
      parent: null
    })
    if (category.children && Array.isArray(category.children)) {
      for (const subcategory of category.children) {
        options.push({
          name: subcategory.name,
          slug: subcategory.slug,
          parent: category.name
        })
      }
    }
  }
  return options
}

const allCategoryOptions = computed(() => {
  return getAllCategoryOptions(props.categoryLinks || [])
})

const filteredResults = computed(() => {
  const query = debouncedSearchQuery.value.trim().toLowerCase()
  if (!query) return []
  return allCategoryOptions.value.filter(option => {
    const nameMatch = option.name.toLowerCase().includes(query)
    const parentMatch = option.parent && option.parent.toLowerCase().includes(query)
    return nameMatch || parentMatch
  }).slice(0, 10)
})

// Resetowanie na każdy input/focus!
watch(searchQuery, value => {
  showResults.value = !!value
  activeResultIndex.value = -1  // <-- domyślnie brak aktywnego wyniku!
})

function moveSelection(direction) {
  if (!filteredResults.value.length) return
  const count = filteredResults.value.length
  if (activeResultIndex.value === -1 && direction === +1) {
    activeResultIndex.value = 0 // pierwszy
  } else if (activeResultIndex.value === -1 && direction === -1) {
    activeResultIndex.value = count - 1 // ostatni
  } else {
    activeResultIndex.value = (activeResultIndex.value + direction + count) % count
  }
}
function goToResult(idx) {
  if (activeResultIndex.value >= 0 && filteredResults.value.length) {
    // Wybrano konkretną sugestię (nawigowano strzałkami)
    const item = filteredResults.value[idx ?? activeResultIndex.value]
    router.push('/' + item.slug)
    searchQuery.value = ''
    showResults.value = false
    activeResultIndex.value = -1
    emit('result-selected')
  } else if (searchQuery.value.trim()) {
    // Nie podświetlono wyniku, po prostu szukaj
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
    showResults.value = false
    activeResultIndex.value = -1
    emit('result-selected')
  }
}
function highlightMatch(name, queryStr) {
  if (!queryStr) return name
  const re = new RegExp(`(${queryStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return name.replace(re, '<mark class="bg-orange-200 rounded">$1</mark>')
}
</script>

<template>
  <div ref="autocompleteRef" class="relative mx-auto">
    <input
      v-model="searchQuery"
      @focus="showResults = true; activeResultIndex = -1"
      @keydown.down.prevent="moveSelection(+1)"
      @keydown.up.prevent="moveSelection(-1)"
      @keydown.enter.prevent="goToResult(activeResultIndex)"
      @keydown.esc="showResults = false"
      class="block w-full px-4 py-1 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-sec-500 focus:border-sec-500 transition text-lg"
      placeholder="Szukaj kolorowanek"
      autocomplete="off"
      type="text"
    />
    <ul
      class="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
      v-show="showResults && filteredResults.length"
    >
      <li
        v-for="(item, index) in filteredResults"
        :key="item.slug + (item.parent || '')"
        :class="['px-4 py-2 cursor-pointer transition hover:bg-orange-50',
                { 'bg-orange-100': index === activeResultIndex }]"
        @mousedown.prevent="goToResult(index)"
        @mouseover="activeResultIndex = index"
      >
        <span v-html="highlightMatch(item.name, searchQuery)"></span>
        <span v-if="item.parent" class="ml-2 text-sm text-gray-400">({{ item.parent }})</span>
      </li>
      <li v-if="!filteredResults.length" class="px-4 py-2 text-gray-400">Brak wyników.</li>
    </ul>
  </div>
</template>
