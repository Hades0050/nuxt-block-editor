import type { Content } from '../content/Content'
import type { IContent } from '../types/interfaces'
import type { FormValue } from '../form-values/FormValue'
import { FormValueInput } from '../form-values/FormValueInput'
import { FormValueSelect } from '../form-values/FormValueSelect'
import { FormValueDate } from '../form-values/FormValueDate'
import { BoxFields } from '../boxes/BoxFields'
import { BoxTabs } from '../boxes/BoxTabs'
import { BoxTree } from '../boxes/BoxTree'
import type { TreeNode } from '../items/TreeNode'

/**
 * Устанавливает значение по точечному пути в объекте.
 * setByPath({}, 'user.name', 'John') → { user: { name: 'John' } }
 */
function setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  current[keys[keys.length - 1]!] = value
}

/**
 * Получает значение по точечному пути из объекта.
 * getByPath({ user: { name: 'John' } }, 'user.name') → 'John'
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/**
 * Обходит Content рекурсивно, вызывая callback для каждого FormValue поля.
 */
function walkFields(content: IContent, callback: (field: FormValue) => void): void {
  for (const box of content.boxes) {
    if (box instanceof BoxFields) {
      for (const field of box.value) {
        callback(field)
      }
    }
    if (box instanceof BoxTabs) {
      for (const tab of box.value) {
        if (tab.content && tab.content.boxes) {
          walkFields(tab.content, callback)
        }
      }
    }
    if (box instanceof BoxTree) {
      walkTreeNodes(box.value, callback)
    }
  }
}

function walkTreeNodes(nodes: TreeNode[], callback: (field: FormValue) => void): void {
  for (const node of nodes) {
    if (node.content && node.content.boxes) {
      walkFields(node.content, callback)
    }
    if (node.children.length > 0) {
      walkTreeNodes(node.children, callback)
    }
  }
}

/**
 * Обходит Content рекурсивно, собирает значения полей форм по bindingKey.
 * Возвращает объект с вложенными путями: "user.name" → { user: { name: value } }.
 *
 * - Input: строковое значение
 * - Select: value строка из выбранной опции (или null)
 * - DateTime: строковое значение
 * - Поля без bindingKey пропускаются
 */
export function collectData(content: Content): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  walkFields(content, (field) => {
    if (!field.bindingKey) return

    let extractedValue: unknown

    if (field instanceof FormValueInput) {
      extractedValue = field.value
    }
    else if (field instanceof FormValueSelect) {
      extractedValue = field.value?.value ?? null
    }
    else if (field instanceof FormValueDate) {
      extractedValue = field.value
    }
    else {
      return
    }

    setByPath(result, field.bindingKey, extractedValue)
  })

  return result
}

/**
 * Обходит Content рекурсивно, заполняет поля форм значениями из data по bindingKey.
 *
 * - Input: устанавливает строку
 * - Select: ищет опцию по value в items, устанавливает SelectOption или null
 * - DateTime: устанавливает строку
 * - Поля без bindingKey или с отсутствующим ключом в data — не трогает
 */
export function insertData(content: Content, data: Record<string, unknown>): void {
  walkFields(content, (field) => {
    if (!field.bindingKey) return

    const value = getByPath(data, field.bindingKey)
    if (value === undefined) return

    if (field instanceof FormValueInput) {
      field.value = String(value ?? '')
    }
    else if (field instanceof FormValueSelect) {
      if (value === null) {
        field.value = null
      }
      else {
        const stringValue = String(value)
        field.value = field.items.find(item => item.value === stringValue) ?? null
      }
    }
    else if (field instanceof FormValueDate) {
      field.value = String(value ?? '')
    }
  })
}

/**
 * Находит дублирующиеся bindingKey среди всех полей форм (рекурсивно).
 * Возвращает массив ключей, встречающихся более одного раза.
 */
export function findDuplicateBindingKeys(content: Content): string[] {
  const counts = new Map<string, number>()

  walkFields(content, (field) => {
    if (!field.bindingKey) return
    counts.set(field.bindingKey, (counts.get(field.bindingKey) ?? 0) + 1)
  })

  const duplicates: string[] = []
  for (const [key, count] of counts) {
    if (count > 1) duplicates.push(key)
  }
  return duplicates
}
