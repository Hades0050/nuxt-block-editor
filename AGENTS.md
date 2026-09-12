# AGENTS.md

Инструкция для AI-ассистентов (Claude Code, Cursor, Codex, Gemini, Copilot), работающих в этом
репозитории. Документ описывает то, что нельзя вывести из чтения одного-двух файлов: реальные
команды, неочевидные контракты и места, где «очевидное» решение ломает работающий код.

> Если этот файл противоречит `CLAUDE.md` — верен этот файл. `CLAUDE.md` не обновлялся после
> появления подсистемы шаблонов и устарел (см. раздел «Устаревшая документация»).

---

## 1. Что это за проект

**Nuxt 4 модуль** (не приложение) — блочный редактор контента с drag-and-drop сеткой.
Точка входа — `src/module.ts` (`main`/`exports` в `package.json`). Единственное запускаемое
приложение — `playground/`, оно подключает модуль относительным путём `'../src/module.ts'`.

Стек: Nuxt 4 + Vue 3 `<script setup>` + TypeScript strict, @nuxt/ui v4 (включая `UEditor` на
TipTap v3), Tailwind CSS v4, gridstack.js v12, Konva (Canvas-блок), Shiki (подсветка кода),
mustache (шаблоны в тексте), Vitest + happy-dom.

Два слоя:

- `src/model/` — чистая TypeScript-модель без Vue и без DOM. Единственная внешняя зависимость
  внутри модели — пакет `mustache` в `src/model/template/MustacheTemplate.ts`.
- `src/runtime/` — Vue-компоненты, composables, локали.

---

## 2. Команды

```bash
npx vitest run                      # ЕДИНСТВЕННЫЙ надёжный гейт: 13 файлов / 242 теста
npx vitest run tests/model/Content.test.ts   # один файл
npm run dev                         # playground на localhost:3000 (nuxt dev playground)
npx tsc --noEmit                    # второй гейт: должен быть пуст
```

Обязательно к соблюдению:

- **Не запускать `npm test` / `bun run test`.** Скрипт — голый `vitest`, то есть watch-режим;
  в неинтерактивной сессии он висит вечно. Всегда `npx vitest run`.
- **`npx vitest run --reporter=basic` падает** с `Failed to load url basic` — репортер `basic`
  удалён в Vitest 4. Используйте репортер по умолчанию.
- **`npx tsc --noEmit` проходит с нулём ошибок** — держите его таким. Что важно знать:
  импорты `.vue` разрешаются через шим `declare module '*.vue'` в `src/runtime/shims.d.ts`,
  где пропсы намеренно объявлены как `any`: `vue-tsc` не установлен, реальных типов SFC у tsc нет,
  а строгий шим ломает `VueNodeViewRenderer`, которому нужен `Component<NodeViewProps>`.
  Следствие: пропсы Vue-компонентов не проверяются вообще — tsc ловит только ошибки в `.ts`.
- Ни ESLint, ни Prettier в репозитории нет. Стиль поддерживается только подражанием соседнему коду.
- Устанавливать зависимости только в корне (`bun install` / `npm install`). `playground/package.json`
  существует, но это не workspace — установка внутри `playground/` создаст дубликат vue/nuxt и
  сломает модуль.
- Покрытие (`--coverage`) не настроено, `@vitest/coverage-v8` не установлен — не запускайте его
  походя, он попросит доинсталлировать пакет.

---

## 3. Что тестируется, а что нет

Тесты — только чистые юнит-тесты: `tests/model/` (11 файлов) и `tests/composables/` (2 файла).

**Компонентных тестов нет вообще**, `@vue/test-utils` не установлен, в `vitest.config.ts` нет
vue-плагина. Не пишите тест, импортирующий `.vue` — он не разрешится.

Без автоматического покрытия остаются: все 32 SFC, `useGridstack.ts` (самый хрупкий файл в репо),
`useFieldBox`, `useEditorI18n`, `useTemplateData`, `useCanvasDraw`, `useTree`, `src/module.ts`,
локали и вся подсистема TipTap под `boxes/content/text/**`. Зелёный `vitest run` ничего не говорит
о сетке, drag/resize, TipTap, slash-командах и подсветке шаблонных токенов — это проверяется руками
в `npm run dev`.

Стабильные DOM-зацепки для ручной/браузерной проверки: элементы сетки несут
`gs-id="<box.id>"` на `.grid-stack-item`, поверхность TipTap — `.tiptap[contenteditable="true"]`,
токены шаблона — `.tpl-token` / `.tpl-token--unknown`. Кнопка «Demo» в playground загружает
наполненный документ из `playground/demo-content.ts`.

