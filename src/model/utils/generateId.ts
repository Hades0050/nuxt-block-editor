/** Счётчик для уникальности ID в рамках одной сессии */
let counter = 0

/** Генерирует уникальный ID с заданным префиксом */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++counter}`
}
