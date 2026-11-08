<script setup lang="ts">
import { Content, boxFactory, type BoxType, type EditorMode, collectData, findDuplicateBindingKeys } from '#block-editor'
import { LOCALE_KEY, type LocaleCode } from '../src/runtime/composables/useEditorI18n'
import { DEMO_BOXES, DEMO_TEMPLATE_DATA } from './demo-content'
import { useShiki } from '../src/runtime/composables/useShiki'
import { shallowRef, ref, computed, watch, onMounted, provide, triggerRef } from 'vue'

function buildDemoContent(): Content {
  return Content.fromJsonString(JSON.stringify(DEMO_BOXES), boxFactory)
}

const content = shallowRef(new Content())
const mode = ref<EditorMode>('edit')
const locale = ref<LocaleCode>('en')
const editorRef = ref<{
  addBlock: (type: BoxType) => void
  collectData: () => Record<string, unknown>
  insertData: (data: Record<string, unknown>) => void
  findDuplicateBindingKeys: () => string[]
}>()

provide(LOCALE_KEY, locale)

const colorMode = useColorMode()

// JSON content viewer
const jsonContent = computed(() => JSON.stringify(content.value.toJSON(), null, 2))
const highlightedJson = ref('')

// Data panel
const collectedData = computed(() => collectData(content.value))
const dataJson = computed(() => JSON.stringify(collectedData.value, null, 2))
const duplicateKeys = computed(() => findDuplicateBindingKeys(content.value))
const highlightedData = ref('')

// Литерал для подписи: `{{key}}` прямо в шаблоне съест компилятор Vue
const KEY_EXAMPLE = '{{key}}'

// Единый источник входных данных: и prop `data` для mustache-шаблонов, и вход для insertData
const dataInput = ref('')
const dataParsed = computed(() => {
  if (!dataInput.value.trim()) return { data: {} as Record<string, unknown>, error: '' }
  try {
    return { data: JSON.parse(dataInput.value) as Record<string, unknown>, error: '' }
  }
  catch {
    return { data: {} as Record<string, unknown>, error: 'Invalid JSON' }
  }
})
const templateData = computed(() => dataParsed.value.data)
const dataError = computed(() => dataParsed.value.error)

const { highlight } = useShiki()

async function highlightAll() {
  try {
    const [json, data] = await Promise.all([highlight(jsonContent.value, 'json'), highlight(dataJson.value, 'json')])
    highlightedJson.value = json
    highlightedData.value = data
  }
  catch {
    // Воркер упал — превью останется без подсветки
  }
}

// content — shallowRef: обновляется присваиванием/triggerRef, глубокий обход графа не нужен
watch(content, () => highlightAll())
onMounted(() => highlightAll())

function loadDemo() {
  content.value = buildDemoContent()
  dataInput.value = DEMO_TEMPLATE_DATA
  triggerRef(content)
}

function handleContentUpdate(val: Content) {
  content.value = val
  triggerRef(content)
}

function handleCollect() {
  dataInput.value = dataJson.value
}

function handleInsert() {
  if (dataError.value) return
  editorRef.value?.insertData(dataParsed.value.data)
}
</script>

