<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import { fontSizes } from './boxes/content/text/toolbar-config'
import ColorPopover from './ColorPopover.vue'
import { useEditorI18n } from '../../composables/useEditorI18n'

defineProps<{
  editor: Editor
}>()

const { t } = useEditorI18n()

function buildToolbarItems(editor: Editor) {
  return [
    [
      {
        icon: 'i-lucide-a-large-small',
        items: fontSizes.map(s => ({
          label: s.label,
          onSelect() {
            editor.chain().focus().setMark('textStyle', { fontSize: s.value }).run()
          }
        }))
      }
    ],
    [
      { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
      { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
      { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline' },
      { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' }
    ],
    [
      { slot: 'textColor', icon: 'i-lucide-palette' },
      { slot: 'highlightColor', icon: 'i-lucide-highlighter' }
    ],
    [
      {
        icon: 'i-lucide-align-left',
        items: [
          { kind: 'textAlign', align: 'left', label: t('toolbar.alignLeft'), icon: 'i-lucide-align-left' },
          { kind: 'textAlign', align: 'center', label: t('toolbar.alignCenter'), icon: 'i-lucide-align-center' },
          { kind: 'textAlign', align: 'right', label: t('toolbar.alignRight'), icon: 'i-lucide-align-right' }
        ]
      }
    ],
    [
      { kind: 'clearFormatting', icon: 'i-lucide-eraser' }
    ]
  ]
}
</script>

<template>
  <div class="border-b border-default rounded-t-md">
    <UEditorToolbar :editor="editor" :items="buildToolbarItems(editor)" :ui="{ base: 'flex flex-wrap items-stretch gap-1.5' }">
      <template #textColor>
        <ColorPopover
          icon="i-lucide-palette"
          :tooltip="t('toolbar.textColor')"
          :reset-label="t('toolbar.resetColor')"
          initial="#000000"
          @apply="(val: string) => editor.chain().setColor(val).run()"
          @reset="editor.chain().focus().unsetColor().run()"
        />
      </template>

      <template #highlightColor>
        <ColorPopover
          icon="i-lucide-highlighter"
          :tooltip="t('toolbar.highlight')"
          :reset-label="t('toolbar.resetHighlight')"
          initial="#ffff00"
          @apply="(val: string) => editor.chain().setHighlight({ color: val }).run()"
          @reset="editor.chain().focus().unsetHighlight().run()"
        />
      </template>
    </UEditorToolbar>
  </div>
</template>