Соглашения тестов: файлы называются `<Subject>.test.ts` по имени класса или модуля
(`Content.test.ts`, `dataBinding.test.ts`); тест, покрывающий группу классов, — kebab-case по теме
(`container-boxes.test.ts`, `field-boxes.test.ts`). Модель импортируется **только** через
`#block-editor`, composables — относительным путём, `describe/it/expect` импортируются явно
(несмотря на `globals: true`, потому что `tsconfig.types` — только `["vite/client"]`).
Тесты composables оборачивают тело в `effectScope().run(...)` + `scope.stop()`.
`vitest.config.ts` не задаёт `include`, поэтому **любой** файл `*.test.ts` где угодно в репозитории
(включая `playground/`) будет подхвачен — не создавайте черновики с таким именем.

---

## 4. Alias `#block-editor` — объявлен в трёх местах

`#block-editor` указывает на **директорию** `src/model`, то есть `import { X } from '#block-editor'`
означает barrel `src/model/index.ts`. Объявлен независимо в трёх файлах, которые обязаны совпадать:

| Файл | Для чего |
|---|---|
| `src/module.ts:13` | runtime / Vite / Nuxt |
| `tsconfig.json:11-12` | tsc и IDE (плюс вариант `#block-editor/*`) |
| `vitest.config.ts:11` | тесты (только голый специфик) |

Изменение расположения модели или добавление второго alias без правки всех трёх файлов молча
ломает что-то одно из {dev, tsc, vitest}.

Правило импортов: модель — всегда через `#block-editor`, composables и соседние компоненты —
относительными путями (несмотря на настроенный auto-import). `generateId`, `setContentClass`,
`getContentClass` **не** реэкспортируются из barrel — через голый `#block-editor` их не получить.
Deep-специфик `#block-editor/utils/generateId` при этом резолвится (`tsconfig` даёт `#block-editor/*`,
а строковый alias в Vite/vitest матчится по префиксу), но пользоваться им не надо — см. ниже.

Не импортируйте вглубь модели (`#block-editor/items/TabItem`): `TabItem`/`TreeNode` получают класс
`Content` через `getContentClass()!`, а регистрация происходит побочным эффектом вычисления
`src/model/content/Content.ts` (последняя строка файла). Импорт в обход barrel даёт
`Cannot read properties of null (reading 'fromRaw')` при конструировании.

---

## 5. Контракт реактивности (нарушать нельзя)

`useBlockEditor` держит `Content` в **`shallowRef`**. Мутации не отслеживаются.

1. Каждый мутатор в `useBlockEditor` вызывает `triggerRef(content)` вручную сразу после
   модельного вызова. Новый мутатор обязан делать то же самое.
   Исключение: `syncPositions` использует дебаунс 300 мс (одна перерисовка на серию событий
   gridstack); тест на него должен прокручивать фейковые таймеры на 300 мс.
   `setContent` не вызывает `triggerRef` вовсе — присваивание того же инстанса ничего не делает.
2. `Content.updateBox` применяет патч, **затем заменяет инстанс бокса** клоном
   `Object.assign(Object.create(Object.getPrototypeOf(oldBox)), oldBox)` и подменяет его и в
   массиве, и в `Map`. Смена идентичности — это и есть сигнал для Vue. Никогда не кэшируйте ссылку
   на `Box` между обновлениями (именно поэтому `useBoxChange` перепривязывается внутри
   `watchEffect`).
3. Два паттерна в компонентах-боксах — их можно сочетать в одном компоненте (так делает Canvas:
   `useBoxChange` для методов-мутаторов плюс четыре `useBoxModel` для скалярных настроек):
   - `useBoxModel(() => props.box.field, emit, 'field')` — writable computed, сеттер эмитит
     `('update', { field: value })`. Бокс не мутируется.
   - `useBoxChange(() => props.box, emit)` — для боксов, у которых есть собственные методы-мутаторы
     (Tabs, Tree, Canvas, File, поля форм). Метод модели вызывает `emitChange()`, тот — `emit('update', {})`
     с **пустым** патчем, единственная задача которого — заставить `updateBox` клонировать бокс.
   Если вы добавили метод-мутатор в подкласс `Box` и забыли `this.emitChange()` — UI замрёт на
   старых данных без единой ошибки.
