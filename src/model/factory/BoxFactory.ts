import type { IBoxFactory, IBox } from '../types/interfaces'
import type { BoxType } from '../types/box-types'
import { BOX_TYPES } from '../types/box-types'
import type { Box } from '../boxes/Box'
import { BoxText } from '../boxes/BoxText'
import { BoxTextArea } from '../boxes/BoxTextArea'
import { BoxHtml } from '../boxes/BoxHtml'
import { BoxMarkdown } from '../boxes/BoxMarkdown'
import { BoxFile } from '../boxes/BoxFile'
import { BoxCode } from '../boxes/BoxCode'
import { BoxExternalService } from '../boxes/BoxExternalService'
import { BoxSelect } from '../boxes/BoxSelect'
import { BoxInput } from '../boxes/BoxInput'
import { BoxDateTime } from '../boxes/BoxDateTime'
import { BoxTabs } from '../boxes/BoxTabs'
import { BoxTree } from '../boxes/BoxTree'
import { BoxVideo } from '../boxes/BoxVideo'
import { BoxCanvas } from '../boxes/BoxCanvas'

export type BoxConstructor = new (data?: Partial<Record<string, unknown>>, factory?: IBoxFactory) => Box

const TYPE_MAP: Record<string, BoxConstructor> = {
  [BOX_TYPES.TEXT]: BoxText,
  [BOX_TYPES.TEXT_AREA]: BoxTextArea,
  [BOX_TYPES.HTML]: BoxHtml,
  [BOX_TYPES.MARKDOWN]: BoxMarkdown,
  [BOX_TYPES.FILE]: BoxFile,
  [BOX_TYPES.CODE]: BoxCode,
  [BOX_TYPES.EXTERNAL_SERVICE]: BoxExternalService,
  [BOX_TYPES.SELECT]: BoxSelect,
  [BOX_TYPES.INPUT]: BoxInput,
  [BOX_TYPES.DATETIME]: BoxDateTime,
  [BOX_TYPES.TABS]: BoxTabs,
  [BOX_TYPES.TREE]: BoxTree,
  [BOX_TYPES.VIDEO]: BoxVideo,
  [BOX_TYPES.CANVAS]: BoxCanvas
}

export const boxFactory: IBoxFactory & {
  /** Регистрирует пользовательский тип бокса */
  registerBoxType(type: string, ctor: BoxConstructor): void
} = {
  prepare(raw: unknown): IBox {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid box: not an object')
    }
    const obj = raw as Record<string, unknown>
    const nameType = obj.name_type as string
    if (!nameType || !(nameType in TYPE_MAP)) {
      throw new Error(`Unknown box type: ${nameType}`)
    }
    const Ctor = TYPE_MAP[nameType]!
    return new Ctor(obj, boxFactory)
  },

  createDefault(type: BoxType): IBox {
    const Ctor = TYPE_MAP[type]
    if (!Ctor) throw new Error(`Unknown box type: ${type}`)
    return new Ctor(undefined, boxFactory)
  },

  registerBoxType(type: string, ctor: BoxConstructor): void {
    TYPE_MAP[type] = ctor
  }
}
