import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок однострочного текста */
export class BoxText extends Box<string> {
  public readonly name_type = BOX_TYPES.TEXT
  public value: string

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string) ?? ''
  }
}
