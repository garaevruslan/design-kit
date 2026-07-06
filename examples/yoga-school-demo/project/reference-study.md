# Reference Study: yoga-school-demo

## Мета

| Поле | Значение |
| --- | --- |
| date | 2026-07-05 |
| method | css-path |
| status | ran-original |
| tools | chrome-devtools MCP (evaluate_script, emulate, take_screenshot) |
| operator | агент (Claude Code), сессия тестового прогона design-kit v1 |

## Источники

| # | Источник (URL / файл) | Тип | Что покрывает |
| --- | --- | --- | --- |
| 1 | https://hollow-template.webflow.io/ | live-site | главная: hero, about, classes, studio, events, first-time, blog, footer |
| 2 | https://hollow-template.webflow.io/template/style-guide | live-site | авторский стайлгайд: type scale, палитра, кнопки, инпуты |
| 3 | https://hollow-template.webflow.io/timetable | live-site | расписание (weekly schedule) |
| 4 | https://hollow-template.webflow.io/classes | live-site | каталог занятий |
| 5 | https://hollow-template.webflow.io/store | live-site | карточки тарифов/пассов (One Class $29, 4-class pass) |

Попытка найти живой оригинал: n/a (css-path, сайт живой).

## Что инспектировалось

- Страницы: `/`, `/template/style-guide`, `/timetable`, `/classes`, `/store`
- Состояния: базовые; hover-правила не извлечены из CSS (CORS, см. «Ограничения»);
  кнопочные вариации сняты со стайлгайда (light/dark варианты cta-main)
- Ширины: 1440px desktop (окно), 390px mobile (эмуляция viewport 390x844x2,mobile,touch);
  контрольные замеры на 991px и 767px для локализации брейкпоинта
- Скриншоты: `project/reference-shots/` — 22 файла, именование `<page>--<section>.png`
  (+ `--mobile`); список секций — в reference-inventory.md

**Важно:** из всех замеров исключён виджет Webflow «Buy Template»
(`.sales-cta-master`, `.master-sales-ctas`, шрифт Raveo Display, цвета
rgb(22,22,22)/rgb(4,4,4)/белые rgba) — это не часть дизайна шаблона.

## Сводка извлечённого

| Группа | Итог | Раздел |
| --- | --- | --- |
| CSS variables | отсутствуют (Webflow-классы; основной CSS недоступен через cssRules — CORS) | §1 |
| Палитра | 4 официальных цвета (стайлгайд) + 2 вспомогательных + альфа-система 88/64/48/32/16/8 | §2 |
| Типографика | 12 именованных шагов (стайлгайд H0…Label Small), 2 семейства | §3 |
| Spacing | базовый шаг 4px, шкала 4–160 | §4 |
| Радиусы и тени | 8 / 24 / pill; 1 мягкая тень | §5 |
| Брейкпоинты / сетка | смена значений на <768px (эмпирически); контейнер max 1800, pad 32/16 | §6 |

### §1. CSS variables

Не обнаружены. Проверены cssRules всех доступных стилей (`:root`, `html`, `body`,
`[data-theme]`, `.dark`) — пусто; основной файл Webflow на assets-домене закрыт CORS.
Компенсация: computed-styles анализ всех видимых элементов (§2–§6) + авторский
стайлгайд `/template/style-guide` как подтверждение именованной системы.

### §2. Палитра

Официальные цвета из стайлгайда (page: /template/style-guide, свотчи `.color-one…four`):

| Цвет | HEX | Роль (по употреблению на /) | Evidence (частота, селекторы) |
| --- | --- | --- | --- |
| Dark | #594A3C (rgb 89,74,60) | основной текст, тёмные секции (events, footer), бордеры | 302 упоминания; div.navbar, section.footer, page: / |
| Light | #F3EEE9 (rgb 243,238,233) | светлый фон, текст на тёмном | 200; body, div.text-light-88, page: / |
| Red | #C9372D (rgb 201,55,45) | системный/ошибки (в маркетинге страницы не встречен) | стайлгайд, свотч .color-three |
| Accent | #E6F6BA (rgb 230,246,186) | лаймовые лейблы-бейджи | 11; div.label-master, page: / |
| — sage | #8A9570 (rgb 138,149,112) | иконки-акценты (about values) | 19; div.icon-home-about svg, page: / |
| — beige | #D7CBBF (rgb 215,203,191) | подложка секций classes/blog, карточки событий | 3; section.classses-home-section, a.card-events-home, page: / |
| — cream-2 | #E9E1D9 (rgb 233,225,217) | navbar, polaroid-карточки, кнопка hero | 6; div.navbar, div.polaroid-card, page: / |

Альфа-система (одинаковая для Dark и Light): 0.88 (основной текст), 0.64 (вторичный),
0.48 (третичный/иконки соц-сетей), 0.32 (линии), 0.16 (бордеры кнопок/делители),
0.08 (заливки кнопок/полей). Evidence: div.text-dark-88/-64, div.button-bg,
input.text-field, div.divider-footer-halves, page: /.

### §3. Типографика

Семейства: **Libre Caslon Condensed** (дисплейная антиква, weight 300) и
**Instrument Sans Variable** (гротеск). Стайлгайд именует шкалу; computed styles
на / и /template/style-guide подтверждают:

