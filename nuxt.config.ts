import { defineNuxtConfig } from "nuxt/config";
import routes  from './prerender-routes.json'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  nitro: {
    preset: 'static',
    prerender: {
      routes            // <‑ pełna lista ścieżek
    }
  },
  content: {
    documentDriven: false
  },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss'
  ]
})