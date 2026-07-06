# Worklog — yoga-school-demo

<!-- Шаблон project/worklog.md (аналог agent-worklog Toolcraft).
     Скопировать в project/worklog.md при старте проекта и вести по ходу работы:
     запись делается В МОМЕНТ решения, а не задним числом (`worklog-required`). -->

## Шапка

| Поле | Значение |
| --- | --- |
| Проект | yoga-school-demo (тестовый прогон design-kit v1) |
| Дата старта | 2026-07-05 |
| Оператор | Руслан + агент (Claude Code) |
| Режим доступа | `figma-mcp` |

## Гейты

<!-- Прохождение гейта = строка здесь. Формулировка — дословные слова человека. -->

| Гейт | Дата | Кто утвердил | Формулировка утверждения |
| --- | --- | --- | --- |
| Гейт 1 — дизайн-система | 2026-07-05 | Руслан | «Утверждаю» (3-й заход: после specimen в Figma, замен шрифтов на кириллические и уборки белых заливок) |
| Гейт 2 — структура и контент | 2026-07-05 | Руслан | «Утверждаю» (10 секций, демо-факты приняты) |
| Гейт 3 — библиотека | 2026-07-05 | Руслан | «Утверждаю» (2-й заход: после 5 правок — центрирование манифеста, фон карточек, системный фикс переполнений, раскладка холста) |
| Гейт 4 — финальная приёмка | 2026-07-06 | Руслан | «Принимаю» (2-й заход: после центрирования заголовка FAQ) |
| Гейт дообогащения — список паттернов + Tier 3 | 2026-07-06 | Руслан | «Все 16» (состав библиотеки); «Внести все 3» (Tier 3: tag-цвета, alpha-0.32, радиус 16); «Добавить как варианты» (invented FaqItem/Card-Teacher не заменяются, референсные композиции — вариантами kind=reference, сданные макеты не трогаем) |
| Гейт дообогащения — библиотека | 2026-07-06 | Руслан | «Утверждаю» (1-й заход: фундамент + 4 дополненных сета + 11 базовых + 5 секционных) |

## Decision Trail

<!-- Формат записи (одна запись = один блок). Verification notes фаз — тоже сюда,
     с решением "verification note" и заполненным полем «Проверки / tier». -->

### [Фаза N] <краткий заголовок решения>

- **Дата:**
- **Запрос / задача:** что требовалось решить
- **Решение:** что выбрано
- **Источник / evidence:** откуда взято (ключ tokens.json, строка inventory,
  скриншот в reference-shots/, ответ человека)
- **Применённые rule ID:** `rule-id`, `rule-id`
- **Отвергнутые альтернативы:** что рассматривалось и почему отклонено
- **Проверки / tier:** tier изменения; что проверено, что пропущено и почему
- **Риски:** что может выстрелить позже; пусто — так и написать «нет»

### [Фаза 0] Preflight и инициализация проекта

- **Дата:** 2026-07-05
- **Запрос / задача:** тестовый прогон design-kit v1 полным циклом через все гейты.
- **Решение:** проект инициализирован копией комплекта (без library/ — читается из
  репо-источника). Референс: https://hollow-template.webflow.io/ (живой сайт →
  css-path). Продукт: лендинг школы йоги (см. inputs.md). Гейты 2 и 3 не объединяем
  с гейтом 1, хотя лендинг одностраничный — тестируем все гейты по отдельности.
- **Источник / evidence:** ответы оператора (AskUserQuestion, 2026-07-05); контракт
  и docs/workflow.md прочитаны (агент — их автор в этой же сессии, содержимое в контексте).
- **Применённые rule ID:** `worklog-required`, `gates-are-blocking`
- **Отвергнутые альтернативы:** объединение гейтов 1–3 (допустимо контрактом для
  1 страницы) — отклонено: цель прогона — проверить каждый гейт.
- **Проверки / tier:** Tier 0 (инициализация, файлы проекта); проверено создание
  структуры project/.
- **Риски:** референс — Webflow-шаблон: возможны утилитарные классы и инлайн-стили,
  извлечение CSS-переменных может дать мало — тогда упор на computed styles.

### [Фаза 1] Verification note

- **Дата:** 2026-07-05
- **Запрос / задача:** план фазы 1 (Reference Study, css-path).
- **Решение:** извлечение через chrome-devtools MCP (evaluate_script + скриншоты
  1440/390), по docs/extraction-css.md; выходы: reference-study.md,
  reference-inventory.md, reference-shots/.
- **Источник / evidence:** docs/workflow.md (таблица маршрутизации, фаза 1).
- **Применённые rule ID:** `reference-source-of-truth`, `font-license-check`
- **Отвергнутые альтернативы:** vision-путь — не нужен, сайт живой.
- **Проверки / tier:** Tier 0 для артефактов; чек-лист выхода из extraction-css.md.
- **Риски:** одностраничный шаблон Webflow может иметь дополнительные страницы
  (work/about) — осмотрим навигацию, инспектируем главную + 1–2 внутренние.

### [Фаза 1] Reference Study завершена (css-path, ran-original)

