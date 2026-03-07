<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorI18n } from '../../../../../../composables/useEditorI18n'

const emit = defineEmits<{
  insert: [rows: number, cols: number]
}>()

const { t } = useEditorI18n()
const rows = ref(5)
const cols = ref(5)
const hoverRow = ref(0)
const hoverCol = ref(0)

const label = computed(() =>
  hoverRow.value && hoverCol.value
    ? `${hoverRow.value} × ${hoverCol.value}`
    : t('toolbar.selectSize')
)

function onHover(r: number, c: number) {
  hoverRow.value = r
  hoverCol.value = c
  if (r === rows.value && rows.value < 10) rows.value++
  if (c === cols.value && cols.value < 10) cols.value++
}

function onSelect() {
  emit('insert', hoverRow.value, hoverCol.value)
}
</script>

<template>
  <div class="p-2" @mouseleave="hoverRow = 0; hoverCol = 0">
    <div v-for="r in rows" :key="r" class="flex">
      <div
        v-for="c in cols"
        :key="c"
        class="size-5 m-0.5 rounded-sm border cursor-pointer"
        :class="r <= hoverRow && c <= hoverCol
          ? 'border-primary bg-primary/20'
          : 'border-default bg-elevated'"
        @mouseover="onHover(r, c)"
        @click="onSelect"
      />
    </div>
    <div class="text-center text-xs text-muted mt-1.5">
      {{ label }}
    </div>
  </div>
</template>
