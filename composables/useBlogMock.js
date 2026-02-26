import { getHomepageCategories, getPostsCountForLayout, CATEGORY_CONFIG } from './useBlogCategories'

const SAMPLE_TITLES = [
  'Kolorowanie a koncentracja — co mówią badania?',
  'Motoryka mała: ćwiczenia z kredkami dla 3-latków',
  'Emocje na papierze — co mówią kolory dziecka',
  'Od bazgrołów do arcydzieł — etapy rozwoju rysunku',
  'Kolorowanie w grupie — zabawa, która uczy współpracy',
  'Kolorowanie przed snem — sposób na wyciszenie',
  'Jak wybrać idealne kredki dla malucha?',
  'Jak drukować kolorowanki? Ustawienia drukarki',
  'Organizacja materiałów plastycznych w domu',
  '10 pomysłów na kreatywne popołudnie',
  'Nauka liter przez kolorowanie',
  'Kolorowanie po numerach — matematyka w akcji',
  'Kolorowankowe bingo — gra planszowa do wydruku',
  'Wiosenne kolorowanki — nowe wzory',
  'Jak budować pewność siebie u dziecka',
  'Zabawa w kolorowanie — jak zacząć przygodę?',
  'Najpiękniejsze mandale dla dzieci',
  'Kreatywne techniki kolorowania — nie tylko kredki',
  'Kolorowanki terapeutyczne — kiedy warto sięgnąć?',
  'Podróż z kredkami — zabawy w podróży',
  'Jak rozmawiać z dzieckiem o emocjach przez sztukę?',
  'Domowe farby plakatowe — przepis krok po kroku',
  'Kolorowanie a rozwój mowy — nieoczywiste połączenie',
  'Zabawy z kredkami na świeżym powietrzu',
  'Jak motywować dziecko do rysowania?',
]

const SAMPLE_EXCERPTS = [
  'Naukowcy potwierdzają: regularne kolorowanie poprawia skupienie u dzieci w każdym wieku.',
  'Proste ćwiczenia pomagające dziecku lepiej trzymać kredki i rozwijać precyzję ruchów.',
  'Kolor, który dziecko wybiera, może wiele powiedzieć o jego uczuciach i emocjach.',
  'Każdy etap rysunku to ważny krok w rozwoju poznawczym malucha.',
  'Wspólne kolorowanie plakatów jako aktywność integracyjna dla grupy dzieci.',
  'Zamień ekran na kredki — wieczorne kolorowanie pomaga dziecku zasnąć szybciej.',
  'Podpowiadamy, które kredki sprawdzą się najlepiej w różnych grupach wiekowych.',
  'Zabawy plastyczne nie muszą kończyć się bałaganem — oto sprawdzone sposoby.',
  'Jak wykorzystać kolorowanki w nauce alfabetu? Praktyczne wskazówki.',
  'Proste projekty, które możesz zrobić z dzieckiem w deszczowe popołudnie.',
]

const SAMPLE_CONTENT = `
<p>Kolorowanie to jedna z najprostszych i najskuteczniejszych aktywności wspierających rozwój małego dziecka. Choć z pozoru wydaje się jedynie rozrywką, w rzeczywistości angażuje <strong>wiele obszarów mózgu</strong> jednocześnie.</p>
<h2>Jak kolorowanie wpływa na motorykę?</h2>
<p>Trzymanie kredki, kontrolowanie nacisku, utrzymanie się w liniach — to wszystko wymaga precyzyjnej pracy małych mięśni dłoni. Regularne kolorowanie pomaga dziecku:</p>
<ul>
<li>Lepiej trzymać ołówek i długopis</li>
<li>Rozwijać precyzję ruchów</li>
<li>Wzmacniać koordynację między oczami a ręką</li>
<li>Przygotować się do nauki pisania</li>
</ul>
<h2>Kolorowanie a koncentracja</h2>
<p>W dobie ekranów i ciągłych bodźców, kolorowanie oferuje dziecku coś wyjątkowego — <strong>możliwość skupienia się na jednej czynności</strong> przez dłuższy czas.</p>
<blockquote>Kolorowanie aktywuje te same obszary mózgu co medytacja mindfulness. Dziecko wchodzi w stan flow, który sprzyja regeneracji i wyciszeniu.</blockquote>
<h2>Podsumowanie</h2>
<p>Kolorowanie to nie tylko „czas z kredkami". To kompleksowe narzędzie rozwojowe, które wspiera motorykę, koncentrację, kreatywność i wyrażanie emocji.</p>
`

const EMOJIS = ['🦕', '🧠', '✋', '😊', '🎯', '🤝', '💤', '🖍️', '🖨️', '📦', '🦄', '🎭', '🌈', '🔤', '🎲', '🌸', '☀️', '🍂', '⛄', '🎪', '🧩', '🎨', '🏠', '📚', '🌻']

