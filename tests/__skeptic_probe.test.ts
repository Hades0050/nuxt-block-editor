import { describe, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { MustacheTemplate } from '#block-editor'

describe('blowup', () => {
  it('measures', () => {
    const data = { rows: [{ a: 1 }, { a: 2 }] }
    const lines: string[] = []
    for (const k of [4, 8, 12, 16, 18, 20, 22]) {
      const src = '<p>' + '{{#rows}}'.repeat(k) + 'x' + '{{/rows}}'.repeat(k) + '</p>'
      const t0 = Date.now()
      const out = new MustacheTemplate(src).render(data)
      lines.push(`k=${k} payload=${src.length} out=${out.length} ms=${Date.now() - t0}`)
    }
    writeFileSync('/tmp/claude-1000/-home-vlad-my-nuxt-block-editor/e29f1830-e771-45ec-a5a9-c9c064af94b7/scratchpad/out.txt', lines.join('\n'))
  })
})
