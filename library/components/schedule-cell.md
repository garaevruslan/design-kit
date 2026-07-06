# schedule-cell

| Поле | Значение |
| --- | --- |
| id | schedule-cell |
| Назначение | Ячейка занятия в расписании: уровень, время, название, ведущий |
| Происхождение | yoga-school-demo (референс hollow-template.webflow.io), 2026-07-06 |

## Props / варианты

`kind=class|day-time`
(kind=day-time добавлен при дообогащении 2026-07-06 — строка мини-расписания
детальной страницы занятия: день | вертикальный делитель | время)

## Состояния

нет (неинтерактивная карточка)

## Слоты контента

kind=class:
- level — бейдж (accent или outline по смыслу уровня)
- time — диапазон времени (text-muted)
- class-name — название (шаг h5)
- teacher — uppercase-тег ведущего (caption, text-muted)

kind=day-time:
- day — день недели (body-bold)
- divider — вертикальная линия 1×32 (border-strong)
- time — диапазон времени (body)

## Роли токенов (только роли, не значения)

surface, text, text-muted, accent, accent-contrast, border-strong (делитель
day-time), radius.md, spacing (паддинг 24, gap 12/16)

## Мобильное поведение

FILL по ширине колонки/экрана; тексты с переносом (wrap-safety в мастере).
