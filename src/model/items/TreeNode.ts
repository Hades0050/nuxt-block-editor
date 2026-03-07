import { Icon } from '../icon/Icon'
import { generateId } from '../utils/generateId'
import { getContentClass } from '../utils/contentRef'
import type { IBoxFactory, IContent } from '../types/interfaces'

/** Узел дерева — хранит label, icon, вложенный контент и дочерние узлы */
export class TreeNode {
  public id: string
  public label: string
  public icon: Icon
  public content: IContent
  public children: TreeNode[]

  constructor(data?: Partial<Record<string, unknown>>, factory?: IBoxFactory) {
    this.id = (data?.id as string) ?? generateId('node')
    this.label = (data?.label as string) ?? 'Node'
    this.icon = Icon.from(data?.icon as { name?: string; color?: string } | undefined)
    const CC = getContentClass()!
    this.content = CC.fromRaw(data?.content, factory)
    const rawChildren = data?.children as unknown[] | undefined
    this.children = Array.isArray(rawChildren)
      ? rawChildren.map(item => new TreeNode(item as Record<string, unknown>, factory))
      : []
  }

  addChild(factory?: IBoxFactory): TreeNode {
    const child = new TreeNode({ label: 'New node' }, factory)
    this.children.push(child)
    return child
  }

  removeChild(nodeId: string): void {
    this.children = this.children.filter(c => c.id !== nodeId)
    // Recursive removal
    for (const child of this.children) {
      child.removeChild(nodeId)
    }
  }

  static findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = TreeNode.findNode(node.children, id)
      if (found) return found
    }
    return undefined
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      label: this.label,
      icon: this.icon.toJSON(),
      content: this.content.toJSON(),
      children: this.children.map(c => c.toJSON())
    }
  }
}
