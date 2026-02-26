import { useBlogTransform } from './useBlogTransform'
import { getHomepageCategories, getPostsCountForLayout } from './useBlogCategories'

export function useBlogApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.wordpressApiUrl
  const { transformPost } = useBlogTransform()

  /**
   * Bazowy fetch z obsluga bledow
   */
  async function wpFetch(endpoint, params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val))
      }
    })

    const url = `${baseUrl}${endpoint}?${query.toString()}`

    try {
      const response = await $fetch.raw(url)
      return {
        data: response._data,
        total: parseInt(response.headers.get('x-wp-total') || '0'),
        totalPages: parseInt(response.headers.get('x-wp-totalpages') || '0'),
      }
    } catch (err) {
      console.error(`[useBlogApi] Error fetching ${url}:`, err?.message || err)
      return { data: [], total: 0, totalPages: 0 }
    }
  }

  /**
   * Pobierz posty z opcjonalnym filtrowaniem
   */
  async function getPosts(params = {}) {
    const {
      page = 1,
      perPage = 12,
      categoryId,
      exclude = [],
      search,
    } = params

    const queryParams = {
      _embed: '',
      page,
      per_page: perPage,
      orderby: 'date',
      order: 'desc',
    }

    if (categoryId) queryParams.categories = categoryId
    if (exclude.length > 0) queryParams.exclude = exclude.join(',')
    if (search) queryParams.search = search

    const result = await wpFetch('/posts', queryParams)

    return {
      posts: (result.data || []).map(transformPost).filter(Boolean),
      total: result.total,
      totalPages: result.totalPages,
    }
  }

  /**
   * Pobierz pojedynczy post po slug
   */
  async function getPostBySlug(slug) {
    const result = await wpFetch('/posts', {
      _embed: '',
      slug,
      per_page: 1,
    })

    const posts = result.data || []
    if (posts.length === 0) return null
    return transformPost(posts[0])
  }

  /**
   * Pobierz kategorie
   */
  async function getCategories() {
    const result = await wpFetch('/categories', {
      per_page: 100,
      hide_empty: true,
    })
    return result.data || []
  }

  /**
   * Pobierz posty dla strony glownej bloga per kategoria z deduplikacja
   */
  async function getHomepagePosts(params = {}) {
    const { featuredPostId, excludeIds = [] } = params
    const homepageCategories = getHomepageCategories()

    // Najpierw pobierz kategorie WP zeby miec ID
    const wpCategories = await getCategories()
    const categoryMap = {}
    wpCategories.forEach(c => { categoryMap[c.slug] = c.id })

    const usedIds = [
      ...(featuredPostId ? [featuredPostId] : []),
      ...excludeIds,
    ]
    const sections = {}

    // Sekwencyjnie per kategoria (zeby exclude dzialal poprawnie)
    for (const catConfig of homepageCategories) {
      const catId = categoryMap[catConfig.slug]
      if (!catId) {
        sections[catConfig.slug] = []
        continue
      }

      const postsNeeded = getPostsCountForLayout(catConfig.layoutType)
      const result = await getPosts({
        categoryId: catId,
        perPage: postsNeeded,
        exclude: [...usedIds],
      })

      sections[catConfig.slug] = result.posts
      // Dodaj pobrane ID do exclude
      result.posts.forEach(p => usedIds.push(p.id))
    }

    return sections
  }

  return { getPosts, getPostBySlug, getCategories, getHomepagePosts }
}
