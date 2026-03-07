import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок загрузки файла */
export class BoxFile extends Box<string | null> {
  public readonly name_type = BOX_TYPES.FILE
  public value: string | null
  public fileName: string | null
  public applicationType: string

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string | null) ?? null
    this.fileName = (data?.fileName as string | null) ?? null
    this.applicationType = (data?.applicationType as string) ?? ''
  }

  setFile(url: string, name: string, type: string): void {
    this.value = url
    this.fileName = name
    this.applicationType = type
    this.emitChange()
  }

  clearFile(): void {
    this.value = null
    this.fileName = null
    this.applicationType = ''
    this.emitChange()
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fileName: this.fileName,
      applicationType: this.applicationType
    }
  }
}
