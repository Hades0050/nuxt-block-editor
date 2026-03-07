import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок внешнего сервиса */
export class BoxExternalService extends Box<string | null> {
  public readonly name_type = BOX_TYPES.EXTERNAL_SERVICE
  public value: string | null

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = (data?.value as string | null) ?? null
  }
}
