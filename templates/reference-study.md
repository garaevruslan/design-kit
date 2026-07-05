# Reference Study: {{project-name}}

<!--
Шаблон артефакта фазы 1. Заполняется агентом по docs/extraction-css.md и/или
docs/extraction-vision.md. Машинные значения полей — английские.
Утверждается на гейте 1 в пакете с tokens.json и design-system.md.
-->

## Мета

| Поле | Значение |
| --- | --- |
| date | {{YYYY-MM-DD}} |
| method | {{css-path / vision-path / mixed}} |
| status | {{ran-original / vision-only / mixed}} |
| tools | {{chrome-devtools MCP / claude-in-chrome / пипетка / ...}} |
| operator | {{кто выполнял}} |

`status: ran-original` допустим только если значения сняты с живого сайта.
`vision-only` требует заполненного раздела «Ограничения» и записи о попытке
найти живой оригинал (extraction-vision.md, шаг 0).

## Источники

| # | Источник (URL / файл) | Тип | Что покрывает |
| --- | --- | --- | --- |
| 1 | {{url или project/inputs/...}} | {{live-site / screenshot / image}} | {{главная / hero / прайсинг}} |

Попытка найти живой оригинал (для vision-path):
{{что искали, чем закончилось / n/a для css-path}}

## Что инспектировалось

- Страницы: {{/, /pricing, /blog/...}}
- Состояния: {{hover кнопок, открытое меню, активный таб / not-inspectable для vision}}
- Ширины: {{1440px desktop, 390px mobile}}
- Скриншоты: `project/reference-shots/` — {{N}} файлов, именование `<page>--<section>.png`
  (+ `--mobile`); список секций — в reference-inventory.md

## Сводка извлечённого

Полные данные — в разделах ниже. Каждое значение с evidence
(css-path: страница + селектор; vision-path: raw → snapped + confidence + точки замера).

| Группа | Итог | Раздел |
| --- | --- | --- |
| CSS variables | {{найдены N / отсутствуют / недоступны (CORS)}} | §1 |
| Палитра | {{N цветов по ролям}} | §2 |
| Типографика | {{M комбинаций, шкала ratio X}} | §3 |
| Spacing | {{базовый шаг Ypx, шкала ...}} | §4 |
| Радиусы и тени | {{...}} | §5 |
| Брейкпоинты / сетка | {{...}} | §6 |

### §1. CSS variables
{{таблица: имя → значение → селектор темы / n/a}}

### §2. Палитра (роли: background / text / accent / border)
{{цвет → роль → частота → evidence}}

### §3. Типографика
{{family/size/weight/line-height → частота → элементы → evidence (+confidence для vision)}}

### §4. Spacing
{{частотная таблица, базовый шаг, шкала, выбросы с evidence}}

### §5. Радиусы и тени
{{значение → элементы → evidence}}

### §6. Брейкпоинты, контейнер, сетка
{{media queries / контейнер max-width / колонки и gap}}

## Лицензии шрифтов (`font-license-check`)

| Font family | Источник обнаружения | Лицензия | Вердикт |
| --- | --- | --- | --- |
| {{Inter}} | {{computed styles, body}} | {{OFL / коммерческая / unknown}} | {{use / replace-with: {{аналог}} + мотивировка → design-system.md}} |

## Ограничения и блокеры

- {{что не удалось извлечь и почему (CORS, paywall, только 1 скриншот...)}}
- {{для vision-only: не извлекаемы состояния, брейкпоинты, тени — перечислить}}
- {{значения со статусом proposed (не extracted) — перечислить}}

## Ссылки

- Инвентарь секций: `project/reference-inventory.md`
- Worklog фазы 1: `project/worklog.md` (rule ID: `reference-source-of-truth`,
  `vision-values-snapped`, `font-license-check`)
