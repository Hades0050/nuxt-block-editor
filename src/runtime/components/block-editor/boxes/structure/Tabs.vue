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
    <div class="shrink-0 space-y-2 pb-2 border-b border-default bg-default">
      <div class="flex items-center gap-1 flex-wrap">
        <UButton
          v-for="tab in box.value"
          :key="tab.id"
          :label="tab.label"
          :color="activeTab === tab.id ? 'primary' : 'neutral'"
          :variant="activeTab === tab.id ? 'solid' : 'ghost'"
          size="sm"
          @click="activeTab = tab.id"
        />
      </div>

      <!-- Tab controls -->
      <div v-if="isEditable && activeTabContent" class="flex items-center gap-2">
        <UInput
          :model-value="activeTabContent.label"
          :placeholder="t('tabs.labelPlaceholder')"
          size="sm"
          class="w-40"
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
