import { inject, ref, computed, type InjectionKey, type Ref } from 'vue'
import en from '../locales/en'
import ru from '../locales/ru'

export type LocaleCode = 'en' | 'ru'
export type Messages = typeof en

const locales: Record<LocaleCode, Messages> = { en, ru }

export const LOCALE_KEY: InjectionKey<Ref<LocaleCode>> = Symbol('block-editor-locale')

/**
 * Composable для i18n блочного редактора.
 * Использует provide/inject — provide вызывается в BlockEditor index.vue.
 */
export function useEditorI18n() {
  const locale = inject(LOCALE_KEY, ref<LocaleCode>('en'))
  const messages = computed(() => locales[locale.value])

  function t(key: string): string {
    const parts = key.split('.')
    let result: any = messages.value
    for (const part of parts) {
      if (result == null) return key
      result = result[part]
    }
    return typeof result === 'string' ? result : key
  }

  return { t, locale }
}
