import { describe, it, expect } from 'vitest'
import { MustacheTemplate } from '#block-editor'

function render(source: string, data: Record<string, unknown> = {}): string {
  return new MustacheTemplate(source).render(data)
}

describe('MustacheTemplate variables', () => {
  it('returns the source untouched when there are no templates', () => {
    const source = '<p>Hello <strong>world</strong></p>'
    expect(render(source, { a: 1 })).toBe(source)
  })

  it('substitutes a simple key', () => {
    expect(render('<p>{{name}}</p>', { name: 'John' })).toBe('<p>John</p>')
  })

  it('substitutes a dotted path', () => {
    expect(render('{{user.name}}', { user: { name: 'John' } })).toBe('John')
  })

  it('renders a missing key as an empty string', () => {
    expect(render('a{{missing}}b', {})).toBe('ab')
    expect(render('a{{deep.missing.key}}b', { deep: {} })).toBe('ab')
  })

  it('renders null and undefined as an empty string', () => {
    expect(render('{{a}}{{b}}', { a: null, b: undefined })).toBe('')
  })

  it('stringifies numbers and booleans', () => {
    expect(render('{{n}} {{b}}', { n: 0, b: false })).toBe('0 false')
  })

  it('escapes HTML in values', () => {
    expect(render('{{html}}', { html: '<script>alert("x" & \'y\')</script>' }))
      .toBe('&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;&#x2F;script&gt;')
  })

  it('escapes raw output too — {{{x}}} is neutralized', () => {
    expect(render('{{{html}}}', { html: '<b>x</b>' })).toBe('&lt;b&gt;x&lt;&#x2F;b&gt;')
  })

  it('escapes ampersand output too — {{&x}} is neutralized', () => {
    expect(render('{{& html}}', { html: '<b>x</b>' })).toBe('&lt;b&gt;x&lt;&#x2F;b&gt;')
  })
})

describe('MustacheTemplate sections', () => {
  it('iterates an array of objects', () => {
    const source = '<ul>{{#items}}<li>{{title}}</li>{{/items}}</ul>'
    const out = render(source, { items: [{ title: 'a' }, { title: 'b' }] })
    expect(out).toBe('<ul><li>a</li><li>b</li></ul>')
  })

  it('iterates an array of primitives via {{.}}', () => {
    expect(render('{{#tags}}[{{.}}]{{/tags}}', { tags: ['x', 'y'] })).toBe('[x][y]')
  })

  it('pushes an object scope', () => {
    expect(render('{{#user}}{{name}}{{/user}}', { user: { name: 'John' } })).toBe('John')
  })

  it('renders once for a truthy primitive', () => {
    expect(render('{{#flag}}yes{{/flag}}', { flag: true })).toBe('yes')
  })

  it('skips falsy values and empty arrays', () => {
    const source = '{{#a}}x{{/a}}{{#b}}x{{/b}}{{#c}}x{{/c}}{{#d}}x{{/d}}{{#e}}x{{/e}}'
    expect(render(source, { a: false, b: '', c: 0, d: [], e: null })).toBe('')
  })

  it('renders inverted sections for falsy values only', () => {
    expect(render('{{^items}}empty{{/items}}', { items: [] })).toBe('empty')
    expect(render('{{^items}}empty{{/items}}', { items: [1] })).toBe('')
    expect(render('{{^missing}}empty{{/missing}}', {})).toBe('empty')
  })

  it('nests sections', () => {
    const source = '{{#rows}}{{#cells}}{{.}};{{/cells}}|{{/rows}}'
    const data = { rows: [{ cells: [1, 2] }, { cells: [3] }] }
    expect(render(source, data)).toBe('1;2;|3;|')
  })

  it('falls back to the outer scope for keys missing in the inner one', () => {
    const source = '{{#items}}{{company}}:{{title}} {{/items}}'
    const data = { company: 'ACME', items: [{ title: 'a' }, { title: 'b' }] }
    expect(render(source, data)).toBe('ACME:a ACME:b ')
  })

  it('falls back to the outer scope when the full dotted path is missing', () => {
    const source = '{{#items}}{{user.name}}{{/items}}'
    const data = { user: { name: 'outer' }, items: [{ user: {} }] }
    expect(render(source, data)).toBe('outer')
  })
})

