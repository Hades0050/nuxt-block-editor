import type { Box } from '#block-editor'
import { computed, watchEffect, onBeforeUnmount, type WritableComputedRef } from 'vue'

/**
 * Creates a writable computed synced with a box property.
 * get() reads from the box prop, set() emits partial update.
 *
 * @param getter - accessor for the box field value
 * @param emit - the component's emit function
 * @param key - the Box key to update
 */
export function useBoxModel<T>(
  getter: () => T,
  emit: (event: 'update', updates: Partial<Box>) => void,
  key: string
): WritableComputedRef<T> {
  return computed({
    get: () => getter(),
    set: (v: T) => emit('update', { [key]: v } as Partial<Box>)
  })
}

/**
 * Binds a box's onChange callback to the component's emit.
 * When any mutation method is called on the box, it auto-emits an update.
 * Returns { notify } for manual triggering (e.g. nested content changes).
 */
export function useBoxChange(
  getBox: () => Box,
  emit: (event: 'update', updates: Partial<Box>) => void
) {
  const notify = () => emit('update', {} as Partial<Box>)
  watchEffect(() => {
    getBox().bindChange(notify)
  })
  onBeforeUnmount(() => {
    getBox().unbindChange()
  })
  return { notify }
}
