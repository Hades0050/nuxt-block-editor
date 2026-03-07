<script setup lang="ts">
import type { BoxCanvas, Box, EditorMode } from '#block-editor'
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Stage as VStage, Layer as VLayer, Image as VImage } from 'vue-konva'
import { useBoxModel, useBoxChange } from '../../../../../composables/useBoxModel'
import { useCanvasDraw } from './useCanvasDraw'
import CanvasToolbar from './CanvasToolbar.vue'

const props = defineProps<{
  box: BoxCanvas
  mode: EditorMode
}>()

const isEditable = computed(() => props.mode === 'edit')

const emit = defineEmits<{
  update: [updates: Partial<Box>]
}>()

useBoxChange(() => props.box, emit)
const bgColor = useBoxModel(() => props.box.backgroundColor, emit, 'backgroundColor')
const strokeColor = useBoxModel(() => props.box.strokeColor, emit, 'strokeColor')
const lineWidth = useBoxModel(() => props.box.lineWidth, emit, 'lineWidth')
const canvasHeight = useBoxModel(() => props.box.canvasHeight, emit, 'canvasHeight')

const containerRef = ref<HTMLElement | null>(null)
const stageWidth = ref(800)
const layerRef = ref<any>(null)
const imageRef = ref<any>(null)

const stageConfig = computed(() => ({
  width: stageWidth.value,
  height: canvasHeight.value
}))

const imageConfig = computed(() => ({
  x: 0,
  y: 0,
  width: stageWidth.value,
  height: canvasHeight.value
}))

const {
  undoStack, handleMouseDown, handleMouseMove, handleMouseUp,
  undo, clearCanvas, init, getDrawCanvas
} = useCanvasDraw({
  strokeColor,
  lineWidth,
  canvasHeight,
  stageWidth,
  onSave: (dataUrl) => props.box.saveDrawing(dataUrl),
  onClear: () => props.box.clear(),
  initialValue: () => props.box.value
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    stageWidth.value = containerRef.value.offsetWidth

    resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width && width !== stageWidth.value) {
        stageWidth.value = width
      }
    })
    resizeObserver.observe(containerRef.value)
  }
  nextTick(() => init(layerRef.value, imageRef.value))
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <!-- Edit mode -->
  <div v-if="isEditable" ref="containerRef">
    <CanvasToolbar
      :undo-disabled="undoStack.length === 0"
      :bg-color="bgColor"
      :stroke-color="strokeColor"
      :line-width="lineWidth"
      :canvas-height="canvasHeight"
      @undo="undo"
      @clear="clearCanvas"
      @update:bg-color="bgColor = $event"
      @update:stroke-color="strokeColor = $event"
      @update:line-width="lineWidth = $event"
      @update:canvas-height="canvasHeight = $event"
    />

    <div
      class="rounded-b-lg border border-t-0 border-default overflow-hidden cursor-crosshair"
      :style="{ backgroundColor: bgColor }"
      @mousedown.stop
      @touchstart.stop
    >
      <VStage
        :config="stageConfig"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart="handleMouseDown"
        @touchmove="handleMouseMove"
        @touchend="handleMouseUp"
      >
        <VLayer ref="layerRef">
          <VImage ref="imageRef" :config="imageConfig" />
        </VLayer>
      </VStage>
    </div>
  </div>

  <!-- View mode -->
  <div v-else>
    <img
      v-if="box.value"
      :src="box.value"
      :style="{ backgroundColor: bgColor }"
      class="w-full rounded-lg border border-default"
    >
    <div
      v-else
      class="w-full rounded-lg border border-default bg-elevated/50 flex items-center justify-center"
      :style="{ height: canvasHeight + 'px' }"
    />
  </div>
</template>
