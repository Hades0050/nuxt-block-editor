import { describe, it, expect } from 'vitest'
import {
  boxFactory, BOX_TYPES,
  BoxText, BoxInput, BoxSelect, BoxDateTime,
  BoxTabs, BoxTree, BoxCode,
  BoxVideo, BoxCanvas, BoxFile, BoxMarkdown,
  BoxTextArea, BoxExternalService,
} from '#block-editor'
import type { BoxType } from '#block-editor'

describe('BoxFactory', () => {
  describe('createDefault', () => {
    const cases: [BoxType, any][] = [
      [BOX_TYPES.TEXT, BoxText],
      [BOX_TYPES.TEXT_AREA, BoxTextArea],
      [BOX_TYPES.MARKDOWN, BoxMarkdown],
      [BOX_TYPES.FILE, BoxFile],
      [BOX_TYPES.CODE, BoxCode],
      [BOX_TYPES.EXTERNAL_SERVICE, BoxExternalService],
      [BOX_TYPES.SELECT, BoxSelect],
      [BOX_TYPES.INPUT, BoxInput],
      [BOX_TYPES.DATETIME, BoxDateTime],
      [BOX_TYPES.TABS, BoxTabs],
      [BOX_TYPES.TREE, BoxTree],
      [BOX_TYPES.VIDEO, BoxVideo],
      [BOX_TYPES.CANVAS, BoxCanvas],
    ]

    it.each(cases)('creates %s with correct type', (type, ExpectedClass) => {
      const box = boxFactory.createDefault(type)
      expect(box).toBeInstanceOf(ExpectedClass)
      expect(box.name_type).toBe(type)
      expect(box.id).toBeTruthy()
    })

    it('throws on unknown type', () => {
      expect(() => boxFactory.createDefault('UNKNOWN' as any)).toThrow('Unknown box type')
    })
  })

  describe('prepare (deserialization)', () => {
    it('deserializes TEXT box', () => {
      const box = boxFactory.prepare({
        name_type: 'TEXT',
        id: 'test-1',
        title: 'Hello',
        value: 'world',
        x: 1, y: 2, w: 6, h: 3, i: 0
      }) as BoxText

      expect(box).toBeInstanceOf(BoxText)
      expect(box.id).toBe('test-1')
      expect(box.title).toBe('Hello')
      expect(box.value).toBe('world')
      expect(box.x).toBe(1)
    })

    it('deserializes INPUT box with fields', () => {
      const box = boxFactory.prepare({
        name_type: 'INPUT',
        value: [
          { id: 'f1', label: 'Name', value: 'Alice' },
          { id: 'f2', label: 'Age', value: '30' }
        ]
      }) as BoxInput

      expect(box).toBeInstanceOf(BoxInput)
      expect(box.value).toHaveLength(2)
      expect(box.value[0]!.label).toBe('Name')
      expect(typeof box.value[0]!.toJSON).toBe('function')
    })

    it('deserializes SELECT box with items', () => {
      const box = boxFactory.prepare({
        name_type: 'SELECT',
        value: [{
          id: 'f1',
          label: 'Color',
          value: { value: 'red', label: 'Red' },
          items: [{ value: 'red', label: 'Red' }, { value: 'blue', label: 'Blue' }]
        }]
      }) as BoxSelect

      expect(box).toBeInstanceOf(BoxSelect)
      expect(box.value[0]!.items).toHaveLength(2)
      expect(box.value[0]!.value!.label).toBe('Red')
    })

    it('deserializes TABS box with nested content', () => {
      const box = boxFactory.prepare({
        name_type: 'TABS',
        value: [{
          id: 'tab1',
          label: 'Tab 1',
          content: {
            boxes: [
              { name_type: 'TEXT', id: 'inner1', title: 'Inner', value: 'text' }
            ]
          }
        }]
      }) as BoxTabs

      expect(box).toBeInstanceOf(BoxTabs)
      expect(box.value).toHaveLength(1)
      expect(box.value[0]!.label).toBe('Tab 1')
      expect(box.value[0]!.content.boxes).toHaveLength(1)
      expect(box.value[0]!.content.boxes[0]!.name_type).toBe(BOX_TYPES.TEXT)
    })

    it('throws on invalid input', () => {
      expect(() => boxFactory.prepare(null)).toThrow()
      expect(() => boxFactory.prepare({})).toThrow('Unknown box type')
      expect(() => boxFactory.prepare({ name_type: 'INVALID' })).toThrow('Unknown box type')
    })
  })

  describe('roundtrip: create → toJSON → prepare', () => {
    it('INPUT box roundtrip preserves data', () => {
      const original = boxFactory.createDefault(BOX_TYPES.INPUT) as BoxInput
      original.addField()
      original.updateFieldAt(0, { label: 'Name', value: 'Bob' })

      const json = original.toJSON()
      const restored = boxFactory.prepare(json) as BoxInput

      expect(restored.value).toHaveLength(2)
      expect(restored.value[0]!.label).toBe('Name')
      expect(restored.value[0]!.value).toBe('Bob')
      expect(typeof restored.addField).toBe('function')
    })

    it('SELECT box roundtrip preserves options', () => {
      const original = boxFactory.createDefault(BOX_TYPES.SELECT) as BoxSelect
      original.addOption(0)
      original.updateOption(0, 1, { label: 'Custom' })

      const json = original.toJSON()
      const restored = boxFactory.prepare(json) as BoxSelect

      expect(restored.value[0]!.items).toHaveLength(2)
      expect(restored.value[0]!.items[1]!.label).toBe('Custom')
    })

    it('TABS box roundtrip preserves nested content', () => {
      const original = boxFactory.createDefault(BOX_TYPES.TABS) as BoxTabs
      const innerBox = boxFactory.createDefault(BOX_TYPES.TEXT) as BoxText
      innerBox.value = 'Nested text'
      original.value[0]!.content.addBox(innerBox)

      const json = original.toJSON()
      const restored = boxFactory.prepare(json) as BoxTabs

      expect(restored.value[0]!.content.boxes).toHaveLength(1)
      expect((restored.value[0]!.content.boxes[0] as BoxText).value).toBe('Nested text')
    })
  })
})
