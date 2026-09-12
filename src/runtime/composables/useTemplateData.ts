import { inject, provide, computed, type InjectionKey, type ComputedRef } from 'vue'
import { TemplateDataSource } from '#block-editor'

export const TEMPLATE_DATA_KEY: InjectionKey<ComputedRef<TemplateDataSource>>
  = Symbol('block-editor-template-data')

const EMPTY_SOURCE = computed(() => TemplateDataSource.from())

/** Вызывается в корневом BlockEditor (не во вложенном — данные общие). */
export function provideTemplateData(source: ComputedRef<TemplateDataSource>): void {
  provide(TEMPLATE_DATA_KEY, source)
}

/** Данные для подстановки в mustache-шаблоны текстовых боксов. */
export function useTemplateData(): ComputedRef<TemplateDataSource> {
  return inject(TEMPLATE_DATA_KEY, EMPTY_SOURCE)
}
