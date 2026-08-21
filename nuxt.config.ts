import { defineNuxtConfig } from "nuxt/config"
import routes from './prerender-routes.json'

// Cookieless analytics (bez zgody wg RODO — brak cookies i identyfikatorów).
// Token: Cloudflare dashboard -> Web Analytics -> Add site; ustaw CF_ANALYTICS_TOKEN w env Netlify.
const cfAnalyticsToken = process.env.CF_ANALYTICS_TOKEN

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  routeRules: {
    '/koloruj/':  { ssr: false, prerender: true },
    '/koloruj/**': { ssr: false, prerender: false },
    '/api/**': { prerender: false },
  },
  colorMode: { preference: 'light' },
  devtools: { enabled: true },
  nitro: {
    preset: 'static',
    prerender: {
      routes: [...routes, '/koloruj/'],
      crawlLinks: true,
      failOnError: false
    }
  },
  components: [
    { path: '~/components/blog/sections', pathPrefix: false },
    { path: '~/components' },
  ],
  content: { documentDriven: false },
  site: { url: 'https://twoja-kolorowanka.pl', name: 'twoja-kolorowanka.pl', trailingSlash: true },
  // Sitemapa = jednostka SEO: huby, kategorie, przekroje i blog. Wykluczenia po kolei:
  //   /\d+\/?$/  liscie — maja canonical na kategorie, wiec do sitemapy nie naleza
  //   /koloruj/  edytor — i tak noindex przez naglowek w netlify.toml
  //   /search/   wyniki wyszukiwania wewnetrznego. Google wprost odradza indeksowanie
  //              takich stron i konsekwentnie raportowal ja jako "adres nieznany".
  //   /myszki/   pelny duplikat /zwierzeta/myszki/ (49 lisci 1:1, zero wyswietlen przez
  //              3 miesiace). Byl w sitemapie MIMO canonicala na /zwierzeta/myszki/,
  //              czyli sitemapa mowila "indeksuj mnie", a canonical "indeksuj tamta" —
  //              Google rozstrzygnal to po swojemu i nie zaindeksowal zadnej.
  //              Caly podkatalog jest teraz przekierowany 301 w netlify.toml.
  sitemap: { exclude: [/\/\d+\/?$/, '/koloruj/**', /^\/search(\/|$)/, /^\/myszki(\/|$)/] },
  modules: ['@nuxtjs/sitemap','@nuxt/content','@nuxt/ui','@nuxtjs/tailwindcss','@vueuse/nuxt','@nuxtjs/google-fonts','@zadigetvoltaire/nuxt-gtm','nuxt-disqus'],
  disqus: {
    shortname: process.env.DISQUS_SHORTNAME || '',
  },
  googleFonts: {
    families: {
      Modak: true,
      'Baloo+2': [400, 500, 600, 700, 800],
      Quicksand: [400, 500, 600, 700],
    },
    display: 'swap', download: true, inject: true
  },
  runtimeConfig: {
    public: {
      wordpressApiUrl: process.env.WORDPRESS_API_URL || 'https://tk.delash.pl/wp-json/wp/v2',
      mockBlog: process.env.MOCK_BLOG === 'true',
      gtm: { id: "GTM-PMTV7XJ8", defer: false, compatibility: false, enabled: false, debug: true, loadScript: false, trackOnNextTick: false, devtools: true }
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pl' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { name: 'p:domain_verify', content: '4c6a41c67fdd215de97174116d655479' }
      ],
      script: cfAnalyticsToken ? [
        {
          src: 'https://static.cloudflareinsights.com/beacon.min.js',
          defer: true,
          'data-cf-beacon': `{"token": "${cfAnalyticsToken}"}`
        }
      ] : []
    }
  }
})
