import { getCategoryConfig } from './useBlogCategories'

const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
]

/**
 * Strip HTML tags from string
 */
function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

/**
 * Oblicz czas czytania (po polsku)
 */
function calculateReadingTime(content) {
  if (!content) return 1
  const text = stripHtml(content)
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / 200)
  return Math.max(1, minutes)
}

/**
 * Formatuj date po polsku: "20 lutego 2026"
 */
function formatDatePl(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  const day = d.getDate()
  const month = POLISH_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Formatuj krotka date: "20 lut"
 */
function formatDateShort(isoDate) {
  if (!isoDate) return ''
  const shortMonths = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
  const d = new Date(isoDate)
  return `${d.getDate()} ${shortMonths[d.getMonth()]}`
}

/**
 * Transformuje WPPost -> BlogPost
 */
function transformPost(wp) {
  if (!wp) return null

  // Wyciagniecie thumbnails z _embedded
  let thumbnail = null
  const media = wp._embedded?.['wp:featuredmedia']?.[0]
  if (media) {
    const sizes = media.media_details?.sizes || {}
    const medium = sizes.medium_large || sizes.medium || sizes.large || {}
    thumbnail = {
      url: medium.source_url || media.source_url,
      alt: media.alt_text || stripHtml(wp.title?.rendered || ''),
      width: medium.width || media.media_details?.width || 800,
      height: medium.height || media.media_details?.height || 600,
    }
  }

  // Wyciagniecie kategorii z _embedded
  let category = null
  const terms = wp._embedded?.['wp:term']
  if (terms && terms[0] && terms[0].length > 0) {
    const wpCat = terms[0][0]
    const config = getCategoryConfig(wpCat.slug)
    category = {
      id: wpCat.id,
      slug: wpCat.slug,
      name: wpCat.name,
      emoji: config?.emoji || '',
      color: config?.color || '#8B7BA5',
    }
  }

  // Tagi
  const tags = []
  if (terms && terms[1]) {
    terms[1].forEach(t => tags.push(t.name))
  }

  return {
    id: wp.id,
    slug: wp.slug,
    title: stripHtml(wp.title?.rendered || ''),
    excerpt: stripHtml(wp.excerpt?.rendered || ''),
    content: wp.content?.rendered || '',
    date: wp.date,
    dateFormatted: formatDatePl(wp.date),
    dateShort: formatDateShort(wp.date),
    readingTime: calculateReadingTime(wp.content?.rendered || ''),
    thumbnail,
    category,
    tags,
  }
}

export function useBlogTransform() {
  return {
    transformPost,
    stripHtml,
    calculateReadingTime,
    formatDatePl,
    formatDateShort,
  }
}