- **Дата:** 2026-07-05
- **Запрос / задача:** извлечь дизайн-систему из hollow-template.webflow.io.
- **Решение:** 5 страниц инспектировано (/, style-guide, timetable, classes, store);
  22 эталонных скриншота (8 секций главной ×2 ширины + внутренние); палитра,
  12-шаговая типографика, spacing base 4, радиусы, брейкпоинт ~768 — см.
  reference-study.md. Инвентарь: 13 паттернов, 2 intentionally-skipped.
- **Источник / evidence:** computed styles + авторский стайлгайд /template/style-guide;
  все значения с evidence в study.
- **Применённые rule ID:** `reference-source-of-truth`, `font-license-check`
- **Отвергнутые альтернативы:** vision-путь (не нужен — сайт живой); полагаться на
  cssRules (недоступны, CORS) — заменено computed-анализом.
- **Проверки / tier:** чек-лист выхода extraction-css.md пройден полностью;
  чек-лист покрытия inventory пройден. Buy-виджет Webflow исключён из замеров.
- **Риски:** hover-состояния не извлечены (CORS) — в фазе 4 строить на альфа-слоях
  (0.08→0.16); шрифт Libre Caslon Condensed нужно найти в Figma (Google Fonts).

### [Фаза 2] Дизайн-система как данные + фикс валидатора комплекта

- **Дата:** 2026-07-05
- **Запрос / задача:** собрать tokens.json и design-system.md из reference-study.
- **Решение:** палитра 11 примитивов (2 полюса + альфа-ступени a64/a16 + 4
  вспомогательных), режимы light/dark как инструмент секционной инверсии
  (тёмные секции events/footer референса); 7 канонических шагов typeScale
  (остальные ступени стайлгайда — в фазе 4); spacing base 4 шкала 4–160;
  радиусы 8/24/pill; 1 тень. Валидация: 0 errors, 4 warnings (плотный
  интерлиньяж серифов — фирменная пластика референса).
- **Источник / evidence:** reference-study.md §2–§6; стайлгайд референса.
- **Применённые rule ID:** `tokens-before-pixels`, `reference-source-of-truth`,
  `font-license-check`, `vision-values-snapped` (nav-label 11→12 снэп)
- **Отвергнутые альтернативы:** выдумать warning-цвет (запрещено) — совмещён с
  danger; кодировать все 12 ступеней шкалы в typeScale (формат требует 7
  канонических — остальные добавятся variables в фазе 4).
- **Проверки / tier:** node scripts/validate-tokens.mjs project/tokens.json →
  exit 0. Найден и исправлен дефект КОМПЛЕКТА: валидатор требовал lineHeight
  ≥1.0, а референс честно даёт 96/80=0.833 — диапазон расширен до 0.8–2.0 с
  WARN ниже 1.0 (исправлено в репо design-kit и в копии проекта).
- **Риски:** Libre Caslon Condensed должен быть доступен в Figma (Google Fonts);
  если вариативный Instrument Sans в Figma не даст weight 300 для h5/h6 —
  задокументировать фолбэк на 400 в фазе 4.

### [Гейт 1] Фидбек оператора: нужен визуальный specimen

- **Дата:** 2026-07-05
- **Запрос / задача:** оператор отказался утверждать систему по текстовому пакету:
  «не могу утвердить только на письменном описании — дай ссылку на Figma».
  Три открытых решения при этом утверждены (warning=danger; hover 0.08→0.16;
  пограничные контрасты ок).
- **Решение:** строим specimen в Figma ДО утверждения гейта 1: файл проекта,
  variables из tokens.json + страница-образец (палитра, шкала, кнопки, лейблы).
  Specimen — это визуализация токенов, а не библиотека/макеты, поэтому
  `tokens-before-pixels` не нарушается по духу; фазу 4 не начинаем до утверждения.
- **Источник / evidence:** ответ оператора на гейте 1 (AskUserQuestion).
- **Применённые rule ID:** `gates-are-blocking`, `tokens-before-pixels`
- **Отвергнутые альтернативы:** HTML-превью со скриншотом — оператор явно
  запросил Figma.
- **Проверки / tier:** —
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА: контракт должен требовать specimen как
  обязательный артефакт гейта 1 (внести в design-kit после прогона, фаза 7).

### [Гейт 1] Specimen в Figma + вынужденные замены шрифтов

- **Дата:** 2026-07-05
- **Запрос / задача:** построить визуальный specimen для гейта 1.
- **Решение:** файл Figma bkzr5tnd8LAsAwL38Zu0H1: variables (color.palette 11,
  color.semantic 11 ролей × light/dark alias, spacing 13, radius 4) + страница
  «01 Specimen» (палитра, type scale, кнопки/бейджи, образец тёмной секции).
  Две вынужденные замены шрифтов: (1) Libre Caslon Condensed отсутствует в
  Figma; (2) КРИТИЧНО — оба шрифта референса Latin-only, контент русский:
  рендер specimen показал фолбэк-гротеск вместо антиквы. Замены: heading →
  Cormorant Light (+ Light Italic для акцентов), body → Manrope. Оба OFL,
  кириллица, доступны в Figma. tokens.json и design-system.md обновлены,
  валидатор чист.
