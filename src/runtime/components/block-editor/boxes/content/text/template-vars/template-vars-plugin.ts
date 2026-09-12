import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as PmNode } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/core'
import { scanTokens, normalizeIndexPath } from '#block-editor'
import type { TemplateVarsMeta } from './types'

export interface TemplateVarsState {
  meta: TemplateVarsMeta | null
  knownPaths: Set<string>
  decorations: DecorationSet
}

export const templateVarsPluginKey = new PluginKey<TemplateVarsState>('blockEditorTemplateVars')

/**
 * Доставляет ключи в плагин. Расширение лежит в общем массиве extensions,
 * который @nuxt/ui читает один раз при useEditor(), поэтому configure() не подходит.
 * Пока ключи не пришли — плагин инертен.
 */
export function setTemplateKeys(editor: Editor, meta: TemplateVarsMeta): void {
  if (!editor || editor.isDestroyed || !editor.view) return

  editor.view.dispatch(
    editor.state.tr.setMeta(templateVarsPluginKey, meta).setMeta('addToHistory', false)
  )
}

function buildDecorations(doc: PmNode, knownPaths: Set<string>): DecorationSet {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true
    if (node.type.spec.code) return false

    // textBetween склеивает текст блока целиком: токен, разрезанный марками,
    // всё равно матчится, а смещения остаются точными (leaf-ноды дают 1 символ)
    const text = node.textBetween(0, node.content.size, undefined, ' ')

    for (const token of scanTokens(text)) {
      const classes = ['tpl-token', `tpl-token--${token.role}`]
      // индексный путь известен по образцу первого элемента: `items.3.title` ≈ `items.0.title`
      if (token.path !== '.'
        && !knownPaths.has(token.path)
        && !knownPaths.has(normalizeIndexPath(token.path))) {
        classes.push('tpl-token--unknown')
      }

      decorations.push(
        Decoration.inline(pos + 1 + token.from, pos + 1 + token.to, { class: classes.join(' ') })
      )
    }

    return false
  })

  return DecorationSet.create(doc, decorations)
}

export function templateVarsPlugin(editor: Editor): Plugin<TemplateVarsState> {
  return new Plugin<TemplateVarsState>({
    key: templateVarsPluginKey,

    state: {
      init: () => ({
        meta: null,
        knownPaths: new Set<string>(),
        decorations: DecorationSet.empty
      }),

      apply(tr, value, _oldState, newState) {
        const meta = tr.getMeta(templateVarsPluginKey) as TemplateVarsMeta | undefined

        if (meta) {
          const knownPaths = new Set(meta.keys.map(key => key.path))
          return { meta, knownPaths, decorations: buildDecorations(newState.doc, knownPaths) }
        }

        if (!value.meta || !tr.docChanged) return value

        // во время IME-композиции декорации только маппим — пересборка ломает ввод
        if (editor.view?.composing) {
          return { ...value, decorations: value.decorations.map(tr.mapping, tr.doc) }
        }

        return { ...value, decorations: buildDecorations(newState.doc, value.knownPaths) }
      }
    },

    props: {
      decorations(state) {
        return templateVarsPluginKey.getState(state)?.decorations
      }
    }
  })
}