4. `Box.applyUpdates` присваивает только ключи, для которых `key in this`, и молча игнорирует
   `undefined`. Значит: панель настроек, эмитящая свойство, не объявленное в классе, — no-op;
   и обнулить значение через `undefined` невозможно. Обратная сторона: проверки типов там нет,
   поэтому **никогда не эмитьте `{ id: ... }` или `{ name_type: ... }`** — они перезапишутся.
5. `@update:content` эмитит **тот же самый** объект `Content` при любой мутации (`shallowRef`
   перетриггеривается, а не переприсваивается). Родитель, делающий `content.value = val`, не увидит
   смены идентичности; playground обходит это явным `triggerRef` у себя. Исключение — экспонированный
   `insertData` (`index.vue:125`) и синхронизация входного пропа `content`: там инстанс действительно
   заменяется и эмитится новый.
6. `Box._onChange` — один слот на инстанс. Два компонента, отрендеренные на одном и том же `Box`,
   затирают колбэк друг друга, а размонтирование любого из них убивает уведомления для обоих.

---

## 6. Модель: чек-лист и ловушки

Иерархия: абстрактный `Box<T>` (дискриминант — поле-литерал `public readonly name_type = BOX_TYPES.X`)
→ 14 типов из `BOX_TYPES`. Промежуточный абстрактный `BoxFields<T extends FormValue>` для
Input/Select/DateTime.

**Добавление нового типа блока** требует правок в пяти местах:

1. `src/model/types/box-types.ts` — значение в `BOX_TYPES`.
2. `src/model/boxes/BoxX.ts` + экспорт в `src/model/boxes/index.ts`.
3. `src/model/factory/BoxFactory.ts` — запись в `TYPE_MAP`.
4. `src/runtime/components/block-editor/box-component-map.ts` — через локальный хелпер `asyncBox()`
   (иначе не будет скелетона загрузки).
5. `BlockAdder.vue` — чтобы тип можно было добавить из UI; плюс строки в **обе** локали.
   Опционально — вкладка настроек в `settings/box-settings-map.ts`.
   Тестовая таблица `cases` в `tests/model/BoxFactory.test.ts` — очевидное место для нового кейса.

Чего не делать и о чём помнить:

- **`BOX_TYPES.HTML` — живой тип модели без компонента.** У него есть `BoxHtml`, запись в
  `TYPE_MAP` и тесты, но нет записи в `boxComponentMap` и в `BlockAdder`. Сохранённый документ с
  HTML-боксом десериализуется нормально и отрендерит `<component :is="undefined">` — пустоту.
  Не считайте, что `BOX_TYPES` ⇒ рендерится.
- **Вложенный контент теряется без фабрики.** `new BoxTabs({ value: [{ content: {...} }] })` без
  второго аргумента даёт пустой `Content`: `Content.fromRaw` проверяет `Array.isArray(raw.boxes) && factory`.
  Всегда передавайте `boxFactory` или идите через `boxFactory.prepare()` / `Content.fromJsonString(json, boxFactory)`.
- **Две разные формы сериализации.** `toJSON()` возвращает `{ boxes: [...] }`, а `toJsonString()` —
  **голый массив**. `fromJsonString` принимает обе формы, любой другой потребитель — нет.
- **`Content.fromJsonString` глотает всё в пустой `catch {}`.** Опечатка в `name_type` заставляет
  `boxFactory.prepare` бросить исключение, и пропадает **весь** документ, без лога. Отлаживая
  «контент исчез», вызывайте `boxFactory.prepare(raw)` на каждом боксе вручную.
- **`Content.addBox` переписывает `y` и `i`** у добавляемого бокса, если контейнер не пуст.
  Позицию задавайте после `addBox` или через `setPosition`/`syncPositions`.
- **Дубликаты id не контролируются.** Второй бокс с тем же id перезаписывает запись в `_boxMap`:
  `findBox`/`updateBox` начинают видеть только его, а первый остаётся в массиве, но становится
  недостижим. `removeBox` удалит второй и оставит первый висеть в `boxes` без записи в Map.
- Подкласс, добавляющий персистентное поле, обязан переопределить `toJSON()` со спредом
  родительского (`{ ...super.toJSON(), language: this.language }`) — иначе поле теряется на round-trip.
- `generateId(prefix)` — это `${prefix}_${Date.now()}_${++counter}` с модульным счётчиком.
  Уникален только в пределах процесса; id, созданные на сервере, надо сериализовать и переиспользовать,
  а не генерировать заново на клиенте.
