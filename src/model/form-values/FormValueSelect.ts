import { FormValue } from './FormValue'
import type { SelectOption } from '../types/box-types'

/** Значение поля выбора из списка */
export class FormValueSelect extends FormValue {
  public value: SelectOption | null
  public items: SelectOption[]

  constructor(data?: Partial<FormValueSelect>) {
    super(data)
    this.label = data?.label || 'Select field'
    this.value = data?.value ?? null
    this.items = data?.items ?? [{ value: 'option_1', label: 'Option 1' }]
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      value: this.value,
      items: this.items
    }
  }

  static from(raw: Record<string, unknown>): FormValueSelect {
    return new FormValueSelect(raw as Partial<FormValueSelect>)
  }
}