- **Источник / evidence:** listAvailableFontsAsync; скриншот specimen до/после.
- **Применённые rule ID:** `font-license-check`, `no-detached-values` (все
  заливки specimen через variables), `reference-source-of-truth`
- **Отвергнутые альтернативы:** Playfair Display (слишком контрастный/широкий),
  Golos Text (менее близок к Instrument Sans, чем Manrope), Inter (безликий).
- **Проверки / tier:** Tier 1; скриншот specimen после замены — антиква
  рендерится корректно, роли/режимы работают (тёмная секция инвертируется
  режимом dark).
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА №2: extraction-доки должны требовать
  проверку глифового покрытия шрифтов под язык КОНТЕНТА (референс может быть
  на другом языке). Внести в design-kit на фазе 7.

### [Гейт 1] Правка по фидбеку: лишние белые заливки

- **Дата:** 2026-07-05
- **Запрос / задача:** оператор указал на лишнюю белую заливку в specimen.
- **Решение:** дефолтные белые fills Figma-фреймов очищены у 26 контейнеров;
  кнопки переведены на новую роль fill-subtle (альфа 0.08 — извлечённая
  ступень референса, ранее не заведённая в палитру). tokens.json дополнен
  brown-a08 / cream-a08 + роль fill-subtle (light/dark), валидатор чист.
- **Источник / evidence:** скриншот оператора; reference-study §2 (альфа-система
  референса включает 0.08).
- **Применённые rule ID:** `no-detached-values`, `reference-source-of-truth`
- **Отвергнутые альтернативы:** оставить кнопки прозрачными (в референсе у
  кнопок есть слой заливки 0.08 — button-bg).
- **Проверки / tier:** Tier 1; скриншот после правки — белых плашек нет,
  кнопки корректны в обоих режимах.
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА №3: в figma-library-rules/скилл добавить
  правило «у createFrame/createAutoLayout дефолтная белая заливка — явно
  очищать или биндить» (внести на фазе 7).

### [Фаза 3] Контент-док из брифа (сценарий Б)

- **Дата:** 2026-07-05
- **Запрос / задача:** структура и тексты лендинга школы йоги из inputs.md.
- **Решение:** одностраничник, 10 секций: header-nav → hero → manifesto →
  directions → teachers → schedule → pricing → faq → cta (форма записи) →
  footer. Все обязательные блоки брифа покрыты; цель каждой секции — вести
  к записи на пробное. Вымышленные демо-факты помечены; 8 из 10 секций имеют
  аналог в референсе, teachers и faq — нет (уйдут в ветки 2/3 каскада).
- **Источник / evidence:** project/inputs.md (бриф); reference-inventory.md
  (маппинг); критерии полноты content-doc-format.md — чек-лист пройден.
- **Применённые rule ID:** `worklog-required`, `placeholders-for-assets`,
  `composition-cascade` (предзаполнение маппинга)
- **Отвергнутые альтернативы:** секция «впервые у нас» из референса
  (home-first-time) — не в брифе; её задача (снять страх новичка) закрыта
  FAQ и тоном hero/manifesto. Блог — не в брифе (intentionally-skipped ещё
  в фазе 1).
- **Проверки / tier:** Tier 0 (документ); чек-лист гейта 2 из
  content-doc-format.md пройден по пунктам.
- **Риски:** формы в референсе есть только в футере (newsletter) — форма
  записи в cta-секции будет комбинировать паттерны (карточка события +
  поля футера), возможен частичный invented.

### [Фаза 4] План библиотеки (до сборки)

- **Дата:** 2026-07-05
- **Запрос / задача:** зафиксировать состав библиотеки до первого создания.
- **Решение:** страница «02 Library». Донастройка фундамента: коллекция
  variables `typography` (режимы desktop/mobile: size/lineHeight/letterSpacing
  на 7 шагов) + текст-стили, привязанные к ним (авто-адаптив сменой режима);
  effect-стиль `soft`. Базовые компоненты (autolayout-адаптив, если не указано):
  Button (state=default|hover; из buttons-inputs), Badge (kind=accent|outline;
  из timetable), Input (state=default|focus; из buttons-inputs + форма футера),
  Card/Class (home-classes), Card/Teacher (invented: анатомия Card/Class),
  Card/Pricing (store-pricing), Card/ScheduleCell (timetable-schedule),
  ValueItem (home-about), FaqItem (invented: вопрос/ответ, аккордеон на мобиле),
  Nav/Header (viewport=desktop|mobile). Секционные компоненты (все
  viewport=desktop|mobile, из инстансов базовых): Section/Hero (home-hero),
  Section/Manifesto (home-about), Section/Directions (home-classes),
  Section/Teachers (invented, сетка по home-classes), Section/Schedule
  (timetable-schedule), Section/Pricing (store-pricing), Section/FAQ (invented),
  Section/CTA (home-events, режим dark), Section/Footer (home-footer, режим dark).
- **Источник / evidence:** reference-inventory maps-to; content-doc секции.
- **Применённые rule ID:** `instances-only`, `no-detached-values`,
  `composition-cascade`
