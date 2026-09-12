/**
 * Демо-контент для playground: показывает работу mustache-шаблонов.
 *
 * Три блока:
 *  1. TEXT_AREA — шпаргалка по синтаксису (без `{{`, поэтому кнопки превью у него нет);
 *  2. INPUT     — поля формы с bindingKey, они перекрывают prop `data`;
 *  3. TEXT      — сам шаблон: значения, вложенный путь, секция, инверсия, неизвестный ключ.
 */

const CHEAT_SHEET = `Как работает шаблонизатор

1. В текстовом блоке (Text) набери {{ — появится подсказка с доступными ключами.
   Ключи берутся из двух источников:
     - панель «Input Data» справа — это prop data у <BlockEditor>;
     - поля форм с заполненным bindingKey (Input / Select / DateTime).

2. Синтаксис:
   {{company}}               значение
   {{user.name}}             вложенный путь
   {{#items}} ... {{/items}} секция: повторяется по массиву
   {{.}}                     текущий элемент массива примитивов
   {{^items}} ... {{/items}} инверсия: видна, когда ключа нет или он пустой
   {{items.0.title}}         элемент массива по порядковому номеру, без секции
                             (нумерация с нуля: 0 — первый, 1 — второй)
   {{#items.1}} ... {{/items.1}}  секция по конкретному элементу
   Номер вне диапазона даёт пустую строку — {{^items.9}} на этом и срабатывает.
   Неизвестный ключ подсвечен отдельным цветом, в превью даёт пустую строку.
   HTML внутри значений всегда экранируется.

3. Маркер секции можно поставить отдельным абзацем или пунктом списка:
   обёртка <p> / <li> вокруг одного маркера снимается при рендере.

4. Кнопка-глаз в тулбаре блока (появляется, если в блоке есть {{) переключает
   Правку и Превью. В режимах Read и Fill превью включено всегда.

5. Приоритет: поле формы всегда перекрывает prop data — в том числе пустым
   значением. Очисти поле «Менеджер» ниже, и {{user.name}} станет пустым.

6. Попробуй: удали items из JSON справа — вместо списка сработает {{^items}}.`

const TEMPLATE_HTML = [
  '<h3>{{company}}</h3>',
  '<p>Менеджер: {{user.name}} &lt;{{user.email}}&gt;</p>',
  '<ul><li>{{#items}}</li><li><strong>{{title}}</strong> — {{price}} ₽</li><li>{{/items}}</li></ul>',
  '<p>{{^items}}</p><p><em>Позиций нет.</em></p><p>{{/items}}</p>',
  '<p>Первая позиция по номеру: {{items.0.title}} — {{items.0.price}} ₽</p>',
  '<p>Вторая: {{items.1.title}}. Десятой нет: [{{items.9.title}}]</p>',
  '<p>Неизвестный ключ: {{nope}}</p>'
].join('')

/** Сырые боксы для Content.fromJsonString */
export const DEMO_BOXES: Record<string, unknown>[] = [
  {
    id: 'demo-cheatsheet',
    name_type: 'TEXT_AREA',
    title: 'Шпаргалка',
    subtitle: 'Синтаксис и правила',
    x: 0, y: 0, w: 12, h: 176, i: 0,
    value: CHEAT_SHEET
  },
  {
    id: 'demo-fields',
    name_type: 'INPUT',
    title: 'Поля формы',
    subtitle: 'Значения перекрывают prop data по bindingKey',
    x: 0, y: 300, w: 12, h: 21, i: 1,
    value: [
      {
        id: 'demo-field-company',
        label: 'Компания',
        placeholder: 'Название компании',
        bindingKey: 'company',
        value: 'ООО «Ромашка» (из поля формы)',
        icon: { name: 'i-lucide-building-2', color: 'primary' }
      },
      {
        id: 'demo-field-manager',
        label: 'Менеджер',
        placeholder: 'Имя менеджера',
        bindingKey: 'user.name',
        value: 'Пётр Смирнов',
        icon: { name: 'i-lucide-user', color: 'primary' }
      }
    ]
  },
  {
    id: 'demo-template',
    name_type: 'TEXT',
    title: 'Шаблон: карточка заказа',
    subtitle: 'Нажми глаз в тулбаре, чтобы увидеть результат',
    x: 0, y: 600, w: 12, h: 54, i: 2,
    value: TEMPLATE_HTML
  }
]

/** Значение панели «Template Data» — то, что уходит в prop data */
export const DEMO_TEMPLATE_DATA = JSON.stringify(
  {
    company: 'ACME Corp (из prop data)',
    user: {
      name: 'Иван из data',
      email: 'ivan@acme.io'
    },
    items: [
      { title: 'Ноутбук', price: 89000 },
      { title: 'Мышь', price: 1500 }
    ]
  },
  null,
  2
)
