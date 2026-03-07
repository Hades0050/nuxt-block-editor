<script setup lang="ts">
import type { BoxTree, Box, EditorMode } from '#block-editor'
import { computed } from 'vue'
import { useBoxChange } from '../../../../../composables/useBoxModel'
import { useTree } from './useTree'

const props = defineProps<{
  box: BoxTree
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const { notify } = useBoxChange(() => props.box, emit)

const {
  treeVersion,
  selectedNodeId,
  selectedNode,
  selectNode,
  addChildNode,
  removeNode,
  updateNodeLabel
} = useTree(() => props.box)
</script>

<template>
  <!-- Side mode: sidebar + content panel -->
  <div v-if="box.displayMode !== 'inline'" class="flex gap-3">
    <div :key="treeVersion" class="w-48 shrink-0 border-r border-default pr-3 space-y-1 overflow-auto">
      <BlockEditorBoxesStructureTreeNodeItem
        v-for="node in box.value"
        :key="node.id"
        :node="node"
        :selected-id="selectedNodeId"
        :mode="mode"
        :depth="0"
        @select="selectNode"
        @add-child="addChildNode"
        @remove="removeNode"
        @update-label="updateNodeLabel"
      />
    </div>

    <div class="flex-1 min-w-0 overflow-auto">
      <template v-if="selectedNode">
        <div :key="selectedNodeId">
          <BlockEditor
            :content="selectedNode.content"
            :mode="mode"
            nested
            @update:content="notify"
          />
        </div>
      </template>
      <div v-else class="text-center py-6 text-muted text-sm">
        Select a node to view its content
      </div>
    </div>
  </div>

  <!-- Inline mode: content under each expanded node -->
  <div v-else :key="treeVersion" class="space-y-1">
    <BlockEditorBoxesStructureTreeNodeItem
      v-for="node in box.value"
      :key="node.id"
      :node="node"
      :selected-id="selectedNodeId"
      :mode="mode"
      :depth="0"
      display-mode="inline"
      :notify="notify"
      @select="selectNode"
      @add-child="addChildNode"
      @remove="removeNode"
      @update-label="updateNodeLabel"
    />
  </div>
</template>
