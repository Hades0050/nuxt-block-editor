import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'
import { TabItem } from '../items/TabItem'
import type { IBoxFactory } from '../types/interfaces'

/** Блок с вкладками — каждая вкладка содержит вложенный контент */
export class BoxTabs extends Box<TabItem[]> {
  public readonly name_type = BOX_TYPES.TABS
  public value: TabItem[]
  public activeTabId: string

  constructor(data?: Partial<Record<string, unknown>>, factory?: IBoxFactory) {
    super(data)
    this.value = BoxTabs.prepareValue(data?.value, factory)
    this.activeTabId = (data?.activeTabId as string) ?? this.value[0]?.id ?? ''
  }

  private static prepareValue(raw: unknown, factory?: IBoxFactory): TabItem[] {
    if (!raw || !Array.isArray(raw)) return [new TabItem({ label: 'Tab 1' }, factory)]
    return raw.map(item => new TabItem(item as Record<string, unknown>, factory))
  }

  addTab(factory?: IBoxFactory): TabItem {
    const tab = new TabItem({ label: `Tab ${this.value.length + 1}` }, factory)
    this.value.push(tab)
    this.activeTabId = tab.id
    this.emitChange()
    return tab
  }

  removeTab(tabId: string): void {
    this.value = this.value.filter(t => t.id !== tabId)
    if (this.activeTabId === tabId && this.value.length) {
      this.activeTabId = this.value[0]!.id
    }
    this.emitChange()
  }

  findTab(tabId: string): TabItem | undefined {
    return this.value.find(t => t.id === tabId)
  }

  updateTabLabel(tabId: string, label: string): void {
    const tab = this.findTab(tabId)
    if (!tab) return
    tab.label = label
    this.emitChange()
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      activeTabId: this.activeTabId,
      value: this.value.map(t => t.toJSON())
    }
  }
}
