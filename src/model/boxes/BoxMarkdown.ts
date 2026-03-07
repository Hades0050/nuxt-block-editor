import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок Markdown-разметки */
export class BoxMarkdown extends Box<string> {
  public readonly name_type = BOX_TYPES.MARKDOWN
  public value: string

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string) ?? ''
  }
}
