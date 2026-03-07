<script setup lang="ts">
import type { BoxExternalService, Box, EditorMode } from '#block-editor'
import { computed } from 'vue'
import { useBoxModel } from '../../../../composables/useBoxModel'

const props = defineProps<{
  box: BoxExternalService
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const localValue = useBoxModel(() => props.box.value ?? '', emit, 'value')
</script>

<template>
  <div class="space-y-2">
    <UInput
      v-if="isEditable"
      v-model="localValue"
      placeholder="External service ID or URL..."
    />
    <div v-else class="text-sm">
      <span v-if="box.value" class="text-highlighted">{{ box.value }}</span>
      <span v-else class="text-muted">No external service configured</span>
    </div>
  </div>
</template>
