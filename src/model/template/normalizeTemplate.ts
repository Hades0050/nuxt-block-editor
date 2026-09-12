/** Токен, внутрь которого затесались теги или `&nbsp;` (пользователь выделил часть ключа жирным). */
const DIRTY_TOKEN_RE = /\{\{(?:<[^>]*>|&nbsp;|[^<>{}])*?\}\}/g

/** Блочный тег, всё содержимое которого — один маркер секции. */
const STANDALONE_SECTION_RE
  = /<(p|div|li|h[1-6])(?:\s[^>]*)?>\s*(\{\{[#^/]\s*(?:[A-Za-z_$][\w$.]*|\.)\s*\}\})\s*<\/\1>/g

/**
 * Снимает inline-разметку, попавшую внутрь `{{…}}`.
 * '{{<strong>user</strong>.name}}' → '{{user.name}}'
 */
function healTags(source: string): string {
  return source.replace(DIRTY_TOKEN_RE, (raw) => {
    if (!raw.includes('<') && !raw.includes('&nbsp;')) return raw

    const inner = raw
      .slice(2, -2)
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()

    const match = /^([#^/]?)\s*([A-Za-z_$][\w$.]*|\.)$/.exec(inner)
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
function unwrapStandaloneTags(source: string): string {
  let result = source
  let previous: string

  do {
    previous = result
    result = result.replace(STANDALONE_SECTION_RE, '$2')
  } while (result !== previous)

  return result
}

/** Глушит сырой вывод mustache — значения всегда экранируются. */
function disableRawOutput(source: string): string {
  return source
    .replace(/\{\{\{/g, '{{')
    .replace(/\}\}\}/g, '}}')
    .replace(/\{\{&\s*/g, '{{')
}

/** Приводит HTML из TipTap к виду, который понимает mustache. */
export function normalizeTemplate(source: string): string {
  return disableRawOutput(unwrapStandaloneTags(healTags(source)))
}
