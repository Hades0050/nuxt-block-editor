import { describe, it, expect } from 'vitest'
import {
  Content, BoxInput, BoxSelect, BoxDateTime, BoxText, BoxTabs, BoxTree,
  boxFactory, collectData, insertData, findDuplicateBindingKeys,
} from '#block-editor'

describe('collectData', () => {
  it('returns {} for empty Content', () => {
    const content = new Content()
    expect(collectData(content)).toEqual({})
  })

  it('returns {} when no field boxes exist', () => {
    const content = new Content()
    content.addBox(new BoxText({ value: 'Hello' }))
    expect(collectData(content)).toEqual({})
  })

  it('collects Input field value by bindingKey', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'name'
    box.value[0]!.value = 'John'
    content.addBox(box)

    expect(collectData(content)).toEqual({ name: 'John' })
  })

  it('collects nested path bindingKey', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'user.name'
    box.value[0]!.value = 'John'
    content.addBox(box)

    expect(collectData(content)).toEqual({ user: { name: 'John' } })
  })

  it('collects Select field value', () => {
    const content = new Content()
    const box = new BoxSelect()
    box.value[0]!.bindingKey = 'status'
    box.value[0]!.items = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
    box.value[0]!.value = { value: 'active', label: 'Active' }
    content.addBox(box)

    expect(collectData(content)).toEqual({ status: 'active' })
  })

  it('collects Select with null value', () => {
    const content = new Content()
    const box = new BoxSelect()
    box.value[0]!.bindingKey = 'status'
    box.value[0]!.value = null
    content.addBox(box)

    expect(collectData(content)).toEqual({ status: null })
  })

  it('collects DateTime field value', () => {
    const content = new Content()
    const box = new BoxDateTime()
    box.value[0]!.bindingKey = 'birthDate'
    box.value[0]!.value = '2000-01-15'
    content.addBox(box)

    expect(collectData(content)).toEqual({ birthDate: '2000-01-15' })
  })

  it('skips fields with empty bindingKey', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = ''
    box.value[0]!.value = 'ignored'
    content.addBox(box)

    expect(collectData(content)).toEqual({})
  })

  it('handles multiple fields in one box', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'firstName'
    box.value[0]!.value = 'John'
    box.addField()
    box.value[1]!.bindingKey = 'lastName'
    box.value[1]!.value = 'Doe'
    content.addBox(box)

    expect(collectData(content)).toEqual({ firstName: 'John', lastName: 'Doe' })
  })

  it('merges fields from multiple boxes', () => {
    const content = new Content()
    const input = new BoxInput()
    input.value[0]!.bindingKey = 'name'
    input.value[0]!.value = 'John'
    content.addBox(input)

    const dt = new BoxDateTime()
    dt.value[0]!.bindingKey = 'date'
    dt.value[0]!.value = '2024-01-01'
    content.addBox(dt)

    expect(collectData(content)).toEqual({ name: 'John', date: '2024-01-01' })
  })

  it('recurses into BoxTabs nested Content', () => {
    const content = new Content()
    const tabs = new BoxTabs(undefined, boxFactory)
    const tab = tabs.value[0]!
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'tab.field'
    nestedInput.value[0]!.value = 'nested'
    tab.content.addBox(nestedInput)
    content.addBox(tabs)

    expect(collectData(content)).toEqual({ tab: { field: 'nested' } })
  })

  it('recurses into BoxTree nested Content', () => {
    const content = new Content()
    const tree = new BoxTree(undefined, boxFactory)
    const node = tree.value[0]!
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'tree.data'
    nestedInput.value[0]!.value = 'treeValue'
    node.content.addBox(nestedInput)
    content.addBox(tree)

    expect(collectData(content)).toEqual({ tree: { data: 'treeValue' } })
  })

  it('recurses into deeply nested TreeNode children', () => {
    const content = new Content()
    const tree = new BoxTree(undefined, boxFactory)
    const root = tree.value[0]!
    const child = root.addChild(boxFactory)
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'deep.value'
    nestedInput.value[0]!.value = 'deepData'
    child.content.addBox(nestedInput)
    content.addBox(tree)

    expect(collectData(content)).toEqual({ deep: { value: 'deepData' } })
  })

  it('builds deeply nested object from multiple dot paths', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'a.b.c'
    box.value[0]!.value = 'deep'
    content.addBox(box)

    expect(collectData(content)).toEqual({ a: { b: { c: 'deep' } } })
  })
})

