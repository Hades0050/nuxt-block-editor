import { Extension } from '@tiptap/core'
import { templateVarsPlugin } from './template-vars-plugin'
import { templateVarsSuggestion } from './template-vars-suggestion'

/**
 * Подсветка токенов `{{…}}` и автокомплит по `{{`.
 * Пока в плагин не пришли ключи (TemplateVarsSync), расширение ничего не делает —
 * поэтому его безопасно держать в общем массиве extensions.
 */
export const TemplateVars = Extension.create({
  name: 'templateVars',

  addProseMirrorPlugins() {
    return [
      templateVarsPlugin(this.editor),
      templateVarsSuggestion(this.editor)
    ]
  }
})
