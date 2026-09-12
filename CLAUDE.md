# nuxt-block-editor

Nuxt 4 модуль — блочный редактор контента с drag-and-drop сеткой (gridstack.js v12).

## Стек

- **Nuxt 4** + **Vue 3** (Composition API, `<script setup>`)
- **@nuxt/ui v4** (компоненты: UButton, UInput, UTextarea, UModal, UPopover, UEditor, UColorPicker, etc.)
- **Tailwind CSS v4**
- **Gridstack.js v12** — сетка с drag/resize, 12 колонок
- **TipTap** (через UEditor) — rich-text редактирование
- **Shiki** — подсветка синтаксиса (Code блок + JSON просмотр)
- **Vitest** + happy-dom — юнит-тесты

## Структура проекта

```
src/
  module.ts                    ← Nuxt module: регистрация компонентов, composables, alias
  model/                       ← Чистая TypeScript модель (без Vue)
    types/                     ← BOX_TYPES, BoxType, IBoxFactory
    utils/                     ← generateId(), dataBinding (collectData/insertData)
    icon/Icon.ts               ← Value-объект иконки (name + color)
    form-values/               ← FormValue → FormValueInput, FormValueSelect, FormValueDate
    boxes/                     ← Box<T> → 13 подклассов (Text, Tabs, Tree, Input, ...)
    items/                     ← TabItem, TreeNode (вложенный Content внутри)
    content/Content.ts         ← Контейнер блоков: массив + Map-индекс для O(1) поиска
    factory/BoxFactory.ts      ← Фабрика: createDefault(type), prepare(raw)
    index.ts                   ← Barrel-экспорт всего
  runtime/
    components/block-editor/
      index.vue                ← <BlockEditor> — главный компонент
      BlockAdder.vue           ← Выбор типа блока (inline-кнопка + popover)
      Container.vue            ← Обёртка блока: тулбар, настройки, drag-handle
      BoxSkeleton.vue          ← Скелетон загрузки блока
      TitleToolbar.vue         ← Тулбар заголовка блока
      ColorPopover.vue         ← Кнопка-пипетка: UColorPicker в поповере + сброс
      box-component-map.ts     ← Маппинг BoxType → Vue-компонент
      title-toolbar-config.ts  ← Конфиг тулбара заголовка
      settings/
        BoxSettings.vue        ← Настройки блока (общий компонент)
        box-settings-map.ts    ← Маппинг BoxType → компонент настроек
      boxes/
        content/
          TextArea.vue         ← Простой текст
          Code.vue             ← Код с подсветкой (Shiki)
          text/                ← Rich-text (TipTap)
            index.vue          ← Основной компонент Text
            TextToolbar.vue    ← Тулбар форматирования
            toolbar-config.ts  ← Конфигурация тулбара
            extensions.ts      ← TipTap расширения
            styles.module.css  ← CSS модуль стилей
            callout/           ← Callout-расширение TipTap
            multi-column/      ← Мультиколоночное расширение
            table/             ← Табличное расширение
            slash-commands/    ← Slash-команды
        data/                  ← FieldRow.vue (каркас строки поля), Input.vue, Select.vue,
                                 DateTime.vue, DatePickerPopover.vue
        media/
          File.vue, Video.vue
          canvas/              ← Canvas (Konva): index.vue, CanvasToolbar.vue, useCanvasDraw.ts, canvas-config.ts
        structure/
          Tabs.vue, ExternalService.vue
          tree/                ← Tree: index.vue, TreeNodeItem.vue, TreeSettings.vue, useTree.ts
    composables/
      useBlockEditor.ts        ← Состояние: shallowRef<Content> + CRUD + syncPositions
      useGridstack.ts          ← Интеграция с gridstack: init, resize, MutationObserver
      useBoxModel.ts           ← Двусторонняя синхронизация prop ↔ emit для боксов
      useFieldBox.ts           ← Общая логика для field-боксов (Input, Select, DateTime)
      useEditorI18n.ts         ← Локализация редактора (provide/inject)
    locales/
      en.ts, ru.ts             ← Строки локализации
playground/                    ← Nuxt-приложение для разработки (nuxt dev playground)
tests/
  model/                       ← Тесты модели
  composables/                 ← Тесты composables
```

