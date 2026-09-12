<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TemplateKey } from '#block-editor'
import type { TemplateVarsLabels } from './types'

const props = defineProps<{
  items: TemplateKey[]
  command: (key: TemplateKey) => void
  labels: TemplateVarsLabels
}>()

const selectedIndex = ref(0)

watch(() => props.items, () => {
  selectedIndex.value = 0
})

function selectItem(index: number) {
  const item = props.items[index]
  if (item) props.command(item)
}

/** Маркер секции для подписи. Строится здесь: в шаблоне `{{#x}}` съест компилятор Vue. */
function scopeLabel(scope: string): string {
  return `{{#${scope}}}`
}

function onKeyDown(event: KeyboardEvent): boolean {
  if (!props.items.length) return false

  if (event.key === 'ArrowUp') {
    selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
    return true
  }
  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length
    return true
  }
  if (event.key === 'Enter' || event.key === 'Tab') {
    selectItem(selectedIndex.value)
    return true
  }
  return false
}

defineExpose({ onKeyDown })
</script>

<template>
  <div class="bg-default border border-default rounded-lg shadow-lg overflow-hidden py-1 max-h-80 overflow-y-auto w-72">
    <UButton
      v-for="(item, index) in items"
      :key="item.scope ? `${item.scope}.${item.path}` : item.path"
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
          <UIcon :name="item.kind === 'section' ? 'i-lucide-repeat' : 'i-lucide-braces'" class="size-4" />
        </div>
      </template>
      <div class="flex-1 min-w-0 text-left">
        <div class="font-medium text-sm truncate font-mono">{{ item.path }}</div>
        <div class="text-xs text-muted truncate">
          {{ item.kind === 'section' ? labels.section : labels.value }}
          <template v-if="item.scope">— {{ labels.inside }} {{ scopeLabel(item.scope) }}</template>
        </div>
      </div>
    </UButton>

    <div v-if="!items.length" class="px-3 py-2 text-sm text-muted">
      {{ labels.empty }}
    </div>
  </div>
</template>
