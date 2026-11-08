import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { OPTIMIZE_INCLUDE, OPTIMIZE_EXCLUDE } from '../src/optimize-deps'

const SRC = resolve(__dirname, '../src')
const SCAN_DIRS = ['runtime', 'model']

/** Резолвятся Nuxt/Vite сами или не требуют пребандла. */
const WHITELIST = [
  'vue',
  '#imports',
  '#app',
  '#block-editor',
  // зависимости @nuxt/ui: Vite находит их уже при загрузке страницы (проверено по dev-логу)
  '@tiptap/vue-3',
  '@tiptap/core',
  '@tiptap/starter-kit',
  '@tiptap/suggestion',
  '@floating-ui/dom',
  '@internationalized/date'
]

const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|vue)$/.test(name) ? [p] : []
  })
}

function bareSpecifiers(): Set<string> {
  const found = new Set<string>()
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(SRC, dir))) {
      for (const m of readFileSync(file, 'utf8').matchAll(IMPORT_RE)) {
        const spec = m[1]!
        if (spec.startsWith('.') || spec.startsWith('/') || spec.endsWith('.css')) continue
        found.add(spec)
      }
    }
  }
  return found
}

const covers = (list: string[], spec: string) =>
  list.some((d) => spec === d || spec.startsWith(d + '/'))

describe('optimizeDeps', () => {
  it('covers every bare runtime import (include, exclude or whitelist)', () => {
    const missing = [...bareSpecifiers()]
      .filter((s) => !OPTIMIZE_INCLUDE.includes(s) && !covers(OPTIMIZE_EXCLUDE, s) && !WHITELIST.includes(s))
      .sort()
    expect(missing, `не покрыты optimizeDeps: ${missing.join(', ')}`).toEqual([])
  })
})
