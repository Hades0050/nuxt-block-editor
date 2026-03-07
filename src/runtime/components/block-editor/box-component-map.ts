import { BOX_TYPES } from '#block-editor'
import { defineAsyncComponent, type Component } from 'vue'
import BoxSkeleton from './BoxSkeleton.vue'

function asyncBox(loader: () => Promise<any>): Component {
  return defineAsyncComponent({ loader, loadingComponent: BoxSkeleton, delay: 150 })
}

/** Маппинг BoxType → async Vue-компонент для рендеринга */
export const boxComponentMap: Record<string, Component> = {
  // Content
  [BOX_TYPES.TEXT]: asyncBox(() => import('./boxes/content/text/index.vue')),
  [BOX_TYPES.TEXT_AREA]: asyncBox(() => import('./boxes/content/TextArea.vue')),
  [BOX_TYPES.MARKDOWN]: asyncBox(() => import('./boxes/content/text/index.vue')),
  [BOX_TYPES.CODE]: asyncBox(() => import('./boxes/content/Code.vue')),
  // Media
  [BOX_TYPES.FILE]: asyncBox(() => import('./boxes/media/File.vue')),
  [BOX_TYPES.VIDEO]: asyncBox(() => import('./boxes/media/Video.vue')),
  [BOX_TYPES.CANVAS]: asyncBox(() => import('./boxes/media/canvas/index.vue')),
  // Data
  [BOX_TYPES.INPUT]: asyncBox(() => import('./boxes/data/Input.vue')),
  [BOX_TYPES.SELECT]: asyncBox(() => import('./boxes/data/Select.vue')),
  [BOX_TYPES.DATETIME]: asyncBox(() => import('./boxes/data/DateTime.vue')),
  // Structure
  [BOX_TYPES.TABS]: asyncBox(() => import('./boxes/structure/Tabs.vue')),
  [BOX_TYPES.TREE]: asyncBox(() => import('./boxes/structure/tree/index.vue')),
  [BOX_TYPES.EXTERNAL_SERVICE]: asyncBox(() => import('./boxes/structure/ExternalService.vue'))
}
