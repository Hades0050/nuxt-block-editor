<script setup lang="ts">
import type { BoxFile, Box, EditorMode } from '#block-editor'
import { ref, computed, onUnmounted } from 'vue'
import { useBoxChange } from '../../../../composables/useBoxModel'
import { useEditorI18n } from '../../../../composables/useEditorI18n'

const { t } = useEditorI18n()

const props = defineProps<{
  box: BoxFile
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

useBoxChange(() => props.box, emit)
const fileInputRef = ref<HTMLInputElement | null>(null)

let currentObjectUrl: string | null = null

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  currentObjectUrl = URL.createObjectURL(file)
  props.box.setFile(currentObjectUrl, file.name, file.type)
}

function handleClearFile() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
  props.box.clearFile()
}

onUnmounted(() => {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})
</script>

<template>
  <div class="space-y-3">
    <div v-if="isEditable" class="flex items-center gap-2">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        @change="handleFileSelect"
      >
      <UButton
        :label="t('file.chooseFile')"
        icon="i-lucide-upload"
        color="neutral"
        variant="outline"
        size="sm"
        @click="fileInputRef?.click()"
      />
      <UButton
        v-if="box.value"
        :label="t('file.clear')"
        icon="i-lucide-x"
        color="error"
        variant="ghost"
        size="sm"
        @click="handleClearFile()"
      />
    </div>

    <div v-if="box.fileName" class="flex items-center gap-2 p-3 rounded-lg border border-default bg-elevated/50">
      <UIcon name="i-lucide-file" class="text-lg shrink-0" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-highlighted truncate">
          {{ box.fileName }}
        </p>
        <p class="text-xs text-muted">
          {{ box.applicationType }}
        </p>
      </div>
    </div>

    <div v-else-if="!isEditable" class="text-sm text-muted text-center py-4">
      {{ t('field.noFile') }}
    </div>
  </div>
</template>
