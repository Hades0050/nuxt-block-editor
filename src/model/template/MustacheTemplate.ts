import Mustache from 'mustache'
import type { TemplateToken, TokenRole } from './types'

/** Грамматика токена — сигил + путь. Все регулярки собраны отсюда: синтаксис `{{…}}` живёт в одном месте. */
const tokenBody = (sigil = '[#^/]?'): string => `(${sigil})\\s*([A-Za-z_$][\\w$.]*|\\.)`

const TOKEN_RE = new RegExp(`\\{\\{${tokenBody()}\\s*\\}\\}`, 'g')
const CLEAN_BODY_RE = new RegExp(`^${tokenBody()}$`)

/** Блочный тег, всё содержимое которого — один маркер секции: $1 — тег, $2 — маркер. */
const SECTION_BLOCK_RE = new RegExp(
  `<(p|div|li|h[1-6])(?:\\s[^>]*)?>\\s*(\\{\\{${tokenBody('[#^/]')}\\s*\\}\\})\\s*</\\1>`, 'g'
)

/** Токен, внутрь которого затесались теги или `&nbsp;` — пользователь выделил часть ключа жирным. */
const DIRTY_TOKEN_RE = /\{\{(?:<[^>]*>|[^<>{}])*?\}\}/g

const ROLE_BY_SIGIL: Record<string, TokenRole> = {
  '': 'var',
  '#': 'open',
  '^': 'inverted',
  '/': 'close'
}

/**
 * Шаблон mustache: `{{key}}`, секции `{{#items}}…{{/items}}`, инверсии `{{^items}}…{{/items}}`.
 * Рендерит пакет mustache, здесь — только приведение HTML из TipTap к виду, который он понимает.
 *
 * Значения всегда экранируются: сырой вывод (`{{{x}}}`, `{{&x}}`) заглушен при нормализации.
 */
export class MustacheTemplate {
  private readonly template: string

  constructor(private readonly source: string) {
    this.template = MustacheTemplate.normalize(source)
  }

  /** Токены с точными смещениями — для подсветки: scan('a {{x}}') → [{ from: 2, to: 7, role: 'var', path: 'x' }] */
  static scan(source: string): TemplateToken[] {
    // matchAll клонирует регулярку, поэтому lastIndex общего TOKEN_RE не двигается
    return [...source.matchAll(TOKEN_RE)].map(match => ({
      from: match.index,
      to: match.index + match[0].length,
      role: ROLE_BY_SIGIL[match[1]!]!,
      path: match[2]!
    }))
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

  /** Приводит HTML из TipTap к виду, который понимает mustache. Порядок проходов значим. */
  private static normalize(source: string): string {
    return this.disableRawOutput(this.unwrapSections(this.healTags(source)))
  }

  /**
   * Снимает inline-разметку, попавшую внутрь `{{…}}`.
   * '{{<strong>user</strong>.name}}' → '{{user.name}}'
   */
  private static healTags(source: string): string {
    return source.replace(DIRTY_TOKEN_RE, (raw) => {
      if (!raw.includes('<') && !raw.includes('&nbsp;')) return raw

      const inner = raw
        .slice(2, -2)
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()

      const match = CLEAN_BODY_RE.exec(inner)
      return match ? `{{${match[1]}${match[2]}}}` : raw
    })
  }

  /**
   * Схлопывает блочные теги, содержащие только маркер секции.
   * TipTap разносит секцию по блокам: '<p>{{#items}}</p><ul>…</ul><p>{{/items}}</p>',
   * из-за чего в вывод попадают пустые параграфы.
   *
   * Только маркеры секций — `{{var}}` никогда не разворачивается.
   */
  private static unwrapSections(source: string): string {
    let result = source
    let previous: string

    do {
      previous = result
      result = result.replace(SECTION_BLOCK_RE, '$2')
    } while (result !== previous)

    return result
  }

  /** Глушит сырой вывод mustache — значения всегда экранируются. */
  private static disableRawOutput(source: string): string {
    return source
      .replace(/\{\{\{/g, '{{')
      .replace(/\}\}\}/g, '}}')
      .replace(/\{\{&\s*/g, '{{')
  }
}
