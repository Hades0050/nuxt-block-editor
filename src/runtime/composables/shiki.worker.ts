import { highlightHtml } from './shiki/engine'

// codeToHtml на ~500 строках TS ≈ 45 мс (см. замер) — держим его вне main thread
self.addEventListener('message', async (e: MessageEvent<{ id: number, code: string, lang: string }>) => {
  const { id, code, lang } = e.data
  self.postMessage({ id, html: await highlightHtml(code, lang) })
})
