# schedule-cell

| Поле | Значение |
| --- | --- |
| id | schedule-cell |
| Назначение | Ячейка занятия в расписании: уровень, время, название, ведущий |
| Происхождение | yoga-school-demo (референс hollow-template.webflow.io), 2026-07-06 |

## Props / варианты

нет (один вариант)

## Состояния

нет (неинтерактивная карточка)

## Слоты контента

- level — бейдж (accent или outline по смыслу уровня)
- time — диапазон времени (text-muted)
- class-name — название (шаг h5)
- teacher — uppercase-тег ведущего (caption, text-muted)

## Роли токенов (только роли, не значения)

surface, text, text-muted, accent, accent-contrast, radius.md, spacing (паддинг 24, gap 12)

## Мобильное поведение

FILL по ширине колонки/экрана; тексты с переносом (wrap-safety в мастере).
