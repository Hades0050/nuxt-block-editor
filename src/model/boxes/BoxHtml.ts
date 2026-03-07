import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'
import { Content } from '../content/Content'
import type { IBoxFactory } from '../types/interfaces'

/** Блок HTML с вложенным контентом */
export class BoxHtml extends Box<Content> {
  public readonly name_type = BOX_TYPES.HTML
  public value: Content

  constructor(data?: Partial<Record<string, unknown>>, factory?: IBoxFactory) {
    super({ ...data, h: (data?.h as number) ?? 8 })
    this.value = Content.fromRaw(data?.value, factory)
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      value: this.value.toJSON()
    }
  }
}
