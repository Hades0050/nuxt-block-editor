import { describe, it, expect } from 'vitest'
import { TemplateDataSource } from '#block-editor'

describe('TemplateDataSource.from', () => {
  it('is empty without sources', () => {
    const source = TemplateDataSource.from()
    expect(source.data).toEqual({})
    expect(source.isEmpty).toBe(true)
  })

  it('skips undefined and null sources', () => {
    expect(TemplateDataSource.from(undefined, { a: 1 }, null).data).toEqual({ a: 1 })
  })

  it('gives priority to the later source', () => {
    expect(TemplateDataSource.from({ a: 1 }, { a: 2 }).data).toEqual({ a: 2 })
  })

  it('lets the later source override with an empty string', () => {
    expect(TemplateDataSource.from({ name: 'John' }, { name: '' }).data).toEqual({ name: '' })
  })

  it('lets the later source override with null', () => {
    expect(TemplateDataSource.from({ name: 'John' }, { name: null }).data).toEqual({ name: null })
  })

  it('skips undefined values instead of overriding', () => {
    expect(TemplateDataSource.from({ name: 'John' }, { name: undefined }).data).toEqual({ name: 'John' })
  })

  it('merges plain objects deeply', () => {
    const merged = TemplateDataSource.from(
      { user: { name: 'John', city: 'Moscow' } },
      { user: { name: 'Pete' } }
    )
    expect(merged.data).toEqual({ user: { name: 'Pete', city: 'Moscow' } })
  })

  it('replaces arrays wholesale', () => {
    expect(TemplateDataSource.from({ items: [1, 2, 3] }, { items: [9] }).data).toEqual({ items: [9] })
  })

  it('does not mutate the source objects', () => {
    const first = { user: { name: 'John' } }
    const second = { user: { name: 'Pete' } }
    TemplateDataSource.from(first, second)
    expect(first).toEqual({ user: { name: 'John' } })
    expect(second).toEqual({ user: { name: 'Pete' } })
  })
})

describe('TemplateDataSource.keys — flattening', () => {
  it('returns [] for empty data', () => {
    expect(TemplateDataSource.from({}).keys()).toEqual([])
  })

  it('marks primitives as values', () => {
    expect(TemplateDataSource.from({ name: 'John', age: 30 }).keys()).toEqual([
      { path: 'name', kind: 'value' },
      { path: 'age', kind: 'value' },
    ])
  })

  it('marks objects as sections and descends into them', () => {
    expect(TemplateDataSource.from({ user: { name: 'John' } }).keys()).toEqual([
      { path: 'user', kind: 'section' },
      { path: 'user.name', kind: 'value' },
    ])
  })

  it('marks arrays as sections and exposes element keys with a scope', () => {
    expect(TemplateDataSource.from({ items: [{ title: 'a', qty: 1 }] }).keys()).toEqual([
      { path: 'items', kind: 'section' },
      { path: 'title', kind: 'value', scope: 'items' },
      { path: 'qty', kind: 'value', scope: 'items' },
      { path: 'items.0.title', kind: 'value' },
      { path: 'items.0.qty', kind: 'value' },
    ])
  })

  it('exposes an indexed sample for arrays of primitives', () => {
    expect(TemplateDataSource.from({ tags: ['a', 'b'] }).keys()).toEqual([
      { path: 'tags', kind: 'section' },
      { path: 'tags.0', kind: 'value' },
    ])
  })

  it('keeps the scope on indexed keys of a nested array', () => {
    expect(TemplateDataSource.from({ items: [{ tags: ['a'] }] }).keys()).toEqual([
      { path: 'items', kind: 'section' },
      { path: 'tags', kind: 'section', scope: 'items' },
      { path: 'tags.0', kind: 'value', scope: 'items' },
      { path: 'items.0.tags', kind: 'section' },
      { path: 'items.0.tags.0', kind: 'value' },
    ])
  })

  it('does not descend into an empty array', () => {
    expect(TemplateDataSource.from({ items: [] }).keys()).toEqual([
      { path: 'items', kind: 'section' },
    ])
  })
})

describe('TemplateDataSource.normalizeIndexPath', () => {
  it('maps any index to zero', () => {
    expect(TemplateDataSource.normalizeIndexPath('items.3.title')).toBe('items.0.title')
    expect(TemplateDataSource.normalizeIndexPath('tags.12')).toBe('tags.0')
    expect(TemplateDataSource.normalizeIndexPath('a.1.b.2.c')).toBe('a.0.b.0.c')
  })

  it('leaves paths without indexes untouched', () => {
    expect(TemplateDataSource.normalizeIndexPath('user.name')).toBe('user.name')
  })

  it('does not touch digits inside a name', () => {
    expect(TemplateDataSource.normalizeIndexPath('item2.title')).toBe('item2.title')
    expect(TemplateDataSource.normalizeIndexPath('a.b2c')).toBe('a.b2c')
  })
})

describe('TemplateDataSource.keys', () => {
  it('memoizes the result', () => {
    const source = TemplateDataSource.from({ a: 1 })
    expect(source.keys()).toBe(source.keys())
  })

  it('reflects the merged data', () => {
    const source = TemplateDataSource.from({ a: 1 }, { b: { c: 2 } })
    expect(source.keys().map(key => key.path)).toEqual(['a', 'b', 'b.c'])
  })
})
