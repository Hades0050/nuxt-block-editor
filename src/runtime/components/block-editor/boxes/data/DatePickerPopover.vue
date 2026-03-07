<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { parseDate, type CalendarDate } from '@internationalized/date'
import { useEditorI18n } from '../../../../composables/useEditorI18n'

const { t } = useEditorI18n()

const props = defineProps<{
  modelValue: string
  mode: 'date' | 'time' | 'datetime'
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const tempDate = ref<CalendarDate | undefined>()
const tempHour = ref(0)
const tempMinute = ref(0)

const hoursRef = ref<HTMLElement | null>(null)
const minutesRef = ref<HTMLElement | null>(null)

const ITEM_HEIGHT = 32
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const showCalendar = computed(() => props.mode === 'date' || props.mode === 'datetime')
const showTime = computed(() => props.mode === 'time' || props.mode === 'datetime')
const needsApply = computed(() => props.mode === 'time' || props.mode === 'datetime')

/** Парсинг строки значения в CalendarDate + часы/минуты */
function parseValue(val: string) {
  if (!val) return { date: undefined, hour: 0, minute: 0 }

  if (props.mode === 'time') {
    const [h, m] = val.split(':').map(Number)
    return { date: undefined, hour: h || 0, minute: m || 0 }
  }

  if (props.mode === 'datetime') {
    const [datePart, timePart] = val.split('T')
    let date: CalendarDate | undefined
    try { date = parseDate(datePart) } catch { date = undefined }
    const [h, m] = (timePart || '').split(':').map(Number)
    return { date, hour: h || 0, minute: m || 0 }
  }

  let date: CalendarDate | undefined
  try { date = parseDate(val) } catch { date = undefined }
  return { date, hour: 0, minute: 0 }
}

function scrollToTime() {
  nextTick(() => {
    hoursRef.value?.scrollTo({ top: tempHour.value * ITEM_HEIGHT, behavior: 'smooth' })
    minutesRef.value?.scrollTo({ top: tempMinute.value * ITEM_HEIGHT, behavior: 'smooth' })
  })
}

watch(isOpen, (open) => {
  if (open) {
    const { date, hour, minute } = parseValue(props.modelValue)
    tempDate.value = date
    tempHour.value = hour
    tempMinute.value = minute
    scrollToTime()
  }
})

function formatCalendarDate(d: CalendarDate) {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

function apply() {
  if (props.mode === 'time') {
    const h = String(tempHour.value).padStart(2, '0')
    const m = String(tempMinute.value).padStart(2, '0')
    emit('update:modelValue', `${h}:${m}`)
  } else if (props.mode === 'datetime') {
    if (!tempDate.value) return
    const h = String(tempHour.value).padStart(2, '0')
    const m = String(tempMinute.value).padStart(2, '0')
    emit('update:modelValue', `${formatCalendarDate(tempDate.value)}T${h}:${m}`)
  } else {
    if (!tempDate.value) return
    emit('update:modelValue', formatCalendarDate(tempDate.value))
  }
  isOpen.value = false
}

function handleDateChange(date: CalendarDate) {
  tempDate.value = date
  if (props.mode === 'date') {
    nextTick(apply)
  }
}

function setNow() {
  const now = new Date()
  tempDate.value = parseDate(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  )
  tempHour.value = now.getHours()
  tempMinute.value = now.getMinutes()
  scrollToTime()
}

function handleClear() {
  emit('update:modelValue', '')
  isOpen.value = false
}

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const { date, hour, minute } = parseValue(props.modelValue)

  if (props.mode === 'time') {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  if (!date) return props.modelValue
  const dd = String(date.day).padStart(2, '0')
  const mm = String(date.month).padStart(2, '0')
  const yyyy = date.year

  if (props.mode === 'datetime') {
    return `${dd}.${mm}.${yyyy} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  return `${dd}.${mm}.${yyyy}`
})

const triggerIcon = computed(() => {
  if (props.mode === 'time') return 'i-lucide-clock'
  return 'i-lucide-calendar'
})
</script>

<template>
  <UPopover v-model:open="isOpen" :content="{ align: 'start' }">
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      block
      :icon="triggerIcon"
      :disabled="disabled"
      class="justify-start font-normal"
      :class="{ 'text-muted': !modelValue }"
    >
      {{ displayValue || placeholder || t('datePicker.select') }}
    </UButton>

    <template #content>
      <div class="flex">
        <!-- Календарь -->
        <UCalendar
          v-if="showCalendar"
          :model-value="tempDate"
          @update:model-value="handleDateChange"
        />

        <!-- Разделитель -->
        <div v-if="showCalendar && showTime" class="border-l border-default" />

        <!-- Выбор времени -->
        <div v-if="showTime" class="flex flex-col w-36">
          <div class="p-3 pb-2 text-xs font-medium text-muted">
            {{ t('datePicker.time') }}
          </div>
          <div class="flex gap-1 px-3 flex-1 min-h-0">
            <!-- Часы -->
            <div class="flex flex-col items-center flex-1">
              <div class="text-[10px] text-dimmed mb-1">{{ t('datePicker.hours') }}</div>
              <div ref="hoursRef" class="h-40 w-full overflow-y-auto rounded-md border border-default scroll-smooth scrollbar-hide">
                <div class="pb-32">
                  <div
                    v-for="h in hours"
                    :key="h"
                    class="h-8 flex items-center justify-center cursor-pointer rounded-md text-sm transition-colors"
                    :class="tempHour === h
                      ? 'bg-primary text-inverted font-medium'
                      : 'hover:bg-elevated'"
                    @click="tempHour = h; scrollToTime()"
                  >
                    {{ String(h).padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Минуты -->
            <div class="flex flex-col items-center flex-1">
              <div class="text-[10px] text-dimmed mb-1">{{ t('datePicker.minutes') }}</div>
              <div ref="minutesRef" class="h-40 w-full overflow-y-auto rounded-md border border-default scroll-smooth scrollbar-hide">
                <div class="pb-32">
                  <div
                    v-for="m in minutes"
                    :key="m"
                    class="h-8 flex items-center justify-center cursor-pointer rounded-md text-sm transition-colors"
                    :class="tempMinute === m
                      ? 'bg-primary text-inverted font-medium'
                      : 'hover:bg-elevated'"
                    @click="tempMinute = m; scrollToTime()"
                  >
                    {{ String(m).padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки -->
          <div v-if="needsApply" class="border-t border-default p-2 flex gap-1.5">
            <UButton size="xs" variant="outline" color="neutral" @click="setNow">
              {{ t('datePicker.now') }}
            </UButton>
            <div class="flex-1" />
            <UButton size="xs" variant="outline" color="neutral" @click="handleClear">
              {{ t('datePicker.clear') }}
            </UButton>
            <UButton size="xs" @click="apply">
              {{ t('datePicker.apply') }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
