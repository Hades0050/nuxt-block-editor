import { describe, it, expect } from 'vitest'
import { boxFactory, BOX_TYPES } from '#block-editor'

const BASE = ['id', 'name_type', 'title', 'subtitle', 'x', 'y', 'w', 'h', 'minW', 'minH', 'i', 'value']
const EXPECTED: Record<string, string[]> = {
  TEXT: BASE, TEXT_AREA: BASE, MARKDOWN: BASE, EXTERNAL_SERVICE: BASE,
  CODE: [...BASE, 'language'],
  VIDEO: [...BASE, 'width', 'height'],
  FILE: [...BASE, 'fileName', 'applicationType'],
  CANVAS: [...BASE, 'canvasId', 'backgroundColor', 'strokeColor', 'lineWidth', 'canvasHeight'],
  INPUT: BASE, SELECT: BASE, DATETIME: BASE,
  TABS: [...BASE, 'activeTabId'],
  TREE: [...BASE, 'activeNodeId', 'displayMode']
}

describe('контракт toJSON: состав и порядок ключей', () => {
  for (const [type, keys] of Object.entries(EXPECTED)) {
    it(type, () => {
      const box = boxFactory.createDefault(BOX_TYPES[type as keyof typeof BOX_TYPES])
      expect(Object.keys(box.toJSON())).toEqual(keys)
    })
  }

  it('round-trip через prepare сохраняет значения extras', () => {
    const canvas = boxFactory.createDefault(BOX_TYPES.CANVAS)
    canvas.applyUpdates({ lineWidth: 7, strokeColor: '#ff0000', canvasHeight: 400 })
    const clone = boxFactory.prepare(JSON.parse(JSON.stringify(canvas.toJSON())))
    expect(clone.toJSON()).toEqual(canvas.toJSON())
  })
})
