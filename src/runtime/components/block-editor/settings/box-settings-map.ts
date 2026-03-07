import { BOX_TYPES } from '#block-editor'
import { defineAsyncComponent, type Component } from 'vue'

export interface BoxSettingsTab {
  label: string
  slot: string
  component: Component
}

/** Маппинг BoxType → компонент дополнительных настроек */
export const boxSettingsMap: Partial<Record<string, BoxSettingsTab>> = {
  [BOX_TYPES.TREE]: {
    label: 'Display',
    slot: 'tree',
    component: defineAsyncComponent(() => import('../boxes/structure/tree/TreeSettings.vue'))
  }
}
