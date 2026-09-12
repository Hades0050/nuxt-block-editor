import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок однострочного текста */
export class BoxText extends Box<string> {
  public readonly name_type = BOX_TYPES.TEXT
  declare public value: string
  protected static override readonly extras = { value: '' }
}
