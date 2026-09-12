/** Роль токена `{{…}}`: переменная, открытие секции, инверсия, закрытие. */
export type TokenRole = 'var' | 'open' | 'inverted' | 'close'

/** Токен `{{…}}` с позицией в исходной строке. */
export interface TemplateToken {
  from: number
  to: number
  role: TokenRole
  path: string
}

/**
 * Ключ, доступный для вставки в шаблон.
 * scope — путь секции, внутри которой ключ резолвится относительно
 * (для элементов массива: scope='items', path='title' → `{{#items}}{{title}}{{/items}}`).
 */
export interface TemplateKey {
  path: string
  kind: 'value' | 'section'
  scope?: string
}
