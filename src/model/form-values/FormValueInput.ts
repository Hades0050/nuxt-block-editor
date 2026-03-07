import { FormValue } from './FormValue'

/** Значение текстового поля ввода */
export class FormValueInput extends FormValue {
  public value: string

  constructor(data?: Partial<FormValueInput>) {
    super(data)
    this.label = data?.label || 'Input field'
    this.value = data?.value ?? ''
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      value: this.value
    }
  }

  static from(raw: Record<string, unknown>): FormValueInput {
    return new FormValueInput(raw as Partial<FormValueInput>)
  }
}
