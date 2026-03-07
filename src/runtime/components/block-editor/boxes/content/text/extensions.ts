import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style/text-style-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { TableKit } from '@tiptap/extension-table'
import { TaskItem } from '@tiptap/extension-list/task-item'
import { TaskList } from '@tiptap/extension-list/task-list'
import CodeBlockShiki from 'tiptap-extension-code-block-shiki'
import { CustomTableHeader, CustomTableCell } from './table/table-extensions'
import { Callout } from './callout/callout-extension'
import { Column, MultiColumn } from './multi-column/multi-column-extension'
import { SlashCommands } from './slash-commands/slash-commands'

/**
 * Shared TipTap extensions for rich text editors.
 * Note: Link and Underline are included in StarterKit (tiptap v3) via UEditor.
 * TextStyleKit includes: TextStyle, FontFamily, Color, FontSize, LineHeight, BackgroundColor
 */
export const editorExtensions = [
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyleKit,
  Highlight.configure({ multicolor: true }),
  CodeBlockShiki.configure({ defaultTheme: 'github-dark' }),
  TableKit.configure({
    table: { resizable: true },
    tableHeader: false,
    tableCell: false
  }),
  CustomTableHeader,
  CustomTableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
  Callout,
  Column,
  MultiColumn,
  SlashCommands
]
