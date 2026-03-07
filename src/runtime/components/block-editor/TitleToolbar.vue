<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import { ref } from 'vue'
import { useEditorI18n } from '../../composables/useEditorI18n'

defineProps<{
  editor: Editor
}>()

const { t } = useEditorI18n()
const textColorOpen = ref(false)
const highlightColorOpen = ref(false)
const textColor = ref('#000000')
const highlightColor = ref('#ffff00')

const fontSizes = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '32px', value: '32px' }
]

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
        <UPopover v-model:open="textColorOpen">
          <UTooltip :text="t('toolbar.textColor')">
            <UButton
              icon="i-lucide-palette"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </UTooltip>
          <template #content>
            <div class="p-2">
              <UColorPicker
                v-model="textColor"
                @update:model-value="(val: string) => editor.chain().setColor(val).run()"
              />
              <UButton
                icon="i-lucide-x"
                :label="t('toolbar.resetColor')"
                color="neutral"
                variant="ghost"
                size="xs"
                block
                class="mt-2"
                @click="editor.chain().focus().unsetColor().run(); textColorOpen = false"
              />
            </div>
          </template>
        </UPopover>
      </template>

      <template #highlightColor>
        <UPopover v-model:open="highlightColorOpen">
          <UTooltip :text="t('toolbar.highlight')">
            <UButton
              icon="i-lucide-highlighter"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </UTooltip>
          <template #content>
            <div class="p-2">
              <UColorPicker
                v-model="highlightColor"
                @update:model-value="(val: string) => editor.chain().setHighlight({ color: val }).run()"
              />
              <UButton
                icon="i-lucide-x"
                :label="t('toolbar.resetHighlight')"
                color="neutral"
                variant="ghost"
                size="xs"
                block
                class="mt-2"
                @click="editor.chain().focus().unsetHighlight().run(); highlightColorOpen = false"
              />
            </div>
          </template>
        </UPopover>
      </template>
    </UEditorToolbar>
  </div>
</template>
