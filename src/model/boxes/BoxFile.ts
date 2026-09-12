import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок загрузки файла */
export class BoxFile extends Box<string | null> {
  public readonly name_type = BOX_TYPES.FILE
  declare public value: string | null
  declare public fileName: string | null
  declare public applicationType: string

  protected static override readonly extras = { value: null, fileName: null, applicationType: '' }

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
}
