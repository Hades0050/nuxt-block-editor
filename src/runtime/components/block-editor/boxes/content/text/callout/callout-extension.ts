import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CalloutView from './CalloutView.vue'

export type CalloutType = 'info' | 'warning' | 'error' | 'success'

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { type?: CalloutType }) => ReturnType
      toggleCallout: (attrs?: { type?: CalloutType }) => ReturnType
      unsetCallout: () => ReturnType
    }
  }
}

/**
 * Callout — цветной блок-подсказка (info, warning, error, success).
 * Вдохновлён Yiitap callout extension.
 */
export const Callout = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: el => el.getAttribute('data-callout-type') || 'info',
        renderHTML: attrs => ({ 'data-callout-type': attrs.type })
      }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout-type]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'callout' }), 0]
  },

  addCommands() {
    return {
      setCallout: (attrs) => ({ commands }) => {
        return commands.wrapIn(this.name, attrs)
      },
      toggleCallout: (attrs) => ({ commands }) => {
        return commands.toggleWrap(this.name, attrs)
      },
      unsetCallout: () => ({ commands }) => {
        return commands.lift(this.name)
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCallout()
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(CalloutView)
  }
})
