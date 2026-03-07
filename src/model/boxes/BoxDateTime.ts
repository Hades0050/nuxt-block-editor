import { BoxFields } from './BoxFields'
import { BOX_TYPES } from '../types/box-types'
import { FormValueDate } from '../form-values/FormValueDate'

/** Блок с полями выбора даты/времени */
export class BoxDateTime extends BoxFields<FormValueDate> {
  public readonly name_type = BOX_TYPES.DATETIME
  public value: FormValueDate[]

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = this.prepareValue(data?.value)
  }

  protected createField(): FormValueDate { return new FormValueDate() }
  protected restoreField(raw: unknown): FormValueDate { return FormValueDate.from(raw as Record<string, unknown>) }
}
