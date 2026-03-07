/** Перечисление всех доступных типов блоков редактора */
export const BOX_TYPES = {
  TEXT: 'TEXT',
  TEXT_AREA: 'TEXT_AREA',
  HTML: 'HTML',
  MARKDOWN: 'MARKDOWN',
  FILE: 'FILE',
  CODE: 'CODE',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE',
  SELECT: 'SELECT',
  INPUT: 'INPUT',
  DATETIME: 'DATETIME',
  TABS: 'TABS',
  TREE: 'TREE',
  VIDEO: 'VIDEO',
  CANVAS: 'CANVAS'
} as const

/** Тип блока — одно из значений BOX_TYPES */
export type BoxType = typeof BOX_TYPES[keyof typeof BOX_TYPES]

/** Элемент выпадающего списка (value + label) */
export interface SelectOption {
  value: string
  label: string
}

/** Режим работы редактора */
export type EditorMode = 'read' | 'fill' | 'edit'
