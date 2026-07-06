# filter-tabs-underline

| Поле | Значение |
| --- | --- |
| id | filter-tabs-underline |
| Назначение | Фильтр категорий каталога: ряд uppercase-ссылок, активная — с постоянным подчёркиванием |
| Происхождение | yoga-school-demo, дообогащение (референс hollow-template.webflow.io: /event-category/past), 2026-07-06 |

## Props / варианты

Элемент FilterTab: `state=default|current`; контейнер — ряд из N инстансов.

## Состояния

- default: лейбл text-muted, подчёркивание скрыто.
- current: лейбл text, подчёркивание видно (линия 1px под лейблом).

## Слоты контента

- label — название категории (caption, uppercase)

## Роли токенов (только роли, не значения)

text, text-muted, spacing (gap 16 между табами, 4 лейбл↔линия)

## Мобильное поведение

Ряд с переносом (wrap); при большом числе категорий — горизонтальный скролл.
