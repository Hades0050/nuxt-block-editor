import type { Box } from '../boxes/Box'
import type { IContent, IBoxFactory } from '../types/interfaces'
import { setContentClass } from '../utils/contentRef'

/**
 * Контейнер блоков. Хранит массив боксов и Map-индекс для O(1)-поиска по id.
 */
export class Content implements IContent {
  public boxes: Box[] = []

  /** Приватный индекс для O(1)-поиска по id */
  private _boxMap: Map<string, Box> = new Map()

  constructor(boxes?: Box[]) {
    this._initBoxes(boxes ?? [])
  }

  /** Устанавливает массив и перестраивает Map-индекс */
  private _initBoxes(arr: Box[]): void {
    this.boxes = arr
    this._boxMap = new Map(arr.map(b => [b.id, b]))
  }

  /** Добавляет блок в конец (y = после последнего существующего) */
  addBox(box: Box): void {
    if (this.boxes.length > 0) {
      const maxY = Math.max(...this.boxes.map(b => b.y + b.h))
      const maxI = Math.max(...this.boxes.map(b => b.i))
      box.y = maxY
      box.i = maxI + 1
    }
    this.boxes.push(box)
    this._boxMap.set(box.id, box)
  }

  /** Удаляет блок по id */
  removeBox(boxId: string): void {
    const box = this._boxMap.get(boxId)
    if (!box) return
    this._boxMap.delete(boxId)
    const index = this.boxes.indexOf(box)
    if (index !== -1) {
      this.boxes.splice(index, 1)
    }
  }

  /** Ищет блок по id — O(1) через Map */
  findBox(boxId: string): Box | undefined {
    return this._boxMap.get(boxId)
  }

  /** Обновляет свойства блока и пересоздаёт ссылку для Vue-реактивности */
  updateBox(boxId: string, updates: Partial<Record<string, unknown>>): void {
    const oldBox = this._boxMap.get(boxId)
    if (!oldBox) return
    oldBox.applyUpdates(updates)
    const newBox = Object.assign(Object.create(Object.getPrototypeOf(oldBox)), oldBox) as Box
    const index = this.boxes.indexOf(oldBox)
    if (index !== -1) {
      this.boxes[index] = newBox
    }
    this._boxMap.set(boxId, newBox)
  }

  /** Синхронизирует позиции блоков с gridstack — O(m) благодаря Map */
  syncPositions(positions: Array<{ id: string; x: number; y: number; w: number; h: number }>): void {
    for (const pos of positions) {
      const box = this._boxMap.get(pos.id)
      if (box) box.setPosition(pos)
    }
  }

  /** Перемещает блок вверх/вниз в порядке отображения */
  moveBox(boxId: string, direction: 'up' | 'down'): void {
    const box = this._boxMap.get(boxId)
    if (!box) return
    const index = this.boxes.indexOf(box)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= this.boxes.length) return
    const temp = this.boxes[index]!
    this.boxes[index] = this.boxes[targetIndex]!
    this.boxes[targetIndex] = temp
    this.boxes.forEach((b, i) => {
      b.i = i
      b.y = i === 0 ? 0 : this.boxes[i - 1]!.y + this.boxes[i - 1]!.h
    })
  }

  toJSON(): { boxes: Record<string, unknown>[] } {
    return { boxes: this.boxes.map(b => b.toJSON()) }
  }

  toJsonString(): string {
    return JSON.stringify(this.boxes.map(b => b.toJSON()))
  }

  /** Десериализация из JSON-строки */
  static fromJsonString(json: string, factory: IBoxFactory): Content {
    if (!json) return new Content()
    try {
      const parsed = JSON.parse(json)
      const rawBoxes = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.boxes) ? parsed.boxes : []
      const content = new Content()
      content._initBoxes(rawBoxes.map((raw: unknown) => factory.prepare(raw) as Box))
      return content
    }
    catch {
      return new Content()
    }
  }

  /** Создание из сырых данных (для вложенного контента в TabItem/TreeNode) */
  static fromRaw(raw: unknown, factory?: IBoxFactory): Content {
    if (!raw) return new Content()
    if (raw instanceof Content) return raw
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.boxes) && factory) {
      const content = new Content()
      content._initBoxes((obj.boxes as unknown[]).map(b => factory.prepare(b) as Box))
      return content
    }
    return new Content()
  }
}

// Регистрируем Content для разрешения циклической зависимости с TabItem/TreeNode
setContentClass(Content)
