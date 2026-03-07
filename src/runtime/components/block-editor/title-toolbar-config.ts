import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style/text-style-kit'
import { Highlight } from '@tiptap/extension-highlight'

/**
 * Упрощённый набор расширений для редактирования заголовков/подзаголовков блоков.
 * TextStyleKit включает: TextStyle, FontFamily, Color, FontSize, LineHeight, BackgroundColor
 */
export const titleExtensions = [
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyleKit,
  Highlight.configure({ multicolor: true })
]
