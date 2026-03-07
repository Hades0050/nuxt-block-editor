import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок многострочного текста */
export class BoxTextArea extends Box<string> {
  public readonly name_type = BOX_TYPES.TEXT_AREA
  public value: string

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string) ?? ''
  }
}
