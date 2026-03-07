import type { BoxTree } from '#block-editor'
import { ref, computed, type Ref } from 'vue'

/**
 * Композабл для управления состоянием дерева.
 * Инкапсулирует выбранный узел, мутации, и версионный счётчик для реактивности.
 */
export function useTree(box: Ref<BoxTree> | (() => BoxTree)) {
  const getBox = typeof box === 'function' ? box : () => box.value

  /** Счётчик версий структуры дерева — инкремент форсирует ре-рендер */
  const treeVersion = ref(0)

  const selectedNodeId = ref(getBox().activeNodeId || getBox().value[0]?.id || '')

  const selectedNode = computed(() => getBox().findNode(selectedNodeId.value))

  function selectNode(id: string) {
    selectedNodeId.value = id
  }

  function addChildNode(parentId: string) {
    getBox().addChildNode(parentId)
    treeVersion.value++
  }

  function removeNode(nodeId: string) {
    getBox().removeNode(nodeId)
    selectedNodeId.value = getBox().activeNodeId
    treeVersion.value++
  }

  function updateNodeLabel(nodeId: string, label: string) {
    getBox().updateNodeLabel(nodeId, label)
    treeVersion.value++
  }

  return {
    treeVersion,
    selectedNodeId,
    selectedNode,
    selectNode,
    addChildNode,
    removeNode,
    updateNodeLabel
  }
}
