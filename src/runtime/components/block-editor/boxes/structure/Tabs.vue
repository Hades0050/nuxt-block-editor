<script setup lang="ts">
import type { BoxTabs, Box, EditorMode } from '#block-editor'
import { computed, ref } from 'vue'
import { useEditorI18n } from '../../../../composables/useEditorI18n'
import { useBoxChange } from '../../../../composables/useBoxModel'

const { t } = useEditorI18n()

const props = defineProps<{
  box: BoxTabs
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const { notify } = useBoxChange(() => props.box, emit)

const activeTab = ref(props.box.activeTabId || props.box.value[0]?.id || '')

const activeTabContent = computed(() =>
  props.box.findTab(activeTab.value)
)

const tabItems = computed(() =>
  props.box.value.map(tab => ({ label: tab.label, value: tab.id }))
)

function addTab() {
  const tab = props.box.addTab()
  activeTab.value = tab.id
}

function removeTab(tabId: string) {
  props.box.removeTab(tabId)
  activeTab.value = props.box.activeTabId
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Tab headers -->
    <div class="shrink-0 flex items-center gap-3 border-b border-default">
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        :content="false"
        variant="link"
        size="sm"
        class="flex-1 min-w-0"
      />

      <!-- Tab controls -->
      <div v-if="isEditable && activeTabContent" class="shrink-0 flex items-center gap-1 pb-1">
        <UInput
          :model-value="activeTabContent.label"
          :placeholder="t('tabs.labelPlaceholder')"
          size="xs"
          class="w-36"
          @update:model-value="(v: string) => box.updateTabLabel(activeTab, v)"
        />
        <UTooltip :text="t('tabs.deleteTab')">
          <UButton
            v-if="box.value.length > 1"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click="removeTab(activeTab)"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Tab content -->
    <div v-if="activeTabContent" :key="activeTab" class="flex-1 pt-2 overflow-auto">
      <BlockEditor
        :content="activeTabContent.content"
        :mode="mode"
        nested
        @update:content="notify"
      />
    </div>
  </div>
</template>
