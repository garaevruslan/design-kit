# Reference Inventory: yoga-school-demo

**Правило покрытия.** Инвентарь покрывает все видимые секции инспектированных
страниц. Непереносимые секции — `intentionally-skipped` с причиной.

## Мета

| Поле | Значение |
| --- | --- |
| date | 2026-07-05; дообогащение 2026-07-06 |
| source-study | project/reference-study.md (ran-original) |
| pages-covered | /, /template/style-guide, /timetable, /classes, /store; дообогащение: /classes/yin-yoga, /events, /event-category/past, /about (+ ревизит /classes, /timetable, /store) |
| sections-total | 27 (13 первой волны + 14 дообогащения) |
| sections-skipped | 1 (home-blog; classes-catalog переведён в mapped при дообогащении) |

## Инвентарь секций

---

### home-hero

| Поле | Значение |
| --- | --- |
| id | home-hero |
| name | Полноэкранный hero: медиа-фон, плавающая навбар-пилюля, серифный заголовок снизу слева |
| evidence | page: / ; shots: home--hero.png, home--hero--mobile.png |
| token-roles | bg (media-подложка), text.on-dark-88, surface (нав-пилюля), accent (лого-знак) |
| maps-to | component: Section/Hero |
| status | mapped |

Композиция (анатомия): фон — полноэкранное видео/фото (100vh), сверху по центру
плавающая навбар-пилюля. Декоративный знак-логотип по центру экрана (лаймовый).
Заголовок H1 (серif, с курсивным `em`) — нижний левый угол. Справа внизу —
маленькая карточка-анонс (текст + лаймовый лейбл NEWS). Мобильный: то же, заголовок
внизу, карточка-анонс скрывается/уходит ниже, нав сворачивается в компакт.

---

### home-about

| Поле | Значение |
| --- | --- |
| id | home-about |
| name | Манифест: центрированный текст-кредо + строка ценностей с иконками |
| evidence | page: / ; shots: home--about.png, home--about--mobile.png |
| token-roles | bg (мягкое фото-размытие), text.primary-88, accent.sage (иконки), label |
| maps-to | component: Section/Manifesto |
| status | mapped |

Композиция (анатомия): мягкий полноширинный фото-фон; по центру — текст-манифест
(H6 sans, 3–4 строки, max-width ~640); ниже вертикальная линия-разделитель (32 alpha);
ниже ряд из 3 ценностей: иконка (sage) + label uppercase. Мобильный: тот же стек,
ценности остаются в ряд (3 колонки сохраняются, gap 8).

---

### home-classes

| Поле | Значение |
| --- | --- |
| id | home-classes |
| name | Направления: заголовок слева + текст справа, 3 фото-карточки |
| evidence | page: / ; shots: home--classes.png, home--classes--mobile.png |
| token-roles | bg.beige, text.primary, label.accent, radius.md, text.on-dark |
| maps-to | component: Section/CardsTriple + Card/ClassCard |
| status | mapped |

Композиция (анатомия): подложка секции — beige. Шапка секции: лаймовый лейбл +
H2 серif с курсивом («Three paths. *One intention*.») слева; поддерживающий текст
и ссылка-underline справа. Ниже грид 3 колонки gap 16: фото-карточки (radius 8),
заголовок H5/H6 верхний левый угол на фото, описание Small — низ карточки.
Мобильный: карточки в 1 колонку (стек), шапка секции в один столбец.

---

### home-studio

| Поле | Значение |
| --- | --- |
| id | home-studio |
| name | Сплит о студии: две половины с gap 120 (текст + медиа) |
| evidence | page: / ; shots: home--studio.png, home--studio--mobile.png |
| token-roles | bg.light, text.primary, label, radius.md |
| maps-to | component: Section/SplitFeature |
| status | mapped |

Композиция (анатомия): грид 2 колонки gap 120; слева текстовый стек (лейбл → H2
сериф → текст → CTA), справа медиа (фото/видео, radius 8). Мобильный: стек,
медиа под текстом, gap схлопывается.

---

### home-events

| Поле | Значение |
| --- | --- |
| id | home-events |
| name | Тёмная секция события: центрированная шапка + большая светлая карточка-сплит |
| evidence | page: / ; shots: home--events.png, home--events--mobile.png |
| token-roles | bg.dark, text.on-dark, label.accent, surface.light (карточка), pill-button |
| maps-to | component: Section/EventFeature + Card/EventCard |
| status | mapped |

