# Соответствие «скиллы/гайдлайны Pencil ↔ доки design-kit»

Этап A обкатки (2026-07-06). Источники: mcp get_guidelines (index, guide:Landing Page,
guide:Design System), get_editor_state include_schema (Pencil 1.1.68, .pen v2.14),
Context7 /websites/pencil_dev. Основа для docs/pencil-path.md.

## Что Pencil покрывает своими гайдлайнами (аналог figma-use)

| Тема | Pencil (встроенное) | design-kit | Вердикт |
| --- | --- | --- | --- |
| Инструктаж перед работой | `get_guidelines` — обязательный вызов перед дизайном (аналог скилла figma-use); guide-доки per задача (Landing Page, Design System) + каталог стилей | скилл figma-use + figma-library-rules/assembly-rules | Pencil сам дирижирует агентом; наш контракт добавляет фазы/гейты/worklog поверх |
| Привязка к токенам | «Always use `$--variable` tokens, never hardcode hex/rgb» (Design Principles §Color) | `no-detached-values` | СОВПАДАЕТ по духу; у Pencil это рекомендация, у нас — правило с аудитом |
| Переиспользование | «Use existing components before creating custom frames»; reusable+ref+descendants | `instances-only` | Pencil мягче («prefer»); контракт главнее — на страницах только инстансы |
| Проверка рендером | «Verify with get_screenshot after major design operations»; чек-лист после сборки (layout not collapsed, clipped, contrast) | скриншот каждого компонента до гейта 3; фаза 6 | СОВПАДАЕТ; наши гейты добавляют человека |
| Плейсхолдер-дисциплина | `placeholder: true` на корневом фрейме до завершения работы | — (нет аналога) | Перенять в pencil-path |
| Лендинг-композиция | guide Landing Page: hero=pitch, один CTA, alignment axis per section, narrative arc | composition-cascade (референс → скелеты → invented) | НЕ конфликтует: их гайд — общие принципы, наш каскад — источник композиции; контракт главнее (композиция из reference-inventory, не из их стилей) |
| Каталог стилей (26 пресетов) | get_guidelines category:style | reference-study (система из референса) | ПРОТИВОРЕЧИТ духу reference-source-of-truth — НЕ использовать: стиль берём из tokens.json |

## Маппинг механик

| design-kit / Figma | Pencil | Примечание |
| --- | --- | --- |
| Variables-коллекция color, режимы light/dark | variables с осью тем `mode` (`{value, theme:{mode}}`); фрейм с `theme:{mode:"dark"}` инвертирует поддерево | 1:1, даже элегантнее Figma (наследование темы) |
| Коллекция typography, режимы desktop/mobile | ось тем `viewport` на number-переменных (size/line/ls) | 1:1; letterSpacing в px — пересчёт из em×size на генерации |
| Text-стили | НЕТ стилей; текст собирает свойства из variables поштучно | ступень = набор variables `text-<step>-size/-line/-ls` (+weight в компоненте) |
| Вариант-сеты (state/size/viewport) | НЕТ. Один reusable = одна композиция; варианты = отдельные компоненты или override'ы | state=hover непредставим интерактивно; секции desktop/mobile = два компонента |
| Autolayout | layout: vertical/horizontal + gap/padding/justify/align; fill_container/fit_content | НЕТ wrap (грид = ручные ряды); нет min/max width |
| Эффект-стили (тень) | НЕТ стилей эффектов; effect.shadow c color-переменной, геометрия числами | геометрия тени — задокументированное исключение |
| get_variable_defs (аудит) | `search_all_unique_properties` (все уникальные значения свойств) + get_variables | аудит отвязанных значений возможен машинно ✓ |
| get_screenshot | get_screenshot ✓ | паритет |
| Скриншот-сверка фазы 6 | snapshot_layout (габариты/переполнения) + get_screenshot | snapshot_layout даже сильнее (машинная геометрия) |
| Экспорт/deliverable | export_nodes (PNG/SVG …), CLI `pencil --export` | .pen-файл в project/ = git-версионируемый первоисточник |
| Figma-файл в облаке | .pen — локальный JSON (проверено: plain JSON v2.14, НЕ зашифрован) | версионируется git'ом; «encrypted» в тексте MCP-сервера — неверно/устарело |
| Плейсхолдеры ассетов | заливка фрейма ролью + подпись; есть Generate(ai/stock) | Generate НЕ использовать в v1 (placeholders-for-assets запрещает стоки/генерацию) |

