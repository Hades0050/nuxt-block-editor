import { describe, it, expect } from 'vitest'
import { scanTokens } from '#block-editor'

describe('scanTokens', () => {
  it('returns [] when there are no tokens', () => {
    expect(scanTokens('plain text')).toEqual([])
  })

  it('reports exact offsets', () => {
    expect(scanTokens('ab {{x}} cd')).toEqual([
      { from: 3, to: 8, role: 'var', path: 'x' },
    ])
  })

  it('detects all roles', () => {
    const roles = scanTokens('{{a}}{{#b}}{{^c}}{{/b}}').map(token => token.role)
    expect(roles).toEqual(['var', 'open', 'inverted', 'close'])
  })

  it('accepts dotted paths and the dot token', () => {
    expect(scanTokens('{{user.name}} {{.}}').map(token => token.path)).toEqual(['user.name', '.'])
  })

  it('accepts indexed paths', () => {
    expect(scanTokens('{{items.0.title}} {{tags.2}} {{#items.1}}').map(token => token.path))
      .toEqual(['items.0.title', 'tags.2', 'items.1'])
  })

  it('tolerates spaces inside the token', () => {
    expect(scanTokens('{{# items }}')).toEqual([
      { from: 0, to: 12, role: 'open', path: 'items' },
    ])
  })

  it('ignores malformed tokens', () => {
    expect(scanTokens('{{1abc}} {{ }} {{a b}}')).toEqual([])
  })

  it('is not confused by repeated calls (lastIndex reset)', () => {
    expect(scanTokens('{{a}}')).toHaveLength(1)
    expect(scanTokens('{{a}}')).toHaveLength(1)
  })
})
