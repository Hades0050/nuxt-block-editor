import { describe, it, expect } from 'vitest'
import {
  BoxInput, BoxSelect, BoxDateTime,
  FormValueInput, FormValueSelect, FormValueDate,
  BOX_TYPES,
} from '#block-editor'

describe('BoxInput', () => {
  it('creates with default field', () => {
    const box = new BoxInput()
    expect(box.name_type).toBe(BOX_TYPES.INPUT)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(FormValueInput)
    expect(box.value[0]!.label).toBe('Input field')
  })

  it('creates from raw data', () => {
    const box = new BoxInput({
      title: 'My Input',
      value: [
        { id: 'f1', label: 'Name', value: 'John' },
        { id: 'f2', label: 'Email', value: 'john@test.com' }
      ]
    })
    expect(box.title).toBe('My Input')
    expect(box.value).toHaveLength(2)
    expect(box.value[0]!.label).toBe('Name')
    expect(box.value[0]!.value).toBe('John')
    expect(box.value[1]!.value).toBe('john@test.com')
  })

  it('addField pushes a new FormValueInput', () => {
    const box = new BoxInput()
    expect(box.value).toHaveLength(1)

    box.addField()
    expect(box.value).toHaveLength(2)
    expect(box.value[1]).toBeInstanceOf(FormValueInput)
  })

  it('removeField removes by id', () => {
    const box = new BoxInput()
    box.addField()
    expect(box.value).toHaveLength(2)

    const idToRemove = box.value[0]!.id
    box.removeField(idToRemove)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]!.id).not.toBe(idToRemove)
  })

  it('updateFieldAt mutates field in place', () => {
    const box = new BoxInput()
    const originalField = box.value[0]!

    box.updateFieldAt(0, { label: 'Updated', value: 'new value' })
    expect(box.value[0]!.label).toBe('Updated')
    expect(box.value[0]!.value).toBe('new value')
    // Same instance — in-place mutation
    expect(box.value[0]).toBe(originalField)
  })

  it('updateFieldAt ignores invalid index', () => {
    const box = new BoxInput()
    box.updateFieldAt(99, { label: 'noop' })
    expect(box.value).toHaveLength(1)
  })

  it('toJSON serializes value array', () => {
    const box = new BoxInput({ title: 'Test' })
    box.updateFieldAt(0, { label: 'Name', value: 'Alice' })

    const json = box.toJSON()
    expect(json.name_type).toBe(BOX_TYPES.INPUT)
    expect(json.title).toBe('Test')
    expect(Array.isArray(json.value)).toBe(true)
    const values = json.value as Record<string, unknown>[]
    expect(values[0]!.label).toBe('Name')
    expect(values[0]!.value).toBe('Alice')
  })
})

describe('BoxSelect', () => {
  it('creates with default field and option', () => {
    const box = new BoxSelect()
    expect(box.name_type).toBe(BOX_TYPES.SELECT)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(FormValueSelect)
    expect(box.value[0]!.items).toHaveLength(1)
  })

  it('addField pushes a new FormValueSelect', () => {
    const box = new BoxSelect()
    box.addField()
    expect(box.value).toHaveLength(2)
    expect(box.value[1]).toBeInstanceOf(FormValueSelect)
  })

  it('removeField removes by id', () => {
    const box = new BoxSelect()
    box.addField()
    const idToRemove = box.value[0]!.id
    box.removeField(idToRemove)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]!.id).not.toBe(idToRemove)
  })

  it('updateFieldAt mutates field in place', () => {
    const box = new BoxSelect()
    box.updateFieldAt(0, { label: 'Color' })
    expect(box.value[0]!.label).toBe('Color')
  })

  it('addOption adds to field items', () => {
    const box = new BoxSelect()
    const before = box.value[0]!.items.length
    box.addOption(0)
    expect(box.value[0]!.items).toHaveLength(before + 1)
    expect(box.value[0]!.items.at(-1)!.label).toBe('Option 2')
  })

  it('removeOption removes by index', () => {
    const box = new BoxSelect()
    box.addOption(0)
    box.addOption(0)
    const count = box.value[0]!.items.length
    box.removeOption(0, 0)
    expect(box.value[0]!.items).toHaveLength(count - 1)
  })

  it('updateOptionLabel updates label in place', () => {
    const box = new BoxSelect()
    box.updateOptionLabel(0, 0, 'Red')
    expect(box.value[0]!.items[0]!.label).toBe('Red')
  })

  it('selectOption sets field value', () => {
    const box = new BoxSelect()
    const optValue = box.value[0]!.items[0]!.value
    box.selectOption(0, optValue)
    expect(box.value[0]!.value).not.toBeNull()
    expect(box.value[0]!.value!.value).toBe(optValue)
  })

  it('selectOption with unknown value sets null', () => {
    const box = new BoxSelect()
    box.selectOption(0, 'nonexistent')
    expect(box.value[0]!.value).toBeNull()
  })
})

describe('BoxDateTime', () => {
  it('creates with default field', () => {
    const box = new BoxDateTime()
    expect(box.name_type).toBe(BOX_TYPES.DATETIME)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(FormValueDate)
    expect(box.value[0]!.mode).toBe('date')
  })

  it('addField pushes a new FormValueDate', () => {
    const box = new BoxDateTime()
    box.addField()
    expect(box.value).toHaveLength(2)
    expect(box.value[1]).toBeInstanceOf(FormValueDate)
  })

  it('removeField removes by id', () => {
    const box = new BoxDateTime()
    box.addField()
    const idToRemove = box.value[0]!.id
    box.removeField(idToRemove)
    expect(box.value).toHaveLength(1)
  })

  it('updateFieldAt changes mode and value', () => {
    const box = new BoxDateTime()
    box.updateFieldAt(0, { mode: 'datetime', value: '2025-01-01T12:00' })
    expect(box.value[0]!.mode).toBe('datetime')
    expect(box.value[0]!.value).toBe('2025-01-01T12:00')
  })

  it('toJSON serializes mode', () => {
    const box = new BoxDateTime()
    box.updateFieldAt(0, { mode: 'time', value: '14:30' })
    const json = box.toJSON()
    const values = json.value as Record<string, unknown>[]
    expect(values[0]!.mode).toBe('time')
    expect(values[0]!.value).toBe('14:30')
  })
})
