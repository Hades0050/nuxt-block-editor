import { Extension } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue-3'
import { Suggestion } from '@tiptap/suggestion'
import { computePosition, flip, shift, offset } from '@floating-ui/dom'
import type { Editor, Range } from '@tiptap/core'
import SlashCommandList from './SlashCommandList.vue'

export interface SlashCommandItem {
  labelKey: string
  descriptionKey: string
  icon: string
  command: (editor: Editor, range: Range) => void
}

/**
 * Элементы slash-меню с ключами i18n.
 */
export const slashCommandItems: SlashCommandItem[] = [
  {
    labelKey: 'slash.heading1',
    descriptionKey: 'slash.heading1Desc',
    icon: 'i-lucide-heading-1',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    }
  },
  {
    labelKey: 'slash.heading2',
    descriptionKey: 'slash.heading2Desc',
    icon: 'i-lucide-heading-2',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    }
  },
  {
    labelKey: 'slash.heading3',
    descriptionKey: 'slash.heading3Desc',
    icon: 'i-lucide-heading-3',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    }
  },
  {
    labelKey: 'slash.bulletList',
    descriptionKey: 'slash.bulletListDesc',
    icon: 'i-lucide-list',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    }
  },
  {
    labelKey: 'slash.orderedList',
    descriptionKey: 'slash.orderedListDesc',
    icon: 'i-lucide-list-ordered',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    }
  },
  {
    labelKey: 'slash.taskList',
    descriptionKey: 'slash.taskListDesc',
    icon: 'i-lucide-list-checks',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    }
  },
  {
    labelKey: 'slash.blockquote',
    descriptionKey: 'slash.blockquoteDesc',
    icon: 'i-lucide-text-quote',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    }
  },
  {
    labelKey: 'slash.codeBlock',
    descriptionKey: 'slash.codeBlockDesc',
    icon: 'i-lucide-square-code',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    }
  },
  {
    labelKey: 'slash.callout',
    descriptionKey: 'slash.calloutDesc',
    icon: 'i-lucide-message-square-warning',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCallout({ type: 'info' }).run()
    }
  },
  {
    labelKey: 'slash.columns',
    descriptionKey: 'slash.columnsDesc',
    icon: 'i-lucide-columns-2',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertColumns(2).run()
    }
  },
  {
    labelKey: 'slash.table',
    descriptionKey: 'slash.tableDesc',
    icon: 'i-lucide-table',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  },
  {
    labelKey: 'slash.horizontalRule',
    descriptionKey: 'slash.horizontalRuleDesc',
    icon: 'i-lucide-minus',
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    }
  }
]

/** Позиционирует popup рядом с виртуальным элементом (clientRect) */
function updatePopupPosition(popup: HTMLElement, clientRect: () => DOMRect | null) {
  const rect = clientRect()
  if (!rect) return

  const virtualEl = {
    getBoundingClientRect: () => rect
  }

  computePosition(virtualEl as Element, popup, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })]
  }).then(({ x, y }) => {
    Object.assign(popup.style, {
      left: `${x}px`,
      top: `${y}px`
    })
  })
}

/**
 * Slash-команды — расширение TipTap для вставки блоков через "/".
 * Вдохновлено Yiitap char-command extension.
 */
export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }) => {
          return slashCommandItems.filter(item =>
            item.labelKey.toLowerCase().includes(query.toLowerCase()) ||
            item.descriptionKey.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: VueRenderer
          let popup: HTMLElement

          return {
            onStart: (props) => {
              component = new VueRenderer(SlashCommandList, {
                props,
                editor: props.editor
              })

              if (!props.clientRect || !component.element) return

              popup = document.createElement('div')
              popup.style.position = 'absolute'
              popup.style.zIndex = '9999'
              popup.appendChild(component.element)
              document.body.appendChild(popup)

              updatePopupPosition(popup, props.clientRect as () => DOMRect)
            },

            onUpdate(props) {
              component?.updateProps(props)
              if (popup && props.clientRect) {
                updatePopupPosition(popup, props.clientRect as () => DOMRect)
              }
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup?.remove()
                return true
              }
              return component?.ref?.onKeyDown?.(props.event) ?? false
            },

            onExit() {
              popup?.remove()
              component?.destroy()
            }
          }
        }
      })
    ]
  }
})
