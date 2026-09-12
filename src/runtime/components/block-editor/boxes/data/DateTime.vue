<script setup lang="ts">
import type { BoxDateTime, Box, EditorMode } from '#block-editor'
import { useFieldBox } from '../../../../composables/useFieldBox'
import DatePickerPopover from './DatePickerPopover.vue'
import FieldRow from './FieldRow.vue'

const props = defineProps<{
  box: BoxDateTime
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
      <DatePickerPopover
        :model-value="field.value"
        :mode="field.mode"
        :placeholder="field.placeholder || field.label"
        :disabled="!isFillable"
        @update:model-value="(v: string) => box.updateFieldAt(index, { value: v })"
      />
    </template>

    <template #extra-settings="{ field, index }">
      <UFormField :label="t('field.mode')">
        <USelect
          :model-value="field.mode"
          :items="[
            { label: t('field.modeDate'), value: 'date' },
            { label: t('field.modeTime'), value: 'time' },
            { label: t('field.modeDatetime'), value: 'datetime' }
          ]"
          size="sm"
          class="w-full"
          @update:model-value="(v: string) => box.updateFieldAt(index, { mode: v })"
        />
      </UFormField>
    </template>
  </FieldRow>
</template>
