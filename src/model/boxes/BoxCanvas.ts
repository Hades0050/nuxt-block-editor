import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'
import { generateId } from '../utils/generateId'

/** Блок холста для рисования */
export class BoxCanvas extends Box<string> {
  public readonly name_type = BOX_TYPES.CANVAS
  public value: string
  public canvasId: string
  public backgroundColor: string
  public strokeColor: string
  public lineWidth: number
  public canvasHeight: number

  constructor(data?: Partial<Record<string, unknown>>) {
    super({ ...data, h: (data?.h as number) ?? 5 })
    this.value = (data?.value as string) ?? ''
    this.canvasId = (data?.canvasId as string) ?? generateId('canvas')
    this.backgroundColor = (data?.backgroundColor as string) ?? '#ffffff'
    this.strokeColor = (data?.strokeColor as string) ?? '#000000'
    this.lineWidth = (data?.lineWidth as number) ?? 2
    this.canvasHeight = (data?.canvasHeight as number) ?? 260
  }

  clear(): void {
    this.value = ''
    this.emitChange()
  }

  saveDrawing(data: string): void {
    this.value = data
    this.emitChange()
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      canvasId: this.canvasId,
      backgroundColor: this.backgroundColor,
      strokeColor: this.strokeColor,
      lineWidth: this.lineWidth,
      canvasHeight: this.canvasHeight
    }
  }
}
