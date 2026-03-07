import { describe, it, expect } from 'vitest'
import { Content, BoxInput, BoxText, BoxDateTime, boxFactory, BOX_TYPES } from '#block-editor'

describe('Content', () => {
  it('creates empty by default', () => {
    const content = new Content()
    expect(content.boxes).toHaveLength(0)
  })

  it('creates with initial boxes', () => {
    const boxes = [new BoxInput(), new BoxText()]
    const content = new Content(boxes)
    expect(content.boxes).toHaveLength(2)
  })

  describe('addBox', () => {
    it('adds a box', () => {
      const content = new Content()
      content.addBox(new BoxInput())
      expect(content.boxes).toHaveLength(1)
    })

    it('auto-positions second box below first', () => {
      const content = new Content()
      const first = new BoxInput()
      first.y = 0
      first.h = 4
      content.addBox(first)

      const second = new BoxText()
      content.addBox(second)
      expect(second.y).toBe(4) // 0 + 4
      expect(second.i).toBe(1)
    })

    it('positions after the tallest box', () => {
      const content = new Content()
      const a = new BoxInput()
      a.y = 0
      a.h = 4
      content.addBox(a)

      const b = new BoxText()
      b.h = 8
      content.addBox(b)
      // addBox sets b.y = max(0+4) = 4

      const c = new BoxDateTime()
      content.addBox(c)
      expect(c.y).toBe(12) // max(0+4, 4+8) = 12
    })
  })

  describe('removeBox', () => {
    it('removes box by id', () => {
      const content = new Content()
      const box = new BoxInput()
      content.addBox(box)
      content.removeBox(box.id)
      expect(content.boxes).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      const content = new Content()
      content.addBox(new BoxInput())
      content.removeBox('nonexistent')
      expect(content.boxes).toHaveLength(1)
    })
  })

  describe('findBox', () => {
    it('finds box by id', () => {
      const content = new Content()
      const box = new BoxInput()
      content.addBox(box)
      expect(content.findBox(box.id)).toBe(box)
    })

    it('returns undefined for non-existent id', () => {
      const content = new Content()
      expect(content.findBox('nonexistent')).toBeUndefined()
    })
  })

  describe('updateBox', () => {
    it('applies updates and creates new reference', () => {
      const content = new Content()
      const box = new BoxInput()
      content.addBox(box)
      const originalRef = content.boxes[0]

      content.updateBox(box.id, { title: 'Updated' })
      expect(content.boxes[0]!.title).toBe('Updated')
      // New reference for Vue reactivity
      expect(content.boxes[0]).not.toBe(originalRef)
    })

    it('does nothing for non-existent id', () => {
      const content = new Content()
      content.addBox(new BoxInput())
      content.updateBox('nonexistent', { title: 'Test' })
      expect(content.boxes[0]!.title).toBe('')
    })
  })

  describe('moveBox', () => {
    it('moves box up', () => {
      const content = new Content()
      const a = new BoxInput()
      const b = new BoxText()
      content.addBox(a)
      content.addBox(b)

      content.moveBox(b.id, 'up')
      expect(content.boxes[0]!.id).toBe(b.id)
      expect(content.boxes[1]!.id).toBe(a.id)
    })

    it('moves box down', () => {
      const content = new Content()
      const a = new BoxInput()
      const b = new BoxText()
      content.addBox(a)
      content.addBox(b)

      content.moveBox(a.id, 'down')
      expect(content.boxes[0]!.id).toBe(b.id)
      expect(content.boxes[1]!.id).toBe(a.id)
    })

    it('does nothing when moving first box up', () => {
      const content = new Content()
      const a = new BoxInput()
      content.addBox(a)
      content.moveBox(a.id, 'up')
      expect(content.boxes[0]!.id).toBe(a.id)
    })

    it('does nothing when moving last box down', () => {
      const content = new Content()
      const a = new BoxInput()
      content.addBox(a)
      content.moveBox(a.id, 'down')
      expect(content.boxes[0]!.id).toBe(a.id)
    })
  })

  describe('serialization', () => {
    it('toJSON returns boxes array', () => {
      const content = new Content()
      content.addBox(new BoxInput({ title: 'A' }))
      content.addBox(new BoxText({ title: 'B' }))

      const json = content.toJSON()
      expect(json.boxes).toHaveLength(2)
      expect(json.boxes[0]!.title).toBe('A')
      expect(json.boxes[1]!.title).toBe('B')
    })

    it('fromJsonString roundtrip', () => {
      const content = new Content()
      const input = new BoxInput({ title: 'Input Box' })
      input.updateFieldAt(0, { label: 'Name', value: 'Test' })
      content.addBox(input)

      const jsonStr = content.toJsonString()
      const restored = Content.fromJsonString(`{"boxes":${jsonStr}}`, boxFactory)

      expect(restored.boxes).toHaveLength(1)
      expect(restored.boxes[0]!.name_type).toBe(BOX_TYPES.INPUT)
      expect(restored.boxes[0]!.title).toBe('Input Box')

      const restoredInput = restored.boxes[0] as BoxInput
      expect(restoredInput.value[0]!.label).toBe('Name')
      expect(restoredInput.value[0]!.value).toBe('Test')
    })

    it('fromJsonString handles empty string', () => {
      const content = Content.fromJsonString('', boxFactory)
      expect(content.boxes).toHaveLength(0)
    })

    it('fromJsonString handles invalid JSON', () => {
      const content = Content.fromJsonString('not json', boxFactory)
      expect(content.boxes).toHaveLength(0)
    })
  })
})
