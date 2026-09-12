import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок кода с подсветкой синтаксиса */
export class BoxCode extends Box<string> {
  public readonly name_type = BOX_TYPES.CODE
  declare public value: string
  declare public language: string

  protected static override readonly extras = { value: '', language: 'javascript' }
}
