import type { TemplateKey } from '#block-editor'

/**
 * Подписи для поповера автокомплита.
 * Приходят готовыми: useEditorI18n() не работает внутри VueRenderer —
 * он рендерит компонент без родителя, component-level provide не виден.
 */
export interface TemplateVarsLabels {
  value: string
  section: string
  inside: string
  empty: string
}

/** Данные, которые компонент-синхронизатор прокидывает в плагин транзакцией. */
export interface TemplateVarsMeta {
  keys: TemplateKey[]
  labels: TemplateVarsLabels
}
