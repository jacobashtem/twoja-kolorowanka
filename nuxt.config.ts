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
    '@nuxtjs/google-fonts'
  ],
    googleFonts: {
    families: {
      Modak: true,
    },
    display: 'swap',
    preconnect: true,
    preload: true,
  },
})