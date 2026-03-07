export default defineNuxtConfig({
  compatibilityDate: '2026-03-07',
  modules: [
    '@nuxt/ui',
    '../src/module.ts'
  ],
  css: ['~/assets/css/main.css'],
  devtools: {
    componentInspector: false
  }
})