| Шаг | Font | Desktop (size/lh/ls) | Mobile 390 (size/lh/ls) | Evidence |
| --- | --- | --- | --- | --- |
| H0 | Caslon 300 | 96/80/-3 | 64/52/-3 | div.text-h0, style-guide + footer / |
| H1 | Caslon 300 | 64/56/-2 | 48/44/-2 | h1, page: / hero |
| H2 | Caslon 300 | 48/48/-2 | 36/40/-1.5 | h2.no-margins, page: / (7 шт.) |
| H3 | Caslon 300 | 40/48/-1 | 32/36/-0.5 | div.text-h3 |
| H4 | Caslon 300 | 32/40/-1 | — (не встречен на /) | style-guide |
| H5 | Sans 300 | 28/32/-1 | 20/24/-0.5 | div.text-h5 |
| H6 | Sans 300 | 24/28/-0.5 | 20/20/-0.25 | div.text-h6 (манифест about) |
| Large | Sans 400 | 20/28 | 16/24 | div.text-large |
| Body | Sans 400 | 16/24 | 14/20 | div.text-dark-88, style-guide `.text-body` |
| Body bold | Sans 500 | 16/24 | 14/20 | div.text-body-bold |
| Small | Sans 400 | 14/20 | 12/16 | div.text-small, футер-ссылки |
| Label Large | Sans 600 upper | 12/16/+1 | 10/12/+0.75 | div.label-large, кнопки |
| Label Small | Sans 600 upper | 10/12/+1 | 8/10/+0.75 | div.label-small |
| Nav label | Sans 600 upper | 11/16/+1 | 10/16/+0.75 | a.nav-button (177 с gsap-сплитом) |

Курсивные `em` внутри заголовков — фирменный приём (hero «to your *body*», классы
«One *intention*», events «Upcoming *Retreat*»).

### §4. Spacing

Частотный анализ padding/margin/gap видимых элементов (page: /, без Buy-виджета):

| px | Частота | Примеры |
| --- | --- | --- |
| 16 | 83 | a.nav-button, div.home-about-tile |
| 8 | 70 | section.section, div.label-master |
| 4 | 56 | div.nav-menu-inner, a.nav-button |
| 24 | 41 | div.navbar, div.right-nav |
| 32 | 33 | контейнер (pad L/R), a.cta-home-hero |
| 12 | 19 | div.navbar, a.cta-home-hero |
| 20 | 14 | div.expandable-inner, form.form-footer |
| 64 | 8 | заголовочные блоки секций |
| 160 | 6 | section.section (верт. паддинги десктоп) |
| 120 | 5 | grid gap половинок, section |
| 80 | 5 | section.section, headline-events |
| 48 | 3 | div.blog-halves, footer-legal |

Базовый шаг: **4px**. Шкала: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 80 / 120 / 160.
Мобильные секции: паддинг 96px (section.section, замер на 390). Выбросы: 40
(heading-home-hero, 1 шт.), 193.5 (animation-wrap, анимационный сдвиг) — не системные.

### §5. Радиусы и тени

| Значение | Употребление | Evidence |
| --- | --- | --- |
| radius 8 | медиа-блоки, карточки, лейблы | 31; div.video-home-a, div.label-master |
| radius 24 | navbar-пилюля, кнопки cta | 18; div.navbar, a.cta-small, style-guide cta-main |
| radius 1440 (pill) | круглые кнопки-иконки, button-bg | 12; a.social-link |
| shadow: rgba(#594A3C, 0.08) -24px 4px 40px | polaroid-карточки футера | 2; div.polaroid-card |

Кнопка cta-main (стайлгайд): radius 24, padding 12/20, label 12/600 uppercase;
заливка/бордер — через альфа-слои (§2): border 0.16, bg 0.08.

### §6. Брейкпоинты, контейнер, сетка

- Media queries из CSS недоступны (CORS). Эмпирика по замерам h1/container/grid
  на ширинах 1440 → 991 → 767 → 390: значения меняются между 991 и 767 →
  **порог ~768px; двух тиров (desktop / mobile) достаточно** для наших макетов
  1440/390. На 991 всё десктопное; на 767 и 390 — мобильное (h1 48, pad 16,
  grid-половинки в 1 колонку).
- Контейнер: `.w-layout-blockcontainer` max-width 1800px, паддинги 32px (desktop)
  / 16px (mobile).
- Сетки: половинки 2 кол. gap 120 (studio, first-time), трети 3 кол. gap 8 (about
  values), карточки классов 3 кол. gap 16, блог 2 кол. gap 48x16, футер 3 кол. gap 16.

## Лицензии шрифтов (`font-license-check`)

| Font family | Источник обнаружения | Лицензия | Вердикт |
| --- | --- | --- | --- |
| Libre Caslon Condensed | computed styles: h1, h2, .text-h0…h3 | SIL OFL 1.1 (github.com/ertekinno/libre-caslon-condensed; fontsquirrel.com/license/libre-caslon) | use |
| Instrument Sans (Variable) | computed styles: body, labels, .text-* | SIL OFL 1.1 (Google Fonts) | use |
| Raveo Display | только Buy-виджет Webflow | не проверялась | исключён из системы (не часть дизайна) |

## Ограничения и блокеры

- Основной CSS-файл Webflow закрыт CORS: CSS-переменные и media queries не читаются.
  Компенсировано computed-styles анализом, эмпирической локализацией брейкпоинта
  и авторским стайлгайдом.
- Hover-состояния из CSS-правил не извлечены (тот же CORS); в фазе 4 hover строить
  на альфа-слоях §2 (0.08 → 0.16) — приём виден в структуре button-bg.
- Секции выше вьюпорта (classes 1118px и т.п.) сняты одним кадром от верха секции.

## Ссылки

- Инвентарь секций: `project/reference-inventory.md`
- Worklog фазы 1: `project/worklog.md` (rule ID: `reference-source-of-truth`,
  `font-license-check`)