- Конструкторы боксов и items имеют форму `(data?: Partial<Record<string, unknown>>, factory?: IBoxFactory)`
  и читают поля как `(data?.x as T) ?? default`; второй параметр объявляют только те, у кого внутри
  вложенный `Content` (`BoxHtml`, `BoxTabs`, `BoxTree`, `TabItem`, `TreeNode`). Исключения из формы:
  `Icon(name?, color?)`, `Content(boxes?)` и `FormValue*` (берут `Partial<Self>`, читают без каста).
  Валидации нет и не надо — следуйте форме, иначе `boxFactory.prepare` сломается.
- Enum-подобные константы — `as const`-объект + производный union, никогда TS `enum`.

### dataBinding

`collectData` / `insertData` / `findDuplicateBindingKeys` обходят дерево по `bindingKey`
(точечные пути). Обход заходит ровно в три вида боксов: `BoxFields`, `BoxTabs` (по `.content`
каждой вкладки) и `BoxTree` (по `.content` узла и его детям).

- **Поля внутри `BoxHtml` невидимы** для всех трёх функций.
- `setByPath` затирает при коллизии путей (`user` и `user.name`); `findDuplicateBindingKeys`
  этот класс конфликтов не ловит — он считает только одинаковые ключи.
- «Ключа нет» и «ключ есть, но `null`» ведут себя по-разному: `insertData` пропускает `undefined`,
  но пишет `null` (Input/DateTime становятся `''`).
- Метки полей не могут быть пустыми: `FormValueInput/Select/Date` используют
  `data?.label || '<Input|Select|Date> field'` — свой английский дефолт у каждого класса,
  поэтому сохранённая пустая метка возвращается английским значением по умолчанию.

---

## 7. Подсистема шаблонов (mustache)

Появилась в коммите `b852683`, в `CLAUDE.md` отсутствует полностью.

Модель — `src/model/template/`:

- `scanTokens.ts:4` — регулярка токенов `/\{\{([#^/]?)\s*([A-Za-z_$][\w$.]*|\.)\s*\}\}/g`.
  Единственный её потребитель вне тестов — подсветка в редакторе (`template-vars-plugin.ts:40`);
  путь рендера (`MustacheTemplate` → `normalizeTemplate` → пакет `mustache`) её не вызывает.
  Грамматика «сигил + путь» продублирована ещё дважды в `normalizeTemplate.ts`: в
  `STANDALONE_SECTION_RE` (строка 6) и во внутренней проверке `healTags` (строка 22). Меняете
  синтаксис токена — правьте все три места, иначе нормализация ослепнет на новом синтаксисе.
- `normalizeTemplate.ts` — три строковых прохода строго в этом порядке: `healTags` (снимает
  inline-разметку, которую TipTap затащил внутрь токена) → `unwrapStandaloneTags` (схлопывает
  `p|div|li|h1-h6`, всё содержимое которых — один маркер секции) → `disableRawOutput`
  (`{{{`→`{{`, `}}}`→`}}`, `{{&`→`{{`).
- `MustacheTemplate.ts` — фасад над пакетом `mustache`.
- `TemplateDataSource.ts` — иммутабельное глубокое слияние источников + `flattenDataPaths`
  (ключи автокомплита) + `normalizeIndexPath`.

Правила, принятые сознательно:

- **Значение поля формы всегда побеждает** проп `data`, в том числе пустой строкой и `null`.
  Слияние вызывается как `TemplateDataSource.from(props.data, collectData(content.value))` —
  поздний источник выигрывает, пропускается только `undefined`.
- **Всё экранируется**, `{{{raw}}}` не поддерживается намеренно. Оговорка: гарантия не абсолютна —
  `disableRawOutput` не нейтрализует смену делимитеров (`{{=[[ ]]=}}`), так что документ,
  сконструированный вручную, может обойти экранирование. Не формулируйте правило как абсолютное;
  если будете ужесточать — нейтрализуйте и `{{=`.
- Доступ по порядковому номеру работает: `{{items.0.title}}`, `{{tags.1}}`, `{{#items.1}}…{{/items.1}}`.
  Индекс вне диапазона даёт пустую строку и включает инвертированную секцию `{{^items.9}}`.
  `flattenDataPaths` выдаёт для массива объектов три вида ключей: сам массив как `kind:'section'`,
  относительные ключи элемента со `scope` (для использования внутри `{{#items}}`) и образец
  `items.0.<key>` без scope. `normalizeIndexPath` приводит любой индекс к нулю (`items.3.title` →
  `items.0.title`) — им пользуется только подсветка, чтобы произвольный индекс не считался неизвестным.

Ловушки:

