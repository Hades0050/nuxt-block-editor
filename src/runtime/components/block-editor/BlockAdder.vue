<script setup lang="ts">
import { BOX_TYPES, type BoxType } from '#block-editor'
import { ref, computed } from 'vue'
import { useEditorI18n } from '../../composables/useEditorI18n'

const props = withDefaults(defineProps<{
  floating?: boolean
}>(), {
  floating: false
})

const emit = defineEmits<{
  add: [type: BoxType]
}>()

const { t } = useEditorI18n()
const open = ref(false)

function handleAdd(type: BoxType) {
  emit('add', type)
  open.value = false
}

const categories = computed(() => [
  {
    label: t('categories.content'),
    items: [
      { type: BOX_TYPES.TEXT, label: t('blocks.richText'), icon: 'i-lucide-type' },
      { type: BOX_TYPES.TEXT_AREA, label: t('blocks.textArea'), icon: 'i-lucide-text' },
      { type: BOX_TYPES.MARKDOWN, label: t('blocks.markdown'), icon: 'i-lucide-hash' },
      { type: BOX_TYPES.CODE, label: t('blocks.code'), icon: 'i-lucide-code' }
    ]
  },
  {
    label: t('categories.media'),
    items: [
      { type: BOX_TYPES.FILE, label: t('blocks.file'), icon: 'i-lucide-file-up' },
      { type: BOX_TYPES.VIDEO, label: t('blocks.video'), icon: 'i-lucide-video' },
      { type: BOX_TYPES.CANVAS, label: t('blocks.canvas'), icon: 'i-lucide-pen-tool' }
    ]
  },
  {
    label: t('categories.data'),
    items: [
      { type: BOX_TYPES.INPUT, label: t('blocks.input'), icon: 'i-lucide-text-cursor-input' },
      { type: BOX_TYPES.SELECT, label: t('blocks.select'), icon: 'i-lucide-list' },
      { type: BOX_TYPES.DATETIME, label: t('blocks.dateTime'), icon: 'i-lucide-calendar' }
    ]
  },
  {
    label: t('categories.structure'),
    items: [
      { type: BOX_TYPES.TABS, label: t('blocks.tabs'), icon: 'i-lucide-columns-2' },
      { type: BOX_TYPES.TREE, label: t('blocks.tree'), icon: 'i-lucide-git-branch' },
      { type: BOX_TYPES.EXTERNAL_SERVICE, label: t('blocks.external'), icon: 'i-lucide-globe' }
    ]
  }
])
</script>

<template>
  <!-- Floating FAB at bottom-right -->
  <div v-if="floating" class="fixed bottom-6 right-6 z-50">
    <UPopover v-model:open="open" :content="{ side: 'top', align: 'end' }">
      <UTooltip :text="t('addBlock')">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          size="lg"
          class="rounded-full shadow-lg"
        />
      </UTooltip>
      <template #content>
        <div class="p-2 w-56 max-h-80 overflow-auto">
          <div v-for="cat in categories" :key="cat.label" class="mb-2 last:mb-0">
            <div class="px-2 py-1 text-xs font-medium text-muted uppercase">{{ cat.label }}</div>
            <UButton
              v-for="item in cat.items"
              :key="item.type"
              :label="item.label"
              :icon="item.icon"
              color="neutral"
              variant="ghost"
              size="sm"
              block
              class="justify-start"
              @click="handleAdd(item.type)"
            />
          </div>
        </div>
      </template>
    </UPopover>
  </div>

  <!-- Inline adder for nested contexts -->
  <div v-else class="flex items-center justify-center py-2">
    <UPopover v-model:open="open" :content="{ align: 'center' }">
      <UTooltip :text="t('addBlock')">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="xs"
          class="rounded-full"
        />
      </UTooltip>
      <template #content>
        <div class="p-2 w-56 max-h-80 overflow-auto">
          <div v-for="cat in categories" :key="cat.label" class="mb-2 last:mb-0">
            <div class="px-2 py-1 text-xs font-medium text-muted uppercase">{{ cat.label }}</div>
            <UButton
              v-for="item in cat.items"
              :key="item.type"
              :label="item.label"
              :icon="item.icon"
              color="neutral"
              variant="ghost"
              size="sm"
              block
              class="justify-start"
              @click="handleAdd(item.type)"
            />
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
