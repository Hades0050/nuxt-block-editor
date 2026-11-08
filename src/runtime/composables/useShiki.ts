type Pending = { resolve: (html: string) => void, reject: (err: Error) => void }

let worker: Worker | undefined
let nextId = 0
const pending = new Map<number, Pending>()

function failAll(message: string) {
  for (const p of pending.values()) p.reject(new Error(message))
  pending.clear()
  worker = undefined
}

function getWorker(): Worker {
  if (!worker) {
    const w = new Worker(new URL('./shiki.worker.ts', import.meta.url), { type: 'module' })
    w.addEventListener('message', (e: MessageEvent<{ id: number, html: string }>) => {
      const p = pending.get(e.data.id)
      pending.delete(e.data.id)
      p?.resolve(e.data.html)
    })
    w.addEventListener('error', () => failAll('Shiki worker failed'))
    worker = w
  }
  return worker
}

async function highlightInline(code: string, lang: string): Promise<string> {
  // Динамически: когда воркер есть, shiki в основной бандл не попадает
  const { highlightHtml } = await import('./shiki/engine')
  return highlightHtml(code, lang)
}

function highlight(code: string, lang: string): Promise<string> {
  // SSR / окружения без Worker — тот же движок в основном потоке
  if (typeof Worker === 'undefined') return highlightInline(code, lang)
  return new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, code, lang })
  })
}

/** Общий Shiki-highlighter (тема `github-dark`) в Web Worker; языки догружаются при первом запросе. */
export function useShiki() {
  return { highlight }
}
