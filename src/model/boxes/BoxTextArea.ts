import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок многострочного текста */
export class BoxTextArea extends Box<string> {
  public readonly name_type = BOX_TYPES.TEXT_AREA
  declare public value: string
  protected static override readonly extras = { value: '' }
}
