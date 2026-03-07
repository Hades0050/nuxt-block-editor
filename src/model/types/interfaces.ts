import type { BoxType } from './box-types'

/** Интерфейс блока редактора — позиция в сетке, метаданные и значение */
export interface IBox<T = unknown> {
  id: string
  readonly name_type: BoxType
  title: string
  subtitle: string
  x: number
  y: number
  w: number
  h: number
  minW: number
  minH: number
  i: number
  value: T
  setPosition(pos: { x: number; y: number; w: number; h: number }): void
  applyUpdates(updates: Partial<Record<string, unknown>>): void
  toJSON(): Record<string, unknown>
}

/** Интерфейс контейнера блоков — управление коллекцией IBox */
export interface IContent {
  boxes: IBox[]
  addBox(box: IBox): void
  removeBox(boxId: string): void
  findBox(boxId: string): IBox | undefined
  toJSON(): { boxes: Record<string, unknown>[] }
  toJsonString(): string
}

/** Фабрика блоков — создание и десериализация IBox */
export interface IBoxFactory {
  prepare(raw: unknown): IBox
  createDefault(type: BoxType): IBox
}
