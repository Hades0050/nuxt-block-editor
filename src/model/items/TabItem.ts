import { Icon } from '../icon/Icon'
import { generateId } from '../utils/generateId'
import { getContentClass } from '../utils/contentRef'
import type { IBoxFactory, IContent } from '../types/interfaces'

/** Элемент вкладки — хранит label, icon и вложенный контент */
export class TabItem {
  public id: string
  public label: string
  public icon: Icon
  public content: IContent

  constructor(data?: Partial<Record<string, unknown>>, factory?: IBoxFactory) {
    this.id = (data?.id as string) ?? generateId('tab')
    this.label = (data?.label as string) ?? 'Tab'
    this.icon = Icon.from(data?.icon as { name?: string; color?: string } | undefined)
    const CC = getContentClass()!
    this.content = CC.fromRaw(data?.content, factory)
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon.toJSON(),
      content: this.content.toJSON()
    }
  }
}
