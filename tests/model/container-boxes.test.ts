import { describe, it, expect } from 'vitest'
import {
  BoxTabs, BoxTree, BoxHtml, BoxText,
  boxFactory, TabItem, TreeNode, Content, BOX_TYPES,
} from '#block-editor'

describe('BoxTabs', () => {
  it('creates with one default tab', () => {
    const box = new BoxTabs(undefined, boxFactory)
    expect(box.name_type).toBe(BOX_TYPES.TABS)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(TabItem)
    expect(box.activeTabId).toBe(box.value[0]!.id)
  })

  it('addTab creates new tab and sets it active', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tab = box.addTab(boxFactory)
    expect(box.value).toHaveLength(2)
    expect(tab).toBeInstanceOf(TabItem)
    expect(tab.label).toBe('Tab 2')
    expect(box.activeTabId).toBe(tab.id)
  })

  it('removeTab removes and switches active', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tab2 = box.addTab(boxFactory)
    const tab1Id = box.value[0]!.id

    box.removeTab(tab2.id)
    expect(box.value).toHaveLength(1)
    expect(box.activeTabId).toBe(tab1Id)
  })

  it('removeTab switches active when active tab removed', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tab2 = box.addTab(boxFactory)
    // active is tab2

    box.removeTab(tab2.id)
    expect(box.activeTabId).toBe(box.value[0]!.id)
  })

  it('findTab returns correct tab', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tab = box.addTab(boxFactory)
    expect(box.findTab(tab.id)).toBe(tab)
    expect(box.findTab('nonexistent')).toBeUndefined()
  })

  it('updateTabLabel changes label in place', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tabId = box.value[0]!.id
    box.updateTabLabel(tabId, 'Renamed')
    expect(box.value[0]!.label).toBe('Renamed')
  })

  it('tab content is a Content instance', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tab = box.value[0]!
    expect(tab.content).toBeInstanceOf(Content)
    expect(tab.content.boxes).toHaveLength(0)
  })

  it('adding box to tab content works', () => {
    const box = new BoxTabs(undefined, boxFactory)
    const tab = box.value[0]!
    const inner = new BoxText({ title: 'Inner' })
    tab.content.addBox(inner)
    expect(tab.content.boxes).toHaveLength(1)
    expect(tab.content.boxes[0]!.title).toBe('Inner')
  })

  it('toJSON serializes tabs and nested content', () => {
    const box = new BoxTabs(undefined, boxFactory)
    box.value[0]!.content.addBox(new BoxText({ value: 'hello' }))

    const json = box.toJSON()
    expect(json.activeTabId).toBeTruthy()
    const tabs = json.value as Record<string, unknown>[]
    expect(tabs).toHaveLength(1)
    const tabContent = tabs[0]!.content as { boxes: Record<string, unknown>[] }
    expect(tabContent.boxes).toHaveLength(1)
  })
})

describe('BoxTree', () => {
  it('creates with one default root node', () => {
    const box = new BoxTree(undefined, boxFactory)
    expect(box.name_type).toBe(BOX_TYPES.TREE)
    expect(box.value).toHaveLength(1)
    expect(box.value[0]).toBeInstanceOf(TreeNode)
    expect(box.activeNodeId).toBe(box.value[0]!.id)
  })

  it('addRootNode adds to top level', () => {
    const box = new BoxTree(undefined, boxFactory)
    const node = box.addRootNode(boxFactory)
    expect(box.value).toHaveLength(2)
    expect(node).toBeInstanceOf(TreeNode)
    expect(node.label).toBe('New root')
  })

  it('removeNode removes from top level', () => {
    const box = new BoxTree(undefined, boxFactory)
    const node2 = box.addRootNode(boxFactory)
    box.removeNode(node2.id)
    expect(box.value).toHaveLength(1)
  })

  it('removeNode switches activeNodeId when active removed', () => {
    const box = new BoxTree(undefined, boxFactory)
    const node2 = box.addRootNode(boxFactory)
    box.activeNodeId = node2.id

    box.removeNode(node2.id)
    expect(box.activeNodeId).toBe(box.value[0]!.id)
  })

  it('findNode finds at top level', () => {
    const box = new BoxTree(undefined, boxFactory)
    const rootId = box.value[0]!.id
    expect(box.findNode(rootId)).toBe(box.value[0])
  })

  it('findNode finds nested node', () => {
    const box = new BoxTree(undefined, boxFactory)
    const child = box.value[0]!.addChild(boxFactory)
    expect(box.findNode(child.id)).toBe(child)
  })

  it('addChildNode adds child to specified parent', () => {
    const box = new BoxTree(undefined, boxFactory)
    const parentId = box.value[0]!.id
    const child = box.addChildNode(parentId, boxFactory)

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(TreeNode)
    expect(box.value[0]!.children).toHaveLength(1)
    expect(box.value[0]!.children[0]).toBe(child)
  })

  it('addChildNode returns undefined for unknown parent', () => {
    const box = new BoxTree(undefined, boxFactory)
    expect(box.addChildNode('nonexistent', boxFactory)).toBeUndefined()
  })

  it('updateNodeLabel changes label in place', () => {
    const box = new BoxTree(undefined, boxFactory)
    const nodeId = box.value[0]!.id
    box.updateNodeLabel(nodeId, 'Renamed')
    expect(box.value[0]!.label).toBe('Renamed')
  })

  it('updateNodeLabel works on nested nodes', () => {
    const box = new BoxTree(undefined, boxFactory)
    const child = box.value[0]!.addChild(boxFactory)
    box.updateNodeLabel(child.id, 'Deep Rename')
    expect(child.label).toBe('Deep Rename')
  })

  it('node content is a Content instance', () => {
    const box = new BoxTree(undefined, boxFactory)
    expect(box.value[0]!.content).toBeInstanceOf(Content)
  })

  it('removeNode cascades to children', () => {
    const box = new BoxTree(undefined, boxFactory)
    const child = box.value[0]!.addChild(boxFactory)
    const grandchild = child.addChild(boxFactory)

    // removeNode on the child should also clean grandchild references
    box.removeNode(child.id)
    expect(box.value[0]!.children).toHaveLength(0)
    expect(box.findNode(grandchild.id)).toBeUndefined()
  })
})

describe('BoxHtml', () => {
  it('creates with empty content', () => {
    const box = new BoxHtml(undefined, boxFactory)
    expect(box.name_type).toBe(BOX_TYPES.HTML)
    expect(box.value).toBeInstanceOf(Content)
    expect(box.value.boxes).toHaveLength(0)
  })

  it('content methods work directly', () => {
    const box = new BoxHtml(undefined, boxFactory)
    const inner = new BoxText({ title: 'Child' })
    box.value.addBox(inner)
    expect(box.value.boxes).toHaveLength(1)

    box.value.removeBox(inner.id)
    expect(box.value.boxes).toHaveLength(0)
  })

  it('toJSON serializes nested content', () => {
    const box = new BoxHtml(undefined, boxFactory)
    box.value.addBox(new BoxText({ value: 'inner' }))

    const json = box.toJSON()
    const value = json.value as { boxes: Record<string, unknown>[] }
    expect(value.boxes).toHaveLength(1)
    expect(value.boxes[0]!.value).toBe('inner')
  })
})
