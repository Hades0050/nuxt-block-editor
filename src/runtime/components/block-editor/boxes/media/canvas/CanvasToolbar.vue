<script setup lang="ts">
import { ref } from 'vue'
import { useEditorI18n } from '../../../../../composables/useEditorI18n'
import { LINE_WIDTHS, CANVAS_HEIGHTS } from './canvas-config'

const { t } = useEditorI18n()

const props = defineProps<{
  undoDisabled: boolean
  bgColor: string
  strokeColor: string
  lineWidth: number
  canvasHeight: number
}>()

const emit = defineEmits<{
  undo: []
  clear: []
  'update:bgColor': [value: string]
  'update:strokeColor': [value: string]
  'update:lineWidth': [value: number]
  'update:canvasHeight': [value: number]
}>()

const bgColorOpen = ref(false)
const strokeColorOpen = ref(false)
const lineWidthOpen = ref(false)
const canvasHeightOpen = ref(false)
</script>

<template>
  <div class="border-b border-default rounded-t-md flex flex-wrap items-center gap-1.5 p-1">
    <!-- Undo -->
    <UTooltip :text="t('canvas.undo')">
      <UButton
        icon="i-lucide-undo-2"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="undoDisabled"
        @click="emit('undo')"
      />
    </UTooltip>

    <div class="w-px h-5 bg-default" />

    <!-- Background Color -->
    <UPopover v-model:open="bgColorOpen">
      <UTooltip :text="t('canvas.bgColor')">
        <UButton color="neutral" variant="ghost" size="sm">
          <UIcon name="i-lucide-paint-bucket" class="size-4" />
          <div class="size-3 rounded-sm border border-default" :style="{ backgroundColor: props.bgColor }" />
        </UButton>
      </UTooltip>
      <template #content>
        <div class="p-2">
          <UColorPicker :model-value="props.bgColor" @update:model-value="emit('update:bgColor', $event)" />
        </div>
      </template>
    </UPopover>

    <!-- Stroke Color -->
    <UPopover v-model:open="strokeColorOpen">
      <UTooltip :text="t('canvas.strokeColor')">
        <UButton color="neutral" variant="ghost" size="sm">
          <UIcon name="i-lucide-pen" class="size-4" />
          <div class="size-3 rounded-sm border border-default" :style="{ backgroundColor: props.strokeColor }" />
        </UButton>
      </UTooltip>
      <template #content>
        <div class="p-2">
          <UColorPicker :model-value="props.strokeColor" @update:model-value="emit('update:strokeColor', $event)" />
        </div>
      </template>
    </UPopover>

    <div class="w-px h-5 bg-default" />

    <!-- Canvas Size -->
    <UPopover v-model:open="canvasHeightOpen">
      <UTooltip :text="t('canvas.size')">
        <UButton color="neutral" variant="ghost" size="sm">
          <UIcon name="i-lucide-scaling" class="size-4" />
          <span class="text-xs">{{ props.canvasHeight }}px</span>
        </UButton>
      </UTooltip>
      <template #content>
        <div class="p-1 flex flex-col gap-0.5 min-w-24">
          <UButton
            v-for="ch in CANVAS_HEIGHTS"
            :key="ch"
            :variant="props.canvasHeight === ch ? 'soft' : 'ghost'"
            color="neutral"
            size="xs"
            block
            @click="emit('update:canvasHeight', ch); canvasHeightOpen = false"
          >
            {{ ch }}px
          </UButton>
        </div>
      </template>
    </UPopover>

    <div class="w-px h-5 bg-default" />

    <!-- Line Width -->
    <UPopover v-model:open="lineWidthOpen">
      <UTooltip :text="t('canvas.lineWidth')">
        <UButton color="neutral" variant="ghost" size="sm">
          <UIcon name="i-lucide-pencil-ruler" class="size-4" />
          <span class="text-xs">{{ props.lineWidth }}px</span>
        </UButton>
      </UTooltip>
      <template #content>
        <div class="p-1 flex flex-col gap-0.5 min-w-24">
          <UButton
            v-for="lw in LINE_WIDTHS"
            :key="lw"
            :variant="props.lineWidth === lw ? 'soft' : 'ghost'"
            color="neutral"
            size="xs"
            block
            @click="emit('update:lineWidth', lw); lineWidthOpen = false"
          >
            <div class="flex items-center gap-2 w-full">
              <svg :width="20" :height="lw + 4" class="shrink-0">
                <line x1="0" :y1="(lw + 4) / 2" x2="20" :y2="(lw + 4) / 2" stroke="currentColor" :stroke-width="lw" stroke-linecap="round" />
              </svg>
              <span>{{ lw }}px</span>
            </div>
          </UButton>
        </div>
      </template>
    </UPopover>

    <div class="w-px h-5 bg-default" />

    <!-- Clear -->
    <UTooltip :text="t('canvas.clear')">
      <UButton
        icon="i-lucide-eraser"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="emit('clear')"
      />
    </UTooltip>
  </div>
</template>
