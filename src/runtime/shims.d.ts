declare module '*.css' {
  const content: string
  export default content
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  // Без vue-tsc типы SFC недоступны, поэтому пропсы намеренно нетипизированы:
  // строгий шим ломает VueNodeViewRenderer, который требует Component<NodeViewProps>.
  const component: DefineComponent<any, any, any>
  export default component
}
