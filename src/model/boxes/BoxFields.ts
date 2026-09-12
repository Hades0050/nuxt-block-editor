import { Box } from './Box'
import type { FormValue } from '../form-values/FormValue'

/**
 * Базовый класс для блоков с массивом полей формы (input, select, datetime).
 * Централизует CRUD-операции и десериализацию полей.
 */
type FieldCtor<T extends FormValue> = new (raw?: Record<string, unknown>) => T

export abstract class BoxFields<T extends FormValue> extends Box<T[]> {
  /** Класс поля — единственное, чем различаются подклассы. Задаётся в них статиком. */
  protected static readonly Field: unknown

  public override value: T[]

  constructor(data?: Partial<Record<string, unknown>>) {
    super(data)
    this.value = this.prepareValue(data?.value)
  }

  /** Конструктор поля текущего подкласса */
  protected get fieldCtor(): FieldCtor<T> {
    return (this.constructor as typeof BoxFields).Field as FieldCtor<T>
  }

  /** Десериализация массива полей из сырых данных; пустой блок получает одно пустое поле */
  protected prepareValue(raw: unknown): T[] {
    const Field = this.fieldCtor
    if (!Array.isArray(raw)) return [new Field()]
    return raw.map(item => new Field(item as Record<string, unknown>))
  }

  addField(): void {
    this.value.push(new this.fieldCtor())
    this.emitChange()
  }

  removeFieldAt(index: number): void {
    const field = this.value[index]
    if (!field) return
    this.value = this.value.filter(f => f.id !== field.id)
    this.emitChange()
  }

  updateFieldAt(index: number, patch: Record<string, unknown>): void {
    const field = this.value[index]
    if (!field) return
    Object.assign(field, patch)
    this.emitChange()
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      value: this.value.map(v => v.toJSON())
    }
  }
}
