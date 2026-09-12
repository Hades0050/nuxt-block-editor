import { VueRenderer } from '@tiptap/vue-3'
import { Suggestion } from '@tiptap/suggestion'
import { PluginKey } from '@tiptap/pm/state'
import type { Editor, Range } from '@tiptap/core'
import type { TemplateKey } from '#block-editor'
import { templateVarsPluginKey } from './template-vars-plugin'
import { updatePopupPosition } from './popup'
import TemplateVarList from './TemplateVarList.vue'

/**
 * Свой PluginKey обязателен: SlashCommands занимает дефолтный SuggestionPluginKey,
 * а prosemirror-state бросает RangeError на двух инстансах одного ключа.
 */
export const templateVarsSuggestionKey = new PluginKey('blockEditorTemplateVarsSuggestion')

const MAX_ITEMS = 50

function insertTemplateToken(editor: Editor, range: Range, key: TemplateKey): void {
  const open = key.kind === 'section' ? `{{#${key.path}}}` : `{{${key.path}}}`
  const text = key.kind === 'section' ? `${open}{{/${key.path}}}` : open

  // поглощаем уже набранные закрывающие скобки, чтобы не получилось {{key}}}}
  const tail = editor.state.doc.textBetween(
    range.to,
    Math.min(range.to + 2, editor.state.doc.content.size)
  )
  const to = tail === '}}' ? range.to + 2 : range.to

  const chain = editor.chain().focus().insertContentAt({ from: range.from, to }, text)
  if (key.kind === 'section') chain.setTextSelection(range.from + open.length)
  chain.run()
}

export function templateVarsSuggestion(editor: Editor) {
  return Suggestion<TemplateKey>({
    editor,
    pluginKey: templateVarsSuggestionKey,
    char: '{{',
    allowedPrefixes: null,
    allowSpaces: false,
    startOfLine: false,

    // query не может содержать '{', но может содержать '}' — закрытый токен уже не подсказка
    allow: ({ state }) => (templateVarsPluginKey.getState(state)?.meta?.keys.length ?? 0) > 0,

    items: ({ query, editor: instance }) => {
      const keys = templateVarsPluginKey.getState(instance.state)?.meta?.keys ?? []
      if (query.includes('}')) return []
      if (!query) return keys.slice(0, MAX_ITEMS)

      const needle = query.toLowerCase()
      return keys.filter(key => key.path.toLowerCase().includes(needle)).slice(0, MAX_ITEMS)
    },

    command: ({ editor: instance, range, props }) => {
      insertTemplateToken(instance, range, props)
    },

    render: () => {
      let component: VueRenderer
      let popup: HTMLElement

      return {
        onStart: (props) => {
          const labels = templateVarsPluginKey.getState(props.editor.state)?.meta?.labels
          if (!labels) return

          component = new VueRenderer(TemplateVarList, {
            props: { items: props.items, command: props.command, labels },
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
          component?.updateProps({ items: props.items, command: props.command })
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
}
