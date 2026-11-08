import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, type App } from 'vue'
import { useGridstack } from '../../src/runtime/composables/useGridstack'

vi.mock('gridstack/dist/gridstack.min.css', () => ({}))

const gridState = vi.hoisted(() => ({ fake: null as any }))
vi.mock('gridstack', () => ({
  GridStack: { init: vi.fn(() => gridState.fake) }
}))

const CELL = 10
const ITEM_CLIENT_H = 100
const CONTENT_CLIENT_H = 90 // marginV = 10

/** Высота в ячейках, которую composable вычислит для заданной высоты child */
const cellsFor = (childH: number) => Math.ceil((childH + (ITEM_CLIENT_H - CONTENT_CLIENT_H)) / CELL)

let log: string[]
let rafQueue: Map<number, FrameRequestCallback>
let rafId: number
let resizeObservers: { observe: ReturnType<typeof vi.fn>, unobserve: ReturnType<typeof vi.fn> }[]
let mutationCallback: MutationCallback | null
let app: App | null
let container: HTMLElement

function flushRaf() {
  const queued = [...rafQueue.values()]
  rafQueue.clear()
  queued.forEach(cb => cb(0))
}

async function flushInit() {
  for (let i = 0; i < 5; i++) {
    await vi.dynamicImportSettled()
    await nextTick()
  }
}

function createItem(id: string, childH: number, nodeH: number) {
  const item = document.createElement('div')
  item.className = 'grid-stack-item'
  item.setAttribute('gs-id', id)
  const content = document.createElement('div')
  content.className = 'grid-stack-item-content'
  const child = document.createElement('div')
  content.appendChild(child)
  item.appendChild(content)

  const state = { childH }
  Object.defineProperty(child, 'offsetHeight', {
    get() {
      log.push(`read:offsetHeight:${id}`)
      return state.childH
    }
  })
  Object.defineProperty(item, 'clientHeight', {
    get() {
      log.push(`read:clientHeight:${id}`)
      return ITEM_CLIENT_H
    }
  })
  Object.defineProperty(content, 'clientHeight', { get: () => CONTENT_CLIENT_H })
  ;(item as any).gridstackNode = { id, h: nodeH }
  return { item, child, state }
}

function createFakeGrid(items: HTMLElement[]) {
  return {
    on: vi.fn(),
    getGridItems: vi.fn(() => items),
    getCellHeight: vi.fn(() => CELL),
    update: vi.fn((el: HTMLElement, opts: { h: number }) => {
      log.push('write:update')
      ;(el as any).gridstackNode.h = opts.h
    }),
    makeWidget: vi.fn(),
    removeWidget: vi.fn(),
    setStatic: vi.fn(),
    destroy: vi.fn(),
    engine: { nodes: [] }
  }
}

type Api = ReturnType<typeof useGridstack>

async function mountGrid(
  items: ReturnType<typeof createItem>[],
  options: Parameters<typeof useGridstack>[1] = { editable: true }
) {
  gridState.fake = createFakeGrid(items.map(i => i.item))
  let api!: Api
  const Comp = defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      api = useGridstack(el, options)
      return () => h('div', { ref: el, class: 'grid-stack' })
    }
  })
  app = createApp(Comp)
  app.mount(container)
  const grid = container.firstElementChild as HTMLElement
  items.forEach(i => grid.appendChild(i.item))
  await flushInit()
  return { api, grid, fake: gridState.fake as ReturnType<typeof createFakeGrid> }
}

beforeEach(() => {
  log = []
  rafQueue = new Map()
  rafId = 0
  resizeObservers = []
  mutationCallback = null
  container = document.createElement('div')
  document.body.appendChild(container)

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.set(++rafId, cb)
    return rafId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => rafQueue.delete(id))
  vi.stubGlobal('ResizeObserver', class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor() {
      resizeObservers.push(this)
    }
  })
  vi.stubGlobal('MutationObserver', class {
    observe = vi.fn()
    disconnect = vi.fn()
    constructor(cb: MutationCallback) {
      mutationCallback = cb
    }
  })
})

