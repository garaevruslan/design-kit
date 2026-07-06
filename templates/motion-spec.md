# Motion Spec: {{project-name}}

<!--
Артефакт фазы 5 (motion-spec-required). Пишется по ходу сборки, принимается на
гейте 4. Правила — docs/motion.md. Паттерны — library/motion/.
Каждая анимация обязана иметь мотивацию (motion-motivated) и уровень
достоверности источника A/B/C (motion-observed-classified).
Машинные имена (паттерны, роли, переменные) — английские.
-->

## Мета

| Поле | Значение |
| --- | --- |
| date | {{YYYY-MM-DD}} |
| режим | {{figma-mcp / pencil / fallback-html}} |
| код реализован | {{да — fallback-html / нет — только спека}} |

<!-- Если проект статический — заполнить ТОЛЬКО строку ниже и удалить таблицу секций.
     "Статический проект. Причина: {{почему моушен не нужен}}." -->

## Секции

<!-- Одна строка на анимируемую секцию/элемент. Уровень: A (CSSOM референса),
     B (классификация наблюдением), C (изобретено). Источник: ссылка на
     reference-study §Моушен / library/motion/<id> / decision-trail worklog. -->

| Секция / элемент | Паттерн (library/motion) | Мотивация | Уровень | Параметры (duration / ease / дистанция) | Источник |
| --- | --- | --- | --- | --- | --- |
| {{home/features}} | {{stagger-children}} | {{storytelling}} | {{A}} | {{0.5s / standard / y16}} | {{reference-study §Моушен}} |

Мотивация — одно из: `иерархия` / `storytelling` / `feedback` / `изменение состояния`.

## Токены моушена

<!-- Ссылка на группу motion tokens.json, если она есть. Параметры секций выше
     берут значения отсюда, а не хардкодом. -->

- Длительности: {{motion.durations из tokens.json / дефолты каталога}}
- Easing: {{motion.easings из tokens.json / дефолты каталога}}

## Reduced motion (HTML-путь)

<!-- Обязательно для fallback-html (motion-reduced): во что схлопывается каждый
     паттерн при prefers-reduced-motion. Для figma-mcp/pencil — «n/a, код не реализуется». -->

- {{паттерн → статичное состояние}}

## Ограничения

- {{что не реализовано в этом режиме: figma/pencil — только спека; секции без референса
  помечены уровнем C; и т.п.}}

## Ссылки

- Правила: `docs/motion.md`
- Worklog фазы 5: `project/worklog.md` (rule ID: `motion-spec-required`,
  `motion-motivated`, `motion-observed-classified`, `motion-reduced`)
