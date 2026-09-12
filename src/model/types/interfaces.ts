import type { BoxType } from './box-types'
import type { Box } from '../boxes/Box'

/** Фабрика блоков — создание и десериализация Box */
export interface IBoxFactory {
  prepare(raw: unknown): Box
  createDefault(type: BoxType): Box
}
