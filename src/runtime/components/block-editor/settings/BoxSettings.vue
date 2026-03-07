<script setup lang="ts">
import type { Box } from '#block-editor'
import { ref, watch, computed } from 'vue'
import { useEditorI18n } from '../../../composables/useEditorI18n'
import { titleExtensions } from '../title-toolbar-config'
import TitleToolbar from '../TitleToolbar.vue'
import { boxSettingsMap } from './box-settings-map'

const props = defineProps<{
  box: Box
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [updates: Partial<Box>]
}>()

const { t } = useEditorI18n()

const editTitle = ref(props.box.title)
const editSubtitle = ref(props.box.subtitle)
const extraUpdates = ref<Record<string, unknown>>({})

const extraTab = computed(() => boxSettingsMap[props.box.name_type])

const tabItems = computed(() => {
  const items = [{ label: t('settings.general'), value: 'general', slot: 'general' as const }]
  if (extraTab.value) {
    items.push({ label: extraTab.value.label, value: extraTab.value.slot, slot: extraTab.value.slot })
  }
  return items
})

watch(() => props.open, (open) => {
  if (open) {
    editTitle.value = props.box.title
    editSubtitle.value = props.box.subtitle
    extraUpdates.value = {}
  }
})

function handleExtraUpdate(updates: Record<string, unknown>) {
  Object.assign(extraUpdates.value, updates)
}

function save() {
  emit('save', {
    title: editTitle.value,
    subtitle: editSubtitle.value,
    ...extraUpdates.value
  } as Partial<Box>)
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="open"
    :modal="false"
    :title="t('container.boxSettings')"
    :description="t('container.configureBlock')"
    :ui="{ width: 'sm:max-w-2xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UTabs v-if="extraTab" :items="tabItems" class="w-full">
        <template #general>
          <div class="space-y-4 pt-4">
            <UFormField :label="t('container.title')">
              <UEditor
                v-model="editTitle"
                content-type="html"
                :extensions="titleExtensions"
                class="rounded-md border border-default min-h-80"
                :placeholder="{ placeholder: t('container.titlePlaceholder') }"
              >
                <template #default="{ editor }">
                  <TitleToolbar :editor="editor" />
                </template>
              </UEditor>
            </UFormField>
            <UFormField :label="t('container.subtitle')">
              <UEditor
                v-model="editSubtitle"
                content-type="html"
                :extensions="titleExtensions"
                class="rounded-md border border-default min-h-80"
                :placeholder="{ placeholder: t('container.subtitlePlaceholder') }"
              >
                <template #default="{ editor }">
                  <TitleToolbar :editor="editor" />
                </template>
              </UEditor>
            </UFormField>
          </div>
        </template>
        <template #[extraTab.slot]>
          <div class="pt-4">
            <component :is="extraTab.component" :box="box" @update="handleExtraUpdate" />
          </div>
        </template>
      </UTabs>

      <!-- No extra tabs — just general settings -->
      <div v-else class="space-y-4">
        <UFormField :label="t('container.title')">
          <UEditor
            v-model="editTitle"
            content-type="html"
            :extensions="titleExtensions"
            class="rounded-md border border-default min-h-80"
            :placeholder="{ placeholder: t('container.titlePlaceholder') }"
          >
            <template #default="{ editor }">
              <TitleToolbar :editor="editor" />
            </template>
          </UEditor>
        </UFormField>
        <UFormField :label="t('container.subtitle')">
          <UEditor
            v-model="editSubtitle"
            content-type="html"
            :extensions="titleExtensions"
            class="rounded-md border border-default min-h-80"
            :placeholder="{ placeholder: t('container.subtitlePlaceholder') }"
          >
            <template #default="{ editor }">
              <TitleToolbar :editor="editor" />
            </template>
          </UEditor>
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          :label="t('container.cancel')"
          color="neutral"
          variant="outline"
          @click="emit('update:open', false)"
        />
        <UButton :label="t('container.save')" @click="save" />
      </div>
    </template>
  </UModal>
</template>
