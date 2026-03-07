<script setup lang="ts">
import type { BoxType, Box, EditorMode } from '#block-editor'
import { Content, collectData, insertData, findDuplicateBindingKeys, boxFactory } from '#block-editor'
import { provide, inject, nextTick, ref, computed, watch, toRef, onUnmounted } from 'vue'
import { useBlockEditor } from '../../composables/useBlockEditor'
import { useGridstack, RESIZE_PARENT_KEY } from '../../composables/useGridstack'
import { LOCALE_KEY, useEditorI18n, type LocaleCode } from '../../composables/useEditorI18n'

const props = withDefaults(defineProps<{
  content: Content
  mode?: EditorMode
  nested?: boolean
  locale?: LocaleCode
}>(), {
  mode: 'edit',
  nested: false,
  locale: 'en'
})

const isEditable = computed(() => props.mode === 'edit')

// Provide locale only from root editor (not nested)
if (!props.nested) {
  provide(LOCALE_KEY, toRef(() => props.locale))
}

const { t } = useEditorI18n()

const emit = defineEmits<{
  'update:content': [content: Content]
}>()

const { content, addBox, removeBox, updateBox, syncPositions } = useBlockEditor(props.content)

// Sync incoming prop changes
watch(() => props.content, (val) => {
  if (val !== content.value) {
    content.value = val
  }
}, { deep: false })

// Emit content changes to parent
watch(content, (val) => {
  emit('update:content', val)
})

// Nested editors inject parent's resize function to cascade resize events upward
const parentResize = props.nested ? inject(RESIZE_PARENT_KEY, null) : null

// Gridstack — always initialized, static in view mode
const gridRef = ref<HTMLElement | null>(null)
const { makeWidget, removeWidget, resizeToContent, resizeAllToContent, isReady } = useGridstack(gridRef, {
  editable: isEditable,
  onPositionsChanged: (positions) => syncPositions(positions),
  onContentResize: parentResize ?? undefined
})

// Provide resize function so nested editors can trigger parent resize
provide(RESIZE_PARENT_KEY, resizeAllToContent)

// Watchers created inside event handlers are not auto-stopped on unmount
const _pendingWatchers: (() => void)[] = []
onUnmounted(() => {
  _pendingWatchers.forEach(s => s())
})

function handleAdd(type: BoxType) {
  addBox(type)
  if (isEditable.value) {
    const newBox = content.value.boxes[content.value.boxes.length - 1]
    if (!newBox) return
    const tryMakeWidget = () => {
      if (!gridRef.value) return
      const el = gridRef.value.querySelector(`[gs-id="${newBox.id}"]`) as HTMLElement
      if (el && !(el as any).gridstackNode) {
        // Let gridstack find the correct position — model h values may be
        // stale (sizeToContent changes them outside our sync flow).
        el.setAttribute('gs-auto-position', 'true')
        makeWidget(el)
        nextTick(() => resizeToContent(el))
      }
    }
    if (isReady.value) {
      nextTick(tryMakeWidget)
    } else {
      const stop = watch(isReady, (ready) => {
        if (ready) {
          nextTick(tryMakeWidget)
          stop()
          const idx = _pendingWatchers.indexOf(stop)
          if (idx >= 0) _pendingWatchers.splice(idx, 1)
        }
      })
      _pendingWatchers.push(stop)
    }
  }
}

function handleRemove(id: string) {
  if (isEditable.value && gridRef.value) {
    const el = gridRef.value.querySelector(`[gs-id="${id}"]`) as HTMLElement | null
    if (el) removeWidget(el)
  }
  removeBox(id)
}

function handleUpdate(id: string, updates: Partial<Box>) {
  updateBox(id, updates)
}

defineExpose({
  addBlock: handleAdd,
  collectData: () => collectData(content.value),
  insertData: (data: Record<string, unknown>) => {
    insertData(content.value, data)
    // Rebuild Content from JSON to create new box references for Vue reactivity
    content.value = Content.fromJsonString(JSON.stringify(content.value.toJSON()), boxFactory)
  },
  findDuplicateBindingKeys: () => findDuplicateBindingKeys(content.value)
})
</script>

<template>
  <div>
    <div
      v-if="isEditable && content.boxes.length === 0"
      class="text-center text-muted"
      :class="nested ? 'py-4' : 'py-12'"
    >
      <p :class="nested ? 'text-sm' : 'text-lg'">{{ t('empty.noBlocks') }}</p>
      <p class="text-xs">{{ t('empty.clickToAdd') }}</p>
    </div>

    <!-- Gridstack grid for both edit and view mode (static in view mode) -->
    <ClientOnly>
      <div ref="gridRef" class="grid-stack">
        <div
          v-for="box in content.boxes"
          :key="box.id"
          class="grid-stack-item"
          :gs-id="box.id"
          :gs-w="box.w"
          :gs-h="box.h"
          :gs-x="box.x"
          :gs-y="box.y"
          :gs-min-w="box.minW"
          :gs-min-h="box.minH"
          :gs-size-to-content="box.name_type !== 'CANVAS'"
        >
          <div class="grid-stack-item-content">
            <BlockEditorContainer
              :box="box"
              :mode="mode"
              @remove="handleRemove"
              @update="handleUpdate"
            />
          </div>
        </div>
      </div>
    </ClientOnly>

    <BlockEditorBlockAdder
      v-if="isEditable && nested"
      @add="handleAdd"
    />
  </div>
</template>

<style>
.grid-stack > .grid-stack-placeholder > .placeholder-content {
  border-radius: 0.5rem;
  border: 2px dashed var(--ui-border);
  background-color: var(--ui-bg-elevated);
}
</style>
