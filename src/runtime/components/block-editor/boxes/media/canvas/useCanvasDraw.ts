import { ref, watch, type Ref } from 'vue'
import Konva from 'konva'
import { MAX_UNDO } from './canvas-config'

interface UseCanvasDrawOptions {
  strokeColor: Ref<string>
  lineWidth: Ref<number>
  canvasHeight: Ref<number>
  stageWidth: Ref<number>
  onSave: (dataUrl: string) => void
  onClear: () => void
  initialValue: () => string
}

export function useCanvasDraw(options: UseCanvasDrawOptions) {
  const { strokeColor, lineWidth, canvasHeight, stageWidth, onSave, onClear, initialValue } = options

  const isDrawing = ref(false)
  const undoStack = ref<string[]>([])
  const lastPos = ref<{ x: number; y: number } | null>(null)

  let drawCanvas: HTMLCanvasElement | null = null
  let drawCtx: CanvasRenderingContext2D | null = null
  let layer: Konva.Layer | null = null
  let imageNode: Konva.Image | null = null

  function createDrawCanvas() {
    drawCanvas = document.createElement('canvas')
    drawCanvas.width = stageWidth.value
    drawCanvas.height = canvasHeight.value
    drawCtx = drawCanvas.getContext('2d')!
    drawCtx.strokeStyle = strokeColor.value
    drawCtx.lineJoin = 'round'
    drawCtx.lineCap = 'round'
    drawCtx.lineWidth = lineWidth.value
  }

  function saveSnapshot(): string {
    if (!drawCanvas) return ''
    return drawCanvas.toDataURL()
  }

  function pushUndo() {
    if (undoStack.value.length >= MAX_UNDO) undoStack.value.shift()
    undoStack.value.push(saveSnapshot())
  }

  function restoreFromDataUrl(dataUrl: string, callback?: () => void) {
    if (!drawCanvas || !drawCtx) return
    const img = new Image()
    img.onload = () => {
      drawCtx!.clearRect(0, 0, drawCanvas!.width, drawCanvas!.height)
      drawCtx!.drawImage(img, 0, 0, drawCanvas!.width, drawCanvas!.height)
      layer?.batchDraw()
      callback?.()
    }
    img.src = dataUrl
  }

  function handleMouseDown(e: any) {
    const stage = e.target.getStage() as Konva.Stage
    const pos = stage.getPointerPosition()
    if (!pos) return
    pushUndo()
    isDrawing.value = true
    lastPos.value = pos
  }

  function handleMouseMove(e: any) {
    if (!isDrawing.value || !lastPos.value || !drawCtx) return
    const stage = e.target.getStage() as Konva.Stage
    const pos = stage.getPointerPosition()
    if (!pos) return

    drawCtx.globalCompositeOperation = 'source-over'
    drawCtx.beginPath()
    drawCtx.moveTo(lastPos.value.x, lastPos.value.y)
    drawCtx.lineTo(pos.x, pos.y)
    drawCtx.stroke()

    lastPos.value = pos
    layer?.batchDraw()
  }

  function handleMouseUp() {
    if (!isDrawing.value) return
    isDrawing.value = false
    onSave(saveSnapshot())
  }

  function undo() {
    if (undoStack.value.length === 0) return
    const prev = undoStack.value.pop()!
    restoreFromDataUrl(prev, () => onSave(saveSnapshot()))
  }

  function clearCanvas() {
    if (!drawCtx || !drawCanvas) return
    pushUndo()
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
    layer?.batchDraw()
    onClear()
  }

  function init(layerRef: any, imageRef: any) {
    createDrawCanvas()
    if (!drawCanvas) return

    layer = layerRef?.getNode?.() ?? null
    imageNode = imageRef?.getNode?.() ?? null
    if (imageNode) {
      imageNode.image(drawCanvas)
    }

    const val = initialValue()
    if (val) {
      restoreFromDataUrl(val)
    }
  }

  function getDrawCanvas() {
    return drawCanvas
  }

  watch(strokeColor, (val) => {
    if (drawCtx) drawCtx.strokeStyle = val
  })

  watch(lineWidth, (val) => {
    if (drawCtx) drawCtx.lineWidth = val
  })

  function resizeDrawCanvas() {
    if (!drawCanvas || !drawCtx) return
    const saved = initialValue()
    drawCanvas.width = stageWidth.value
    drawCanvas.height = canvasHeight.value
    drawCtx.strokeStyle = strokeColor.value
    drawCtx.lineJoin = 'round'
    drawCtx.lineCap = 'round'
    drawCtx.lineWidth = lineWidth.value
    if (saved) {
      restoreFromDataUrl(saved)
    }
  }

  watch(canvasHeight, resizeDrawCanvas)
  watch(stageWidth, resizeDrawCanvas)

  return {
    isDrawing,
    undoStack,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    undo,
    clearCanvas,
    init,
    getDrawCanvas
  }
}
