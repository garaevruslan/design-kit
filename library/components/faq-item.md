# faq-item

| Поле | Значение |
| --- | --- |
| id | faq-item |
| Назначение | Пункт FAQ с раскрытием: вопрос + шеврон, ответ в развёрнутом состоянии |
| Происхождение | yoga-school-demo (референс hollow-template.webflow.io), 2026-07-06 |

## Props / варианты

`kind=list|card` × `state=collapsed|expanded`
(kind=card добавлен при дообогащении 2026-07-06 — референсная композиция FAQ
с детальных страниц: `expandable-single`)

## Состояния

- collapsed: только строка вопроса, шеврон «+».
- expanded: + ответ (text-muted), шеврон «−».

## Слоты контента

- question — вопрос (kind=list: body-lg; kind=card: body-bold)
- answer — ответ (body, text-muted), только в expanded
- chevron — глиф +/−

## Роли токенов (только роли, не значения)

- kind=list: text, text-muted, border (нижний делитель), spacing (паддинги 16/4, gap 12)
- kind=card: + surface (подложка), radius.md, spacing (паддинг 24)

## Мобильное поведение

FILL по ширине; на мобиле по умолчанию все collapsed (аккордеон).
