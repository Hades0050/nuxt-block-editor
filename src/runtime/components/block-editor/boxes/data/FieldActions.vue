<script setup lang="ts">
import { computed } from 'vue'
import { useEditorI18n } from '../../../../composables/useEditorI18n'

const { t } = useEditorI18n()

const props = defineProps<{
  label: string
  placeholder: string
  bindingKey: string
}>()

const emit = defineEmits<{
  'update:label': [value: string]
  'update:placeholder': [value: string]
  'update:bindingKey': [value: string]
  'remove': []
}>()

const bindingKeyPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/

const bindingKeyError = computed(() => {
  if (!props.bindingKey) return undefined
  return bindingKeyPattern.test(props.bindingKey) ? undefined : t('field.bindingKeyError')
})
</script>

<template>
  <div class="shrink-0 flex items-center gap-1">
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
              :model-value="label"
              :placeholder="t('field.labelPlaceholder')"
              size="sm"
              class="w-full"
              @update:model-value="(v: string) => emit('update:label', v)"
            />
          </UFormField>
          <UFormField :label="t('field.placeholder')">
            <UInput
              :model-value="placeholder"
              :placeholder="t('field.placeholderPlaceholder')"
              size="sm"
              class="w-full"
              @update:model-value="(v: string) => emit('update:placeholder', v)"
            />
          </UFormField>
          <UFormField :label="t('field.bindingKey')" :error="bindingKeyError" :help="!bindingKeyError ? t('field.bindingKeyHint') : undefined">
            <UInput
              :model-value="bindingKey"
              :placeholder="t('field.bindingKeyPlaceholder')"
              :color="bindingKeyError ? 'error' : undefined"
              size="sm"
              class="w-full"
              @update:model-value="(v: string) => emit('update:bindingKey', v)"
            />
          </UFormField>
          <slot name="extra-settings" />
        </div>
      </template>
    </UPopover>

    <slot name="extra-actions" />

    <UTooltip :text="t('field.remove')">
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="xs"
        @click="emit('remove')"
      />
    </UTooltip>
  </div>
</template>
