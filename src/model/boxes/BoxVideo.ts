import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок встроенного видео */
export class BoxVideo extends Box<string> {
  public readonly name_type = BOX_TYPES.VIDEO
  declare public value: string
  declare public width: number
  declare public height: number

  protected static override readonly extras = { value: '', width: 560, height: 315 }
}