- **Отвергнутые альтернативы:** два набора текст-стилей Desktop/*+Mobile/*
  (вместо привязки к variables с режимами) — оставлен как fallback, если
  биндинг стилей к variables не сработает.
- **Проверки / tier:** чек-лист figma-library-rules перед гейтом 3.
- **Риски:** invented-паттерны: Card/Teacher, FaqItem, Section/Teachers,
  Section/FAQ — приоритетный просмотр человеком на гейте 3.

### [Фаза 4] Библиотека собрана — verification note

- **Дата:** 2026-07-05
- **Запрос / задача:** сборка библиотеки по плану, самопроверка перед гейтом 3.
- **Решение:** собрано 10 базовых компонентов (Button, Badge, Input, Card/Class,
  Card/Teacher, Card/Pricing, Card/ScheduleCell, ValueItem, FaqItem, Nav/Header)
  и 9 секционных сетов с вариантами viewport=desktop|mobile. Мобильная
  типографика — переключением режима коллекции typography (стили привязаны к
  variables); тёмные секции (CTA, Footer) — режимом dark коллекции color.semantic.
- **Источник / evidence:** план библиотеки (запись выше); reference-inventory.
- **Применённые rule ID:** `no-detached-values`, `instances-only`,
  `composition-cascade`, `tokens-before-pixels`
- **Отвергнутые альтернативы:** два набора текст-стилей Desktop/Mobile —
  не понадобился, биндинг стилей к variables сработал.
- **Проверки / tier:** машинный аудит страницы 02 Library: 0 отвязанных
  fills/strokes, 0 фреймов без autolayout; коллекции: color.palette 13,
  color.semantic 12, spacing 13, radius 4, typography 24. Скриншоты Hero и CTA
  (оба вьюпорта) сняты; баг переполнения заголовка мобильной CTA найден
  скриншотом и исправлен (перенос на 340px).
- **Риски:** составные тексты legal-строки футера при переносе контента;
  расписание на мобиле длинное (проверить на сборке страницы).

### [Гейт 3] Правки по фидбеку оператора (заход 2)

- **Дата:** 2026-07-05
- **Запрос / задача:** 4 правки: (1) пункты манифеста не центрированы, разная
  ширина; (2) на мобиле пункты выходят за экран — сделать вертикально;
  (3) у карточек направлений нет фона (сливались с фоном секции);
  (4) переполнение текста на мобиле в teachers/pricing и, вероятно, ещё где-то;
  (5) сеты наложены друг на друга на холсте.
- **Решение:** (1) пункты фикс. ширины 220, контент центрирован; (2) мобильный
  вариант манифеста — вертикальный стек; (3) Card/Class: подложка surface +
  бордер + подпись фото-слота «[ ФОТО НАПРАВЛЕНИЯ ]» (заодно слот «[ ПОРТРЕТ ]»
  в Card/Teacher — по `placeholders-for-assets`); (4) системно: все
  heading/slogan во всех 16 вариантах секций — перенос по фиксированной ширине
  от ширины варианта (FILL в hug-контейнерах схлопывал текст — первый подход
  отвергнут скриншотом); wrap-safety в мастерах карточек; (5) все 19 сетов
  разложены вертикально с шагом 160.
- **Источник / evidence:** скриншоты оператора; контрольные скриншоты после
  правок (манифест оба вьюпорта, teachers mobile, directions desktop,
  pricing mobile).
- **Применённые rule ID:** `placeholders-for-assets`, `no-detached-values`
- **Отвергнутые альтернативы:** heading FILL — схлопывается в hug-родителях.
- **Проверки / tier:** Tier 1×5; скриншоты до/после по каждой правке.
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА №4: чек-лист фазы 4 должен требовать
  скриншот КАЖДОГО компонента в обоих вьюпортах до гейта (переполнения ловятся
  только рендером), плюс правило раскладки сетов на холсте без наложений.

### [Фаза 5] Сборка страниц + [Фаза 6] verification note

- **Дата:** 2026-07-05
- **Запрос / задача:** собрать home (desktop-1440, mobile-390) из инстансов; аудит.
- **Решение:** страница «03 Layouts», фреймы home/desktop-1440 (7491px) и
  home/mobile-390 (9986px), по 9 секций-инстансов. header-nav живёт внутри
  Section/Hero (композиция референса: плавающая пилюля на медиа). В футер
  добавлены полароид-слоты (заявлены в утверждённом контент-доке).
- **Источник / evidence:** content-doc порядок секций; таблица источников
  композиции ниже.
- **Применённые rule ID:** `instances-only`, `composition-cascade`
- **Отвергнутые альтернативы:** отдельный компонент header-nav верхнего уровня
  страницы — отклонено: в референсе нав внутри hero-медиа.
- **Проверки / tier:** машинный аудит: 9/9 секций-инстансов на обоих фреймах,
  0 не-инстансных детей, 23/23 контрольных текста контент-дока найдены;
  ранее: 0 отвязанных значений, autolayout везде. Скриншоты обеих страниц.
- **Риски:** нет.

### [Гейт 4] Правка: центрирование заголовка FAQ

- **Дата:** 2026-07-06
- **Запрос / задача:** оператор: заголовок секции FAQ должен быть отцентрирован.
- **Решение:** textAlignHorizontal=CENTER у heading в обоих вариантах Section/FAQ
  (после фикса переносов текст получил ширину блока, но остался выровнен влево
  при центрированном лейбле).
- **Источник / evidence:** скриншот оператора; контрольный скриншот после.
- **Применённые rule ID:** `worklog-required`
- **Отвергнутые альтернативы:** нет.
- **Проверки / tier:** Tier 1; скриншот desktop-варианта.
- **Риски:** нет.

### [Фаза 7] Harvest выполнен, находки внесены в комплект

- **Дата:** 2026-07-06
- **Запрос / задача:** пополнение накопительной библиотеки + внесение уроков.
- **Решение:** оператор утвердил всё: 9 скелетов секций (hero-fullbleed-media,
  manifesto-centered, cards-triple, team-cards, schedule-week, pricing-cards,
  faq-list-centered, cta-dark-form, footer-slogan-columns) + 3 схемы компонентов
  (button-pill-subtle, schedule-cell, faq-item) записаны в library/ репо
  design-kit. Четыре находки внесены в контракт и доки комплекта: specimen
  обязателен для гейта 1; трёхосевая проверка шрифтов (лицензия + глифы под
  язык контента + доступность в Figma); правило белой заливки Figma; скриншоты
  каждого компонента в обоих вьюпортах + раскладка холста. Коммит ad65855.
- **Источник / evidence:** утверждение оператора (harvest-is-curated).
- **Применённые rule ID:** `harvest-is-curated`
- **Отвергнутые альтернативы:** нет.
- **Проверки / tier:** git log репо комплекта; 12 новых файлов в library/.
- **Риски:** Figma team library (проекция) ещё не регенерирована — предложена
  оператору отдельным шагом.

### [Фаза 1×2] Verification note — дообогащение инвентаря после приёмки

- **Дата:** 2026-07-06
- **Запрос / задача:** оператор запросил дообогащение инвентаря и библиотеки из
  дополнительных страниц референса: /classes/yin-yoga, /timetable, /classes,
  /events, /event-category/past, /store, /about. Затем — новые компоненты в
  библиотеку (гейт), tokens.json не трогать без утверждения (Tier 3), в конце —
  предложить harvest.
- **Решение:** классификация: возврат в фазу 1 для новых страниц (css-path,
  chrome-devtools MCP, по extraction-css.md) + мини-фаза 4 Tier 2 (новые
  компоненты, токены не меняются). План: (а) обойти 7 страниц на 1440/390,
  эталонные скриншоты секций; (б) computed-извлечение для НОВЫХ паттернов —
  сверка значений с tokens.json; значения вне утверждённых шкал — кандидаты
  Tier 3, предъявляются отдельно, самовольно в tokens.json не вносятся;
  (в) дополнить reference-inventory.md; (г) остановка: список новых паттернов
  на утверждение оператору; (д) после утверждения — компоненты на страницу
  «02 Library» по figma-library-rules (скриншот каждого компонента в обоих
  вьюпортах, раскладка без наложений) → гейт; (е) предложение harvest.
- **Источник / evidence:** запрос оператора (2026-07-06); docs/workflow.md
  («референс добавили в середине проекта» + «правки после сдачи»).
- **Применённые rule ID:** `reference-source-of-truth`, `worklog-required`,
  `gates-are-blocking`, `tokens-before-pixels` (новые пиксели только после
  утверждения списка)
- **Отвергнутые альтернативы:** vision-путь — не нужен, сайт живой.
- **Проверки / tier:** Tier 2 (состав библиотеки); чек-лист extraction-css для
  новых страниц; повторное извлечение всей палитры/типографики пропускается —
  система утверждена гейтом 1, сверяем только новые значения.
- **Риски:** страницы /timetable, /classes, /store уже инспектировались —
  возможны дубли паттернов (инвентарь дополняется, не переписывается);
  /events и /event-category/past могут требовать CMS-контента Webflow
  (пустые коллекции); Figma MCP в этой сессии может требовать переавторизации.

### [Фаза 1×2] Дообогащение инвентаря завершено (css-path, ran-original)

- **Дата:** 2026-07-06
- **Запрос / задача:** извлечь паттерны с 7 дополнительных страниц референса.
- **Решение:** инспектированы /classes/yin-yoga, /events, /event-category/past,
  /about + ревизит /classes, /timetable, /store (1440/390). 25 новых эталонных
  скриншотов в reference-shots/. Инвентарь дополнен 14 паттернами + 1 переведён
  из skipped (classes-catalog, уточнена композиция: грид 2 кол., не строки).
  Две ключевые находки: у референса ЕСТЬ настоящие композиции FAQ
  (class-faq-accordion: cream-карточки) и команды (about-team: фото 7:9 + имя +
  роль) — наши FaqItem и Card/Teacher были invented и отличаются. Все значения
  сверены с tokens.json: совпадают с палитрой/шкалами, КРОМЕ кандидатов Tier 3
  (см. риски). label-small/label-large = caption mobile/desktop (новых ступеней
  не требуют); ступень h4 32/40/−1 — в variables фазы 4 по решению фазы 2.
- **Источник / evidence:** computed styles живого сайта (chrome-devtools MCP);
  все записи инвентаря с evidence страница+скриншот.
- **Применённые rule ID:** `reference-source-of-truth`, `worklog-required`
- **Отвергнутые альтернативы:** vision-путь (сайт живой); переписывание
  инвентаря целиком (дополнен инкрементально).
- **Проверки / tier:** чек-лист выхода extraction-css: переменные (без изменений,
  CORS как в фазе 1), новые значения с evidence, скриншоты десктоп+мобайл для
  всех новых секций, покрытие сводки сходится. /store и /timetable новых
  паттернов не дали (CTA-трио уже снято на детальной странице).
- **Риски / кандидаты Tier 3 (tokens.json НЕ менялся, ждут утверждения):**
  (1) цвета тегов уровней: beginner #F1F8E8, intermediate #EDE9F6, advanced
  #FFF2D9; (2) alpha-ступень 0.32 (вертикальные делители, тире времени);
  (3) радиус 16 (полароид card-photo). Без утверждения — снэп к существующим
  шкалам или исключение поимённо.

### [Tier 3] Аддитивное дополнение tokens.json (утверждено)

- **Дата:** 2026-07-06
- **Запрос / задача:** внести утверждённые Tier 3 кандидаты дообогащения.
- **Решение:** palette + mint-100 #F1F8E8, lavender-100 #EDE9F6, amber-100
  #FFF2D9, brown-a32 #594A3C52; роли tag-beginner/-intermediate/-advanced
  (оба режима, пастель не инвертируется) и border-strong (light: brown-a32;
  dark: снэп к cream-a16 — ступень .32 на тёмном не извлечена, выдумывать
  запрещено); radius md-lg=16. design-system.md дополнен.
- **Источник / evidence:** computed styles: tag-bg (/classes), divider-cms-body
  (/classes/yin-yoga), card-photo (/about); утверждение оператора «Внести все 3».
- **Применённые rule ID:** `reference-source-of-truth`, `gates-are-blocking`
- **Отвергнутые альтернативы:** имя радиуса «xl» (16 < lg=24 — путаница);
  cream-a32 в dark (нет evidence).
- **Проверки / tier:** Tier 3, но строго аддитивное: существующие примитивы,
  роли и привязки не менялись → полная инвалидация не требуется; валидатор
  0 errors / 5 warnings (5-й — известная неканоничность h5). Машинный аудит
  библиотеки будет прогнан после добавления компонентов (гейт дообогащения).
- **Риски:** контраст label на пастельных тегах — проверить скриншотом
  компонента до гейта.

### [Фаза 4×2] План дообогащения библиотеки (до сборки)

- **Дата:** 2026-07-06
- **Запрос / задача:** зафиксировать состав дообогащения библиотеки до создания.
- **Решение:** страница «02 Library», файл bkzr5tnd8LAsAwL38Zu0H1.
  Донастройка фундамента: variables palette +4 (mint-100, lavender-100,
  amber-100, brown-a32), semantic +4×2 режима (tag-beginner/-intermediate/
  -advanced, border-strong), radius +1 (md-lg=16), typography +2 ступени ×
  режимы desktop/mobile (h4: 32/40/−1 → 28/32/−1; caption-sm: 10/12/ls1 →
  8/10/ls0.75 — обе замерены live) + текст-стили h4, caption-sm.
  Базовые компоненты (autolayout-адаптив, если не указано): Button —
  ДОПОЛНЕНИЕ prop size=md|sm (sm: паддинг 8/16, из cta-small; ось state
  сохраняется); Tag (kind=meta|beginner|intermediate|advanced; meta —
  иконка 12 + caption-sm; уровни — плашка tag-* радиус md); Card/AuthorTile
  (class-detail-hero); TextBlock/Labeled (class-detail-body); Divider/Vertical
  (1×40, border-strong); Card/Feature (class-benefits); Card/Testimonial
  (class-testimonial); Card/CtaDark (class-cta-cards, режим dark, инстанс
  Button size=sm); Card/Event (card-events); Nav/FilterTabs (filter-tabs;
  элемент FilterTab state=default|current); Card/Polaroid (about-photos-marquee,
  радиус md-lg; наклон ±8° — на уровне употребления в секции, не в мастере);
  Card/ClassCatalog (classes-catalog, инстансы Tag); FaqItem — ДОПОЛНЕНИЕ
  вариантом kind=card (class-faq-accordion; существующий kind=list остаётся
  дефолтом); Card/Teacher — ДОПОЛНЕНИЕ вариантом kind=reference (about-team,
  фото 7:9 448×576, подписи по центру; существующий — дефолт); вариант
  Card/ScheduleCell kind=day-time (class-detail-timetable). Секционные
  (viewport=desktop|mobile, из инстансов базовых): Section/ClassHero
  (class-detail-hero), Section/StatementHero (about-statement-hero),
  Section/QuoteMedia (about-quote-video), Section/PhotoMarquee
  (about-photos-marquee), Section/SplitFeature (home-studio +
  about-founder-split — паттерн 1-й волны, в библиотеке отсутствовал).
  Сданные Section/FAQ и Section/Teachers НЕ трогаем (решение оператора
  «Добавить как варианты» — новые композиции живут вариантами базовых
  компонентов). Layout/CatalogSticky — не компонент; кандидат harvest
  (скелет). Раскладка новых сетов — вертикально ниже существующих, шаг 160,
  без наложений; скриншот каждого компонента в обоих вьюпортах до гейта.
- **Источник / evidence:** reference-inventory (дообогащение 2026-07-06);
  утверждение состава оператором («Все 16»).
- **Применённые rule ID:** `instances-only`, `no-detached-values`,
  `composition-cascade`, `manual-edits-respected` (перед правкой Button/
  FaqItem/Card-Teacher/ScheduleCell — дифф текущего состояния сетов)
- **Отвергнутые альтернативы:** оси kind у Section/FAQ и Section/Teachers
  (удвоение вариантов сданных секций — отклонено выбором оператора);
  Layout/CatalogSticky как компонент (это раскладка страницы, не компонент).
- **Проверки / tier:** Tier 2; чек-лист figma-library-rules перед гейтом.
- **Риски:** мутация 4 существующих сетов (Button, FaqItem, Card/Teacher,
  Card/ScheduleCell) — проверить, что дефолтные варианты и их употребления
  в «03 Layouts» не сместились (аудит + скриншоты секций FAQ/Teachers/
  Schedule/кнопок после правки).

### [Фаза 4×2] Дообогащение библиотеки собрано — verification note

- **Дата:** 2026-07-06
- **Запрос / задача:** сборка по плану дообогащения, самопроверка перед гейтом.
- **Решение:** собрано всё из плана. Фундамент: palette +4, semantic +4 ролей
  (light/dark), radius md-lg=16, typography h4 + caption-sm (desktop/mobile)
  + текст-стили h4, caption-sm, body-bold (вес-вариант ступени body: Manrope
  Medium на variables body/*; референс text-body-bold 16/24/500). Мутированы
  4 сета: Button → size=md|sm × state (sm: паддинги 8/16 из cta-small);
  FaqItem → kind=list|card × state (card: cream, radius md, паддинг 24,
  вопрос body-bold); Card/Teacher → kind=default|reference (reference: фото
  7:9, имя body-bold + роль по центру, без цитаты); Card/ScheduleCell →
  kind=class|day-time (день | делитель 1×32 border-strong | время).
  Новые базовые: Tag (kind=meta|beginner|intermediate|advanced),
  Card/AuthorTile, TextBlock/Labeled, Divider/Vertical, Card/Feature,
  Card/Testimonial, Card/CtaDark (режим dark + инстанс Button sm),
  Card/Event (wrap-адаптив контента, minWidth 280), FilterTab
  (state=default|current) + Nav/FilterTabs, Card/Polaroid (radius md-lg,
  тень soft), Card/ClassCatalog (инстансы Tag; заголовок — снэп к h5:
  ступени h6-sans 24 нет в утверждённой шкале). Секционные сеты
  viewport=desktop|mobile: Section/ClassHero, Section/StatementHero,
  Section/QuoteMedia, Section/PhotoMarquee (полароиды ±8°, лента
  обрезается краями — как в референсе), Section/SplitFeature.
- **Источник / evidence:** reference-inventory дообогащения; скриншоты
  каждого компонента в ходе сборки (оба вьюпорта у секций; сжатие
  инстансов до 342 у адаптивных карточек).
- **Применённые rule ID:** `no-detached-values`, `instances-only`,
  `composition-cascade`, `manual-edits-respected`, `placeholders-for-assets`
- **Отвергнутые альтернативы:** FILL-высота медиа Card/Event (schлопнулась —
  исправлено FIXED 464 после layoutMode); паддинг 64 у мобильной QuoteMedia
  (переполнение — заменён на 24); вертикальная раскладка сета FaqItem
  (наложение на Nav/Header — заменена wrap 2 колонки).
- **Проверки / tier:** Tier 2. Машинный аудит 21 корня: 0 отвязанных
  fills/strokes; 6 фреймов без autolayout — все декоративные линии
  (см. исключения); наложения сетов на холсте устранены (проверка
  пересечений: 0). 03 Layouts не пострадали: 38 инстансов мутированных
  компонентов на исходных вариантах (size=md / kind=list / kind=default /
  kind=class), высоты страниц прежние (7491 / 9986). Сжатие адаптивных
  карточек до 342 — переполнений нет (Card/Event исправлен wrap'ом).
- **Риски:** контраст caption-sm 8px на мобиле — минимальный кегль
  референса, показать оператору на гейте; полароиды на мобиле уходят
  за края ленты (аутентично референсу, но проверить глазами).

### [Фаза 7×2] Harvest дообогащения выполнен

- **Дата:** 2026-07-06
- **Запрос / задача:** пополнение накопительной библиотеки после дообогащения.
- **Решение:** оператор утвердил всё («Всё (12+9+4)»). Записано в library/
  репо design-kit: 12 скелетов (catalog-sticky, class-hero-tags,
  detail-labeled-blocks, benefits-cards-triple, testimonial-card-centered,
  faq-cards-accordion, cta-cards-trio, events-list-cards,
  statement-hero-centered, quote-on-media, photo-marquee-polaroids,
  split-feature-media), 9 схем компонентов (tag-pastel-level, author-tile,
  event-card, polaroid-card, filter-tabs-underline, feature-card-square,
  testimonial-card, cta-dark-card, class-catalog-card), 4 обновления
  (button-pill-subtle +size=sm; faq-item +kind=card; schedule-cell
  +kind=day-time; team-cards +референсная композиция). Пересечение
  split-feature-media с посевным hero-split проверено: hero-split — первый
  экран с CTA-рядом и social-proof, split-feature-media — секция середины
  страницы; оба остаются, границы применения прописаны в файлах.
- **Источник / evidence:** утверждение оператора; коммит 5573c6c в репо
  design-kit (25 файлов).
- **Применённые rule ID:** `harvest-is-curated`
- **Отвергнутые альтернативы:** дополнение hero-split вместо отдельного
  скелета (разные типы секций).
- **Проверки / tier:** git log репо комплекта; форматы файлов — по
  library/*/README.md.
