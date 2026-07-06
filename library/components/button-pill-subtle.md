# button-pill-subtle

| Поле | Значение |
| --- | --- |
| id | button-pill-subtle |
| Назначение | Кнопка-пилюля с полупрозрачной заливкой — работает на светлом и тёмном фоне без вариантов темы |
| Происхождение | yoga-school-demo (референс hollow-template.webflow.io), 2026-07-06 |

## Props / варианты

`size=md|sm` × `state=default|hover`
(size=sm добавлен при дообогащении 2026-07-06: малая кнопка `cta-small` референса
для карточек и плотных контекстов)

## Состояния

- default: заливка fill-subtle (низкая альфа полюса), бордер border, текст text.
- hover: заливка усиливается до border-альфы (приём «0.08 → 0.16»).

## Слоты контента

- label — uppercase-текст стилем caption.

## Роли токенов (только роли, не значения)

fill-subtle, border, text, radius.lg, spacing (паддинги md: 12/20; sm: 8/16)

## Мобильное поведение

Autolayout-поведение: hug по контенту; в формах растягивается FILL.
