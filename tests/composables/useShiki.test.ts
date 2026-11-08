import { describe, it, expect, vi, beforeEach } from 'vitest'

const loaded = new Set<string>()
const loadLanguage = vi.fn(async (lang: string) => {
  if (lang === 'nope') throw new Error('Language `nope` not found')
  loaded.add(lang)
})
const codeToHtml = vi.fn((code: string, opts: { lang: string }) => `<pre>${opts.lang}:${code}</pre>`)
const createHighlighter = vi.fn(async () => ({
  loadLanguage,
  getLoadedLanguages: () => [...loaded],
  codeToHtml
}))

vi.mock('shiki', () => ({ createHighlighter }))

async function freshUseShiki() {
  vi.resetModules()
  return (await import('../../src/runtime/composables/useShiki')).useShiki
}

describe('useShiki (main thread, no Worker)', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', undefined)
    loaded.clear()
    createHighlighter.mockClear()
    loadLanguage.mockClear()
    codeToHtml.mockClear()
  })

  it('creates the highlighter once for sequential and parallel calls', async () => {
    const { highlight } = (await freshUseShiki())()
    await Promise.all([highlight('a', 'json'), highlight('b', 'ts')])
    await highlight('c', 'json')
    expect(createHighlighter).toHaveBeenCalledTimes(1)
  })

  it('shares one highlighter across useShiki() calls', async () => {
    const useShiki = await freshUseShiki()
    await Promise.all([useShiki().highlight('a', 'json'), useShiki().highlight('b', 'json')])
    expect(createHighlighter).toHaveBeenCalledTimes(1)
  })

  it('loads each language once on repeated and parallel requests', async () => {
    const { highlight } = (await freshUseShiki())()
    await Promise.all([highlight('a', 'json'), highlight('b', 'json')])
    await highlight('c', 'json')
    await highlight('d', 'ts')
    expect(loadLanguage.mock.calls.map(c => c[0])).toEqual(['json', 'ts'])
  })

  it('returns highlighted html for the requested language', async () => {
    const { highlight } = (await freshUseShiki())()
    expect(await highlight('x', 'json')).toBe('<pre>json:x</pre>')
  })

  it('retries highlighter creation after a failed attempt', async () => {
    const { highlight } = (await freshUseShiki())()
    createHighlighter.mockRejectedValueOnce(new Error('chunk load failed'))
    await expect(highlight('a', 'json')).rejects.toThrow('chunk load failed')
    await expect(highlight('b', 'json')).resolves.toBe('<pre>json:b</pre>')
    expect(createHighlighter).toHaveBeenCalledTimes(2)
  })

  it('falls back to text for an unknown language without throwing', async () => {
    const { highlight } = (await freshUseShiki())()
    await expect(highlight('x', 'nope')).resolves.toBe('<pre>text:x</pre>')
    await highlight('y', 'nope')
    expect(loadLanguage.mock.calls.filter(c => c[0] === 'nope')).toHaveLength(1)
  })
})

describe('useShiki (Web Worker)', () => {
  class FakeWorker {
    static instances: FakeWorker[] = []
    posted: { id: number, code: string, lang: string }[] = []
    listeners: Record<string, ((e: any) => void)[]> = {}
    constructor(public url: URL, public options?: WorkerOptions) { FakeWorker.instances.push(this) }
    postMessage(msg: any) { this.posted.push(msg) }
    addEventListener(type: string, fn: (e: any) => void) { (this.listeners[type] ??= []).push(fn) }
    emit(type: string, data: unknown) { this.listeners[type]?.forEach(fn => fn({ data })) }
  }

  beforeEach(() => {
    FakeWorker.instances = []
    createHighlighter.mockClear()
    vi.stubGlobal('Worker', FakeWorker)
  })

  it('spawns one module worker and does not touch shiki on the main thread', async () => {
    const { highlight } = (await freshUseShiki())()
    const a = highlight('a', 'json')
    const b = highlight('b', 'ts')
    expect(FakeWorker.instances).toHaveLength(1)
    const w = FakeWorker.instances[0]!
    expect(w.options).toEqual({ type: 'module' })
    expect(w.url.pathname).toMatch(/shiki\.worker\.ts$/)
    expect(w.posted).toEqual([
      { id: 1, code: 'a', lang: 'json' },
      { id: 2, code: 'b', lang: 'ts' }
    ])
    w.emit('message', { id: 2, html: 'B' }) // ответы приходят не по порядку
    w.emit('message', { id: 1, html: 'A' })
    await expect(Promise.all([a, b])).resolves.toEqual(['A', 'B'])
    expect(createHighlighter).not.toHaveBeenCalled()
  })

  it('rejects pending requests when the worker fails', async () => {
    const { highlight } = (await freshUseShiki())()
    const p = highlight('a', 'json')
    FakeWorker.instances[0]!.emit('error', undefined)
    await expect(p).rejects.toThrow()
  })
})