- `MustacheTemplate.render` при ошибке mustache (незакрытая секция) возвращает **исходную
  ненормализованную строку**, а не нормализованный шаблон. Битый документ показывает грязный HTML.
- `disableRawOutput` — слепая глобальная замена: литеральные `}}}` в обычном тексте превратятся в
  `}}`. Сохранённое значение не трогается, искажение видно только в превью.
- Пробел между скобками и сигилом меняет всё: mustache считает `{{ #items }}` секцией, а
  `scanTokens` и `unwrapStandaloneTags` требуют сигил вплотную к `{{`. Результат — нет подсветки и
  остаётся пустой `<p>`. Пробелы **после** сигила (`{{# items }}`) безопасны везде.
- `unwrapStandaloneTags` знает только `p|div|li|h1-h6`. Маркер в `<blockquote>`, `<td>`, `<th>`
  сохранит обёртку. И обёртка должна содержать **только** маркер — `<p>{{#items}}<br></p>` не
  схлопнется.
- Подсветка «неизвестных» токенов — подсказка, а не валидатор: `knownPaths` строится только из
  `key.path` и игнорирует `key.scope`, поэтому относительные ключи утекают в глобальный набор.
- `TemplateDataSource.keys()` кэшируется на инстансе навсегда. Корректность держится на том, что
  `TemplateDataSource.from(...)` вызывается внутри `computed` и создаёт **новый** инстанс.
- Модель обязана оставаться без DOM и Vue. Не «улучшайте» `normalizeTemplate` через `DOMParser`:
  пара `{{#items}}…{{/items}}`, разнесённая TipTap по соседним блокам, не является корректным
  поддеревом, и round-trip через DOM её сломает.
- Превью — локальный `ref(false)` в `Container.vue` без персистентности, и оно принудительно
  включено в режимах `read` и `fill`. Текстовый блок, где `{{…}}` задуман как документация, будет
  подставлен, как только появятся данные.
- `:data` на вложенном `<BlockEditor nested>` не делает ничего: `provideTemplateData` вызывается
  только при `!props.nested`.

---

## 8. Rich-text / TipTap

Компонент — `src/runtime/components/block-editor/boxes/content/text/index.vue`, он же обслуживает
`BOX_TYPES.TEXT` и `BOX_TYPES.MARKDOWN`. Рендерится ровно один `<UEditor>`: редактируемый либо
read-only/превью, но не оба.

- **`extensions.ts` — module-level синглтон массива инстансов расширений**, общий для всех
  редакторов на странице. TipTap присваивает `editor.extensionStorage[name] = extension.storage` —
  тот же самый объект, — поэтому расширение, пишущее в `this.storage`, протечёт во все Text-блоки
  сразу. Держите расширения здесь без состояния. И наоборот: не превращайте массив в
  computed — `UEditor` снимает `extensions.value` один раз при `useEditor()`, реактивность не
  сработает. Именно поэтому ключи для подсветки шаблонов доставляются транзакцией
  `tr.setMeta(templateVarsPluginKey, meta)` из renderless-компонента `TemplateVarsSync.vue`,
  а не через `configure()`.
- **`SlashCommands` занимает дефолтный `SuggestionPluginKey`** (он не передаёт `pluginKey`).
  Любой второй `Suggestion` без явного собственного ключа заставит `prosemirror-state` бросить
  `RangeError: Adding different instances of a keyed plugin` и убьёт редактор целиком, а не только
  меню. `template-vars-suggestion.ts` заводит собственный ключ именно поэтому.
- **`UEditor` уже подключает** StarterKit, Code, HorizontalRule, Image, Mention и Placeholder, а
  `props.extensions` добавляет **последними**. Не добавляйте узел или марку с совпадающим именем.
  Существующие `:starter-kit="{ codeBlock: false }"` (конфликт с CodeBlockShiki) и
  `TableKit.configure({ tableHeader: false, tableCell: false })` (конфликт с CustomTableHeader/Cell)
  стоят ровно для этого.
- **`useEditorI18n()` внутри `VueRenderer` работает.** `@tiptap/vue-3` пробрасывает
  `editor.appContext` (`dist/index.js:78-82` и `:181`), поэтому у смонтированного им списка
  доступны и `inject`, и глобальные компоненты. `SlashCommandList.vue` зовёт `useEditorI18n()`
  напрямую (`t(item.labelKey)`) и получает рабочую локаль из `locales/ru.ts`. В template-vars
  подписи приходят готовым объектом `labels` через meta плагина — это способ вычислить их один раз
  в Vue, а не обход неработающего inject.
