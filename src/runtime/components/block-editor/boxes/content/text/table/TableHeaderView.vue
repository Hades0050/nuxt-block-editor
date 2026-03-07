<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'
import { useEditorI18n } from '../../../../../../composables/useEditorI18n'

const props = defineProps<NodeViewProps>()
const { t } = useEditorI18n()

const colMenuOpen = ref(false)
const rowMenuOpen = ref(false)

const cellStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.node.attrs.background) style.background = props.node.attrs.background
  const colwidth = props.node.attrs.colwidth as number[] | null
  if (colwidth) style.minWidth = `${colwidth[0]}px`
  return style
})

function addColumnBefore() {
  props.editor.chain().focus().addColumnBefore().run()
  colMenuOpen.value = false
}

function addColumnAfter() {
  props.editor.chain().focus().addColumnAfter().run()
  colMenuOpen.value = false
}

function deleteColumn() {
  props.editor.chain().focus().deleteColumn().run()
  colMenuOpen.value = false
}

function addRowBefore() {
  props.editor.chain().focus().addRowBefore().run()
  rowMenuOpen.value = false
}

function addRowAfter() {
  props.editor.chain().focus().addRowAfter().run()
  rowMenuOpen.value = false
}

function deleteRow() {
  props.editor.chain().focus().deleteRow().run()
  rowMenuOpen.value = false
}
</script>

<template>
  <NodeViewWrapper
    as="th"
    class="table-cell-view"
    :colspan="node.attrs.colspan"
    :rowspan="node.attrs.rowspan"
    :style="cellStyle"
  >
    <!-- Column handler -->
    <div class="col-handler" @click.stop>
      <UPopover v-model:open="colMenuOpen">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          size="2xs"
          class="handler-dot"
          @mousedown.prevent
        />
        <template #content>
          <div class="flex flex-col gap-0.5 p-1 min-w-40">
            <UButton
              icon="i-lucide-arrow-left-to-line"
              :label="t('table.insertLeft')"
              color="neutral"
              variant="ghost"
              size="xs"
              block
              class="justify-start"
              @mousedown.prevent="addColumnBefore"
            />
            <UButton
              icon="i-lucide-arrow-right-to-line"
              :label="t('table.insertRight')"
              color="neutral"
              variant="ghost"
              size="xs"
              block
              class="justify-start"
              @mousedown.prevent="addColumnAfter"
            />
            <USeparator />
            <UButton
              icon="i-lucide-trash-2"
              :label="t('table.deleteColumn')"
              color="error"
              variant="ghost"
              size="xs"
              block
              class="justify-start"
              @mousedown.prevent="deleteColumn"
            />
          </div>
        </template>
      </UPopover>
    </div>

    <!-- Row handler -->
    <div class="row-handler" @click.stop>
      <UPopover v-model:open="rowMenuOpen">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          size="2xs"
          class="handler-dot"
          @mousedown.prevent
        />
        <template #content>
          <div class="flex flex-col gap-0.5 p-1 min-w-40">
            <UButton
              icon="i-lucide-arrow-up-to-line"
              :label="t('table.insertAbove')"
              color="neutral"
              variant="ghost"
              size="xs"
              block
              class="justify-start"
              @mousedown.prevent="addRowBefore"
            />
            <UButton
              icon="i-lucide-arrow-down-to-line"
              :label="t('table.insertBelow')"
              color="neutral"
              variant="ghost"
              size="xs"
              block
              class="justify-start"
              @mousedown.prevent="addRowAfter"
            />
            <USeparator />
            <UButton
              icon="i-lucide-trash-2"
              :label="t('table.deleteRow')"
              color="error"
              variant="ghost"
              size="xs"
              block
              class="justify-start"
              @mousedown.prevent="deleteRow"
            />
          </div>
        </template>
      </UPopover>
    </div>

    <NodeViewContent as="div" />
  </NodeViewWrapper>
</template>
