# nuxt-block-editor

Nuxt 4 модуль — блочный редактор контента с drag-and-drop сеткой на [gridstack.js](https://gridstackjs.com/) v12.

## Возможности

- Drag-and-drop сетка 12 колонок с resize блоков
- 14 типов блоков: текст, код, вкладки, дерево, форма, видео, рисование и другие
- Rich-text редактирование через TipTap (таблицы, callout, мультиколонки, slash-commands)
- Три режима работы: `edit` (редактирование), `fill` (заполнение форм), `read` (просмотр)
- Data binding — сбор и вставка данных из полей формы
- Вложенные редакторы (вкладки, дерево, HTML-блок)
- Локализация (en, ru)
- Подсветка синтаксиса (Shiki)

## Стек

- **Nuxt 4** + **Vue 3** (Composition API, `<script setup>`)
- **@nuxt/ui v4** — UI-компоненты
- **Tailwind CSS v4**
- **Gridstack.js v12** — сетка с drag/resize
- **TipTap** (через UEditor) — rich-text
- **Shiki** — подсветка синтаксиса
- **Konva** — Canvas-рисование

## Установка

```bash
npm install nuxt-block-editor
```

Добавьте модуль в `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-block-editor']
})
```

### Peer-зависимости

Убедитесь, что установлены:

```bash
npm install @nuxt/ui gridstack @tiptap/extension-color @tiptap/extension-font-family \
  @tiptap/extension-highlight @tiptap/extension-link @tiptap/extension-text-align \
  @tiptap/extension-text-style @tiptap/extension-underline
```

## Использование

```vue
<script setup lang="ts">
import { Content, boxFactory } from 'nuxt-block-editor/model'

const content = ref(Content.createEmpty())

// Или загрузка из JSON:
// const content = ref(Content.fromJsonString(jsonString, boxFactory))
</script>

<template>
  <BlockEditor
    v-model:content="content"
    mode="edit"
    locale="ru"
  />
</template>
```

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `content` | `Content` | — | Контент редактора (v-model) |
| `mode` | `'edit' \| 'fill' \| 'read'` | `'edit'` | Режим работы |
| `locale` | `'en' \| 'ru'` | `'en'` | Язык интерфейса |
| `nested` | `boolean` | `false` | Вложенный редактор (используется внутренне) |

### Exposed-методы

```ts
const editorRef = ref()

// Программное добавление блока
editorRef.value.addBlock('TEXT')

// Сбор данных из полей формы (data binding)
const data = editorRef.value.collectData()

// Вставка данных в поля формы
editorRef.value.insertData({ fieldKey: 'value' })

// Поиск дублирующихся ключей привязки
const duplicates = editorRef.value.findDuplicateBindingKeys()
```

## Типы блоков

| Тип | Описание |
|-----|----------|
| `TEXT` | Rich-text (TipTap) с тулбаром форматирования |
| `TEXTAREA` | Простой текст |
| `MARKDOWN` | Markdown |
| `HTML` | Вложенный контент (вложенный редактор) |
| `CODE` | Код с подсветкой синтаксиса (Shiki) |
| `INPUT` | Поле ввода с data binding |
| `SELECT` | Выпадающий список |
| `DATE_TIME` | Дата и время |
| `TABS` | Вкладки с вложенным контентом |
| `TREE` | Дерево с вложенным контентом на каждом узле |
| `VIDEO` | Встраиваемое видео (iframe) |
| `FILE` | Загрузка файла |
| `CANVAS` | Рисование (Konva) |
| `EXTERNAL_SERVICE` | Внешний сервис |

## Разработка

```bash
# Запуск playground
npm run dev

# Тесты
npm test

# Проверка типов
npx tsc --noEmit
```

## Лицензия

MIT
