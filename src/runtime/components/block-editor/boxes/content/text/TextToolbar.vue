<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import { ref } from 'vue'
import { fontFamilies, fontSizes } from './toolbar-config'
import TableGrid from './table/TableGrid.vue'
import ColorPopover from '../../../ColorPopover.vue'
import { useEditorI18n } from '../../../../../composables/useEditorI18n'

const props = defineProps<{
  editor: Editor
}>()

const { t } = useEditorI18n()
const tableGridOpen = ref(false)
const calloutMenuOpen = ref(false)

function triggerImageUpload(editor: Editor) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function insertTable(rows: number, cols: number) {
  props.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  tableGridOpen.value = false
}

function buildToolbarItems(editor: Editor) {
  const items: Record<string, unknown>[][] = [
    // Undo / Redo
    [
      { kind: 'undo', icon: 'i-lucide-undo-2' },
      { kind: 'redo', icon: 'i-lucide-redo-2' }
    ],
    // Font Family + Size
    [
      {
        icon: 'i-lucide-type',
        items: fontFamilies.map(f => ({
          label: f.label,
          onSelect() {
            if (f.value) editor.chain().focus().setFontFamily(f.value).run()
            else editor.chain().focus().unsetFontFamily().run()
          }
        }))
      },
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
    // Headings
    [
      {
        icon: 'i-lucide-heading',
        items: [
          { kind: 'heading', level: 1, label: `${t('toolbar.heading')} 1`, icon: 'i-lucide-heading-1' },
          { kind: 'heading', level: 2, label: `${t('toolbar.heading')} 2`, icon: 'i-lucide-heading-2' },
          { kind: 'heading', level: 3, label: `${t('toolbar.heading')} 3`, icon: 'i-lucide-heading-3' },
          { kind: 'heading', level: 4, label: `${t('toolbar.heading')} 4`, icon: 'i-lucide-heading-4' }
        ]
      }
    ],
    // Text formatting
    [
      { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
      { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
      { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline' },
      { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' },
      { kind: 'mark', mark: 'code', icon: 'i-lucide-code' }
    ],
    // Colors
    [
      { slot: 'textColor', icon: 'i-lucide-palette' },
      { slot: 'highlightColor', icon: 'i-lucide-highlighter' }
    ],
    // Alignment
    [
      {
        icon: 'i-lucide-align-left',
        items: [
          { kind: 'textAlign', align: 'left', label: t('toolbar.alignLeft'), icon: 'i-lucide-align-left' },
          { kind: 'textAlign', align: 'center', label: t('toolbar.alignCenter'), icon: 'i-lucide-align-center' },
          { kind: 'textAlign', align: 'right', label: t('toolbar.alignRight'), icon: 'i-lucide-align-right' },
          { kind: 'textAlign', align: 'justify', label: t('toolbar.alignJustify'), icon: 'i-lucide-align-justify' }
        ]
      }
    ],
    // Lists (+ task list)
    [
      { kind: 'bulletList', icon: 'i-lucide-list' },
      { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
      { kind: 'taskList', icon: 'i-lucide-list-checks' }
    ],
    // Block elements (+ callout, columns)
    [
      { kind: 'blockquote', icon: 'i-lucide-text-quote' },
      { kind: 'codeBlock', icon: 'i-lucide-square-code' },
      { kind: 'horizontalRule', icon: 'i-lucide-minus' },
      { slot: 'calloutInsert', icon: 'i-lucide-message-square-warning' },
      { slot: 'columnsInsert', icon: 'i-lucide-columns-2' }
    ],
    // Table (grid selector)
    [
      { slot: 'tableInsert', icon: 'i-lucide-table' }
    ],
    // Links & images
    [
      { kind: 'link', icon: 'i-lucide-link' },
      { slot: 'imageUpload', icon: 'i-lucide-image' }
    ],
    // Clear
    [
      { kind: 'clearFormatting', icon: 'i-lucide-eraser' }
    ]
  ]

  // Table operations — показываем только когда курсор в таблице
  if (editor.isActive('table')) {
    items.push([
      { slot: 'tableMerge', icon: 'i-lucide-table-cells-merge' },
      { slot: 'tableSplit', icon: 'i-lucide-table-cells-split' },
      { slot: 'cellBgColor', icon: 'i-lucide-paint-bucket' },
      { slot: 'tableDelete', icon: 'i-lucide-table-2' }
    ])
  }

  return items
}
</script>

<template>
  <div class="sticky top-0 z-10 border-b border-default rounded-t-md">
    <UEditorToolbar :editor="editor" :items="buildToolbarItems(editor)" :ui="{ base: 'flex flex-wrap items-stretch gap-1.5' }">
      <!-- Table Grid selector -->
      <template #tableInsert>
        <UPopover v-model:open="tableGridOpen">
          <UTooltip :text="t('toolbar.table')">
            <UButton
              icon="i-lucide-table"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </UTooltip>
          <template #content>
            <TableGrid @insert="insertTable" />
          </template>
        </UPopover>
      </template>

      <!-- Text Color -->
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

      <!-- Image Upload -->
      <template #imageUpload>
        <UTooltip :text="t('toolbar.image')">
          <UButton
            icon="i-lucide-image"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="triggerImageUpload(editor)"
          />
        </UTooltip>
      </template>

      <!-- Highlight Color -->
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

      <!-- Callout insert -->
      <template #calloutInsert>
        <UPopover v-model:open="calloutMenuOpen">
          <UTooltip :text="t('toolbar.callout')">
            <UButton
              icon="i-lucide-message-square-warning"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </UTooltip>
          <template #content>
            <div class="flex gap-1 p-1.5">
              <UTooltip v-for="ct in ['info', 'warning', 'error', 'success'] as const" :key="ct" :text="t(`callout.${ct}`)">
                <UButton
                  :icon="{ info: 'i-lucide-info', warning: 'i-lucide-triangle-alert', error: 'i-lucide-circle-x', success: 'i-lucide-circle-check' }[ct]"
                  :color="{ info: 'info', warning: 'warning', error: 'error', success: 'success' }[ct] as any"
                  variant="soft"
                  size="sm"
                  @click="editor.chain().focus().setCallout({ type: ct }).run(); calloutMenuOpen = false"
                />
              </UTooltip>
            </div>
          </template>
        </UPopover>
      </template>

      <!-- Columns insert -->
      <template #columnsInsert>
        <UTooltip :text="t('toolbar.columns')">
          <UButton
            icon="i-lucide-columns-2"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="editor.chain().focus().insertColumns(2).run()"
          />
        </UTooltip>
      </template>

      <!-- Table merge cells -->
      <template #tableMerge>
        <UTooltip :text="t('toolbar.mergeCells')">
          <UButton
            icon="i-lucide-table-cells-merge"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="!editor.can().mergeCells()"
            @click="editor.chain().focus().mergeCells().run()"
          />
        </UTooltip>
      </template>

      <!-- Table split cell -->
      <template #tableSplit>
        <UTooltip :text="t('toolbar.splitCell')">
          <UButton
            icon="i-lucide-table-cells-split"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="!editor.can().splitCell()"
            @click="editor.chain().focus().splitCell().run()"
          />
        </UTooltip>
      </template>

      <!-- Cell background color -->
      <template #cellBgColor>
        <ColorPopover
          icon="i-lucide-paint-bucket"
          :tooltip="t('toolbar.cellBackground')"
          :reset-label="t('toolbar.resetBackground')"
          initial="#ffffff"
          @apply="(val: string) => editor.chain().setCellAttribute('background', val).run()"
          @reset="editor.chain().setCellAttribute('background', null).run()"
          @close="editor.chain().focus().run()"
        />
      </template>

      <!-- Delete table -->
      <template #tableDelete>
        <UTooltip :text="t('toolbar.deleteTable')">
          <UButton
            icon="i-lucide-table-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="editor.chain().focus().deleteTable().run()"
          />
        </UTooltip>
      </template>
    </UEditorToolbar>
  </div>
</template>
