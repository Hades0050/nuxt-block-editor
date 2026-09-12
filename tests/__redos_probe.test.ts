import { describe, it, expect } from 'vitest'
import { Content, collectData, TemplateDataSource, MustacheTemplate, boxFactory } from '#block-editor'

describe('redos probe', () => {
  it('measures displayValue cost from untrusted Content JSON', () => {
    for (const n of [16, 20, 24, 26]) {
      const rawJson = [
        { name_type: 'TEXT', value: '<p>{{' + '&nbsp;'.repeat(n) + '</p>' },
        { name_type: 'INPUT', value: [{ bindingKey: 'user', value: 'x' }] }
      ]
      const content = new Content(rawJson.map(b => boxFactory.prepare(b)) as any)
      const src = TemplateDataSource.from(undefined, collectData(content))
      const raw = (content.boxes[0] as any).value
      const t = performance.now()
      const out = src.isEmpty ? raw : new MustacheTemplate(raw).render(src.data)
      const ms = performance.now() - t
      require("fs").appendFileSync("/tmp/claude-1000/-home-vlad-my-nuxt-block-editor/e29f1830-e771-45ec-a5a9-c9c064af94b7/scratchpad/out.txt", `n=${n} bytes=${raw.length} isEmpty=${src.isEmpty} ms=${ms.toFixed(1)}\n`)
      expect(typeof out).toBe('string')
    }
  })
})
