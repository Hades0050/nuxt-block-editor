<script setup lang="ts">
import type { BoxTree } from '#block-editor'
import { useEditorI18n } from '../../../../../composables/useEditorI18n'

const { t } = useEditorI18n()

const props = defineProps<{
  box: BoxTree
}>()

const emit = defineEmits<{
  update: [updates: Record<string, unknown>]
}>()
</script>

<template>
  <div class="space-y-4">
    <UFormField :label="t('tree.displayMode')">
      <URadioGroup
        :model-value="box.displayMode"
        :items="[
          { label: t('tree.modeSide'), value: 'side', description: t('tree.modeSideDesc') },
          { label: t('tree.modeInline'), value: 'inline', description: t('tree.modeInlineDesc') }
        ]"
        @update:model-value="emit('update', { displayMode: $event })"
      />
    </UFormField>
  </div>
</template>
