import { defineNuxtConfig } from "nuxt/config";
import routes  from './prerender-routes.json'

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
})