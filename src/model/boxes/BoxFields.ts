import { Box } from './Box'
import type { FormValue } from '../form-values/FormValue'

/**
 * Базовый класс для блоков с массивом полей формы (input, select, datetime).
 * Централизует CRUD-операции и десериализацию полей.
 */
export abstract class BoxFields<T extends FormValue> extends Box<T[]> {
  public abstract override value: T[]

  /** Создаёт новое пустое поле — реализуется в подклассах */
  protected abstract createField(): T

  /** Восстанавливает поле из сырых данных — реализуется в подклассах */
  protected abstract restoreField(raw: unknown): T

  /** Десериализация массива полей из сырых данных */
  protected prepareValue(raw: unknown): T[] {
    if (!raw || !Array.isArray(raw)) return [this.createField()]
    return raw.map(item => this.restoreField(item))
  }

  addField(): void {
    this.value.push(this.createField())
    this.emitChange()
  }

  removeField(id: string): void {
    this.value = this.value.filter(f => f.id !== id)
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
