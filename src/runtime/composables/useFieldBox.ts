import type { Box, EditorMode } from '#block-editor'
import { computed } from 'vue'
import { useBoxChange } from './useBoxModel'
import { useEditorI18n } from './useEditorI18n'

/**
 * Общий composable для data-компонентов (Input, Select, DateTime).
 * Выносит повторяющийся setup: mode-вычисления, useBoxChange, i18n.
 */
export function useFieldBox(
  getBox: () => Box,
  mode: () => EditorMode,
  emit: (event: 'update', updates: Partial<Box>) => void
) {
  const { t } = useEditorI18n()
  const isEditable = computed(() => mode() === 'edit')
  const isFillable = computed(() => mode() === 'fill' || mode() === 'edit')
  useBoxChange(getBox, emit)

  return { t, isEditable, isFillable }
}
