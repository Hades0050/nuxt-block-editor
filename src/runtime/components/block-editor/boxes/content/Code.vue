<script setup lang="ts">
import { BoxCode } from '#block-editor'
import type { Box, EditorMode } from '#block-editor'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useBoxModel } from '../../../../composables/useBoxModel'
import { createHighlighter, type Highlighter } from 'shiki'

const props = defineProps<{
  box: BoxCode
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const localValue = useBoxModel(() => props.box.value, emit, 'value')
const language = useBoxModel(() => props.box.language, emit, 'language')

const languageOptions = ref<{ label: string; value: string }[]>([])

// Загружаем список языков лениво — не тянем все грамматики в бандл
let _unmounted = false
onUnmounted(() => { _unmounted = true })

import('shiki/langs').then(mod => {
  if (_unmounted) return
  const names = mod.bundledLanguagesInfo.map((l: { id: string }) => l.id).sort()
  languageOptions.value = names.map((n: string) => ({ label: n, value: n }))
})

// Shiki highlighter with lazy language loading
const highlighter = ref<Highlighter>()
const highlightedHtml = ref('')

onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: ['github-dark'],
    langs: [language.value]
  })
  updateHighlight()
})

onUnmounted(() => {
  highlighter.value?.dispose()
  highlighter.value = undefined
})

async function ensureLanguageLoaded(lang: string) {
  if (!highlighter.value) return
  const loaded = highlighter.value.getLoadedLanguages()
  if (!loaded.includes(lang)) {
    await highlighter.value.loadLanguage(lang as any)
  }
}

async function updateHighlight() {
  const code = localValue.value || ''
  if (!code || !highlighter.value) {
    highlightedHtml.value = escapeHtml(code)
    return
  }
  await ensureLanguageLoaded(language.value)
  const html = highlighter.value.codeToHtml(code, {
    lang: language.value,
    theme: 'github-dark'
  })
  // Extract inner content from shiki's <pre><code>...</code></pre> wrapper
  const match = html.match(/<code[^>]*>([\s\S]*)<\/code>/)
  highlightedHtml.value = match ? match[1] : escapeHtml(code)
}

watch([localValue, language], () => updateHighlight())

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Auto-resize textarea
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

watch(localValue, () => nextTick(autoResize))
onMounted(() => nextTick(autoResize))
</script>

<template>
  <div class="space-y-2">
    <USelect
      v-if="isEditable"
      v-model="language"
      :items="languageOptions"
      placeholder="Language"
      size="sm"
      class="w-40"
    />

    <!-- Edit mode: overlay textarea over highlighted pre -->
    <div v-if="isEditable" class="code-editor-wrapper">
      <pre
        class="code-editor-highlight"
        aria-hidden="true"
      ><code v-html="highlightedHtml + '\n'" /></pre>
      <textarea
        ref="textareaRef"
        v-model="localValue"
        placeholder="Enter code..."
        class="code-editor-input"
        spellcheck="false"
      />
    </div>

    <!-- View mode -->
    <pre
      v-else
      class="code-editor-highlight"
    ><code v-html="highlightedHtml || escapeHtml('// Empty')" /></pre>
  </div>
</template>

<style>
.code-editor-wrapper {
  position: relative;
}

.code-editor-highlight,
.code-editor-input {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: normal;
  tab-size: 2;
  padding: 12px;
  margin: 0;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.code-editor-highlight {
  background: #24292e;
  color: #e1e4e8;
  overflow: auto;
}

.code-editor-wrapper .code-editor-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-color: transparent;
}

.code-editor-input {
  position: relative;
  display: block;
  width: 100%;
  min-height: 96px;
  background: transparent;
  color: transparent;
  caret-color: #e1e4e8;
  resize: none;
  outline: none;
}

.code-editor-input:focus {
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 25%, transparent);
}
</style>
