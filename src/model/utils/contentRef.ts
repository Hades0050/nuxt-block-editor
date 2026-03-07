import type { IContent, IBoxFactory } from '../types/interfaces'

/** Конструктор Content, зарегистрированный через setContentClass() */
export interface ContentClassLike {
  fromRaw(raw: unknown, factory?: IBoxFactory): IContent
}

/**
 * Общая ссылка на класс Content для разрешения циклической зависимости.
 * TabItem и TreeNode не могут импортировать Content напрямую,
 * т.к. Content импортирует их. Вместо этого Content регистрирует себя
 * через setContentClass(), а TabItem/TreeNode используют getContentClass().
 */
let ContentClass: ContentClassLike | null = null

export function setContentClass(cls: ContentClassLike): void {
  ContentClass = cls
}

export function getContentClass(): ContentClassLike | null {
  return ContentClass
}
