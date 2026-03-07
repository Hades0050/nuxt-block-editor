<script setup lang="ts">
import type { BoxTextArea, Box, EditorMode } from '#block-editor'
import { computed } from 'vue'
import { useBoxModel } from '../../../../composables/useBoxModel'
import { useEditorI18n } from '../../../../composables/useEditorI18n'

const { t } = useEditorI18n()

const props = defineProps<{
  box: BoxTextArea
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const localValue = useBoxModel(() => props.box.value, emit, 'value')
</script>

<template>
  <UTextarea
    v-if="isEditable"
    v-model="localValue"
    autoresize
    :placeholder="t('placeholder.enterText')"
    class="w-full"
  />
  <div v-else class="whitespace-pre-wrap text-sm">
    {{ box.value || t('placeholder.empty') }}
  </div>
</template>
