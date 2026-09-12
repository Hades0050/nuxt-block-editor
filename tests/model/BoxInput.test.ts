import { describe, it, expect } from 'vitest'
import { BoxInput, FormValueInput, BOX_TYPES } from '#block-editor'

describe('BoxInput', () => {
  it('creates with one default field', () => {
    const box = new BoxInput()
    expect(box.name_type).toBe(BOX_TYPES.INPUT)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(FormValueInput)
    expect(box.value[0]!.label).toBe('Input field')
    expect(box.value[0]!.value).toBe('')
  })

  it('creates from raw data', () => {
    const box = new BoxInput({
      title: 'My Input',
      value: [
        { id: 'f1', label: 'Name', value: 'John' },
        { id: 'f2', label: 'Email', value: 'john@test.com' },
      ],
    })
    expect(box.title).toBe('My Input')
    expect(box.value).toHaveLength(2)
    expect(box.value[0]!.label).toBe('Name')
    expect(box.value[0]!.value).toBe('John')
    expect(box.value[1]!.label).toBe('Email')
  })

  describe('addField', () => {
    it('adds a new field', () => {
      const box = new BoxInput()
      expect(box.value).toHaveLength(1)

      box.addField()
      expect(box.value).toHaveLength(2)
      expect(box.value[1]).toBeInstanceOf(FormValueInput)
    })

    it('adds multiple fields', () => {
      const box = new BoxInput()
      box.addField()
      box.addField()
      box.addField()
      expect(box.value).toHaveLength(4)
    })

    it('assigns unique ids to each field', () => {
      const box = new BoxInput()
      box.addField()
      box.addField()
      const ids = box.value.map(f => f.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('removeFieldAt', () => {
    it('removes field by index', () => {
      const box = new BoxInput()
      box.addField()
      expect(box.value).toHaveLength(2)

      const removedId = box.value[0]!.id
      box.removeFieldAt(0)
      expect(box.value).toHaveLength(1)
      expect(box.value.find(f => f.id === removedId)).toBeUndefined()
    })

    it('does nothing for out-of-bounds index', () => {
      const box = new BoxInput()
      box.removeFieldAt(99)
      expect(box.value).toHaveLength(1)
    })

    it('can remove all fields', () => {
      const box = new BoxInput()
      box.removeFieldAt(0)
      expect(box.value).toHaveLength(0)
    })
  })

  describe('updateFieldAt', () => {
    it('updates label', () => {
      const box = new BoxInput()
      box.updateFieldAt(0, { label: 'Username' })
      expect(box.value[0]!.label).toBe('Username')
    })

    it('updates value', () => {
      const box = new BoxInput()
      box.updateFieldAt(0, { value: 'hello' })
      expect(box.value[0]!.value).toBe('hello')
    })

    it('updates multiple properties at once, мутируя поле на месте', () => {
      const box = new BoxInput()
      const originalField = box.value[0]!
      box.updateFieldAt(0, { label: 'Name', value: 'Alice' })
      expect(box.value[0]!.label).toBe('Name')
      expect(box.value[0]!.value).toBe('Alice')
      expect(box.value[0]).toBe(originalField)
    })

    it('does nothing for out-of-bounds index', () => {
      const box = new BoxInput()
      box.updateFieldAt(99, { label: 'test' })
      expect(box.value).toHaveLength(1)
      expect(box.value[0]!.label).toBe('Input field')
    })

    it('does nothing for negative index', () => {
      const box = new BoxInput()
      box.updateFieldAt(-1, { label: 'test' })
      expect(box.value[0]!.label).toBe('Input field')
    })
  })

  describe('toJSON', () => {
    it('serializes all fields', () => {
      const box = new BoxInput({ title: 'Test' })
      box.updateFieldAt(0, { label: 'Name', value: 'Val' })
      box.addField()

      const json = box.toJSON()
      expect(json.name_type).toBe(BOX_TYPES.INPUT)
      expect(json.title).toBe('Test')
      expect(json.value).toHaveLength(2)

      const fields = json.value as Record<string, unknown>[]
      expect(fields[0]!.label).toBe('Name')
      expect(fields[0]!.value).toBe('Val')
    })
  })
})
