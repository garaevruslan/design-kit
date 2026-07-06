# Пример: opora-html-fallback

Обкатка пути **`fallback-html`** (docs/fallback-html.md) — фазы 4–6 того же
продукта, что в `examples/yoga-school-demo`, БЕЗ Figma MCP. Одно из трёх
исполнений «Опоры» для сравнения путей (Figma / HTML / Pencil, 2026-07-06).

- **Продукт и артефакты фаз 1–3:** переиспользованы из
  `../yoga-school-demo/project/` (reference-study, inventory, tokens.json,
  design-system, content-doc — утверждены гейтами 1–2 исходного прогона;
  здесь не дублируются).
- **Результат:** `project/prototype/` — index.html (обе ширины через media
  query), tokens.css (сгенерирован из tokens.json), components.css
  (19 классов-компонентов), components.html (превью для гейта 3).
  Открой index.html в браузере — прототип интерактивный (:hover, аккордеон).
- **Гейты 3–4:** утверждены 2026-07-06 («Все утверждают», 1-й заход).

## Порядок чтения

1. `project/inputs.md` — режим, происхождение артефактов
2. `project/worklog.md` — decision trail: план библиотеки ДО вёрстки,
   исключения аудита (блок геометрии), находки
3. `project/prototype/` — сам прототип
4. `project/verification-report.md` — grep-аудит, скриншот-сверка, компромиссы

## Чего здесь нет

- `reference-shots/` и `verification-shots/` (~6.5МБ) — не включены;
  эталоны пересъёмаются с живого референса в фазе 6 (см. worklog про
  скролл-анимации).

## Чему учит пример

Как правила контракта звучат в CSS-терминах: `var(--…)` = variables,
классы = компоненты, media query = вариант viewport, `data-theme="dark"` =
режим dark; grep — машинный аудит. Уроки прогона внесены в
docs/fallback-html.md (генератор tokens.css, гейт 3 через components.html).
