import type { GridStack, GridStackNode } from 'gridstack'
import type { InjectionKey } from 'vue'
import { ref, watch, nextTick, isRef, onMounted, onBeforeUnmount, type Ref } from 'vue'

/** Ключ provide/inject для каскадного resize вложенных gridstack-сеток */
export const RESIZE_PARENT_KEY: InjectionKey<() => void> = Symbol('resizeParentGrid')

interface WidgetPosition {
  id: string
  x: number
  y: number
  w: number
  h: number
}

interface GridstackOptions {
  editable: Ref<boolean> | boolean
  onPositionsChanged?: (positions: WidgetPosition[]) => void
  onContentResize?: () => void
}

export function useGridstack(
  containerRef: Ref<HTMLElement | null>,
  options: GridstackOptions
) {
  let grid: GridStack | null = null
  let resizeObserver: ResizeObserver | null = null
  let mutationObserver: MutationObserver | null = null
  let resizeFrame: number | null = null
  let parentResizeFrame: number | null = null
  const isReady = ref(false)

  /**
   * Custom resize logic that uses scrollHeight instead of getBoundingClientRect().
   * Gridstack's built-in resizeToContent fails for nested grids because
   * .grid-stack-item-content is position:absolute with inset, so its child's
   * getBoundingClientRect().height returns the constrained height, not the natural one.
   *
   * Key insight: calling grid.update() triggers gridstack's internal
   * resizeToContentCheck() which re-runs the broken measurement and overrides
   * our correct height. We temporarily disable node.sizeToContent to prevent this.
   */
  function resizeItemToContent(el: HTMLElement) {
    if (!grid || !el.clientHeight) return
    const node = (el as any).gridstackNode
    if (!node) return
    // Skip nodes being actively dragged/resized — calling grid.update() during
    // a move deletes node._orig which gridstack needs in onEndMoving.
    if (node._moving || node._resizing) return

    const cell = grid.getCellHeight(true)
    if (!cell) return

    const contentEl = el.querySelector('.grid-stack-item-content') as HTMLElement
    if (!contentEl) return

    // Measure the first child instead of contentEl.scrollHeight.
    // contentEl is position:absolute with inset, so its scrollHeight can never
    // be less than clientHeight — meaning items could grow but never shrink.
    // The child element has natural flow sizing and reflects actual content height.
    const child = contentEl.firstElementChild as HTMLElement
    const wantedH = child ? child.offsetHeight : contentEl.scrollHeight
    // Account for gap between grid-stack-item and grid-stack-item-content
    // (.grid-stack-item-content uses position:absolute with top/bottom insets)
    const marginV = el.clientHeight - contentEl.clientHeight
    const h = Math.max(1, Math.ceil((wantedH + marginV) / cell))

    if (node.minH && h < node.minH) return
    if (h !== node.h) {
      // Temporarily disable sizeToContent so gridstack's internal
      // resizeToContentCheck (triggered by update()) doesn't override
      // our scrollHeight-based measurement with its own broken one
      const origSTC = node.sizeToContent
      node.sizeToContent = false
      grid.update(el, { h })
      node.sizeToContent = origSTC
    }
  }

  function resizeAllToContent() {
    if (!grid) return
    grid.getGridItems().forEach(el => resizeItemToContent(el))
    // Notify parent grid to re-measure after nested changes are painted
    if (options.onContentResize) {
      if (parentResizeFrame) cancelAnimationFrame(parentResizeFrame)
      parentResizeFrame = requestAnimationFrame(() => {
        parentResizeFrame = null
        options.onContentResize!()
      })
    }
  }

  function observeItemChild(item: HTMLElement) {
    if (!resizeObserver) return
    const contentEl = item.querySelector('.grid-stack-item-content')
    const child = contentEl?.firstElementChild
    if (child) resizeObserver.observe(child)
  }

  function scheduleResizeAll() {
    if (resizeFrame) return
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null
      resizeAllToContent()
    })
  }

  async function init() {
    if (!containerRef.value || grid) return

    await import('gridstack/dist/gridstack.min.css')
    const { GridStack } = await import('gridstack')

    if (!containerRef.value) return

    const editable = isRef(options.editable) ? options.editable.value : options.editable

    grid = GridStack.init({
      column: 12,
      cellHeight: 10,
      float: false,
      animate: true,
      margin: '2px',
      sizeToContent: true,
      resizable: { handles: 'e' },
      draggable: { handle: '.box-drag-handle' },
      staticGrid: !editable
    }, containerRef.value)

    grid.on('change', (_event: Event, nodes: GridStackNode[]) => {
      if (!nodes || !options.onPositionsChanged) return
      const positions = nodes.map(node => ({
        id: node.id ?? node.el?.getAttribute('gs-id') ?? '',
        x: node.x ?? 0,
        y: node.y ?? 0,
        w: node.w ?? 12,
        h: node.h ?? 1
      }))
      options.onPositionsChanged(positions)
    })

    // Sync x/y/w from gridstack's initial layout, but preserve model's h values.
    // sizeToContent during init computes wrong heights (content not rendered yet).
    // ResizeObserver will correct heights shortly after.
    if (options.onPositionsChanged && grid.engine.nodes.length) {
      const positions = grid.engine.nodes.map(n => ({
        id: n.id ?? n.el?.getAttribute('gs-id') ?? '',
        x: n.x ?? 0,
        y: n.y ?? 0,
        w: n.w ?? 12,
        h: n.h ?? 1
      }))
      options.onPositionsChanged(positions)
    }

    // ResizeObserver on the *child* of .grid-stack-item-content (the Vue component
    // wrapper). We can't observe .grid-stack-item-content itself because it's
    // position:absolute and its size is constrained by the parent — it never resizes
    // when content changes. The child has natural flow sizing and triggers correctly.
    resizeObserver = new ResizeObserver(scheduleResizeAll)
    for (const item of grid.getGridItems()) {
      observeItemChild(item)
    }

    // MutationObserver for childList (new/removed widgets)
    mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node instanceof HTMLElement && node.classList.contains('grid-stack-item')) {
              observeItemChild(node)
            }
          })
        }
      }
      scheduleResizeAll()
    })
    mutationObserver.observe(containerRef.value, {
      childList: true,
      subtree: false
    })

    isReady.value = true

    // Force initial resize — sizeToContent doesn't always trigger from HTML.
    // Multiple passes needed: nested async components mount after the first tick.
    nextTick(resizeAllToContent)
    setTimeout(resizeAllToContent, 200)
  }

  watch(containerRef, (el) => {
    if (el && !grid) {
      nextTick(() => init())
    }
  })

  if (isRef(options.editable)) {
    watch(options.editable, (val) => {
      grid?.setStatic(!val)
      nextTick(resizeAllToContent)
    })
  }

  function makeWidget(el: HTMLElement) {
    if (!grid) return
    grid.makeWidget(el)
  }

  function removeWidget(el: HTMLElement) {
    if (!grid) return
    grid.removeWidget(el, false)
  }

  function resizeToContent(el: HTMLElement) {
    resizeItemToContent(el)
  }

  onMounted(() => nextTick(() => init()))

  onBeforeUnmount(() => {
    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = null
    }
    if (parentResizeFrame) {
      cancelAnimationFrame(parentResizeFrame)
      parentResizeFrame = null
    }
    resizeObserver?.disconnect()
    resizeObserver = null
    mutationObserver?.disconnect()
    mutationObserver = null
    if (grid) {
      try {
        grid.destroy(false)
      } catch { /* gridstack v12 may throw during destroy when nodes are already partially cleaned */ }
      grid = null
    }
  })

  return {
    isReady,
    makeWidget,
    removeWidget,
    resizeToContent,
    resizeAllToContent
  }
}
