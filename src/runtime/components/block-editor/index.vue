<script setup lang="ts">
import type { BoxType, Box, EditorMode } from '#block-editor'
import { Content, collectData, insertData, findDuplicateBindingKeys, boxFactory, TemplateDataSource } from '#block-editor'
import { provide, inject, ref, computed, watch, toRef } from 'vue'
import { useBlockEditor } from '../../composables/useBlockEditor'
import { useGridstack, RESIZE_PARENT_KEY } from '../../composables/useGridstack'
import { LOCALE_KEY, useEditorI18n, type LocaleCode } from '../../composables/useEditorI18n'
import { provideTemplateData } from '../../composables/useTemplateData'

const props = withDefaults(defineProps<{
  content: Content
  mode?: EditorMode
  nested?: boolean
  locale?: LocaleCode
  data?: Record<string, unknown>
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

// Provide template data only from root editor — nested content is part of the same Content,
// so its fields are already in collectData. Form values win over the incoming data prop.
if (!props.nested) {
  provideTemplateData(computed(() => TemplateDataSource.from(props.data, collectData(content.value))))
}

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
const { removeWidget, resizeAllToContent } = useGridstack(gridRef, {
  editable: isEditable,
  onPositionsChanged: (positions) => syncPositions(positions),
  onContentResize: parentResize ?? undefined
})

// Provide resize function so nested editors can trigger parent resize
provide(RESIZE_PARENT_KEY, resizeAllToContent)

// Новый .grid-stack-item регистрирует MutationObserver в useGridstack
function handleAdd(type: BoxType) {
  addBox(type)
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