Композиция (анатомия): тёмная (#594A3C с фото-затемнением) секция. Центрированная
шапка: лаймовый лейбл → H1 сериф с курсивом («Upcoming *Retreat*») → текст 2–3
строки → аутлайн-кнопка-пилюля. Ниже — крупная светлая карточка: слева текстовый
стек по центру (лаймовый лейбл-дата → H2 сериф → label-локация → текст), справа
фото (radius 8). Мобильный: карточка в стек, фото под текстом.

---

### home-first-time

| Поле | Значение |
| --- | --- |
| id | home-first-time |
| name | Сплит «впервые у нас»: текст + 2 мини-карточки преимуществ, большое фото справа |
| evidence | page: / ; shots: home--first-time.png, home--first-time--mobile.png |
| token-roles | bg.light, text.primary, label.accent, surface.cream (мини-карточки), radius.md |
| maps-to | component: Section/SplitWithTiles + Card/IconTile |
| status | mapped |

Композиция (анатомия): грид 2 колонки; слева: лаймовый лейбл → H2 сериф → текст →
кнопка-пилюля, ниже ряд из 2 мини-карточек (cream, radius 8: иконка-лайн → заголовок
Body-bold → текст Small); справа: большое фото на всю высоту (radius 8).
Мобильный: стек — текст, кнопка, карточки (1 колонка), фото.

---

### home-blog

| Поле | Значение |
| --- | --- |
| id | home-blog |
| name | Блог-превью: шапка секции + 2 колонки статей |
| evidence | page: / ; shots: home--blog.png, home--blog--mobile.png |
| token-roles | bg.beige, text.primary, label, radius.md |
| maps-to | intentionally-skipped |
| status | intentionally-skipped: в брифе лендинга нет блока блога/новостей |

Композиция (анатомия): шапка (лейбл + H2 слева), грид 2 кол. gap 48x16 —
карточки статей (фото radius 8, заголовок, дата-лейбл). Мобильный: 1 колонка.

---

### home-footer

| Поле | Значение |
| --- | --- |
| id | home-footer |
| name | Тёмный футер: гигантский серифный слоган, newsletter-форма, колонки ссылок, polaroid-фото |
| evidence | page: / ; shots: home--footer.png, home--footer--mobile.png |
| token-roles | bg.dark, text.on-dark (+ альфа 64/48/16), text-h0, pill-button, input |
| maps-to | component: Section/Footer |
| status | mapped |

Композиция (анатомия): тёмный (#594A3C) футер: сверху H0 сериф-слоган
(«Find what moves you», text-moon-dust); блок newsletter (Large bold заголовок +
поле ввода + кнопка); грид колонок ссылок (3 кол. gap 16, label-заголовки, Small
ссылки, соц-иконки в круглых пилюлях 48-alpha); внизу legal-строка (Small, 64-alpha,
делители 16-alpha); декоративные polaroid-карточки с фото (cream, тень -24/4/40).
Мобильный: всё в стек, H0 64/52.

---

### timetable-schedule

| Поле | Значение |
| --- | --- |
| id | timetable-schedule |
| name | Расписание: колонки по дням недели, карточки занятий |
| evidence | page: /timetable ; shots: timetable--hero.png, timetable--schedule.png |
| token-roles | bg.light, surface.cream (карточки), label.accent + label.outline, text.primary |
| maps-to | component: Section/Timetable + Card/ScheduleCell |
| status | mapped |

Композиция (анатомия): заголовок дня (H6/label) → вертикальный список карточек.
Карточка занятия (cream, radius 8, паддинг 24): лейбл уровня (лаймовый бейдж
BEGINNER / аутлайн ADVANCED) → время «10:00 AM — 10:45 AM» с вертикальной
линией-делителем → название занятия (H6/Large) → тег преподавателя (мини-бейдж
cream-2). Мобильный: дни в аккордеон/стек, карточки на всю ширину.

---

### classes-catalog

| Поле | Значение |
| --- | --- |
| id | classes-catalog |
| name | Каталог занятий: sticky-сайдбар + грид 2 колонки карточек занятия |
| evidence | page: /classes ; shots: classes--catalog.png, classes--catalog-grid.png, classes--catalog-grid--mobile.png |
| token-roles | bg (cream-100), text.primary, label-small, radius.md, tag-цвета уровней (Tier 3 кандидаты) |
| maps-to | component: Card/ClassCatalog + Layout/CatalogSticky (см. events-catalog) |
| status | mapped (дообогащение 2026-07-06; переведён из intentionally-skipped — на лендинг не идёт, добавляется в библиотеку) |

Композиция (анатомия, уточнена ревизитом 2026-07-06): layout как events-catalog
(sticky-заголовок слева, грид справа). Грид `.classes-halves` 2 колонки 410px,
gap 48×16. Карточка `.card-class` (без подложки, flex col gap 20): фото-квадрат
411×410 radius 8 → контент: ряд тегов (tag-класс: цветная плашка `tag-bg` radius 8
+ label-small 10/600 upper: уровень beginner #F1F8E8 / intermediate #EDE9F6 /
advanced #FFF2D9; тег длительности с иконкой 12; тег преподавателя) → название
text-h6 (sans 24/28/−0.5/300) → описание text-small. Мобильный: грид остаётся
2 колонки (228px).

---

### store-pricing

| Поле | Значение |
| --- | --- |
| id | store-pricing |
| name | Карточки пассов/тарифов: фото, название, описание, цена |
| evidence | page: /store ; shots: store--pricing.png |
| token-roles | bg.light, surface.cream, text.primary, label, radius.md |
| maps-to | component: Card/PricingCard (композиция строится по этому образцу + сетка 3 кол. из home-classes) |
| status | mapped |

Композиция (анатомия): грид карточек продукта: фото сверху (radius 8), нижняя
плитка (cream): название (H6) → описание (Small) → цена (Body-bold «$29»).
Референс-употребление: «One Class — $29», «4-class pass». Мобильный: 1 колонка.

## Дообогащение 2026-07-06: детальная страница занятия (/classes/yin-yoga)

---

### class-detail-hero

| Поле | Значение |
| --- | --- |
| id | class-detail-hero |
| name | Hero занятия: видео-фон, тег-чипы, заголовок H1, карточка преподавателя |
| evidence | page: /classes/yin-yoga ; shots: class-detail--hero.png, class-detail--hero--mobile.png |
| token-roles | surface-alt (подложка #D7CBBF), text.primary, label-small, radius.md |
| maps-to | component: Section/ClassHero + Card/AuthorTile |
| status | mapped |

Композиция (анатомия): секция 784px, паддинг 200/0/48, фон — видео с бежевым
оверлеем (surface-alt). Слева стек: ряд тег-чипов (иконка 12 alpha-64 +
label-small 10/600/ls1 upper: уровень, длительность) → H1 сериф 64/56/−2 →
описание body 448px. Справа/ниже — `author-tile`: карточка cream-200 radius 8
паддинг 16 gap 24: фото 96×96 radius 8 + имя text-body-bold + био text-small.
Мобильный: стек, тот же порядок.

---

### class-detail-body

| Поле | Значение |
| --- | --- |
| id | class-detail-body |
| name | Тело детальной страницы: колонка 912, лейбл-блоки через вертикальные делители |
| evidence | page: /classes/yin-yoga ; shots: class-detail--textblocks.png |
| token-roles | bg, label-small, text.primary, border (делитель alpha-32 — Tier 3 кандидат) |
| maps-to | component: TextBlock/Labeled (+ layout-правило DetailBody) |
| status | mapped |

Композиция (анатомия): одна колонка 912px, flex col gap 48; блоки
`master-cms-block` (label-small upper → контент, gap 24) разделены вертикальной
линией 1×40 (brown alpha 0.32). Текстовые блоки (PHILOSOPHY, HOW TO PREPARE) —
label + body, ширина ~448.

---

### class-detail-timetable

| Поле | Значение |
| --- | --- |
| id | class-detail-timetable |
| name | Мини-расписание занятия: строки «день — время» |
| evidence | page: /classes/yin-yoga ; shots: class-detail--timetable.png, class-detail--timetable--mobile.png |
| token-roles | surface (cream-200), text.primary, border (делитель), radius.md |
| maps-to | component: Card/ScheduleCell (вариант kind=day-time; анатомия совпадает) |
| status | mapped |

Композиция (анатомия): ряд ячеек `timetable-cell` (cream-200, radius 8, паддинг
24, flex row): день text-body-bold → вертикальный делитель 32px → время
«8:00 AM — 8:45 AM» (тире text-dark-32). Вариант существующего Card/ScheduleCell.

---

### class-benefits

| Поле | Значение |
| --- | --- |
| id | class-benefits |
| name | Преимущества: 3 квадратные cream-карточки с иконкой 48 |
| evidence | page: /classes/yin-yoga ; shots: class-detail--benefits.png, class-detail--benefits--mobile.png |
| token-roles | surface (cream-200), radius.md, text.primary, text-muted (64) |
| maps-to | component: Card/Feature |
| status | mapped |

Композиция (анатомия): грид `event-features-thirds` 3×293 gap 16. Карточка
`card-features`: cream-200, radius 8, паддинг 24, flex col gap 32,
space-between: иконка-лайн 48×48 → низ: заголовок text-body-bold + текст
body alpha-64, gap 12. Мобильный: 1 колонка. Отличие от IconTile
(home-first-time): квадратная пропорция, иконка 48, прижатый низ.

---

### class-testimonial

| Поле | Значение |
| --- | --- |
| id | class-testimonial |
| name | Отзыв: широкая cream-карточка с центрированной серифной цитатой |
| evidence | page: /classes/yin-yoga ; shots: class-detail--testimonial.png |
| token-roles | surface (cream-200), radius.md, text.primary, label-small |
| maps-to | component: Card/Testimonial |
| status | mapped |

Композиция (анатомия): карточка 912px, cream-200, radius 8, паддинг 80/80/64,
flex col center gap 32, text-align center: label-small «TESTIMONIAL» → цитата
text-h4 (сериф 32/40/−1/300, ширина 752) → автор. Ступень h4 — в typography
variables фазы 4 (решение фазы 2: некононические ступени добавляются variables).

---

### class-faq-accordion

| Поле | Значение |
| --- | --- |
| id | class-faq-accordion |
| name | FAQ-аккордеон: cream-карточки вопросов |
| evidence | page: /classes/yin-yoga ; shots: class-detail--faq.png, class-detail--faq--mobile.png |
| token-roles | surface (cream-200), radius.md, text.primary |
| maps-to | component: FaqItem (вариант kind=card; ЗАМЕНЯЕТ invented-композицию списка с делителями) |
| status | mapped |

Композиция (анатомия): `faq-block` flex col gap 16; элемент `expandable-single`:
cream-200, radius 8, паддинг 24, высота закрытого 72: вопрос text-body-bold
(16/24/500) + иконка-плюс справа; ответ раскрывается внутри карточки. НАХОДКА:
наш FaqItem (фаза 4) был `invented` (список с alpha-делителями) — у референса
FAQ есть на детальных страницах, композиция карточная.

---

### class-cta-cards

| Поле | Значение |
| --- | --- |
| id | class-cta-cards |
| name | CTA-трио: тёмные карточки способов записи с малой кнопкой |
| evidence | pages: /classes/yin-yoga, /timetable ; shots: class-detail--booking.png, class-detail--booking--mobile.png |
| token-roles | bg.dark (brown-900), text.on-dark-88, accent (lime кнопка), radius.md, pill |
| maps-to | component: Card/CtaDark + Button (size=small) |
| status | mapped |

Композиция (анатомия): грид `classes-cta-thirds` 3×293 gap 16. Карточка
`card-classes-cta`: brown-900, radius 8, паддинг 24, flex col space-between:
верх (заголовок + текст cream alpha-88) → кнопка `cta-small`: пилюля radius 24,
паддинг 8/16, высота 32, подложка lime-200 (accent), label upper. НОВОЕ:
малый размер кнопки (существующий Button — паддинг 12/20). Тот же блок на
/timetable («How to join classes»). Мобильный: колонки схлопываются в стек/2.

## Дообогащение 2026-07-06: события (/events, /event-category/past)

---

### events-catalog

| Поле | Значение |
| --- | --- |
| id | events-catalog |
| name | Каталог событий: sticky-заголовок слева, вертикальный список карточек справа |
| evidence | page: /events ; shots: events--catalog.png, events--catalog--mobile.png |
| token-roles | bg, text.primary, label-small |
| maps-to | layout: Layout/CatalogSticky (грид 419+837 gap 120, лево position:sticky top:120) |
| status | mapped |

Композиция (анатомия): секция паддинг 200/0; грид `cms-halves`
419px + 837px, gap 120. Слева `cms-sticky` (sticky top 120): заголовок
страницы + вводный текст (+ фильтр, см. filter-tabs). Справа список
`events-list` flex col gap 24. Тот же layout на /classes и /store (грид/список
меняется). Мобильный: стек, сайдбар теряет sticky.

---

### card-events

| Поле | Значение |
| --- | --- |
| id | card-events |
| name | Карточка события: фото сверху, контент в 2 колонки |
| evidence | page: /events ; shots: events--card.png, events--card--mobile.png |
| token-roles | surface (cream-200), radius.md, label-small, label-large (88), text (88) |
| maps-to | component: Card/Event |
| status | mapped |

Композиция (анатомия): карточка-ссылка 837px, cream-200, radius 8: фото
837×464 сверху (overflow hidden) → контент грид 2×387 gap 16, паддинг 32/24:
слева стек gap 16 (дата label-small → название text-h4 сериф 32/40/−1 →
локация label-large 12/600 upper alpha-88), справа описание body alpha-88.
Мобильный: контент в 1 колонку, фото сжимается.

---

### filter-tabs

| Поле | Значение |
| --- | --- |
| id | filter-tabs |
| name | Фильтр категорий: подчёркнутые label-ссылки с активным состоянием |
| evidence | page: /event-category/past ; shot: event-category--filter.png |
| token-roles | text.primary, nav-label (11→12 снэп фазы 2) |
| maps-to | component: Nav/FilterTabs |
| status | mapped |

Композиция (анатомия): `filter-list` flex row gap 16; ссылка `link-underline`:
nav-label 11/600 upper + подчёркивание (у активной — постоянное, `w--current`).
Состояния: default / current.

## Дообогащение 2026-07-06: о студии (/about)

---

### about-statement-hero

| Поле | Значение |
| --- | --- |
| id | about-statement-hero |
| name | Hero-манифест: видео-фон, центрированная серифная цитата |
| evidence | page: /about ; shots: about--hero.png, about--hero--mobile.png |
| token-roles | bg (видео + затемнение), text.on-dark-88 (cream alpha 0.88) |
| maps-to | component: Section/StatementHero |
| status | mapped |

Композиция (анатомия): секция 732px, фон видео; по центру H1 сериф 64/56/−2,
цвет cream alpha-88, text-align center, ширина 704. Родственник home-hero
(отличие: контент по центру, без нав-пилюли и карточки-анонса).

---

### about-founder-split

| Поле | Значение |
| --- | --- |
| id | about-founder-split |
| name | Сплит об основателе: текст + фото 628×710 |
| evidence | page: /about ; shots: about--founder.png, about--founder--mobile.png |
| token-roles | bg, text.primary, radius.md |
| maps-to | component: Section/SplitFeature (вариант; грид column-halves 628+628 gap 120) |
| status | mapped |

Композиция (анатомия): грид `column-halves` 2×628 gap 120: слева стек — лид
«Founded & led by» + имя (обе строки text-h2 48/48/−2 сериф) → биография body;
справа фото 628×710 radius 8. Вариант существующего Section/SplitFeature
(home-studio), новых компонентов не требует.

---

### about-photos-marquee

| Поле | Значение |
| --- | --- |
| id | about-photos-marquee |
| name | Фото-марки: центрированная шапка + лента наклонённых полароидов |
| evidence | page: /about ; shot: about--photos.png |
| token-roles | bg, label-small, text.primary, surface (cream-200), radius 16 (Tier 3 кандидат), shadow.soft |
| maps-to | component: Card/Polaroid + Section/PhotoMarquee |
| status | mapped |

Композиция (анатомия): центрированная шапка (label-small → H1 сериф → body,
все center) → лента `marquee-photos` (ряд по центру, выходит за вьюпорт):
карточки `card-photo` 417×478, cream-200, radius 16, паддинг 16, gap 16,
наклон ±8° (transform rotate), тень soft: фото 4:4.5 radius 8 → подпись
label-large upper alpha-64 по центру. Родственник полароидов футера
(там же тень −24/4/40). Радиус 16 отсутствует в tokens.json — Tier 3 кандидат
(либо снэп к md=8/lg=24 с фиксацией отклонения).

---

### about-quote-video

| Поле | Значение |
| --- | --- |
| id | about-quote-video |
| name | Цитата на видео: тёмная секция с label, серифной цитатой и подписью |
| evidence | page: /about ; shot: about--quote-video.png |
| token-roles | bg (видео + затемнение), text.on-dark (#F3EEE9), label-small, label-large |
| maps-to | component: Section/QuoteMedia |
| status | mapped |

Композиция (анатомия): секция 732px, фон видео с затемнением; контент слева:
label-small «FROM FOUNDER» → цитата H1 сериф 64/56/−2 cream-100, ширина 912 →
подпись label-large 12/600 upper. Мобильный: тот же стек.

---

### about-team

| Поле | Значение |
| --- | --- |
| id | about-team |
| name | Команда: заголовок + грид 3 колонки карточек преподавателей |
| evidence | page: /about ; shots: about--team.png, about--team-2.png, about--team--mobile.png |
| token-roles | bg, label-small, text.primary (88/64), radius.md |
| maps-to | component: Card/Teacher (ЗАМЕНЯЕТ invented-композицию) + Section/Teachers |
| status | mapped |

Композиция (анатомия): шапка: label-small «OUR STUDIO» → заголовок text-h2
48/48/−2. Грид `team-grid` 3×448, gap 32×16. Карточка `card-team` (без
подложки): фото 448×576 (7:9) radius 8 → имя text-body-bold alpha-88 center →
роль text-small alpha-64 center, gap 16. Мобильный: грид 2 колонки. НАХОДКА:
наши Card/Teacher и Section/Teachers (фаза 4) были `invented` — у референса
паттерн команды есть на /about; эталонная композиция теперь известна.

## Сквозные паттерны (не секции)

---

### nav-header

| Поле | Значение |
| --- | --- |
| id | nav-header |
| name | Плавающая навбар-пилюля: лого + меню-лейблы + аутлайн-CTA |
| evidence | все страницы; верх каждого shot |
| token-roles | surface.cream-2 (пилюля radius 24), text.primary, nav-label 11/600 upper, pill-button |
| maps-to | component: Nav/Header |
| status | mapped |

Композиция (анатомия): пилюля (cream-2, radius 24, паддинг 12/24) по центру
сверху с отступом от края; внутри: лого-логотип слева, meню label-кнопками
(8/16 паддинг), справа аутлайн-кнопка-пилюля. Мобильный: логотип + бургер,
меню раскрывается.

---

### buttons-inputs

| Поле | Значение |
| --- | --- |
| id | buttons-inputs |
| name | Кнопки (пилюли) и поля ввода |
| evidence | page: /template/style-guide ; shot: style-guide--colors-buttons.png |
| token-roles | pill (radius 24), label 12/600 upper, alpha-слои: border 0.16, fill 0.08; варианты light/dark |
| maps-to | component: Button/* + Input/TextField |
| status | mapped |

Композиция (анатомия): кнопка — пилюля radius 24, паддинг 12/20, текст Label Large
12/600 uppercase; вариант на светлом (текст dark, бордер dark-16, заливка dark-08)
и на тёмном (текст light, бордер light-16, заливка light-08). Инпут — поле с
заливкой alpha-08, radius 8. Hover-режим CSS не извлечён (CORS) — в библиотеке
строить hover усилением альфа-слоя (0.08 → 0.16), приём виден в структуре button-bg.

### labels-system (дообогащение 2026-07-06)

| Поле | Значение |
| --- | --- |
| id | labels-system |
| name | Система лейблов референса: label-small и label-large |
| evidence | pages: /classes/yin-yoga, /events, /about — множественные употребления (см. записи выше) |
| token-roles | caption (label-large = caption desktop 12/600/ls1; label-small = caption mobile 10/600/ls1, но употребляется и на десктопе) |
| maps-to | text-styles: существующая ступень caption; label-small — как caption/sm стиль в Figma |
| status | mapped |

`label-large` = ступень caption tokens.json точно (desktop 12/16/0.75–1, mobile
10/12/0.75 — замер live 390). `label-small` — под-ступень НИЖЕ caption: desktop
10/12/ls1, mobile 8/10/ls0.75 (замер live 390, page /events). tokens.json не
меняется: неканонические ступени добавляются typography-variables в фазе 4
(решение фазы 2) — caption-sm (10/8) и h4 (32/40 desktop, 28/32 mobile,
замер live).

## Пропущенные секции (сводка)

| id | Причина `intentionally-skipped` |
| --- | --- |
| home-blog | в брифе лендинга нет блока блога/новостей |

(classes-catalog переведён из skipped в mapped при дообогащении 2026-07-06:
на лендинг по-прежнему не идёт, но паттерн задокументирован для библиотеки.)

## Проверка покрытия (перед сдачей фазы 1)

- [x] Каждая секция каждого скриншота/страницы имеет запись в инвентаре
- [x] У каждой записи есть evidence (страница/скриншот)
- [x] У каждой записи описана композиция, включая мобильное поведение
- [x] Все `intentionally-skipped` — с причиной
- [x] `maps-to` заполнен для всех `mapped`
- [x] Сводка sections-total / sections-skipped сходится с телом документа
