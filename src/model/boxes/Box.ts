import type { BoxType } from '../types/box-types'
import type { IBox } from '../types/interfaces'
import { generateId } from '../utils/generateId'

/**
 * Базовый абстрактный класс для всех блоков редактора.
 * Хранит позицию в сетке (x, y, w, h), метаданные и значение.
 */
export abstract class Box<T = unknown> implements IBox<T> {
  public id: string
  public abstract readonly name_type: BoxType
  public title: string
  public subtitle: string
  public x: number
  public y: number
  public w: number
  public h: number
  public minW: number
  public minH: number
  public i: number
  public abstract value: T

  private _onChange?: () => void

  /** Привязывает колбэк, вызываемый при мутациях блока */
  bindChange(callback: () => void): void {
    this._onChange = callback
  }

  /** Отвязывает колбэк onChange */
  unbindChange(): void {
    this._onChange = undefined
  }

  /** Уведомляет родителя об изменении данных блока */
  protected emitChange(): void {
    this._onChange?.()
  }

  constructor(data?: Partial<Record<string, unknown>>) {
    this.id = (data?.id as string) ?? generateId('box')
    this.title = (data?.title as string) ?? ''
    this.subtitle = (data?.subtitle as string) ?? ''
    this.x = (data?.x as number) ?? 0
    this.y = (data?.y as number) ?? 0
    this.w = (data?.w as number) ?? 12
    this.h = (data?.h as number) ?? 1
    this.minW = (data?.minW as number) ?? 3
    this.minH = (data?.minH as number) ?? 1
    this.i = (data?.i as number) ?? 0
  }

  /** Обновляет позицию блока в сетке (вызывается из gridstack sync) */
  setPosition(pos: { x: number; y: number; w: number; h: number }): void {
    this.x = pos.x
    this.y = pos.y
    this.w = pos.w
    this.h = pos.h
  }

  /** Применяет частичное обновление свойств блока */
  applyUpdates(updates: Partial<Record<string, unknown>>): void {
    for (const [key, val] of Object.entries(updates)) {
      if (key in this && val !== undefined) {
        (this as Record<string, unknown>)[key] = val
      }
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name_type: this.name_type,
      title: this.title,
      subtitle: this.subtitle,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      minW: this.minW,
      minH: this.minH,
      i: this.i,
      value: this.value
    }
  }
}