## Противоречия и дыры (кандидаты в docs/pencil-path.md)

1. **Нет вариант-сетов** → конвенция имён: `Button`, `Badge/Accent`, `Badge/Outline`,
   `Section/Hero (desktop)` / `(mobile)`. Hover-состояния не представимы паритетно
   Figma — фиксировать в worklog как ограничение пути (в спецификации hover описывать
   текстом или отдельным компонентом-образцом на странице компонентов).
2. **Нет wrap и min/max** → адаптивные карточки только через отдельные mobile-композиции.
3. **weight/fontFamily в тексте** — string; можно биндить на string-переменные
   (font-heading/font-body) ✓, но вес ступени живёт в компоненте, не в переменной оси.
4. **Каталог стилей Pencil игнорируем** (reference-source-of-truth).
5. **open_document не работает в desktop-приложении** («No handler found») — файл
   открывает человек; путь фиксируется в worklog. .pen редактируется только через MCP.
6. **MCP-транспорт привязан к приложению** (`--app visual_studio_code|desktop`):
   если агент видит «failed to connect … visual_studio_code», а открыт standalone
   Pencil — нужен сервер с `--app desktop` (Windows-нюанс для ONBOARDING).
7. **«.pen files are encrypted» в инструкции MCP-сервера** — фактически файл
   открытый JSON; правило «не редактировать .pen руками/Read'ом» сохраняем, но
   git-diff возможен и полезен.

## Дополнено обкаткой (2026-07-06, фазы 4–6)

8. **Устаревший MCP-бинарник = пустые рендеры.** `~/.pencil/mcp/*/out/…` может
   отставать от приложения (у нас: сборка 02.06 рисовала однотонный фон);
   рабочий бинарник — внутри `Pencil.app/Contents/Resources/app.asar.unpacked/out/`.
9. **Лимит строки stdio-сервера ~4КБ** — batch_design дробить до ~3КБ JS.
10. **Наборы инструментов различаются**: свежий сервер (07.2026): batch_design,
    batch_get, export_html, export_nodes, get_editor_state, get_guidelines,
    get_screenshot, get_variables, snapshot_layout — БЕЗ open_document,
    set_variables (есть SetVariables внутри batch_design), find_empty_space
    (есть FindEmptySpace в batch), search/replace_all_matching_properties.
    Desktop-приложение не реализует обработчики open_document и
    search_all_unique_properties даже у старого сервера.
11. **Аудит отвязанных значений** в desktop-варианте — скриптом по JSON
    документа (актуальное состояние: `~/.pencil/backup/<hash>`, обновляется
    по ходу; сам файл сохраняется по Cmd+S).
12. **Ref на корневой reusable-фрейм не рендерится** (пустой кадр) — мастера
    компонентов держать во вложенном контейнер-фрейме.
13. **Ресайз контейнера «всасывает» соседние корневые ноды** (geometric
    reparenting) — после ресайзов проверять корень документа.
14. **get_screenshot flaky при частых вызовах** — паузы 3–5с между вызовами,
    ретраи; иначе отдаёт обзор холста вместо узла. export_nodes на нодах
    размером со страницу (1440×8400) падает/виснет — экспортировать посекционно
    или export_html.
15. **Составные заголовки**: rich-text/микс стилей в одном text-узле недоступен —
    курсивные акценты собираются рядом текст-нод (gap = ширина пробела,
    исключение аудита); text-transform нет — капс пишется в контент.
