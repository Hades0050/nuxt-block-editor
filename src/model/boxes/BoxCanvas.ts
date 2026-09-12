import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'
import { generateId } from '../utils/generateId'

/** Блок холста для рисования */
export class BoxCanvas extends Box<string> {
  public readonly name_type = BOX_TYPES.CANVAS
  declare public value: string
  declare public canvasId: string
  declare public backgroundColor: string
  declare public strokeColor: string
  declare public lineWidth: number
  declare public canvasHeight: number

  protected static override readonly extras = {
    value: '',
    canvasId: () => generateId('canvas'),
    backgroundColor: '#ffffff',
    strokeColor: '#000000',
    lineWidth: 2,
    canvasHeight: 260
  }

  /** Холст выше прочих блоков по умолчанию — рисовать в одну строку сетки нечем */
  constructor(data?: Partial<Record<string, unknown>>) {
    super({ ...data, h: (data?.h as number) ?? 5 })
  }

  clear(): void {
    this.value = ''
    this.emitChange()
  }

  saveDrawing(data: string): void {
    this.value = data
    this.emitChange()
  }
}