- **Известный открытый баг: меню по `/` не открывается.** `@tiptap/suggestion@3.31.3` вызывает
  `onStart` с `items: []` ещё до асинхронной загрузки списка; `SlashCommandList.vue:49` вешает
  `v-if="items.length"` на корневой элемент, поэтому Vue отдаёт только комментарий,
  `VueRenderer.element` (`el.firstElementChild`) равен `null`, и `slash-commands.ts:168`
  (`if (!props.clientRect || !component.element) return`) выходит, не создав попап. Восстановления
  нет: `onUpdate` только перепозиционирует уже существующий попап. Работающий сосед
  `TemplateVarList.vue:50` имеет безусловный корневой `<div>` — в этом вся разница.
  Сопутствующее: `SlashCommands` не задаёт `allowedPrefixes`, поэтому действует дефолт `[" "]` и
  `/` после буквы не срабатывает вовсе. Быстрая диагностика: набрать `/` и нажать Enter — если
  появился заголовок H1, плагин жив и сломан только монтаж DOM.
- Меню `/` фильтрует по **ключам i18n** (`slash.heading1`), а не по переводам, поэтому русский
  запрос не находит ничего.
- Ни один из `@tiptap/core`, `@tiptap/vue-3`, `@tiptap/suggestion`, `@tiptap/pm`,
  `@tiptap/extension-list`, `@floating-ui/dom`, `@internationalized/date`
  **не объявлен в `package.json`** (последний импортируется не здесь, а в
  `boxes/data/DatePickerPopover.vue`; `@tiptap/starter-kit` в коде не импортируется вовсе —
  он приходит как зависимость @nuxt/ui и настраивается пропом `:starter-kit`) — они резолвятся только благодаря hoisting из @nuxt/ui.
  При строгом установщике (pnpm, Yarn PnP) сборка развалится. Добавляя импорт ещё одного
  транзитивного пакета, вы углубляете эту яму.
- `src/module.ts:15-32` (правка `vite.optimizeDeps`) — **несущая** конструкция против дублирующихся
  копий ProseMirror. Выглядит мёртвым конфигом, но её удаление ломает Text-блок только в рантайме.

---

## 9. Gridstack

`useGridstack.ts` — самый хрупкий файл репозитория. Параметры зашиты: 12 колонок, `cellHeight: 10`,
`float: false`, `margin: '2px'`, `sizeToContent: true`, ручка ресайза только `'e'`, drag-handle
`.box-drag-handle`, `staticGrid: !editable`. Сетка инициализируется во **всех** режимах.

Не «упрощайте» следующее — каждая строка компенсирует конкретный баг:

- `resizeItemToContent` измеряет `contentEl.firstElementChild.offsetHeight`, а не сам
  `.grid-stack-item-content` (он `position:absolute` с инсетами, его `scrollHeight` не опускается
  ниже `clientHeight`, и блоки смогут только расти). JSDoc над функцией устарел и говорит про
  `scrollHeight` — верьте коду.
- Вокруг `grid.update(el, { h })` временно выставляется `node.sizeToContent = false`, иначе
  внутренний `resizeToContentCheck()` затрёт измеренную высоту.
- Узлы с `node._moving` / `node._resizing` пропускаются: `grid.update()` во время перетаскивания
  удаляет `node._orig`, который gridstack разыменовывает в `onEndMoving` — падение при отпускании.
- ResizeObserver вешается на **ребёнка** `.grid-stack-item-content`, а не на него самого.
- MutationObserver идёт с `subtree: false` и фильтрует добавленные узлы по атрибуту `gs-id` —
  без этого фильтра плейсхолдер самого gridstack (тот же класс) регистрируется как виджет.
- `gs-size-to-content` привязан к `box.name_type !== 'CANVAS'` **строковым литералом**, а не через
  `BOX_TYPES.CANVAS`. Новый блок с фиксированной высотой надо добавлять в это выражение вручную.
- Селектор `.box-drag-handle` продублирован в `Container.vue` и в опциях gridstack. Переименование
  в одном месте не отключает перетаскивание, а делает drag-ручкой **весь блок**: gridstack,
  не найдя элементов по селектору, вешает `mousedown` на сам `.grid-stack-item`.
- Интерактивные поверхности внутри блока обязаны гасить события указателя
  (`@mousedown.stop @touchstart.stop`), иначе drag сетки перехватит их (см. Canvas).

---

## 10. Vue-слой: что неочевидно

