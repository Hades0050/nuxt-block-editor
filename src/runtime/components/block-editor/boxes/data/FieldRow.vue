<script setup lang="ts" generic="T extends FormValue">
import type { BoxFields, FormValue } from '#block-editor'
import { useEditorI18n } from '../../../../composables/useEditorI18n'

defineProps<{
  box: BoxFields<T>
  editable: boolean
}>()

const { t } = useEditorI18n()

const bindingKeyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/

function bindingKeyError(key: string): string | undefined {
  if (!key) return undefined
  return bindingKeyPattern.test(key) ? undefined : t('field.bindingKeyError')
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="(field, index) in box.value" :key="field.id" class="flex items-end gap-2">
      <div class="flex-1 min-w-0">
        <label v-if="field.label" class="block text-xs font-medium text-muted mb-1">{{ field.label }}</label>
        <slot name="control" :field="field" :index="index" />
      </div>

      <div v-if="editable" class="shrink-0 flex items-center gap-1">
        <UPopover :content="{ side: 'left', align: 'start' }">
          <UTooltip :text="t('field.configure')">
            <UButton
              icon="i-lucide-settings"
              color="neutral"
              variant="ghost"
              size="xs"
            />
          </UTooltip>
          <template #content>
            <div class="p-3 space-y-3 w-64">
              <UFormField :label="t('field.label')">
                <UInput
                  :model-value="field.label"
                  :placeholder="t('field.labelPlaceholder')"
                  size="sm"
                  class="w-full"
                  @update:model-value="(v: string) => box.updateFieldAt(index, { label: v })"
                />
              </UFormField>
              <UFormField :label="t('field.placeholder')">
                <UInput
                  :model-value="field.placeholder"
                  :placeholder="t('field.placeholderPlaceholder')"
                  size="sm"
                  class="w-full"
                  @update:model-value="(v: string) => box.updateFieldAt(index, { placeholder: v })"
                />
              </UFormField>
              <UFormField
                :label="t('field.bindingKey')"
                :error="bindingKeyError(field.bindingKey)"
                :help="!bindingKeyError(field.bindingKey) ? t('field.bindingKeyHint') : undefined"
              >
                <UInput
                  :model-value="field.bindingKey"
                  :placeholder="t('field.bindingKeyPlaceholder')"
                  :color="bindingKeyError(field.bindingKey) ? 'error' : undefined"
                  size="sm"
                  class="w-full"
                  @update:model-value="(v: string) => box.updateFieldAt(index, { bindingKey: v })"
                />
              </UFormField>
              <slot name="extra-settings" :field="field" :index="index" />
            </div>
          </template>
        </UPopover>

        <slot name="extra-actions" :field="field" :index="index" />

        <UTooltip :text="t('field.remove')">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click="box.removeFieldAt(index)"
          />
        </UTooltip>
      </div>
    </div>

    <slot />
  </div>
</template>
