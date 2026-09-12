<script setup lang="ts">
import { BOX_TYPES, MustacheTemplate } from '#block-editor'
import type { BoxText, BoxMarkdown, Box, EditorMode } from '#block-editor'
import { computed } from 'vue'
import { useBoxModel } from '../../../../../composables/useBoxModel'
import { useEditorI18n } from '../../../../../composables/useEditorI18n'
import { useTemplateData } from '../../../../../composables/useTemplateData'
import { editorExtensions } from './extensions'
import TextToolbar from './TextToolbar.vue'
import TemplateVarsSync from './template-vars/TemplateVarsSync.vue'
import type { TemplateVarsMeta } from './template-vars/types'
import styles from './styles.module.css'

const props = withDefaults(defineProps<{
  box: BoxText | BoxMarkdown
  mode: EditorMode
  preview?: boolean
}>(), {
  preview: false
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

const templateData = useTemplateData()

// В read/fill превью включено всегда, в edit — по тумблеру в тулбаре блока
const previewActive = computed(() => props.mode === 'edit' ? props.preview : true)
const showEditor = computed(() => isEditable.value && !previewActive.value)

const displayValue = computed(() => {
  const raw = localValue.value || ''
  // без данных рендерим сырую строку — существующие документы не меняются
  if (!previewActive.value || templateData.value.isEmpty) return raw
  return new MustacheTemplate(raw).render(templateData.value.data)
})

const templateMeta = computed<TemplateVarsMeta>(() => ({
  keys: templateData.value.keys(),
  labels: {
    value: t('templateVars.value'),
    section: t('templateVars.section'),
    inside: t('templateVars.inside'),
    empty: t('templateVars.empty')
  }
}))
</script>

<template>
  <div>
    <UEditor
      v-if="showEditor"
      v-model="localValue"
      :content-type="contentType"
      :extensions="editorExtensions"
      :starter-kit="{ codeBlock: false }"
      :editor-props="{ attributes: { spellcheck: 'true' } }"
      :image="{ allowBase64: true, resize: { enabled: true, alwaysPreserveAspectRatio: true } }"
      :class="styles.richtext"
    >
      <template #default="{ editor }">
        <TemplateVarsSync :editor="editor" :meta="templateMeta" />

        <TextToolbar :editor="editor" />
      </template>
    </UEditor>

    <!-- View mode / preview -->
    <UEditor
      v-else
      :model-value="displayValue"
      :content-type="contentType"
      :extensions="editorExtensions"
      :starter-kit="{ codeBlock: false }"
      :editable="false"
      :class="[styles.richtext, styles.readonly]"
    />
  </div>
</template>