afterEach(() => {
  app?.unmount()
  app = null
  container.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useGridstack resizeAllToContent', () => {
  it('measures every item before the first grid.update', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const b = createItem('b', 200, cellsFor(200))
    const { api, fake } = await mountGrid([a, b])
    a.state.childH = 300
    b.state.childH = 400
    log.length = 0
    fake.update.mockClear()

    api.resizeAllToContent()

    const lastRead = log.map(e => e.startsWith('read:')).lastIndexOf(true)
    const firstWrite = log.indexOf('write:update')
    expect(fake.update).toHaveBeenCalledTimes(2)
    expect(lastRead).toBeGreaterThanOrEqual(0)
    expect(lastRead).toBeLessThan(firstWrite)
  })

  it('applies the computed height and restores sizeToContent around update', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const { api, fake } = await mountGrid([a])
    const node = (a.item as any).gridstackNode
    node.sizeToContent = true
    let seenDuringUpdate: unknown
    fake.update.mockImplementation((_el: HTMLElement, opts: { h: number }) => {
      seenDuringUpdate = node.sizeToContent
      node.h = opts.h
    })
    a.state.childH = 300

    api.resizeAllToContent()

    expect(fake.update).toHaveBeenLastCalledWith(a.item, { h: cellsFor(300) })
    expect(seenDuringUpdate).toBe(false)
    expect(node.sizeToContent).toBe(true)
  })

  it('skips items being dragged or resized', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const { api, fake } = await mountGrid([a])
    ;(a.item as any).gridstackNode._moving = true
    a.state.childH = 300
    fake.update.mockClear()

    api.resizeAllToContent()

    expect(fake.update).not.toHaveBeenCalled()
  })
})

describe('useGridstack parent cascade', () => {
  it('does not call onContentResize when no item height changed', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const onContentResize = vi.fn()
    const { api } = await mountGrid([a], { editable: true, onContentResize })
    flushRaf()
    onContentResize.mockClear()

    api.resizeAllToContent()
    flushRaf()

    expect(onContentResize).not.toHaveBeenCalled()
  })

  it('calls onContentResize after rAF when an item height changed', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const onContentResize = vi.fn()
    const { api } = await mountGrid([a], { editable: true, onContentResize })
    flushRaf()
    onContentResize.mockClear()
    a.state.childH = 300

    api.resizeAllToContent()
    expect(onContentResize).not.toHaveBeenCalled()
    flushRaf()

    expect(onContentResize).toHaveBeenCalledTimes(1)
  })
})

describe('useGridstack delayed resize', () => {
  it('cancels the 200ms resize timer and never touches the grid after unmount', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const a = createItem('a', 100, cellsFor(100))
    const { fake } = await mountGrid([a])
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    fake.update.mockClear()
    fake.getGridItems.mockClear()
    a.state.childH = 300

    app!.unmount()
    app = null
    const pendingAfterUnmount = vi.getTimerCount()
    vi.advanceTimersByTime(300)

    expect(pendingAfterUnmount).toBe(0)
    expect(fake.getGridItems).not.toHaveBeenCalled()
    expect(fake.update).not.toHaveBeenCalled()
  })
})

describe('useGridstack removed nodes', () => {
  const removal = (node: HTMLElement) =>
    [{ type: 'childList', removedNodes: [node], addedNodes: [] }] as unknown as MutationRecord[]

  it('unobserves the child of an item that was removed from the container', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const { grid, fake } = await mountGrid([a])
    grid.removeChild(a.item)

    mutationCallback!(removal(a.item), {} as MutationObserver)

    expect(resizeObservers.some(ro => ro.unobserve.mock.calls.some(([el]) => el === a.child))).toBe(true)
    expect(fake.removeWidget).toHaveBeenCalledWith(a.item, false)
  })

  it('does not unobserve when the node is still in the container (reorder)', async () => {
    const a = createItem('a', 100, cellsFor(100))
    const { fake } = await mountGrid([a])

    mutationCallback!(removal(a.item), {} as MutationObserver)

    expect(resizeObservers.every(ro => ro.unobserve.mock.calls.length === 0)).toBe(true)
    expect(fake.removeWidget).not.toHaveBeenCalled()
  })

  it('initializes the grid once although onMounted and the ref watcher both schedule init', async () => {
    const { GridStack } = await import('gridstack')
    vi.mocked(GridStack.init).mockClear()

    await mountGrid([createItem('a', 100, cellsFor(100))])

    expect(GridStack.init).toHaveBeenCalledTimes(1)
    expect(resizeObservers).toHaveLength(1)
  })
})
