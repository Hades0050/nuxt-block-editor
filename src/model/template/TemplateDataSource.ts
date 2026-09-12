import type { TemplateKey } from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Глубокое слияние: поздний источник перекрывает ранний, массивы заменяются целиком. */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue

    if (isPlainObject(value)) {
      const existing = target[key]
      target[key] = deepMerge(isPlainObject(existing) ? existing : {}, value)
      continue
    }

    target[key] = value
  }

  return target
}

/**
 * Приводит индексные сегменты пути к нулевому: `items.3.title` → `items.0.title`.
 * Автокомплит отдаёт образец по первому элементу, а в шаблоне номер любой —
 * по нормализованному виду проверяется, что путь известен.
 */
export function normalizeIndexPath(path: string): string {
  return path.replace(/(^|\.)\d+(?=\.|$)/g, '$10')
}

/**
 * Разворачивает данные в плоский список путей для автокомплита.
 * Для массива объектов дополнительно отдаёт ключи первого элемента со scope —
 * внутри `{{#items}}` они резолвятся относительно элемента.
 * Плюс индексный образец `items.0.title` — доступ к элементу по порядковому номеру без секции.
 */
export function flattenDataPaths(data: Record<string, unknown>): TemplateKey[] {
  const keys: TemplateKey[] = []

  const walk = (obj: Record<string, unknown>, prefix: string, scope?: string): void => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      const base: TemplateKey = scope ? { path, kind: 'value', scope } : { path, kind: 'value' }

      if (Array.isArray(value)) {
        keys.push({ ...base, kind: 'section' })
        const first = value[0]
        if (isPlainObject(first)) {
          walk(first, '', scope ? `${scope}.${path}` : path)
          walk(first, `${path}.0`, scope)
        }
        else if (first !== undefined) {
          keys.push({ ...base, path: `${path}.0` })
        }
        continue
      }

      if (isPlainObject(value)) {
        keys.push({ ...base, kind: 'section' })
        walk(value, path, scope)
        continue
      }

      keys.push(base)
    }
  }

  walk(data, '')
  return keys
}

/**
 * Иммутабельный источник данных для шаблонов.
 * Собирается из нескольких источников: чем позже источник, тем выше приоритет
 * (значения полей форм перекрывают внешний prop `data`, в том числе пустой строкой).
 */
export class TemplateDataSource {
  private cachedKeys: TemplateKey[] | null = null

  private constructor(readonly data: Record<string, unknown>) {}

  static from(...sources: Array<Record<string, unknown> | undefined | null>): TemplateDataSource {
    const merged: Record<string, unknown> = {}
    for (const source of sources) {
      if (source) deepMerge(merged, source)
    }
    return new TemplateDataSource(merged)
  }

  get isEmpty(): boolean {
    return Object.keys(this.data).length === 0
  }

  keys(): TemplateKey[] {
    this.cachedKeys ??= flattenDataPaths(this.data)
    return this.cachedKeys
  }
}
