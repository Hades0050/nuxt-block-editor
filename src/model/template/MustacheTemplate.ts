import Mustache from 'mustache'
import { normalizeTemplate } from './normalizeTemplate'

/**
 * Шаблон mustache: `{{key}}`, секции `{{#items}}…{{/items}}`, инверсии `{{^items}}…{{/items}}`.
 * Рендерит пакет mustache, здесь — только приведение HTML из TipTap к виду, который он понимает.
 *
 * Значения всегда экранируются: сырой вывод (`{{{x}}}`, `{{&x}}`) заглушен при нормализации.
 */
export class MustacheTemplate {
  private readonly template: string

  constructor(private readonly source: string) {
    this.template = normalizeTemplate(source)
  }

  render(data: Record<string, unknown>): string {
    // документы без шаблонов проходят байт-в-байт
    if (!this.source.includes('{{')) return this.source

    try {
      return Mustache.render(this.template, data)
    }
    catch {
      // незакрытая или лишняя секция — показываем исходник, а не падаем
      return this.source
    }
  }
}
