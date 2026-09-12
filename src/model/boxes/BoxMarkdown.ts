import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок Markdown-разметки */
export class BoxMarkdown extends Box<string> {
  public readonly name_type = BOX_TYPES.MARKDOWN
  declare public value: string
  protected static override readonly extras = { value: '' }
}