## Иерархия классов Box

```
Box<T> (abstract) — id, title, subtitle, позиция в сетке (x, y, w, h)
  ├── BoxText<string>              — HTML (TipTap)
  ├── BoxTextArea<string>          — Простой текст
  ├── BoxMarkdown<string>          — Markdown
  ├── BoxCode<string>              — Код + язык
  ├── BoxVideo<string>             — URL + размеры iframe
  ├── BoxCanvas<string>            — dataURL рисунка
  ├── BoxFile<string|null>         — Файл (blob URL)
  ├── BoxExternalService<string|null>
  ├── BoxFields<T extends FormValue> — Массив полей формы (подкласс задаёт только `static Field`)
  │     ├── BoxInput<FormValueInput>
  │     ├── BoxSelect<FormValueSelect>
  │     └── BoxDateTime<FormValueDate>
  ├── BoxTabs<TabItem[]>           — Вкладки с вложенным Content
  └── BoxTree<TreeNode[]>          — Дерево с вложенным Content на каждом узле
```

## Ключевые архитектурные решения

### Alias `#block-editor`
Все runtime-импорты модели идут через `#block-editor` (настроен в tsconfig, vitest.config, module.ts).

### Vue-реактивность с классами
- `useBlockEditor` хранит `Content` в `shallowRef` — мутации не отслеживаются автоматически
- После каждой мутации вызывается `triggerRef(content)` вручную
- `updateBox` создаёт новый объект через `Object.assign(Object.create(proto), box)` для смены ссылки
- `syncPositions` использует **дебаунс** (300мс) для `triggerRef` — gridstack уже переместил DOM

### Gridstack resize
Кастомный `resizeItemToContent`: измеряет `child.offsetHeight` (не `scrollHeight`), временно отключает `sizeToContent` при `grid.update()`. Вложенные редакторы каскадируют resize через `provide('resizeParentGrid')`.

### `Box.extras` — персистентные поля подкласса
Подкласс перечисляет свои поля сверх базовых двенадцати в `protected static readonly extras`
(имя — значение по умолчанию; функция в значении вычисляется при создании). Базовый конструктор
читает их из `data`, `toJSON()` дописывает после базовых ключей. Поэтому листовому боксу не нужны
ни собственный конструктор, ни `override toJSON()`.

Поле из `extras` объявляется в подклассе через `declare public value: string` — обычное объявление
поля при `useDefineForClassFields` (включён из-за `target: ESNext`) затёрло бы присваивание базы
значением `undefined` сразу после возврата из `super()`.

Состав и порядок ключей `toJSON()` для всех 13 типов зафиксирован в
`tests/model/box-json-contract.test.ts` — цикл по `extras` пересобирает объект, тест ловит сдвиг.

### Content: Map + Array гибрид
`boxes: Box[]` — для рендеринга (v-for), порядка, сериализации.
`_boxMap: Map<string, Box>` — приватный индекс для O(1) поиска по id (`findBox`, `removeBox`, `updateBox`, `syncPositions`).

## Команды

```bash
# Разработка
npm run dev                    # playground на localhost:3000

# Тесты
npx vitest run                 # все тесты (227)
npx tsc --noEmit               # проверка типов

# Один файл
npx vitest run tests/model/Content.test.ts
```

## Стиль кода

- TypeScript strict mode
- Комментарии JSDoc на русском языке
- Классы модели — чистый TS без Vue-зависимостей
- Vue компоненты — `<script setup lang="ts">` + Composition API
- Tailwind v4 синтаксис: `m-0!` (не `!m-0`)
