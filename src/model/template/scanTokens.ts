import type { TemplateToken, TokenRole } from './types'

/** Единственная регулярка `{{…}}` в проекте: используется и парсером, и подсветкой в редакторе. */
const TOKEN_RE = /\{\{([#^/]?)\s*([A-Za-z_$][\w$.]*|\.)\s*\}\}/g

const ROLE_BY_SIGIL: Record<string, TokenRole> = {
  '': 'var',
  '#': 'open',
  '^': 'inverted',
  '/': 'close'
}

/**
 * Находит все токены `{{…}}` в строке с точными смещениями.
 * scanTokens('a {{x}}') → [{ from: 2, to: 7, role: 'var', path: 'x' }]
 */
export function scanTokens(source: string): TemplateToken[] {
  const tokens: TemplateToken[] = []

  TOKEN_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_RE.exec(source)) !== null) {
    tokens.push({
      from: match.index,
      to: match.index + match[0].length,
      role: ROLE_BY_SIGIL[match[1]!]!,
      path: match[2]!
    })
  }

  return tokens
}
