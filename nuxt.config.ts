import { defineNuxtConfig } from "nuxt/config"
import routes from './prerender-routes.json'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  routeRules: {
    '/koloruj/**': { appMiddleware: 'check-id' }
  },
  devtools: { enabled: true },
  nitro: {
    preset: 'static',
    prerender: {
      routes
    }
  },
  content: {
    documentDriven: false
  },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    '@zadigetvoltaire/nuxt-gtm',
  ],
  googleFonts: {
    families: {
      Modak: true,
    },
    display: 'swap',
    preconnect: true,
    preload: true,
  },
  runtimeConfig: {
    public: {
      gtm: {
        id: "GTM-PMTV7XJ8",
        defer: false,
        compatibility: false,
        enabled: true,
        debug: true,
        loadScript: true,
        trackOnNextTick: false,
        devtools: true,
      },
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'pl'
      },
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
        { name: 'msapplication-TileColor', content: '#ffffff' }
      ]
    }
  }
})
