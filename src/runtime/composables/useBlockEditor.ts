import { Content } from '#block-editor'
import { boxFactory } from '#block-editor'
import type { BoxType } from '#block-editor'
import type { Box } from '#block-editor'
import { shallowRef, triggerRef, onUnmounted } from 'vue'

export function useBlockEditor(initialContent?: Content) {
  const content = shallowRef<Content>(initialContent ?? new Content())

  // Отложенный triggerRef для syncPositions — не перерисовываем Vue
  // на каждом кадре перетаскивания, только после паузы 300мс
  let _positionFlushTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleTrigger(): void {
    if (_positionFlushTimer !== null) return
    _positionFlushTimer = setTimeout(() => {
      _positionFlushTimer = null
      triggerRef(content)
    }, 300)
  }

  onUnmounted(() => {
    if (_positionFlushTimer !== null) {
      clearTimeout(_positionFlushTimer)
      _positionFlushTimer = null
    }
  })

  function addBox(type: BoxType) {
    const box = boxFactory.createDefault(type) as Box
    content.value.addBox(box)
    triggerRef(content)
  }

  function removeBox(boxId: string) {
    content.value.removeBox(boxId)
    triggerRef(content)
  }

  function updateBox(boxId: string, updates: Partial<Record<string, unknown>>) {
    content.value.updateBox(boxId, updates)
    triggerRef(content)
  }

  function moveBox(boxId: string, direction: 'up' | 'down') {
    content.value.moveBox(boxId, direction)
    triggerRef(content)
  }

  function syncPositions(positions: Array<{ id: string; x: number; y: number; w: number; h: number }>) {
    content.value.syncPositions(positions)
    // Gridstack уже переместил DOM — откладываем Vue-обновление
    scheduleTrigger()
  }

  function setContent(newContent: Content) {
    content.value = newContent
  }

  return {
    content,
    addBox,
    removeBox,
    updateBox,
    moveBox,
    syncPositions,
    setContent
  }
}
