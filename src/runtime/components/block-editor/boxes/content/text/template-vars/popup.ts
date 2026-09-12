import { computePosition, flip, shift, offset } from '@floating-ui/dom'

/** Позиционирует popup рядом с виртуальным элементом (clientRect) */
export function updatePopupPosition(popup: HTMLElement, clientRect: () => DOMRect | null): void {
  const rect = clientRect()
  if (!rect) return

  const virtualEl = {
    getBoundingClientRect: () => rect
  }

  computePosition(virtualEl as Element, popup, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })]
  }).then(({ x, y }) => {
    Object.assign(popup.style, {
      left: `${x}px`,
      top: `${y}px`
    })
  })
}
