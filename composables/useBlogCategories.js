/**
 * Konfiguracja kategorii WordPress → frontend
 * Slug kategorii w WP MUSI odpowiadac tym slugom
 */
export const CATEGORY_CONFIG = [
  // === SEKCJE NA STRONIE GLOWNEJ (homepage: true, maja layoutType) ===
  {
    slug: 'zabawa',
    emoji: '\u{1F3AA}',
    color: '#FF6B9D',
    bgColor: '#FFF0F5',
    tagBg: '#FCE7F3',
    tagColor: '#9D174D',
    layoutType: 'zigzag',
    homepage: true,
    homepageOrder: 1,
  },
  {
    slug: 'edukacja',
    emoji: '\u{1F4DA}',
    color: '#9B72CF',
    bgColor: 'transparent',
    tagBg: '#EDE9FE',
    tagColor: '#5B21B6',
    layoutType: 'masonry-plus-compact',
    homepage: true,
    homepageOrder: 2,
  },
  {
    slug: 'wychowanie',
    emoji: '\u{1F331}',
    color: '#6BCB77',
    bgColor: '#ECFDF5',
    tagBg: '#D1FAE5',
    tagColor: '#065F46',
    layoutType: 'grid-3x2',
    homepage: true,
    homepageOrder: 3,
  },
  {
    slug: 'zdrowie',
    emoji: '\u{1F49A}',
    color: '#059669',
    bgColor: 'transparent',
    tagBg: '#D1FAE5',
    tagColor: '#065F46',
    layoutType: '1-plus-3-plus-3',
    homepage: true,
    homepageOrder: 4,
  },
  {
    slug: 'inspiracje',
    emoji: '\u{1F3A8}',
    color: '#FFAB76',
    bgColor: '#FFF5EB',
    tagBg: '#FFEDD5',
    tagColor: '#9A3412',
    layoutType: 'slider',
    homepage: true,
    homepageOrder: 5,
  },
  {
    slug: 'kuchnia',
    emoji: '\u{1F338}',
    color: '#2EC4B6',
    bgColor: 'transparent',
    tagBg: '#CCFBF1',
    tagColor: '#115E59',
    homepage: false,
  },

  // === KATEGORIE BEZ SEKCJI NA STRONIE GLOWNEJ ===
  {
    slug: 'podroze',
    emoji: '\u{2708}\u{FE0F}',
    color: '#4D96FF',
    bgColor: '#F0F4FF',
    tagBg: '#DBEAFE',
    tagColor: '#1E40AF',
    homepage: false,
  },
  {
    slug: 'recenzje',
    emoji: '\u{2B50}',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    tagBg: '#FEF3C7',
    tagColor: '#92400E',
    homepage: false,
  },
  {
    slug: 'rodzic',
    emoji: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}',
    color: '#EC4899',
    bgColor: '#FFF0F5',
    tagBg: '#FCE7F3',
    tagColor: '#9D174D',
    layoutType: 'banner-plus-grid',
    homepage: true,
    homepageOrder: 6,
  },
  {
    slug: 'technologie',
    emoji: '\u{1F4BB}',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    tagBg: '#E0E7FF',
    tagColor: '#3730A3',
    homepage: false,
  },
]

/**
 * Pobiera konfig kategorii po slug
 */
export function getCategoryConfig(slug) {
  return CATEGORY_CONFIG.find(c => c.slug === slug) || null
}

/**
 * Pobiera kategorie do wyswietlenia na stronie glownej bloga,
 * posortowane po homepageOrder
 */
export function getHomepageCategories() {
  return CATEGORY_CONFIG
    .filter(c => c.homepage)
    .sort((a, b) => (a.homepageOrder || 99) - (b.homepageOrder || 99))
}

/**
 * Pobiera wszystkie kategorie posortowane:
 * 1. homepage: true (po homepageOrder)
 * 2. reszta alfabetycznie
 */
export function getSortedCategories() {
  const homepage = CATEGORY_CONFIG
    .filter(c => c.homepage)
    .sort((a, b) => (a.homepageOrder || 99) - (b.homepageOrder || 99))
  const rest = CATEGORY_CONFIG
    .filter(c => !c.homepage)
    .sort((a, b) => a.slug.localeCompare(b.slug, 'pl'))
  return [...homepage, ...rest]
}

/**
 * Ilosc postow potrzebna per layout
 */
export function getPostsCountForLayout(layoutType) {
  const counts = {
    'grid-3x2': 6,
    '1-plus-3-plus-3': 7,
    'slider': 6,
    'masonry-plus-compact': 6,
    'zigzag': 6,
    'banner-plus-grid': 5,
  }
  return counts[layoutType] || 6
}

export function useBlogCategories() {
  return {
    CATEGORY_CONFIG,
    getCategoryConfig,
    getHomepageCategories,
    getSortedCategories,
    getPostsCountForLayout,
  }
}
