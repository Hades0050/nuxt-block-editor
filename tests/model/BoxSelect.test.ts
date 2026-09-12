import { describe, it, expect } from 'vitest'
import { BoxSelect, FormValueSelect, BOX_TYPES } from '#block-editor'

describe('BoxSelect', () => {
  it('creates with one default field and one default option', () => {
    const box = new BoxSelect()
    expect(box.name_type).toBe(BOX_TYPES.SELECT)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(FormValueSelect)
    expect(box.value[0]!.label).toBe('Select field')
    expect(box.value[0]!.value).toBeNull()
    expect(box.value[0]!.items).toHaveLength(1)
    expect(box.value[0]!.items[0]!.label).toBe('Option 1')
  })

  it('creates from raw data', () => {
    const box = new BoxSelect({
      value: [
        {
          id: 'f1',
          label: 'Color',
          value: null,
          items: [
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
          ],
        },
      ],
    })
    expect(box.value).toHaveLength(1)
    expect(box.value[0]!.label).toBe('Color')
    expect(box.value[0]!.items).toHaveLength(2)
  })

  describe('addField', () => {
    it('adds a new field', () => {
      const box = new BoxSelect()
      box.addField()
      expect(box.value).toHaveLength(2)
      expect(box.value[1]).toBeInstanceOf(FormValueSelect)
    })
  })

  describe('updateFieldAt', () => {
    it('updates label', () => {
      const box = new BoxSelect()
      box.updateFieldAt(0, { label: 'Category' })
      expect(box.value[0]!.label).toBe('Category')
    })

    it('does nothing for out-of-bounds index', () => {
      const box = new BoxSelect()
      box.updateFieldAt(99, { label: 'test' })
      expect(box.value[0]!.label).toBe('Select field')
    })
  })

  describe('addOption', () => {
    it('adds an option to the field', () => {
      const box = new BoxSelect()
      expect(box.value[0]!.items).toHaveLength(1)

      box.addOption(0)
      expect(box.value[0]!.items).toHaveLength(2)
      expect(box.value[0]!.items[1]!.label).toBe('Option 2')
    })

    it('does nothing for invalid field index', () => {
      const box = new BoxSelect()
      box.addOption(99)
      expect(box.value[0]!.items).toHaveLength(1)
    })
  })

  describe('removeOption', () => {
    it('removes an option by index', () => {
      const box = new BoxSelect()
      box.addOption(0)
      expect(box.value[0]!.items).toHaveLength(2)

      box.removeOption(0, 0)
      expect(box.value[0]!.items).toHaveLength(1)
      expect(box.value[0]!.items[0]!.label).toBe('Option 2')
    })

    it('does nothing for invalid field index', () => {
      const box = new BoxSelect()
      box.removeOption(99, 0)
      expect(box.value[0]!.items).toHaveLength(1)
    })
  })

  describe('updateOption', () => {
    it('updates an option label', () => {
      const box = new BoxSelect()
      box.updateOption(0, 0, { label: 'Primary' })
      expect(box.value[0]!.items[0]!.label).toBe('Primary')
    })

    it('does nothing for invalid field index', () => {
      const box = new BoxSelect()
      box.updateOption(99, 0, { label: 'Test' })
      expect(box.value[0]!.items[0]!.label).toBe('Option 1')
    })

    it('does nothing for invalid option index', () => {
      const box = new BoxSelect()
      box.updateOption(0, 99, { label: 'Test' })
      expect(box.value[0]!.items[0]!.label).toBe('Option 1')
    })
  })

  describe('selectOption', () => {
    it('selects an option by value', () => {
      const box = new BoxSelect()
      const optValue = box.value[0]!.items[0]!.value
      box.selectOption(0, optValue)
      expect(box.value[0]!.value).toEqual(box.value[0]!.items[0])
    })

    it('sets null when option value does not exist', () => {
      const box = new BoxSelect()
      box.selectOption(0, 'nonexistent')
      expect(box.value[0]!.value).toBeNull()
    })

    it('does nothing for invalid field index', () => {
      const box = new BoxSelect()
      box.selectOption(99, 'test')
      expect(box.value[0]!.value).toBeNull()
    })
  })

  describe('toJSON', () => {
    it('serializes fields with items', () => {
      const box = new BoxSelect()
      box.updateFieldAt(0, { label: 'Color' })
      box.addOption(0)
      box.updateOption(0, 1, { label: 'Green' })

      const json = box.toJSON()
      const fields = json.value as Record<string, unknown>[]
      expect(fields).toHaveLength(1)
      expect(fields[0]!.label).toBe('Color')
      expect((fields[0]!.items as unknown[]).length).toBe(2)
    })
  })
})