- **Риски:** Figma team library (проекция) не регенерировалась после
  дообогащения — при следующей регенерации она перезапишется целиком из
  данных (исключение manual-edits-respected для файла-проекции).

## Источники композиции

<!-- Одна строка на секцию каждой страницы (`composition-cascade`).
     invented-секции человек смотрит в первую очередь. -->

| Страница / секция | Источник (`reference` / `library` / `invented`) | Evidence |
| --- | --- | --- |
| home/hero (+nav) | reference | inventory: home-hero, nav-header; shots home--hero*.png |
| home/manifesto | reference | inventory: home-about; shots home--about*.png |
| home/directions | reference | inventory: home-classes; shots home--classes*.png |
| home/teachers | invented | аналога нет; анатомия карточки — по Card/Class + сетка home-classes (запись «План библиотеки») |
| home/schedule | reference | inventory: timetable-schedule; shots timetable--schedule.png |
| home/pricing | reference | inventory: store-pricing (карточка) + сетка home-classes; shot store--pricing.png |
| home/faq | invented | аналога нет; список с делителями по альфа-системе референса |
| home/cta | reference (частично) | inventory: home-events (центрированная шапка тёмной секции); форма — по полям футера референса; см. риск фазы 3 |
| home/footer | reference | inventory: home-footer; shots home--footer*.png |

