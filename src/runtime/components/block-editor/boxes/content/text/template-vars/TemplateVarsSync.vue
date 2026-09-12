<script setup lang="ts">
import { watch } from 'vue'
import type { Editor } from '@tiptap/core'
import type { TemplateVarsMeta } from './types'
import { setTemplateKeys } from './template-vars-plugin'

/** Renderless: гонит ключи шаблонов в ProseMirror-плагин транзакцией. */
const props = defineProps<{
  editor?: Editor
  meta: TemplateVarsMeta
}>()

function apply() {
  if (props.editor) setTemplateKeys(props.editor, props.meta)
}

watch(() => props.meta, apply, { immediate: true, flush: 'post' })
watch(() => props.editor, apply, { flush: 'post' })
</script>

<template><span class="hidden" /></template>
