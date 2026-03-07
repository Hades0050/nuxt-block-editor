<script setup lang="ts">
import { BOX_TYPES } from '#block-editor'
import type { BoxText, BoxMarkdown, Box, EditorMode } from '#block-editor'
import { computed } from 'vue'
import type { Node as PmNode } from '@tiptap/pm/model'
import { useBoxModel } from '../../../../../composables/useBoxModel'
import { useEditorI18n } from '../../../../../composables/useEditorI18n'
import { editorExtensions } from './extensions'
import { editorBubbleItems, floatingMenuItems } from './toolbar-config'
import TextToolbar from './TextToolbar.vue'
import styles from './styles.module.css'

const props = withDefaults(defineProps<{
  box: BoxText | BoxMarkdown
  mode: EditorMode
  toolbar?: boolean
  bubbleMenu?: boolean
  floatingMenu?: boolean
  dragHandle?: boolean
  placeholder?: boolean
}>(), {
  toolbar: true,
  bubbleMenu: false,
  floatingMenu: false,
  dragHandle: true,
  placeholder: false
})

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const { t } = useEditorI18n()
const isEditable = computed(() => props.mode === 'edit')
const localValue = useBoxModel(() => props.box.value, emit, 'value')

const contentType = computed(() =>
  props.box.name_type === BOX_TYPES.MARKDOWN ? 'markdown' : 'html'
)

const placeholderConfig = computed(() => {
  if (!props.placeholder) return undefined
  return {
    placeholder: ({ node }: { node: PmNode }) => {
      if (node.type.name === 'heading') return `${t('placeholder.heading')} ${node.attrs.level}`
      return t('placeholder.typeSlash')
    }
  }
})
</script>

<template>
  <div>
    <UEditor
      v-if="isEditable"
      v-model="localValue"
      :content-type="contentType"
      :extensions="editorExtensions"
      :starter-kit="{ codeBlock: false }"
      :editor-props="{ attributes: { spellcheck: 'true' } }"
      :image="{ allowBase64: true, resize: { enabled: true, alwaysPreserveAspectRatio: true } }"
      :placeholder="placeholderConfig"
      :class="styles.richtext"
    >
      <template #default="{ editor }">
        <TextToolbar v-if="toolbar" :editor="editor" />

        <!-- Bubble menu on selection -->
        <UEditorToolbar
          v-if="bubbleMenu"
          :editor="editor"
          :items="editorBubbleItems"
          layout="bubble"
        />

        <!-- Floating menu on empty lines -->
        <UEditorToolbar
          v-if="floatingMenu"
          :editor="editor"
          :items="floatingMenuItems"
          layout="floating"
        />

        <!-- Side menu — drag handle -->
        <UEditorDragHandle v-if="dragHandle" :editor="editor" :options="{ flip: false }" />
      </template>
    </UEditor>

    <!-- View mode -->
    <UEditor
      v-else
      :model-value="localValue || ''"
      :content-type="contentType"
      :extensions="editorExtensions"
      :starter-kit="{ codeBlock: false }"
      :editable="false"
      :class="styles.richtext"
    />
  </div>
</template>
