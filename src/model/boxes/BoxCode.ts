import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок кода с подсветкой синтаксиса */
export class BoxCode extends Box<string> {
  public readonly name_type = BOX_TYPES.CODE
  public value: string
  public language: string

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string) ?? ''
    this.language = (data?.language as string) ?? 'javascript'
  }

  override toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), language: this.language }
  }
}