## Утверждённые исключения

<!-- Поимённый список отступлений от машинных правил: отвязанные значения
     (`no-detached-values`), фреймы без autolayout и пр. Аудит фазы 6 сверяется
     с этим списком. Нет записи здесь = ERROR аудита. -->

| Узел / место | Правило-исключение | Что именно отвязано | Мотивировка | Кто утвердил, дата |
| --- | --- | --- | --- | --- |
| Nav/Header > brand | `no-detached-values` | кегль 28 без текст-стиля | текст-логотип, не типографическая ступень | предъявлено на гейте 3 |
| Nav/Header (mobile) > burger | `no-detached-values` | кегль 20 без стиля | глиф-иконка ☰ | предъявлено на гейте 3 |
| Card/ScheduleCell (day-time) > divider | autolayout | фрейм-линия 1×32 без autolayout | фикс-геометрия делителя; заливка привязана (border-strong) | предъявлено на гейте дообогащения |
| FilterTab > underline (оба варианта + инстансы) | autolayout | фрейм-линия h=1 без autolayout | фикс-геометрия подчёркивания; заливка привязана (text) | предъявлено на гейте дообогащения |
| Section/PhotoMarquee > polaroid (инстансы) | без правила — фиксация приёма | rotation ±8° на инстансах | наклон полароидов — приём референса (/about, transform rotate 8deg); в мастере Card/Polaroid наклона нет | предъявлено на гейте дообогащения |
| Card/Feature, Card/CtaDark | без правила — фиксация | фиксированный размер 293×293 | квадратная пропорция карточек референса (event-features-thirds 293px) | предъявлено на гейте дообогащения |

## Ассеты-плейсхолдеры

<!-- По `placeholders-for-assets`: каждая картинка-заглушка описывается здесь. -->

| Секция | Описание желаемого ассета (сюжет, стиль, формат) |
| --- | --- |
| hero | фон: фото/видео практики в светлой студии, мягкий утренний свет, тёплая гамма, 16:9 (сейчас — цветовая подложка surface-alt) |
| manifesto | фон: расфокусированная тёплая фактура (ткань/дерево/свет), горизонтальный (сейчас — цвет bg) |
| directions | 3 фото 4:5: асаны по характеру направления (статика/динамика/расслабление), единая тёплая гамма — слоты «[ ФОТО НАПРАВЛЕНИЯ ]» |
| teachers | 3 портрета 4:5: естественный свет, нейтральный тёплый фон — слоты «[ ПОРТРЕТ ]» |
| cta | фон: тёплая темнота, силуэт практики (сейчас — тёмный bg режимом dark) |
| footer | 3 полароида: жизнь студии (занятия, чай после практики), квадратные — слоты «[ ФОТО ]» |