- `EditorMode` — `'read' | 'fill' | 'edit'` (не `view`). Режим `fill` учитывают **только** Input,
  Select и DateTime через `useFieldBox` (`isFillable`). Все остальные компоненты считают лишь
  `isEditable = mode === 'edit'`, то есть для них `fill` неотличим от `read`. Новый интерактивный
  блок, проверяющий только `edit`, окажется нередактируемым в режиме заполнения формы.
- **Корневой `<BlockEditor>` не рендерит кнопку добавления блока** (`v-if="isEditable && nested"`).
  Хост-приложение само рендерит `<BlockEditorBlockAdder>` и вызывает экспонированный
  `addBlock(type)` через template ref (образец — `playground/app.vue`).
- `defineExpose` отдаёт ровно четыре метода: `addBlock`, `collectData`, `insertData`,
  `findDuplicateBindingKeys`.
- Вся сетка живёт внутри `<ClientOnly>` **без fallback** — SSR отдаёт пустоту в любом режиме.
- `LOCALE_KEY` и данные шаблонов провайдятся только при `!props.nested`; вложенные редакторы
  наследуют их. `:locale` и `:data` на вложенном редакторе игнорируются.
- `addComponentsDir({ prefix: 'BlockEditor', pathPrefix: true })` регистрирует глобально **весь**
  каталог, включая `.ts`-файлы — они становятся псевдокомпонентами (`BlockEditorBoxComponentMap`
  и т. п.). Любой хелпер, положенный под `components/block-editor/`, попадёт туда же; общие
  composables кладите в `src/runtime/composables/`.
- Внутри модуля composables импортируются **явными относительными путями**, несмотря на
  настроенный auto-import (36 мест). `Video.vue` — единственное исключение, оно работает только
  благодаря auto-import; не копируйте его как образец.
- `Container.vue` выбирает кнопки добавления (поле, вкладка, узел дерева, переключатель режима
  дерева) через `instanceof` по модельным классам. Кнопка превью шаблона — единственная, что
  выбирается по `name_type` (`Container.vue:33-38`), как и выбор самого компонента бокса.

---

## 11. i18n

Своя реализация на provide/inject, без vue-i18n. `src/runtime/locales/en.ts` и `ru.ts` — два
объекта с группировкой на один уровень (19 именованных групп плюс один ключ верхнего уровня,
170 листовых ключей в каждом), структурно связанных типом `Messages = typeof en`; сейчас они
полностью параллельны (одинаковый порядок и количество ключей).

- Новая строка добавляется **в оба файла, на одну и ту же позицию, в ту же именованную группу**.
  Ключ, добавленный только в `en.ts`, ловит tsc (`Record<LocaleCode, Messages>` в
  `useEditorI18n.ts:8` → TS2719). Без проверки остаются обратный случай (ключ только в `ru.ts`),
  порядок и группировка. В рантайме `t()` при промахе молча возвращает точечную строку ключа, и в UI
  появляется текст вида `container.addField`. Если видите в интерфейсе точечный путь — это
  отсутствующий ключ, а не баг рендеринга.
- `t()` возвращает обычную строку, поэтому всё, что должно реагировать на смену языка, обязано
  находиться внутри `computed()`. `const label = t('x')` на верхнем уровне setup заморозит язык.
- Статические `.ts`-конфиги (`toolbar-config.ts`, `slash-commands.ts` и др.) выполняются вне
  `setup()`, поэтому `useEditorI18n()` там недоступен. Либо хардкод (как сейчас в
  `toolbar-config.ts`), либо хранить **ключи** и переводить в момент рендера.
- Часть компонентов до сих пор содержит захардкоженный английский (`Video.vue`,
  `ExternalService.vue`, `Code.vue`, `tree/index.vue`, `box-settings-map.ts`). Это долг, а не
  образец.

---

## 12. Стиль и CSS

- TypeScript: без точек с запятой, одинарные кавычки, отступ 2 пробела, без висячих запятых,
  одиночный параметр стрелки — чаще без скобок, но в репозитории смешанно (38 против 26).
  Линтера нет — копируйте окружающий файл буквально.
- SFC: `<script setup lang="ts">`, пропсы через `defineProps<{...}>()` с inline-типом;
  `withDefaults(...)` — только когда у пропса реально есть дефолт (4 файла из 30).
  Эмиты через `defineEmits<{ update: [updates: Partial<Box>] }>()`.
- Комментарии объясняют **почему**, а не что, и пишутся по-русски; идентификаторы, типы и ключи
  i18n — по-английски.
