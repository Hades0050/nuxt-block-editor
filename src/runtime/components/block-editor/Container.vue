<script setup lang="ts">
import { BoxFields, BoxTabs, BoxTree } from '#block-editor'
import type { Box, EditorMode } from '#block-editor'
import { computed, ref } from 'vue'
import { useEditorI18n } from '../../composables/useEditorI18n'
import { boxComponentMap } from './box-component-map'

const props = defineProps<{
  box: Box
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  remove: [id: string]
  update: [id: string, updates: Partial<Box>]
}>()

const { t } = useEditorI18n()
const settingsOpen = ref(false)

function saveSettings(updates: Partial<Box>) {
  emit('update', props.box.id, updates)
  settingsOpen.value = false
}

const hasTitle = computed(() => !!props.box.title && props.box.title !== '<p></p>')
const hasSubtitle = computed(() => !!props.box.subtitle && props.box.subtitle !== '<p></p>')

const hasAddField = computed(() => props.box instanceof BoxFields)
const hasAddTab = computed(() => props.box instanceof BoxTabs)
const hasAddRootNode = computed(() => props.box instanceof BoxTree)

function handleAddField() {
  if (!(props.box instanceof BoxFields)) return
  props.box.addField()
}

function handleAddTab() {
  if (!(props.box instanceof BoxTabs)) return
  props.box.addTab()
}

function handleAddRootNode() {
  if (!(props.box instanceof BoxTree)) return
  props.box.addRootNode()
}

function handleToggleTreeDisplayMode() {
  if (!(props.box instanceof BoxTree)) return
  const mode = props.box.displayMode === 'side' ? 'inline' : 'side'
  emit('update', props.box.id, { displayMode: mode } as Partial<Box>)
}

function handleBoxUpdate(updates: Partial<Box>) {
  emit('update', props.box.id, updates)
}
</script>

<template>
  <div :class="isEditable ? 'group/block rounded-lg border border-default hover:border-accented transition-colors' : ''">
    <!-- Top toolbar (edit mode only) -->
    <div v-if="isEditable" class="flex items-center gap-1 px-2 py-1 border-b border-default bg-elevated/50">
      <UTooltip :text="t('container.drag')">
        <div class="box-drag-handle cursor-grab p-1 rounded hover:bg-elevated flex items-center justify-center">
          <UIcon name="i-lucide-grip-vertical" class="size-4 text-muted" />
        </div>
      </UTooltip>
      <span v-if="hasTitle" class="text-xs text-muted truncate" v-html="box.title" />
      <div class="flex-1" />
      <UTooltip v-if="hasAddField" :text="t('container.addField')">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          variant="ghost"
          size="xs"
          @click="handleAddField"
        />
      </UTooltip>
      <UTooltip v-if="hasAddTab" :text="t('container.addTab')">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          variant="ghost"
          size="xs"
          @click="handleAddTab"
        />
      </UTooltip>
      <UTooltip v-if="hasAddRootNode" :text="t('container.addNode')">
        <UButton
          icon="i-lucide-plus"
          color="primary"
          variant="ghost"
          size="xs"
          @click="handleAddRootNode"
        />
      </UTooltip>
      <UTooltip v-if="hasAddRootNode" :text="t('container.toggleTreeMode')">
        <UButton
          :icon="(box as any).displayMode === 'inline' ? 'i-lucide-panel-left' : 'i-lucide-list'"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="handleToggleTreeDisplayMode"
        />
      </UTooltip>
      <UTooltip :text="t('container.settings')">
        <UButton
          icon="i-lucide-settings"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="settingsOpen = true"
        />
      </UTooltip>
      <UTooltip :text="t('container.delete')">
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          @click="emit('remove', box.id)"
        />
      </UTooltip>
    </div>

    <!-- Title / Subtitle -->
    <div v-if="hasTitle || hasSubtitle" :class="isEditable ? 'px-3 pt-2' : 'mb-1'">
      <div v-if="hasTitle" class="text-sm font-semibold [&_p]:m-0" v-html="box.title" />
      <div v-if="hasSubtitle" class="text-xs text-muted [&_p]:m-0" v-html="box.subtitle" />
    </div>

    <!-- Body (single instance — survives mode switches) -->
    <div :class="isEditable ? 'p-2' : ''">
      <component
        :is="boxComponentMap[box.name_type]"
        :box="box"
        :mode="mode"
        @update="handleBoxUpdate"
      />
    </div>

    <!-- Settings modal -->
    <BlockEditorSettingsBoxSettings
      v-if="isEditable"
      :box="box"
      :open="settingsOpen"
      @update:open="settingsOpen = $event"
      @save="saveSettings"
    />
  </div>
</template>
