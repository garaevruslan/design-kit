# faq-item

| Поле | Значение |
| --- | --- |
| id | faq-item |
| Назначение | Пункт FAQ с раскрытием: вопрос + шеврон, ответ в развёрнутом состоянии |
| Происхождение | yoga-school-demo (референс hollow-template.webflow.io), 2026-07-06 |

## Props / варианты

`state=collapsed|expanded`

## Состояния

- collapsed: только строка вопроса, шеврон «+».
- expanded: + ответ (text-muted), шеврон «−».

## Слоты контента

- question — вопрос (body-lg)
- answer — ответ (body, text-muted), только в expanded
- chevron — глиф +/−

## Роли токенов (только роли, не значения)

text, text-muted, border (нижний делитель), spacing (паддинги 16/4, gap 12)

## Мобильное поведение

FILL по ширине; на мобиле по умолчанию все collapsed (аккордеон).
