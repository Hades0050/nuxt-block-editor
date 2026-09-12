import { BoxFields } from './BoxFields'
import { BOX_TYPES } from '../types/box-types'
import { FormValueDate } from '../form-values/FormValueDate'

/** Блок с полями выбора даты/времени */
export class BoxDateTime extends BoxFields<FormValueDate> {
  public readonly name_type = BOX_TYPES.DATETIME
  protected static override readonly Field = FormValueDate
}
