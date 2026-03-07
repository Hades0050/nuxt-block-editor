<script setup lang="ts">
import { computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'
import { useEditorI18n } from '../../../../../../composables/useEditorI18n'

const props = defineProps<NodeViewProps>()
const { t } = useEditorI18n()

const columnCount = computed(() => props.node.childCount)

function addColumn() {
  const basePos = props.getPos()
  if (basePos == null) return
  const pos = basePos + props.node.nodeSize - 1
  props.editor.chain().focus().insertContentAt(pos, {
    type: 'column',
    content: [{ type: 'paragraph' }]
  }).run()
}

function removeLastColumn() {
  const basePos = props.getPos()
  if (basePos == null || columnCount.value <= 2) return
  const lastChild = props.node.lastChild
  if (!lastChild) return
  const pos = basePos + props.node.nodeSize - 1 - lastChild.nodeSize
  props.editor.chain().focus().deleteRange({
    from: pos,
    to: pos + lastChild.nodeSize
  }).run()
}

function deleteBlock() {
  props.deleteNode()
}
</script>

<template>
  <NodeViewWrapper class="multi-column-wrapper my-2 relative group/mc" data-multi-column>
    <!-- Панель управления -->
    <div
      class="absolute -top-3 right-0 flex items-center gap-0.5 opacity-0 group-hover/mc:opacity-100 transition-opacity z-10"
      contenteditable="false"
    >
      <UTooltip :text="t('multiColumn.addColumn')">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="soft"
          size="2xs"
          @click="addColumn"
        />
      </UTooltip>
      <UTooltip v-if="columnCount > 2" :text="t('multiColumn.removeLastColumn')">
        <UButton
          icon="i-lucide-minus"
          color="neutral"
          variant="soft"
          size="2xs"
          @click="removeLastColumn"
        />
      </UTooltip>
      <UTooltip :text="t('multiColumn.deleteColumns')">
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          size="2xs"
          @click="deleteBlock"
        />
      </UTooltip>
    </div>

    <!-- Колонки -->
    <NodeViewContent class="multi-column-content" />
  </NodeViewWrapper>
</template>
