import { BoxFields } from './BoxFields'
import { BOX_TYPES } from '../types/box-types'
import { FormValueInput } from '../form-values/FormValueInput'

/** Блок с полями ввода текста */
export class BoxInput extends BoxFields<FormValueInput> {
  public readonly name_type = BOX_TYPES.INPUT
  protected static override readonly Field = FormValueInput
}