<template>
  <UApp>
    <div class="h-screen flex flex-col">
      <!-- Toolbar -->
      <div class="shrink-0 border-b border-default px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold">Block Editor Playground</h1>
        <div class="flex items-center gap-2">
          <BlockEditorBlockAdder
            v-if="mode === 'edit'"
            @add="editorRef?.addBlock($event)"
          />
          <div class="flex items-center">
            <UButton
              label="Read"
              icon="i-lucide-eye"
              :color="mode === 'read' ? 'primary' : 'neutral'"
              :variant="mode === 'read' ? 'solid' : 'outline'"
              size="sm"
              class="rounded-r-none"
              @click="mode = 'read'"
            />
            <UButton
              label="Fill"
              icon="i-lucide-pen-line"
              :color="mode === 'fill' ? 'primary' : 'neutral'"
              :variant="mode === 'fill' ? 'solid' : 'outline'"
              size="sm"
              class="rounded-none border-x-0"
              @click="mode = 'fill'"
            />
            <UButton
              label="Edit"
              icon="i-lucide-pencil"
              :color="mode === 'edit' ? 'primary' : 'neutral'"
              :variant="mode === 'edit' ? 'solid' : 'outline'"
              size="sm"
              class="rounded-l-none"
              @click="mode = 'edit'"
            />
          </div>
          <USeparator orientation="vertical" class="h-5" />
          <UButton
            label="Demo"
            icon="i-lucide-sparkles"
            color="neutral"
            variant="outline"
            size="sm"
            @click="loadDemo"
          />
          <UButton
            :label="locale === 'en' ? 'EN' : 'RU'"
            icon="i-lucide-languages"
            color="neutral"
            variant="outline"
            size="sm"
            @click="locale = locale === 'en' ? 'ru' : 'en'"
          />
          <UButton
            :icon="colorMode.preference === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
            color="neutral"
            variant="outline"
            size="sm"
            @click="colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'"
          />
        </div>
      </div>

      <!-- Main content: 2 columns -->
      <div class="flex-1 flex min-h-0">
        <!-- Left: Editor -->
        <UScrollArea shadow class="flex-1 min-w-0" :ui="{ viewport: 'p-4 min-h-full' }">
          <div class="flex-1 rounded-lg border border-default bg-default p-4">
            <BlockEditor
              ref="editorRef"
              :content="content"
              :mode="mode"
              :locale="locale"
              :data="templateData"
              @update:content="handleContentUpdate"
            />
          </div>
        </UScrollArea>

        <!-- Right: JSON + Data -->
        <UScrollArea shadow class="w-120 shrink-0 border-l border-default" :ui="{ viewport: 'min-h-full' }">
          <!-- JSON Card -->
          <div class="border-b border-default p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-braces" class="text-muted" />
              <h2 class="text-sm font-semibold">Content JSON</h2>
            </div>
            <div
              class="overflow-auto max-h-64 rounded-lg text-xs leading-relaxed [&_pre]:m-0! [&_pre]:p-3!"
              v-html="highlightedJson"
            />
          </div>

          <!-- Data Card -->
          <div class="p-4 flex-1 flex flex-col min-h-0">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-database" class="text-muted" />
              <h2 class="text-sm font-semibold">Collected Data</h2>
            </div>

            <!-- Duplicate keys warning -->
            <div v-if="duplicateKeys.length > 0" class="mb-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs">
              <p class="font-semibold mb-1">Duplicate binding keys:</p>
              <ul class="list-disc list-inside">
                <li v-for="key in duplicateKeys" :key="key">{{ key }}</li>
              </ul>
            </div>

            <!-- Collected data preview -->
            <div
              class="overflow-auto max-h-48 rounded-lg text-xs leading-relaxed [&_pre]:m-0! [&_pre]:p-3! mb-3"
              v-html="highlightedData"
            />

            <!-- Input area — единый источник: prop `data` + вход для insertData -->
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-xs font-semibold text-muted">Input Data</h3>
              <div class="flex-1" />
              <UButton
                label="Collect"
                icon="i-lucide-arrow-down"
                color="neutral"
                variant="outline"
                size="xs"
                @click="handleCollect"
              />
              <UButton
                label="Insert"
                icon="i-lucide-arrow-up"
                color="primary"
                size="xs"
                :disabled="!dataInput.trim() || !!dataError"
                @click="handleInsert"
              />
            </div>
            <p class="text-xs text-muted mb-2">
              Уходит в prop <code>data</code> у &lt;BlockEditor&gt; — источник ключей для шаблонов
              <code>{{ KEY_EXAMPLE }}</code>. Кнопка Insert раскладывает тот же JSON по полям форм.
              Поля формы с тем же <code>bindingKey</code> перекрывают эти значения.
            </p>
            <UTextarea
              v-model="dataInput"
              autoresize
              placeholder='{"key": "value"}'
              :color="dataError ? 'error' : undefined"
              class="w-full text-xs font-mono"
              :rows="6"
            />
            <p v-if="dataError" class="text-xs text-error mt-1">{{ dataError }}</p>
          </div>
        </UScrollArea>
      </div>
    </div>
  </UApp>
</template>
