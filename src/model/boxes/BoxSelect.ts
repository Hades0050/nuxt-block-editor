import { BoxFields } from './BoxFields'
import { BOX_TYPES } from '../types/box-types'
import { FormValueSelect } from '../form-values/FormValueSelect'

/** Блок с полями выбора из списка */
export class BoxSelect extends BoxFields<FormValueSelect> {
  public readonly name_type = BOX_TYPES.SELECT
  public value: FormValueSelect[]

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = this.prepareValue(data?.value)
  }

  protected createField(): FormValueSelect { return new FormValueSelect() }
  protected restoreField(raw: unknown): FormValueSelect { return FormValueSelect.from(raw as Record<string, unknown>) }

  addOption(fieldIndex: number): void {
    const field = this.value[fieldIndex]
    if (!field) return
    const n = field.items.length + 1
    field.items.push({ value: `option_${n}`, label: `Option ${n}` })
    this.emitChange()
  }

  removeOption(fieldIndex: number, optionIndex: number): void {
    const field = this.value[fieldIndex]
    if (!field) return
    field.items.splice(optionIndex, 1)
    this.emitChange()
  }

  updateOptionLabel(fieldIndex: number, optionIndex: number, label: string): void {
    const field = this.value[fieldIndex]
    if (!field) return
    const opt = field.items[optionIndex]
    if (!opt) return
    opt.label = label
    this.emitChange()
  }

  updateOptionValue(fieldIndex: number, optionIndex: number, value: string): void {
    const field = this.value[fieldIndex]
    if (!field) return
    const opt = field.items[optionIndex]
    if (!opt) return
    opt.value = value
    this.emitChange()
  }

  selectOption(fieldIndex: number, optionValue: string): void {
    const field = this.value[fieldIndex]
    if (!field) return
    field.value = field.items.find(i => i.value === optionValue) ?? null
    this.emitChange()
  }
}
