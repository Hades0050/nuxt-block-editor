import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { TableHeader } from '@tiptap/extension-table/header'
import { TableCell } from '@tiptap/extension-table/cell'
import TableHeaderView from './TableHeaderView.vue'
import TableCellView from './TableCellView.vue'

/** Общий атрибут background для ячеек таблицы */
const backgroundAttribute = {
  background: {
    default: null,
    parseHTML: (el: HTMLElement) => el.style.backgroundColor || el.getAttribute('data-background') || null,
    renderHTML: (attrs: Record<string, any>) => {
      if (!attrs.background) return {}
      return { style: `background-color: ${attrs.background}`, 'data-background': attrs.background }
    }
  }
}

/**
 * Расширение TableHeader с Vue NodeView —
 * рендерит col-handler (сверху) и row-handler (слева).
 */
export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...backgroundAttribute
    }
  },
  addNodeView() {
    return VueNodeViewRenderer(TableHeaderView, {
      stopEvent: () => false
    })
  }
})

/**
 * Расширение TableCell с Vue NodeView —
 * рендерит row-handler (слева, только на первой ячейке через CSS).
 */
export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...backgroundAttribute
    }
  },
  addNodeView() {
    return VueNodeViewRenderer(TableCellView, {
      stopEvent: () => false
    })
  }
})
