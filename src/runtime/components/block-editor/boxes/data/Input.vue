<script setup lang="ts">
import type { BoxInput, Box, EditorMode } from '#block-editor'
import { useFieldBox } from '../../../../composables/useFieldBox'

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
  <div class="space-y-3">
    <div v-for="(field, index) in box.value" :key="field.id" class="flex items-end gap-2">
      <div class="flex-1 min-w-0">
        <label v-if="field.label" class="block text-xs font-medium text-muted mb-1">{{ field.label }}</label>
        <UInput
          :model-value="field.value"
          :placeholder="field.placeholder || field.label || t('field.enterValue')"
          :disabled="!isFillable"
          class="w-full"
          size="sm"
          @update:model-value="(v: string) => box.updateFieldAt(index, { value: v })"
        />
      </div>

      <BlockEditorBoxesDataFieldActions
        v-if="isEditable"
        :label="field.label"
        :placeholder="field.placeholder"
        :binding-key="field.bindingKey"
        @update:label="(v: any) => box.updateFieldAt(index, { label: v })"
        @update:placeholder="(v: any) => box.updateFieldAt(index, { placeholder: v })"
        @update:binding-key="(v: any) => box.updateFieldAt(index, { bindingKey: v })"
        @remove="box.removeFieldAt(index)"
      />
    </div>
  </div>
</template>
