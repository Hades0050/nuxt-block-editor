import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir } from '@nuxt/kit'
import { OPTIMIZE_INCLUDE, OPTIMIZE_EXCLUDE } from './optimize-deps'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-block-editor',
    configKey: 'blockEditor',
    compatibility: { nuxt: '>=4.0.0' }
  },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // #block-editor alias → model directory
    nuxt.options.alias['#block-editor'] = resolve('./model')

    // Списки и причины — в optimize-deps.ts
    nuxt.options.vite ??= {}
    nuxt.options.vite.optimizeDeps ??= {}
    nuxt.options.vite.optimizeDeps.exclude ??= []
    nuxt.options.vite.optimizeDeps.include ??= []
    ;(nuxt.options.vite.optimizeDeps.exclude as string[]).push(...OPTIMIZE_EXCLUDE)
    ;(nuxt.options.vite.optimizeDeps.include as string[]).push(...OPTIMIZE_INCLUDE)

    // Дефолтный iife склеивает shiki-воркер со всеми грамматиками (~9 МБ); es сохраняет ленивые чанки
    nuxt.options.vite.worker ??= {}
    nuxt.options.vite.worker.format ??= 'es'

    // Auto-register components with BlockEditor prefix
    addComponentsDir({
      path: resolve('./runtime/components/block-editor'),
      prefix: 'BlockEditor',
      pathPrefix: true
    })

    // Auto-import composables
    addImportsDir(resolve('./runtime/composables'))
  }
})
