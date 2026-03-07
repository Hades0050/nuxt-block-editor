import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MultiColumnView from './MultiColumnView.vue'

export interface MultiColumnOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    multiColumn: {
      insertColumns: (count?: number) => ReturnType
    }
  }
}

/**
 * Column — отдельная колонка внутри MultiColumn.
 */
export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: 'block+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-column]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-column': '', class: 'column' }), 0]
  }
})

/**
 * MultiColumn — контейнер с N колонками.
 * Вдохновлён Yiitap multi-column extension.
 */
export const MultiColumn = Node.create<MultiColumnOptions>({
  name: 'multiColumn',
  group: 'block',
  content: 'column{2,}',
  defining: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-multi-column]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-multi-column': '',
      class: 'multi-column'
    }), 0]
  },

  addCommands() {
    return {
      insertColumns: (count = 2) => ({ chain }) => {
        const columns = Array.from({ length: count }, () => ({
          type: 'column',
          content: [{ type: 'paragraph' }]
        }))

        return chain()
          .insertContent({ type: this.name, content: columns })
          .run()
      }
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(MultiColumnView)
  }
})
