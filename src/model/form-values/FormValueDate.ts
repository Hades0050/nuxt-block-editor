import { FormValue } from './FormValue'

/** Значение поля даты/времени */
export class FormValueDate extends FormValue {
  public value: string
  public mode: 'date' | 'time' | 'datetime'

  constructor(data?: Partial<FormValueDate>) {
    super(data)
    this.label = data?.label || 'Date field'
    this.value = data?.value ?? ''
    this.mode = data?.mode ?? 'date'
  }

  get htmlInputType(): string {
    if (this.mode === 'time') return 'time'
    if (this.mode === 'datetime') return 'datetime-local'
    return 'date'
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      value: this.value,
      mode: this.mode
    }
  }
}
