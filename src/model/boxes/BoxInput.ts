import { BoxFields } from './BoxFields'
import { BOX_TYPES } from '../types/box-types'
import { FormValueInput } from '../form-values/FormValueInput'

/** Блок с полями ввода текста */
export class BoxInput extends BoxFields<FormValueInput> {
  public readonly name_type = BOX_TYPES.INPUT
  public value: FormValueInput[]

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = this.prepareValue(data?.value)
  }

  protected createField(): FormValueInput { return new FormValueInput() }
  protected restoreField(raw: unknown): FormValueInput { return FormValueInput.from(raw as Record<string, unknown>) }
}
