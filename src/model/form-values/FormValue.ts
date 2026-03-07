import { Icon } from '../icon/Icon'
import { generateId } from '../utils/generateId'

/**
 * Базовый класс для значений формы (input, select, datetime).
 * Хранит общие поля: label, placeholder, bindingKey, icon.
 */
export abstract class FormValue {
  public id: string
  public label: string
  public icon: Icon
  public placeholder: string
  public bindingKey: string

  constructor(data?: Partial<{ id: string; label: string; icon: { name?: string; color?: string }; placeholder: string; bindingKey: string }>) {
    this.id = data?.id ?? generateId('fv')
    this.label = data?.label ?? ''
    this.icon = Icon.from(data?.icon)
    this.placeholder = data?.placeholder ?? ''
    this.bindingKey = data?.bindingKey ?? ''
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon.toJSON(),
      placeholder: this.placeholder,
      bindingKey: this.bindingKey
    }
  }
}
