import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const wpApiUrl = process.env.WORDPRESS_API_URL || 'https://tk.delash.pl/wp-json/wp/v2'

  try {
    const posts = await $fetch(`${wpApiUrl}/posts?per_page=100&_fields=slug,modified`)

    return (posts as any[]).map((post) => ({
      loc: `/blog/${post.slug}/`,
      lastmod: post.modified,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[sitemap/blog] Error fetching posts:', err)
    return []
  }
})
