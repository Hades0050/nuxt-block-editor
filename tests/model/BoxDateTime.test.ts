import { describe, it, expect } from 'vitest'
import { BoxDateTime, FormValueDate, BOX_TYPES } from '#block-editor'

describe('BoxDateTime', () => {
  it('creates with one default field in date mode', () => {
    const box = new BoxDateTime()
    expect(box.name_type).toBe(BOX_TYPES.DATETIME)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(FormValueDate)
    expect(box.value[0]!.label).toBe('Date field')
    expect(box.value[0]!.value).toBe('')
    expect(box.value[0]!.mode).toBe('date')
  })

  it('creates from raw data', () => {
    const box = new BoxDateTime({
      value: [
        { id: 'f1', label: 'Start', value: '2025-01-01', mode: 'date' },
        { id: 'f2', label: 'Time', value: '14:30', mode: 'time' },
      ],
    })
    expect(box.value).toHaveLength(2)
    expect(box.value[0]!.label).toBe('Start')
    expect(box.value[0]!.value).toBe('2025-01-01')
    expect(box.value[0]!.mode).toBe('date')
    expect(box.value[1]!.mode).toBe('time')
  })

  describe('addField', () => {
    it('adds a new date field', () => {
      const box = new BoxDateTime()
      box.addField()
      expect(box.value).toHaveLength(2)
      expect(box.value[1]).toBeInstanceOf(FormValueDate)
      expect(box.value[1]!.mode).toBe('date')
    })

    it('assigns unique ids', () => {
      const box = new BoxDateTime()
      box.addField()
      box.addField()
      const ids = box.value.map(f => f.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('removeField', () => {
    it('removes field by id', () => {
      const box = new BoxDateTime()
      box.addField()
      const id = box.value[0]!.id
      box.removeField(id)
      expect(box.value).toHaveLength(1)
      expect(box.value.find(f => f.id === id)).toBeUndefined()
    })

    it('does nothing for non-existent id', () => {
      const box = new BoxDateTime()
      box.removeField('nonexistent')
      expect(box.value).toHaveLength(1)
    })
  })

  describe('updateFieldAt', () => {
    it('updates label', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(0, { label: 'Deadline' })
      expect(box.value[0]!.label).toBe('Deadline')
    })

    it('updates value', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(0, { value: '2025-06-15' })
      expect(box.value[0]!.value).toBe('2025-06-15')
    })

    it('updates mode to time', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(0, { mode: 'time' })
      expect(box.value[0]!.mode).toBe('time')
    })

    it('updates mode to datetime', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(0, { mode: 'datetime' })
      expect(box.value[0]!.mode).toBe('datetime')
    })

    it('updates multiple properties at once', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(0, { label: 'Event', value: '2025-12-31', mode: 'datetime' })
      expect(box.value[0]!.label).toBe('Event')
      expect(box.value[0]!.value).toBe('2025-12-31')
      expect(box.value[0]!.mode).toBe('datetime')
    })

    it('does nothing for out-of-bounds index', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(99, { label: 'test' })
      expect(box.value[0]!.label).toBe('Date field')
    })
  })

  describe('toJSON', () => {
    it('serializes fields with mode', () => {
      const box = new BoxDateTime()
      box.updateFieldAt(0, { label: 'Start', value: '10:00', mode: 'time' })
      box.addField()

      const json = box.toJSON()
      expect(json.name_type).toBe(BOX_TYPES.DATETIME)
      const fields = json.value as Record<string, unknown>[]
      expect(fields).toHaveLength(2)
      expect(fields[0]!.label).toBe('Start')
      expect(fields[0]!.value).toBe('10:00')
      expect(fields[0]!.mode).toBe('time')
    })
  })
})