- **Tailwind v4: важность — суффикс `m-0!`, а не `!m-0`.**
- **Tailwind не сканирует `src/`.** @nuxt/ui выдаёт один `@source` на слой Nuxt, а `src/` модуля
  слоем не является — сгенерированный `ui.css` содержит только `@source "<repo>/playground/**/*"`
  и `@source "./ui"`. Любая утилита, встречающаяся **только** внутри `src/**`, не даёт CSS вообще
  (сегодня мертвы, например, `w-3/4`, `w-5/6`, `w-72`, `max-h-80`, `justify-start`). Классы,
  работающие в `src/`, работают случайно — потому что их использует сама тема @nuxt/ui.
  Правило: в `src/` либо классы, которые @nuxt/ui уже эмитит, либо CSS с токенами `var(--ui-*)`.
  Не «чините» пропавший стиль изобретением новой утилиты в `src/`.
- Цвета, рамки и фоны в CSS берутся из custom properties @nuxt/ui (`var(--ui-border)`,
  `var(--ui-bg-elevated)`, `var(--ui-color-primary-100)`), тёмная тема — через селектор-предок
  `.dark`, а не вариант `dark:`.
- CSS, нацеленный на чужой DOM (ProseMirror, gridstack), пишется в нескоупленном `<style>` или в
  CSS-модуле через `:global()`. `styles.module.css.d.ts` — это blanket index signature, поэтому
  `styles.опечатка` проходит проверку типов и даёт `undefined`.

---

## 13. Ловушка Vue SFC + mustache (самая частая)

Внутри `<template>` интерполяция `{{ }}` завершается на **первом** `}}`.

- `{{ '{{key}}' }}` — ошибка компиляции `SyntaxError: Unterminated string constant`.
- Просто `{{key}}` в статическом тексте молча становится интерполяцией необъявленной переменной
  и рендерится пустотой.

Поэтому **любой** пример mustache-синтаксиса в этом репозитории собирается в `<script>` как
константа или функция (`const KEY_EXAMPLE = '{{key}}'`, `function scopeLabel(scope) { return \`{{#${scope}}}\` }`)
либо лежит в `.ts`-файле (`playground/demo-content.ts`). Строка с `}}`, пришедшая в рантайме через
переменную или локаль, рендерится нормально — ловушка только на уровне компиляции шаблона.

---

## 14. Устаревшая документация

`CLAUDE.md` расходится с репозиторием как минимум в следующем:

- говорит про 181 тест — реально 13 файлов / 242 теста;
- дерево проекта не содержит `src/model/template/`, `src/runtime/composables/useTemplateData.ts`
  и каталога `boxes/content/text/template-vars/`;
- помещает `slash-commands/` прямо в `text/`, хотя реальный путь —
  `boxes/content/text/table/slash-commands/`;
- описывает `src/module.ts` как «регистрация компонентов, composables, alias», умалчивая о правке
  `vite.optimizeDeps`;
- утверждает, что JSDoc везде на русском — `useBoxModel.ts`, `toolbar-config.ts` и `extensions.ts`
  англоязычны;
- описывает каскад resize как `provide('resizeParentGrid')`, хотя ключ — Symbol-ный
  `RESIZE_PARENT_KEY` из `useGridstack.ts:6`; `inject('resizeParentGrid')` по строке молча вернёт
  дефолт, и каскад отвалится без ошибки.

`README.md` тоже неполон и местами прямо неверен: таблица пропсов `<BlockEditor>` не упоминает
проп `data`; раздел разработки советует `npm test` (watch-режим); пример использования вызывает
несуществующий `Content.createEmpty()` (есть только `new Content()`, `Content.fromJsonString`,
`Content.fromRaw`); таблица типов блоков называет `TEXTAREA` и `DATE_TIME`, тогда как в `BOX_TYPES`
это `TEXT_AREA` и `DATETIME` — копипаста из README не скомпилируется.

Верьте файловой системе, а не этим двум документам.

---

## 15. Правила работы с репозиторием

- **Git не трогать**: ни `commit`, ни `add`, ни `git mv`, ни `stash`. Только обычные `mv`/`rm`.
- Мёртвые файлы не удалять, а помечать маской; если помеченный файл уже замечен — удалять сразу и
  правок в него не вносить.
- Массовых рефакторингов не делать. Предпочитать одну точку подмены целой россыпи правок по `src`.
- После браузерных проверок убивать зомби-процессы: headless-chrome и дубли dev-серверов.
- Абстракцию вводить только при появлении второго потребителя; флаг или слой, оставшийся без
  потребителей, удалять, а не хранить впрок.
