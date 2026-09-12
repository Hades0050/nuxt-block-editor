import type { Content } from '../content/Content'
import type { FormValue } from '../form-values/FormValue'
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
function walkFields(content: Content, callback: (field: FormValue) => void): void {
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
 * Что считать значением, решает само поле — см. FormValue.boundValue.
 * Поля без bindingKey пропускаются.
 */
export function collectData(content: Content): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  walkFields(content, (field) => {
    if (!field.bindingKey) return
    setByPath(result, field.bindingKey, field.boundValue)
  })

  return result
}

/**
 * Обходит Content рекурсивно, заполняет поля форм значениями из data по bindingKey.
 * Как уложить значение, решает само поле — см. FormValue.boundValue.
 * Поля без bindingKey или с отсутствующим ключом в data — не трогает
 * (отсутствующий ключ и `null` — разное: `null` записывается).
 */
export function insertData(content: Content, data: Record<string, unknown>): void {
  walkFields(content, (field) => {
    if (!field.bindingKey) return

    const value = getByPath(data, field.bindingKey)
    if (value === undefined) return

    field.boundValue = value
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
