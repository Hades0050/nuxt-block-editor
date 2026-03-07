<script setup lang="ts">
import { computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'
import type { CalloutType } from './callout-extension'
import { useEditorI18n } from '../../../../../../composables/useEditorI18n'

const props = defineProps<NodeViewProps>()
const { t } = useEditorI18n()

const calloutStyles: Record<CalloutType, { bg: string, border: string, icon: string }> = {
  info: { bg: 'bg-info/10', border: 'border-info', icon: 'i-lucide-info' },
  warning: { bg: 'bg-warning/10', border: 'border-warning', icon: 'i-lucide-triangle-alert' },
  error: { bg: 'bg-error/10', border: 'border-error', icon: 'i-lucide-circle-x' },
  success: { bg: 'bg-success/10', border: 'border-success', icon: 'i-lucide-circle-check' }
}

const calloutType = computed<CalloutType>(() => props.node.attrs.type || 'info')
const style = computed(() => calloutStyles[calloutType.value])

const types: CalloutType[] = ['info', 'warning', 'error', 'success']

function setType(type: CalloutType) {
  props.updateAttributes({ type })
}

function deleteCallout() {
  props.deleteNode()
}
</script>

<template>
  <NodeViewWrapper
    class="callout rounded-md border-l-4 p-3 my-2"
    :class="[style.bg, style.border]"
  >
    <div class="flex items-start gap-2">
      <!-- Иконка + выбор типа -->
      <div class="shrink-0 mt-0.5" contenteditable="false">
        <UPopover>
          <UButton
            :icon="style.icon"
            variant="ghost"
            color="neutral"
            size="xs"
          />
          <template #content>
            <div class="flex gap-1 p-1.5">
              <UTooltip v-for="ct in types" :key="ct" :text="t(`callout.${ct}`)">
                <UButton
                  :icon="calloutStyles[ct].icon"
                  variant="ghost"
                  :color="calloutType === ct ? 'primary' : 'neutral'"
                  size="xs"
                  :class="calloutType === ct ? 'ring-1 ring-primary' : ''"
                  @click="setType(ct)"
                />
              </UTooltip>
              <USeparator orientation="vertical" />
              <UTooltip :text="t('callout.delete')">
                <UButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  color="error"
                  size="xs"
                  @click="deleteCallout"
                />
              </UTooltip>
            </div>
          </template>
        </UPopover>
      </div>

      <!-- Контент -->
      <NodeViewContent class="callout-content flex-1 min-w-0" />
    </div>
  </NodeViewWrapper>
</template>
