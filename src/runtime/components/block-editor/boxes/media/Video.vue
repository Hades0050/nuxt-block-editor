<script setup lang="ts">
import type { BoxVideo, Box, EditorMode } from '#block-editor'
import { computed } from 'vue'

const props = defineProps<{
  box: BoxVideo
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

const url = useBoxModel(() => props.box.value, emit, 'value')
const width = useBoxModel(() => props.box.width, emit, 'width')
const height = useBoxModel(() => props.box.height, emit, 'height')
</script>

<template>
  <div class="space-y-3">
    <div v-if="isEditable" class="space-y-2">
      <UInput v-model="url" placeholder="Video embed URL (e.g. https://youtube.com/embed/...)" />
      <div class="flex gap-2">
        <UFormField label="Width">
          <UInput v-model.number="width" type="number" class="w-24" />
        </UFormField>
        <UFormField label="Height">
          <UInput v-model.number="height" type="number" class="w-24" />
        </UFormField>
      </div>
    </div>

    <div v-if="url" class="w-full aspect-video">
      <iframe
        :src="url"
        :width="width"
        :height="height"
        class="w-full h-full rounded-lg"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
    <div v-else class="text-sm text-muted text-center py-6">
      No video URL specified
    </div>
  </div>
</template>
