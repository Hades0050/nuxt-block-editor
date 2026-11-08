/**
 * Боксы грузятся лениво: на холодном кэше Vite первое добавление блока находит
 * новые зависимости → full reload в dev → содержимое редактора теряется.
 * Всё, что импортируется в runtime/model, должно быть здесь или в EXCLUDE.
 */
export const OPTIMIZE_INCLUDE: string[] = [
  'prosemirror-view',
  'prosemirror-state',
  'prosemirror-model',
  'prosemirror-tables',
  'prosemirror-transform',
  '@tiptap/pm/model',
  '@tiptap/pm/state',
  '@tiptap/pm/view',
  '@tiptap/extension-highlight',
  '@tiptap/extension-text-align',
  '@tiptap/extension-text-style/text-style-kit',
  'tiptap-extension-code-block-shiki',
  'shiki',
  'shiki/langs',
  'gridstack',
  'mustache',
  'konva',
  'vue-konva'
]

/** Не пребандлим, чтобы Vite не инлайнил prosemirror-view (дубли классов вроде DecorationSet). */
export const OPTIMIZE_EXCLUDE: string[] = [
  '@tiptap/extension-table',
  '@tiptap/extension-image',
  '@tiptap/extension-list'
]
