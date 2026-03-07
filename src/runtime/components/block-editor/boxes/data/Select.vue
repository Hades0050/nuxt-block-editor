<script setup lang="ts">
import type { BoxSelect, Box, EditorMode } from '#block-editor'
import { ref, computed } from 'vue'
import { useFieldBox } from '../../../../composables/useFieldBox'

const props = defineProps<{
  box: BoxSelect
  mode: EditorMode
}>()

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const { t, isEditable, isFillable } = useFieldBox(() => props.box, () => props.mode, emit)

const optionsModalField = ref<{ index: number, label: string } | null>(null)
const optionsModalOpen = computed({
  get: () => optionsModalField.value !== null,
  set: (v) => {
    if (!v) optionsModalField.value = null
  }
})

function openOptionsModal(fieldIndex: number) {
  const field = props.box.value[fieldIndex]
  if (field)
    optionsModalField.value = { index: fieldIndex, label: field.label }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(field, fIdx) in box.value"
      :key="field.id"
      class="flex items-end gap-2"
    >
      <div class="flex-1 min-w-0">
        <label
          v-if="field.label"
          class="block text-xs font-medium text-muted mb-1"
        >{{ field.label }}</label>
        <USelect
          :model-value="field.value?.value ?? ''"
          :items="field.items.map((i) => ({ label: i.label, value: i.value }))"
          :disabled="!isFillable"
          :placeholder="field.placeholder || t('field.selectPlaceholder')"
          class="w-full"
          size="sm"
          @update:model-value="(v: string) => box.selectOption(fIdx, v)"
        />
      </div>

      <BlockEditorBoxesDataFieldActions
        v-if="isEditable"
        :label="field.label"
        :placeholder="field.placeholder"
        :binding-key="field.bindingKey"
        @update:label="(v: string) => box.updateFieldAt(fIdx, { label: v })"
        @update:placeholder="(v: string) => box.updateFieldAt(fIdx, { placeholder: v })"
        @update:binding-key="(v: string) => box.updateFieldAt(fIdx, { bindingKey: v })"
        @remove="box.removeFieldAt(fIdx)"
      >
        <template #extra-actions>
          <UTooltip :text="t('selectBlock.manageOptions')">
            <UButton
              icon="i-lucide-list"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openOptionsModal(fIdx)"
            />
          </UTooltip>
        </template>
      </BlockEditorBoxesDataFieldActions>
    </div>

    <!-- Options management modal -->
    <UModal
      v-model:open="optionsModalOpen"
      :modal="false"
      :title="t('selectBlock.manageOptions')"
      :description="optionsModalField?.label || ''"
    >
      <template #body>
        <div v-if="optionsModalField" class="overflow-auto max-h-80 space-y-2">
          <div
            v-for="(opt, oIdx) in box.value[optionsModalField.index]?.items"
            :key="oIdx"
            class="flex items-center gap-2"
          >
            <UInput
              :model-value="opt.value"
              :placeholder="t('selectBlock.optionValuePlaceholder')"
              size="sm"
              class="w-32 shrink-0 font-mono"
              @update:model-value="
                (v: string) =>
                  box.updateOptionValue(optionsModalField!.index, oIdx, v)
              "
            />
            <UInput
              :model-value="opt.label"
              :placeholder="t('selectBlock.optionLabelPlaceholder')"
              size="sm"
              class="flex-1"
              @update:model-value="
                (v: string) =>
                  box.updateOptionLabel(optionsModalField!.index, oIdx, v)
              "
            />
            <UTooltip :text="t('selectBlock.removeOption')">
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="box.removeOption(optionsModalField!.index, oIdx)"
              />
            </UTooltip>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full items-center justify-between">
          <UButton
            :label="t('selectBlock.addOption')"
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            size="sm"
            @click="box.addOption(optionsModalField!.index)"
          />
          <UButton
            :label="t('container.save')"
            color="success"
            variant="solid"
            size="sm"
            @click="optionsModalOpen = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
