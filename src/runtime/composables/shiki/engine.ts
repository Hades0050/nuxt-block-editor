import { createHighlighter, type Highlighter } from 'shiki'

const THEME = 'github-dark'
const FALLBACK_LANG = 'text'

// Один движок на весь контекст (страницу или воркер): Shiki ругается на множественные инстансы.
let highlighterPromise: Promise<Highlighter> | undefined
// Кэш по языку: параллельные запросы одного языка делят один loadLanguage
const langPromises = new Map<string, Promise<string>>()

function getHighlighter(): Promise<Highlighter> {
  // Сбой (например, не догрузился чанк) не кэшируем — иначе подсветка мертва до перезагрузки
  return highlighterPromise ??= createHighlighter({ themes: [THEME], langs: [] }).catch((err) => {
    highlighterPromise = undefined
    throw err
  })
}

/** Загружает грамматику один раз; неизвестный язык кэшируется как фолбэк `text`. */
function resolveLang(hl: Highlighter, lang: string): Promise<string> {
  let p = langPromises.get(lang)
  if (!p) {
    p = hl.loadLanguage(lang as never).then(() => lang, () => FALLBACK_LANG)
    langPromises.set(lang, p)
  }
  return p
}

export async function highlightHtml(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter()
  return hl.codeToHtml(code, { lang: await resolveLang(hl, lang), theme: THEME })
}
