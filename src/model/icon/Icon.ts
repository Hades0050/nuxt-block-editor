export const DEFAULT_ICON = { name: 'visibility_off', color: '#757575' } as const

/** Value-объект иконки (имя + цвет) */
export class Icon {
  public name: string
  public color: string

  constructor(name?: string, color?: string) {
    this.name = name ?? DEFAULT_ICON.name
    this.color = color ?? DEFAULT_ICON.color
  }

  toJSON(): { name: string; color: string } {
    return { name: this.name, color: this.color }
  }

  static from(data?: { name?: string; color?: string } | null): Icon {
    if (!data) return new Icon()
    return new Icon(data.name, data.color)
  }
}
