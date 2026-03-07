<script setup lang="ts">
import type { BoxDateTime, Box, EditorMode } from '#block-editor'
import { useFieldBox } from '../../../../composables/useFieldBox'
import DatePickerPopover from './DatePickerPopover.vue'

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
  <div class="space-y-3">
    <div v-for="(field, index) in box.value" :key="field.id" class="flex items-end gap-2">
      <div class="flex-1 min-w-0">
        <label v-if="field.label" class="block text-xs font-medium text-muted mb-1">{{ field.label }}</label>
        <DatePickerPopover
          :model-value="field.value"
          :mode="field.mode"
          :placeholder="field.placeholder || field.label"
          :disabled="!isFillable"
          @update:model-value="(v: string) => box.updateFieldAt(index, { value: v })"
        />
      </div>

      <BlockEditorBoxesDataFieldActions
        v-if="isEditable"
        :label="field.label"
        :placeholder="field.placeholder"
        :binding-key="field.bindingKey"
        @update:label="(v) => box.updateFieldAt(index, { label: v })"
        @update:placeholder="(v) => box.updateFieldAt(index, { placeholder: v })"
        @update:binding-key="(v) => box.updateFieldAt(index, { bindingKey: v })"
        @remove="box.removeFieldAt(index)"
      >
        <template #extra-settings>
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
      </BlockEditorBoxesDataFieldActions>
    </div>
  </div>
</template>
