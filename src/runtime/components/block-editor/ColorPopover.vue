<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  icon: string
  tooltip: string
  resetLabel: string
  initial: string
}>()

const emit = defineEmits<{
  apply: [color: string]
  reset: []
  close: []
}>()

const open = ref(false)
// Пикер держит выбранный цвет сам — родитель получает его только через apply
const color = ref(props.initial)
</script>

<template>
  <UPopover v-model:open="open" @update:open="(v: boolean) => { if (!v) emit('close') }">
    <UTooltip :text="tooltip">
      <UButton
        :icon="icon"
        color="neutral"
        variant="ghost"
        size="sm"
      />
    </UTooltip>
    <template #content>
      <div class="p-2">
        <UColorPicker
          v-model="color"
          @update:model-value="(val: string) => emit('apply', val)"
        />
        <UButton
          icon="i-lucide-x"
          :label="resetLabel"
          color="neutral"
          variant="ghost"
          size="xs"
          block
          class="mt-2"
          @click="emit('reset'); open = false"
        />
      </div>
    </template>
  </UPopover>
</template>
