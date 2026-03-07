<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SlashCommandItem } from './slash-commands'
import type { Editor, Range } from '@tiptap/core'
import { useEditorI18n } from '../../../../../../composables/useEditorI18n'

const props = defineProps<{
  items: SlashCommandItem[]
  command: (item: { editor: Editor, range: Range, command: SlashCommandItem['command'] }) => void
  editor: Editor
  range: Range
}>()

const { t } = useEditorI18n()
const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

function selectItem(index: number) {
  const item = props.items[index]
  if (item) {
    item.command(props.editor, props.range)
  }
}

function onKeyDown(event: KeyboardEvent): boolean {
  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter') {
    selectItem(selectedIndex.value)
    return true
  }
  return false
}

defineExpose({ onKeyDown })
</script>

<template>
  <div
    v-if="items.length"
    class="bg-default border border-default rounded-lg shadow-lg overflow-hidden py-1 max-h-80 overflow-y-auto w-64"
  >
    <UButton
      v-for="(item, index) in items"
      :key="item.labelKey"
      color="neutral"
      variant="ghost"
      size="md"
      block
      class="justify-start rounded-none"
      :class="index === selectedIndex ? 'bg-elevated' : ''"
      @click="selectItem(index)"
      @mouseenter="selectedIndex = index"
    >
      <template #leading>
        <div class="flex items-center justify-center size-8 rounded-md bg-elevated border border-default">
          <UIcon :name="item.icon" class="size-4" />
        </div>
      </template>
      <div class="flex-1 min-w-0 text-left">
        <div class="font-medium text-sm truncate">{{ t(item.labelKey) }}</div>
        <div class="text-xs text-muted truncate">{{ t(item.descriptionKey) }}</div>
      </div>
    </UButton>

    <div v-if="!items.length" class="px-3 py-2 text-sm text-muted">
      {{ t('slash.noResults') }}
    </div>
  </div>
</template>
