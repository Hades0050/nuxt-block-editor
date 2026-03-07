<script setup lang="ts">
import type { TreeNode, EditorMode } from '#block-editor'
import { computed, ref } from 'vue'
import { useEditorI18n } from '../../../../../composables/useEditorI18n'

const { t } = useEditorI18n()

const props = withDefaults(defineProps<{
  node: TreeNode
  selectedId: string
  mode: EditorMode
  depth: number
  displayMode?: 'side' | 'inline'
  notify?: () => void
}>(), {
  displayMode: 'side'
})

const isEditable = computed(() => props.mode === 'edit')
const isInline = computed(() => props.displayMode === 'inline')

const emit = defineEmits<{
  select: [id: string]
  addChild: [parentId: string]
  remove: [id: string]
  updateLabel: [id: string, label: string]
}>()

const isExpanded = ref(true)
const isEditing = ref(false)
const editLabel = ref(props.node.label)

function saveLabel() {
  emit('updateLabel', props.node.id, editLabel.value)
  isEditing.value = false
}
</script>

<template>
  <div>
    <div
      class="flex items-center gap-1 px-1 py-0.5 rounded text-sm cursor-pointer hover:bg-elevated"
      :class="{ 'bg-elevated': node.id === selectedId }"
      :style="{ paddingLeft: `${depth * 12 + 4}px` }"
      @click="emit('select', node.id)"
    >
      <UTooltip v-if="node.children.length || isInline" :text="t('tree.expand')">
        <UButton
          :icon="isExpanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
          color="neutral"
          variant="ghost"
          size="xs"
          class="shrink-0"
          @click.stop="isExpanded = !isExpanded"
        />
      </UTooltip>
      <span v-else class="w-6 shrink-0" />

      <template v-if="isEditing && isEditable">
        <input
          v-model="editLabel"
          class="flex-1 text-xs bg-default border border-default rounded px-1"
          @blur="saveLabel"
          @keyup.enter="saveLabel"
        >
      </template>
      <span v-else class="flex-1 truncate text-xs" @dblclick="isEditable && (isEditing = true)">
        {{ node.label }}
      </span>

      <div v-if="isEditable" class="flex shrink-0">
        <UTooltip :text="t('tree.addChild')">
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="xs"
            @click.stop="emit('addChild', node.id)"
          />
        </UTooltip>
        <UTooltip :text="t('tree.removeNode')">
          <UButton
            icon="i-lucide-x"
            color="error"
            variant="ghost"
            size="xs"
            @click.stop="emit('remove', node.id)"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Inline mode: node content below header -->
    <div
      v-if="isInline && isExpanded && node.content.boxes.length > 0"
      class="border-l border-default ml-4 pl-3 py-2"
      :style="{ marginLeft: `${depth * 12 + 16}px` }"
    >
      <BlockEditor
        :content="node.content"
        :mode="mode"
        nested
        @update:content="notify?.()"
      />
    </div>

    <!-- Children -->
    <div v-if="isExpanded && node.children.length">
      <BlockEditorBoxesStructureTreeNodeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :mode="mode"
        :depth="depth + 1"
        :display-mode="displayMode"
        :notify="notify"
        @select="emit('select', $event)"
        @add-child="emit('addChild', $event)"
        @remove="emit('remove', $event)"
        @update-label="(id: string, label: string) => emit('updateLabel', id, label)"
      />
    </div>
  </div>
</template>
