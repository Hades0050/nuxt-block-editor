import { Box } from './Box'
import { BOX_TYPES } from '../types/box-types'
import { TreeNode } from '../items/TreeNode'
import type { IBoxFactory } from '../types/interfaces'

/** Блок с древовидной структурой — каждый узел содержит вложенный контент */
export class BoxTree extends Box<TreeNode[]> {
  public readonly name_type = BOX_TYPES.TREE
  public value: TreeNode[]
  public activeNodeId: string
  /** Режим отображения: 'side' — боковая панель, 'inline' — контент под узлами */
  public displayMode: 'side' | 'inline'

  constructor(data?: Partial<Record<string, unknown>>, factory?: IBoxFactory) {
    super(data)
    this.value = BoxTree.prepareValue(data?.value, factory)
    this.activeNodeId = (data?.activeNodeId as string) ?? this.value[0]?.id ?? ''
    this.displayMode = (data?.displayMode as 'side' | 'inline') ?? 'side'
  }

  private static prepareValue(raw: unknown, factory?: IBoxFactory): TreeNode[] {
    if (!raw || !Array.isArray(raw)) {
      return [new TreeNode({ label: 'Root' }, factory)]
    }
    return raw.map(item => new TreeNode(item as Record<string, unknown>, factory))
  }

  addRootNode(factory?: IBoxFactory): TreeNode {
    const node = new TreeNode({ label: 'New root' }, factory)
    this.value.push(node)
    this.emitChange()
    return node
  }

  removeNode(nodeId: string): void {
    this.value = this.value.filter(n => n.id !== nodeId)
    for (const node of this.value) {
      node.removeChild(nodeId)
    }
    if (this.activeNodeId === nodeId && this.value.length) {
      this.activeNodeId = this.value[0]!.id
    }
    this.emitChange()
  }

  findNode(nodeId: string): TreeNode | undefined {
    return TreeNode.findNode(this.value, nodeId)
  }

  addChildNode(parentId: string, factory?: IBoxFactory): TreeNode | undefined {
    const parent = this.findNode(parentId)
    if (!parent) return undefined
    const child = parent.addChild(factory)
    this.emitChange()
    return child
  }

  updateNodeLabel(nodeId: string, label: string): void {
    const node = this.findNode(nodeId)
    if (!node) return
    node.label = label
    this.emitChange()
  }

  notifyContentChange(): void {
    this.emitChange()
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      activeNodeId: this.activeNodeId,
      displayMode: this.displayMode,
      value: this.value.map(n => n.toJSON())
    }
  }
}
