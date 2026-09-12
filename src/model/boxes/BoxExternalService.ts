import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'

/** Блок внешнего сервиса */
export class BoxExternalService extends Box<string | null> {
  public readonly name_type = BOX_TYPES.EXTERNAL_SERVICE
  declare public value: string | null
  protected static override readonly extras = { value: null }
}
