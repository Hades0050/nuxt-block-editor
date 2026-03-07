import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок встроенного видео */
export class BoxVideo extends Box<string> {
  public readonly name_type = BOX_TYPES.VIDEO
  public value: string
  public width: number
  public height: number

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string) ?? ''
    this.width = (data?.width as number) ?? 560
    this.height = (data?.height as number) ?? 315
  }

  override toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), width: this.width, height: this.height }
  }
}