describe('MustacheTemplate HTML normalization', () => {
  it('unwraps block tags holding only a section marker', () => {
    const source = '<p>{{#items}}</p><ul><li>{{title}}</li></ul><p>{{/items}}</p>'
    const out = render(source, { items: [{ title: 'a' }, { title: 'b' }] })
    expect(out).toBe('<ul><li>a</li></ul><ul><li>b</li></ul>')
  })

  it('unwraps list items holding only a section marker', () => {
    const source = '<ul><li>{{#items}}</li><li>{{.}}</li><li>{{/items}}</li></ul>'
    expect(render(source, { items: ['a', 'b'] })).toBe('<ul><li>a</li><li>b</li></ul>')
  })

  it('keeps blocks that hold a variable, not a section marker', () => {
    expect(render('<p>{{name}}</p>', { name: 'John' })).toBe('<p>John</p>')
  })

  it('heals inline markup inside a token', () => {
    expect(render('{{<strong>user</strong>.name}}', { user: { name: 'John' } })).toBe('John')
  })

  it('heals &nbsp; inside a token', () => {
    expect(render('{{#&nbsp;items}}x{{/items}}', { items: [1] })).toBe('x')
  })
})

describe('MustacheTemplate malformed input', () => {
  it('falls back to the source on an unclosed section', () => {
    const source = '<p>{{#items}}</p><p>body</p>'
    expect(render(source, { items: [1] })).toBe(source)
  })

  it('falls back to the source on a stray closing marker', () => {
    expect(render('a{{/items}}b', {})).toBe('a{{/items}}b')
  })

  it('falls back to the source on a mismatched closing marker', () => {
    expect(render('{{#a}}x{{/b}}', { a: true })).toBe('{{#a}}x{{/b}}')
  })

  it('does not throw on garbage', () => {
    expect(() => render('{{{{}}}}{{#}}{{/}}{{', {})).not.toThrow()
  })
})

describe('MustacheTemplate indexed access', () => {
  const data = { items: [{ title: 'A', price: 1 }, { title: 'B', price: 2 }], tags: ['x', 'y'] }

  it('reads an array element by its ordinal number', () => {
    expect(render('{{items.0.title}}/{{items.1.price}}/{{tags.1}}', data)).toBe('A/2/y')
  })

  it('opens a section on an indexed element', () => {
    expect(render('{{#items.1}}{{title}}{{/items.1}}', data)).toBe('B')
  })

  it('renders an out-of-range index as an empty string', () => {
    expect(render('[{{items.9.title}}]', data)).toBe('[]')
  })

  it('inverts on an out-of-range index', () => {
    expect(render('{{^items.9}}none{{/items.9}}', data)).toBe('none')
  })
})

describe('MustacheTemplate reuse', () => {
  it('renders the same instance with different data', () => {
    const template = new MustacheTemplate('{{name}}')
    expect(template.render({ name: 'a' })).toBe('a')
    expect(template.render({ name: 'b' })).toBe('b')
  })
})

describe('MustacheTemplate.scan', () => {
  it('returns [] when there are no tokens', () => {
    expect(MustacheTemplate.scan('plain text')).toEqual([])
  })

  it('reports exact offsets', () => {
    expect(MustacheTemplate.scan('ab {{x}} cd')).toEqual([
      { from: 3, to: 8, role: 'var', path: 'x' },
    ])
  })

  it('detects all roles', () => {
    const roles = MustacheTemplate.scan('{{a}}{{#b}}{{^c}}{{/b}}').map(token => token.role)
    expect(roles).toEqual(['var', 'open', 'inverted', 'close'])
  })

  it('accepts dotted paths and the dot token', () => {
    expect(MustacheTemplate.scan('{{user.name}} {{.}}').map(token => token.path))
      .toEqual(['user.name', '.'])
  })

  it('accepts indexed paths', () => {
    expect(MustacheTemplate.scan('{{items.0.title}} {{tags.2}} {{#items.1}}').map(token => token.path))
      .toEqual(['items.0.title', 'tags.2', 'items.1'])
  })

  it('tolerates spaces inside the token', () => {
    expect(MustacheTemplate.scan('{{# items }}')).toEqual([
      { from: 0, to: 12, role: 'open', path: 'items' },
    ])
  })

  it('ignores malformed tokens', () => {
    expect(MustacheTemplate.scan('{{1abc}} {{ }} {{a b}}')).toEqual([])
  })

  it('is not confused by repeated calls (lastIndex reset)', () => {
    expect(MustacheTemplate.scan('{{a}}')).toHaveLength(1)
    expect(MustacheTemplate.scan('{{a}}')).toHaveLength(1)
  })
})
