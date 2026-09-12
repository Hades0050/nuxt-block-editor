import { BoxFields } from './BoxFields'
import { BOX_TYPES, type SelectOption } from '../types/box-types'
import { FormValueSelect } from '../form-values/FormValueSelect'

/** Блок с полями выбора из списка */
export class BoxSelect extends BoxFields<FormValueSelect> {
  public readonly name_type = BOX_TYPES.SELECT
  protected static override readonly Field = FormValueSelect

  addOption(fieldIndex: number): void {
    const field = this.value[fieldIndex]
    if (!field) return
    const n = field.items.length + 1
    field.items.push({ value: `option_${n}`, label: `Option ${n}` })
    this.emitChange()
  }

  removeOption(fieldIndex: number, optionIndex: number): void {
    this.value[fieldIndex]?.items.splice(optionIndex, 1)
    this.emitChange()
  }

  updateOption(fieldIndex: number, optionIndex: number, patch: Partial<SelectOption>): void {
    const opt = this.value[fieldIndex]?.items[optionIndex]
    if (!opt) return
    Object.assign(opt, patch)
    this.emitChange()
  }

  selectOption(fieldIndex: number, optionValue: string): void {
    const field = this.value[fieldIndex]
    if (!field) return
    field.value = field.items.find(i => i.value === optionValue) ?? null
    this.emitChange()
  }
}