const GRADIENTS = [
  'linear-gradient(135deg, #A7F3D0, #6EE7B7)',
  'linear-gradient(135deg, #BBF7D0, #86EFAC)',
  'linear-gradient(135deg, #BFDBFE, #93C5FD)',
  'linear-gradient(135deg, #DDD6FE, #C4B5FD)',
  'linear-gradient(135deg, #FBCFE8, #F9A8D4)',
  'linear-gradient(135deg, #FED7AA, #FDBA74)',
  'linear-gradient(135deg, #99F6E4, #5EEAD4)',
  'linear-gradient(135deg, #FDE68A, #FBCFE8)',
]

// Deterministyczny generator - stabilne ID na podstawie seeda
function generateMockPost(id, catSlug) {
  const catConfig = CATEGORY_CONFIG.find(c => c.slug === catSlug) || CATEGORY_CONFIG[0]
  const titleIdx = (id - 1) % SAMPLE_TITLES.length
  const excerptIdx = (id - 1) % SAMPLE_EXCERPTS.length
  const month = id <= 14 ? 2 : 1
  const day = id <= 14 ? Math.max(1, 28 - id * 2) : Math.max(1, 31 - (id - 14) * 2)
  const monthName = month === 2 ? 'lutego' : 'stycznia'
  const monthShort = month === 2 ? 'lut' : 'sty'
  const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:00:00`

  return {
    id,
    slug: `mock-post-${id}`,
    title: SAMPLE_TITLES[titleIdx],
    excerpt: SAMPLE_EXCERPTS[excerptIdx],
    content: SAMPLE_CONTENT,
    date: dateStr,
    dateFormatted: `${day} ${monthName} 2026`,
    dateShort: `${day} ${monthShort}`,
    readingTime: 3 + (id % 8),
    thumbnail: null,
    category: {
      id: catConfig.slug.charCodeAt(0) * 100,
      slug: catSlug,
      name: catConfig.slug.charAt(0).toUpperCase() + catConfig.slug.slice(1),
      emoji: catConfig.emoji,
      color: catConfig.color,
    },
    tags: ['kolorowanie', 'dzieci', 'kreatywność'],
    _mockEmoji: EMOJIS[(id - 1) % EMOJIS.length],
    _mockGradient: GRADIENTS[(id - 1) % GRADIENTS.length],
  }
}

// Pre-generuj pulę postów per kategoria (deterministyczna, bez dubli)
const CATEGORY_POOLS = {}
let globalId = 1

// Pula "najnowsze" - posty z roznych kategorii
const ALL_POSTS_POOL = []

for (const cat of CATEGORY_CONFIG) {
  CATEGORY_POOLS[cat.slug] = []
  const count = 25 // wystarczajaco na 2+ strony paginacji
  for (let i = 0; i < count; i++) {
    const post = generateMockPost(globalId++, cat.slug)
    CATEGORY_POOLS[cat.slug].push(post)
    ALL_POSTS_POOL.push(post)
  }
}

// Sortuj po dacie (najnowsze najpierw)
ALL_POSTS_POOL.sort((a, b) => new Date(b.date) - new Date(a.date))

export function useBlogMock() {
  async function getPosts(params = {}) {
    const { page = 1, perPage = 12, categoryId, exclude = [] } = params

    // Wybierz pule postow
    let pool
    if (categoryId) {
      // Znajdz slug na podstawie categoryId
      const cat = CATEGORY_CONFIG.find(c => c.slug.charCodeAt(0) * 100 === categoryId)
      pool = cat ? CATEGORY_POOLS[cat.slug] : ALL_POSTS_POOL
    } else {
      pool = ALL_POSTS_POOL
    }

    // Filtruj exclude
    const filtered = pool.filter(p => !exclude.includes(p.id))
    const total = filtered.length

    // Paginacja
    const start = (page - 1) * perPage
    const posts = filtered.slice(start, start + perPage)

    return {
      posts,
      total,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async function getPostBySlug(slug) {
    const found = ALL_POSTS_POOL.find(p => p.slug === slug)
    return found || generateMockPost(1, 'wychowanie')
  }

  async function getCategories() {
    return CATEGORY_CONFIG.map((c) => ({
      id: c.slug.charCodeAt(0) * 100,
      slug: c.slug,
      name: c.slug.charAt(0).toUpperCase() + c.slug.slice(1),
      count: CATEGORY_POOLS[c.slug]?.length || 0,
      description: `Artykuły z kategorii ${c.slug}`,
    }))
  }

  async function getHomepagePosts(params = {}) {
    const { featuredPostId, excludeIds = [] } = params
    const sections = {}
    const homepageCats = getHomepageCategories()
    const usedIds = new Set([
      ...(featuredPostId ? [featuredPostId] : []),
      ...excludeIds,
    ])

    for (const cat of homepageCats) {
      const count = getPostsCountForLayout(cat.layoutType)
      const pool = CATEGORY_POOLS[cat.slug] || []
      const posts = pool.filter(p => !usedIds.has(p.id)).slice(0, count)
      posts.forEach(p => usedIds.add(p.id))
      sections[cat.slug] = posts
    }

    return sections
  }

  return { getPosts, getPostBySlug, getCategories, getHomepagePosts }
}