describe('insertData', () => {
  it('sets simple string value on Input field', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'name'
    content.addBox(box)

    insertData(content, { name: 'John' })
    expect(box.value[0]!.value).toBe('John')
  })

  it('sets nested path value on Input field', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'user.name'
    content.addBox(box)

    insertData(content, { user: { name: 'Jane' } })
    expect(box.value[0]!.value).toBe('Jane')
  })

  it('sets Select value by matching option value string', () => {
    const content = new Content()
    const box = new BoxSelect()
    box.value[0]!.bindingKey = 'status'
    box.value[0]!.items = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
    content.addBox(box)

    insertData(content, { status: 'active' })
    expect(box.value[0]!.value).toEqual({ value: 'active', label: 'Active' })
  })

  it('sets Select to null for null data value', () => {
    const content = new Content()
    const box = new BoxSelect()
    box.value[0]!.bindingKey = 'status'
    box.value[0]!.value = { value: 'active', label: 'Active' }
    content.addBox(box)

    insertData(content, { status: null })
    expect(box.value[0]!.value).toBeNull()
  })

  it('sets Select to null when no matching option found', () => {
    const content = new Content()
    const box = new BoxSelect()
    box.value[0]!.bindingKey = 'status'
    box.value[0]!.items = [{ value: 'active', label: 'Active' }]
    content.addBox(box)

    insertData(content, { status: 'unknown' })
    expect(box.value[0]!.value).toBeNull()
  })

  it('sets DateTime string value', () => {
    const content = new Content()
    const box = new BoxDateTime()
    box.value[0]!.bindingKey = 'date'
    content.addBox(box)

    insertData(content, { date: '2024-06-15' })
    expect(box.value[0]!.value).toBe('2024-06-15')
  })

  it('skips fields with empty bindingKey', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = ''
    box.value[0]!.value = 'original'
    content.addBox(box)

    insertData(content, { anything: 'data' })
    expect(box.value[0]!.value).toBe('original')
  })

  it('skips fields whose bindingKey is not in data', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'missing'
    box.value[0]!.value = 'original'
    content.addBox(box)

    insertData(content, { other: 'data' })
    expect(box.value[0]!.value).toBe('original')
  })

  it('recurses into BoxTabs', () => {
    const content = new Content()
    const tabs = new BoxTabs(undefined, boxFactory)
    const tab = tabs.value[0]!
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'tab.name'
    tab.content.addBox(nestedInput)
    content.addBox(tabs)

    insertData(content, { tab: { name: 'TabValue' } })
    expect(nestedInput.value[0]!.value).toBe('TabValue')
  })

  it('recurses into BoxTree', () => {
    const content = new Content()
    const tree = new BoxTree(undefined, boxFactory)
    const node = tree.value[0]!
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'tree.name'
    node.content.addBox(nestedInput)
    content.addBox(tree)

    insertData(content, { tree: { name: 'TreeValue' } })
    expect(nestedInput.value[0]!.value).toBe('TreeValue')
  })

  it('does not affect non-field boxes', () => {
    const content = new Content()
    const text = new BoxText({ value: 'Hello' })
    content.addBox(text)

    insertData(content, { anything: 'data' })
    expect(text.value).toBe('Hello')
  })

  it('coerces number to string for Input', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'age'
    content.addBox(box)

    insertData(content, { age: 42 })
    expect(box.value[0]!.value).toBe('42')
  })
})

describe('findDuplicateBindingKeys', () => {
  it('returns [] when no fields exist', () => {
    const content = new Content()
    expect(findDuplicateBindingKeys(content)).toEqual([])
  })

  it('returns [] when all bindingKeys are unique', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'name'
    box.addField()
    box.value[1]!.bindingKey = 'email'
    content.addBox(box)

    expect(findDuplicateBindingKeys(content)).toEqual([])
  })

  it('returns [] when bindingKeys are empty strings', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = ''
    box.addField()
    box.value[1]!.bindingKey = ''
    content.addBox(box)

    expect(findDuplicateBindingKeys(content)).toEqual([])
  })

  it('returns duplicate key when same key used twice', () => {
    const content = new Content()
    const box = new BoxInput()
    box.value[0]!.bindingKey = 'name'
    box.addField()
    box.value[1]!.bindingKey = 'name'
    content.addBox(box)

    expect(findDuplicateBindingKeys(content)).toEqual(['name'])
  })

  it('returns duplicate keys across different box types', () => {
    const content = new Content()
    const input = new BoxInput()
    input.value[0]!.bindingKey = 'shared'
    content.addBox(input)

    const select = new BoxSelect()
    select.value[0]!.bindingKey = 'shared'
    content.addBox(select)

    expect(findDuplicateBindingKeys(content)).toEqual(['shared'])
  })

  it('detects duplicates across nested Tabs content', () => {
    const content = new Content()
    const input = new BoxInput()
    input.value[0]!.bindingKey = 'dup'
    content.addBox(input)

    const tabs = new BoxTabs(undefined, boxFactory)
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'dup'
    tabs.value[0]!.content.addBox(nestedInput)
    content.addBox(tabs)

    expect(findDuplicateBindingKeys(content)).toEqual(['dup'])
  })

  it('detects duplicates across nested Tree content', () => {
    const content = new Content()
    const input = new BoxInput()
    input.value[0]!.bindingKey = 'dup'
    content.addBox(input)

    const tree = new BoxTree(undefined, boxFactory)
    const nestedInput = new BoxInput()
    nestedInput.value[0]!.bindingKey = 'dup'
    tree.value[0]!.content.addBox(nestedInput)
    content.addBox(tree)

    expect(findDuplicateBindingKeys(content)).toEqual(['dup'])
  })
})
