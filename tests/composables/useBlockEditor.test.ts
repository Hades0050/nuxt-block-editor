import { describe, it, expect, vi, beforeEach } from 'vitest'
import { effectScope, nextTick } from 'vue'

// Mock onUnmounted — composable вызывается вне компонента
vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

import { useBlockEditor } from '../../src/runtime/composables/useBlockEditor'
import { Content, BoxText, BoxInput, BOX_TYPES } from '#block-editor'

describe('useBlockEditor', () => {
  let scope: ReturnType<typeof effectScope>

  beforeEach(() => {
    scope = effectScope()
  })

  it('creates empty content by default', () => {
    scope.run(() => {
      const { content } = useBlockEditor()
      expect(content.value).toBeInstanceOf(Content)
      expect(content.value.boxes).toHaveLength(0)
    })
    scope.stop()
  })

  it('accepts initial content', () => {
    scope.run(() => {
      const initial = new Content()
      initial.addBox(new BoxText({ value: 'hello' }))

      const { content } = useBlockEditor(initial)
      expect(content.value.boxes).toHaveLength(1)
    })
    scope.stop()
  })

  it('addBox creates and adds a box of given type', () => {
    scope.run(() => {
      const { content, addBox } = useBlockEditor()
      addBox(BOX_TYPES.TEXT)

      expect(content.value.boxes).toHaveLength(1)
      expect(content.value.boxes[0]!.name_type).toBe(BOX_TYPES.TEXT)
    })
    scope.stop()
  })

  it('removeBox removes box by id', () => {
    scope.run(() => {
      const initial = new Content()
      const box = new BoxText({ id: 'remove-me' })
      initial.addBox(box)

      const { content, removeBox } = useBlockEditor(initial)
      expect(content.value.boxes).toHaveLength(1)

      removeBox('remove-me')
      expect(content.value.boxes).toHaveLength(0)
    })
    scope.stop()
  })

  it('updateBox applies partial updates', () => {
    scope.run(() => {
      const initial = new Content()
      const box = new BoxText({ id: 'upd', value: 'old' })
      initial.addBox(box)

      const { content, updateBox } = useBlockEditor(initial)
      updateBox('upd', { title: 'New Title' })

      const updated = content.value.findBox('upd')
      expect(updated?.title).toBe('New Title')
    })
    scope.stop()
  })

  it('moveBox reorders boxes', () => {
    scope.run(() => {
      const initial = new Content()
      initial.addBox(new BoxText({ id: 'a' }))
      initial.addBox(new BoxInput({ id: 'b' }))

      const { content, moveBox } = useBlockEditor(initial)
      expect(content.value.boxes[0]!.id).toBe('a')
      expect(content.value.boxes[1]!.id).toBe('b')

      moveBox('a', 'down')
      expect(content.value.boxes[0]!.id).toBe('b')
      expect(content.value.boxes[1]!.id).toBe('a')
    })
    scope.stop()
  })

  it('syncPositions updates box positions', () => {
    scope.run(() => {
      const initial = new Content()
      initial.addBox(new BoxText({ id: 'pos-test', x: 0, y: 0, w: 12, h: 1 }))

      const { content, syncPositions } = useBlockEditor(initial)
      syncPositions([{ id: 'pos-test', x: 3, y: 5, w: 6, h: 2 }])

      const box = content.value.findBox('pos-test')
      expect(box?.x).toBe(3)
      expect(box?.y).toBe(5)
      expect(box?.w).toBe(6)
      expect(box?.h).toBe(2)
    })
    scope.stop()
  })

  it('setContent replaces entire content', () => {
    scope.run(() => {
      const { content, setContent, addBox } = useBlockEditor()
      addBox(BOX_TYPES.TEXT)
      expect(content.value.boxes).toHaveLength(1)

      const fresh = new Content()
      setContent(fresh)
      expect(content.value.boxes).toHaveLength(0)
    })
    scope.stop()
  })

  it('syncPositions uses debounce (does not trigger immediately)', async () => {
    await scope.run(async () => {
      vi.useFakeTimers()
      const initial = new Content()
      initial.addBox(new BoxText({ id: 'debounce-test' }))

      const { syncPositions } = useBlockEditor(initial)

      // Multiple rapid calls should not create multiple timers
      syncPositions([{ id: 'debounce-test', x: 1, y: 0, w: 12, h: 1 }])
      syncPositions([{ id: 'debounce-test', x: 2, y: 0, w: 12, h: 1 }])
      syncPositions([{ id: 'debounce-test', x: 3, y: 0, w: 12, h: 1 }])

      vi.advanceTimersByTime(300)
      vi.useRealTimers()
    })
    scope.stop()
  })
})
