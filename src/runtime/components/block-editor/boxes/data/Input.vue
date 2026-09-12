<script setup lang="ts">
import type { BoxInput, Box, EditorMode } from '#block-editor'
import { useFieldBox } from '../../../../composables/useFieldBox'
import FieldRow from './FieldRow.vue'

const props = defineProps<{
  box: BoxInput
  mode: EditorMode
}>()

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const { t, isEditable, isFillable } = useFieldBox(() => props.box, () => props.mode, emit)
</script>

<template>
  <FieldRow :box="box" :editable="isEditable">
    <template #control="{ field, index }">
      <UInput
        :model-value="field.value"
        :placeholder="field.placeholder || field.label || t('field.enterValue')"
        :disabled="!isFillable"
        class="w-full"
        size="sm"
        @update:model-value="(v: string) => box.updateFieldAt(index, { value: v })"
      />
    </template>
  </FieldRow>
</template>
