# Worklog — opora-pencil

<!-- Шаблон project/worklog.md (аналог agent-worklog Toolcraft).
     Скопировать в project/worklog.md при старте проекта и вести по ходу работы:
     запись делается В МОМЕНТ решения, а не задним числом (`worklog-required`). -->

## Шапка

| Поле | Значение |
| --- | --- |
| Проект | opora-pencil (обкатка пути Pencil на продукте yoga-school-demo) |
| Дата старта | 2026-07-06 |
| Оператор | Руслан + агент (Claude Code) |
| Режим доступа | `pencil` (Pencil 1.1.68 desktop + Pencil MCP; без Figma MCP) |

## Гейты

| Гейт | Дата | Кто утвердил | Формулировка утверждения |
| --- | --- | --- | --- |
| Гейт 1 — дизайн-система | 2026-07-05 | Руслан | пройден в исходном прогоне yoga-school-demo; артефакты переиспользованы без изменений |
| Гейт 2 — структура и контент | 2026-07-05 | Руслан | пройден в исходном прогоне; content-doc.md переиспользован без изменений |
| Гейт 3 — библиотека (компоненты .pen) | 2026-07-06 | Руслан | «В целом, всё ок. Приемка пройдена» (после отложенной приёмки: сначала «Пока не буду делать сравнение своими глазами», затем просмотр и приёмка одним пакетом с гейтом 4) |
| Гейт 4 — финальная приёмка (макеты .pen) | 2026-07-06 | Руслан | «Приемка пройдена» (в пакете с гейтом 3; правок нет) |

## Decision Trail

### [Фаза 0] Происхождение артефактов + окружение Pencil

- **Дата:** 2026-07-06
- **Запрос / задача:** обкатать путь Pencil (фазы 4–6) на «Опоре»; фазы 1–3 не
  пересобирать.
- **Решение:** проект скаффолжен create-project.mjs (комплект v1.0-3-g5ceb730);
  артефакты фаз 1–3 скопированы 1:1 из examples/yoga-school-demo (утверждены
  гейтами 1–2 исходного прогона). Рабочий .pen: оператор создал
  `~/Documents/pencil.dev/opora-yoga-demo.pen` (открыт в Pencil desktop);
  `open_document` в desktop-приложении не работает («No handler found») —
  работаем в открытом файле, по завершении копия кладётся в
  `project/opora-yoga-demo.pen` (артефакт проекта). MCP-доступ: серверу нужен
  флаг `--app desktop` (сессионный сервер Claude привязан к visual_studio_code
  и не видит standalone-приложение) — поднят локальный экземпляр
  `~/.pencil/mcp/*/out/mcp-server-darwin-x64 -app desktop -http`.
- **Источник / evidence:** сообщение оператора; ps-лист процессов Pencil;
  ошибка транспорта MCP.
- **Применённые rule ID:** `worklog-required`, `gates-are-blocking`
- **Отвергнутые альтернативы:** пересоздание файла в project/ с открытием через
  MCP (open_document недоступен); просьба к оператору переоткрыть файл из
  project/ (лишний цикл; перенос копией эквивалентен — .pen самодостаточный JSON).
- **Проверки / tier:** Tier 0; get_editor_state видит документ.
- **Риски:** правки оператора в файле во время сессии (Pencil multiplayer) —
  перед аудитом перечитывать состояние.

### [Этап A] Изучение Pencil до сборки

- **Дата:** 2026-07-06
- **Запрос / задача:** гайдлайны/инструменты Pencil MCP + сверка с Context7;
  таблица соответствия с доками design-kit.
- **Решение:** см. project/pencil-mapping.md. Ключевое: variables с осями тем
  (mode: light/dark; viewport: desktop/mobile — зеркало режимов Figma-коллекций);
  reusable+ref = компоненты/инстансы с override'ами; вариант-сетов НЕТ
  (конвенция имён `X/Variant`); wrap НЕТ (гриды — ручные ряды); текст-стилей
  НЕТ (ступень = связка number-переменных); аудит — search_all_unique_properties;
  экспорт — export_nodes. .pen = открытый JSON v2.14 (не «encrypted», вопреки
  инструкции MCP). Гайдлайны Pencil сами требуют $-переменные и переиспользование
  компонентов — контракту не противоречат; их каталог стилей игнорируем
  (`reference-source-of-truth`).
- **Источник / evidence:** get_guidelines (index + Landing Page + Design System),
  get_editor_state include_schema; Context7 /websites/pencil_dev.
- **Применённые rule ID:** `reference-source-of-truth`, `worklog-required`
- **Отвергнутые альтернативы:** использовать стиль-пресеты Pencil (запрещено:
  система из tokens.json).
- **Проверки / tier:** —
- **Риски:** git-версионируемость .pen проверить на практике (размер/шум диффа).

### [Фаза 4-pen] План библиотеки (ДО сборки)

- **Дата:** 2026-07-06
- **Запрос / задача:** состав компонентов .pen до первого создания (зеркало
  плана исходного прогона, масштаб — лендинг home).
- **Решение:**
  - **Специмен-проверка (не гейт):** фрейм «00 Specimen» — палитра-свотчи,
    ступени шкалы кириллицей, кнопка/бейджи, тёмный образец. Цель: поймать
    отсутствие глифов/шрифтов в Pencil до компонентов (аналог урока specimen;
    гейт 1 уже пройден — фрейм предъявляется на гейте 3 справочно).
  - **Variables (SetVariables, имена 1:1 с tokens.json):** palette-* (17);
    роли color-* с осью mode (16 × light/dark); font-heading/-heading-italic/
    -body (string); text-<step>-size/-line/-ls с осью viewport
    (8 ступеней × desktop/mobile; ls в px = em×size); space-* (13);
    radius-* (4 + pill=999). Вес ступени — в компонентах (string-переменные
    weight не заводим: вес не темируется, weight-вариант body-bold = отдельная
    настройка текста, как в исходном прогоне).
  - **Базовые компоненты (reusable):** Button (пилюля 12/20, caption-текст;
    hover-состояние непредставимо — образец «Button/Hover Spec» на странице
    компонентов, документирует правило альфа 0.08→0.16); Badge/Accent;
    Badge/Outline; Input; Card/Class; Card/Teacher (invented, анатомия
    Card/Class); Card/Pricing; Card/ScheduleCell; ValueItem; FaqItem
    (kind=list как в сданном исполнении); Nav/Header (desktop) и
    Nav/Header (mobile) — композиции реально разные.
  - **Секционные компоненты:** Section/<Name> (desktop) + (mobile) для hero,
    manifesto, directions, teachers, schedule, pricing, faq, cta, footer —
    из инстансов базовых; тёмные (cta, footer) — theme:{mode:"dark"} на корне.
  - **Страницы:** фреймы `home/desktop-1440` (1440) и `home/mobile-390` (390),
    вертикальный layout, только инстансы секционных компонентов
    (`instances-only`); mobile-фрейм с theme:{viewport:"mobile"} — типографика
    переключается осью тем.
  - Раскладка холста: компоненты сверху (FindEmptySpace), страницы ниже;
    без наложений; placeholder: true на время сборки корневых фреймов.
- **Источник / evidence:** план библиотеки исходного прогона (examples worklog);
  reference-inventory maps-to; content-doc; pencil-mapping.md (ограничения).
- **Применённые rule ID:** `instances-only`, `no-detached-values`,
  `composition-cascade`, `tokens-before-pixels`
- **Отвергнутые альтернативы:** секции прямо во фреймах страниц (ломает
  паритет instances-only с Figma-исполнением); ось тем для секционных паддингов
  (новый токен — не заводим без Tier 3); Generate ai/stock для плейсхолдеров
  (запрещено placeholders-for-assets).
- **Проверки / tier:** Tier 4 по завершении; чек-лист фазы 4 в терминах Pencil:
  скриншот каждого компонента (get_screenshot), аудит
  search_all_unique_properties (сырые hex/шрифты вне $-переменных), snapshot_layout
  на переполнения, полнота секций/текстов против content-doc.
- **Риски:** кириллица Cormorant/Manrope в рендере Pencil (проверка специменом);
  letterSpacing в px может округляться; производительность больших batch_design.

### [Фаза 4-pen] Инфраструктурные находки при подключении (до сборки)

- **Дата:** 2026-07-06
- **Запрос / задача:** заставить Pencil MCP работать со standalone-приложением.
- **Решение:** три обхода: (1) MCP-сервер сессии привязан к `visual_studio_code` —
  поднят свой с `-app desktop`; (2) бинарник `~/.pencil/mcp/...` (сборка 02.06)
  отдаёт ПУСТЫЕ рендеры (get_screenshot/export_nodes — однотонный фон) — рабочий
  бинарник лежит в `Pencil.app/Contents/Resources/app.asar.unpacked/out/`
  (сборка 01.07, только stdio, флага -http нет); (3) stdio-сервер обрезает
  строки ~4КБ — batch_design дробить до ~3КБ JS.
- **Источник / evidence:** сравнение рендеров двух бинарников на одном узле;
  ошибка «flag provided but not defined: -http».
- **Применённые rule ID:** `worklog-required`
- **Отвергнутые альтернативы:** просить оператора чинить конфиг MCP вручную.
- **Проверки / tier:** тест-нода с сырым hex + переменной + кириллицей.
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА №1: в docs/pencil-path.md — раздел
  «диагностика подключения» (app-транспорты, свежесть бинарника, лимит батча).

### [Фаза 4-pen] Специмен-проверка + сборка библиотеки — verification note

- **Дата:** 2026-07-06
- **Запрос / задача:** variables → специмен → 12 базовых + 18 секционных
  компонентов по плану.
- **Решение:** variables сгенерированы скриптом из tokens.json (77 шт., оси
  mode/viewport; letterSpacing в px = em×size по режимам). Фрейм «00 Specimen»:
  кириллица Cormorant/Manrope рендерится, курсив есть, инверсия mode=dark
  работает — глиф-риск снят. Базовые: Button, Badge/Accent, Badge/Outline,
  Input, ValueItem, FaqItem, Card/Class, Card/Teacher, Card/Pricing,
  ScheduleCell (вложенные ref-бейджи; outline-уровень — подмена узла через
  descendants type-replacement), Nav desktop/mobile. Секционные: 9×2 по плану;
  тёмные — theme mode=dark; мобильные мастера — theme viewport=mobile.
  Отклонение от плана: переменная font-heading-italic не заводилась — курсив
  задаётся fontStyle:"italic" при том же семействе (rich-text в Pencil нет,
  акценты — составными текст-рядами).
- **Источник / evidence:** get_screenshot специмена и каждого компонента;
  вывод batch_design.
- **Применённые rule ID:** `tokens-before-pixels`, `no-detached-values`,
  `instances-only`, `composition-cascade`, `placeholders-for-assets`,
  `font-license-check` (рендер-проверка глифов специменом)
- **Отвергнутые альтернативы:** стиль-пресеты Pencil (reference-source-of-truth);
  Generate ai/stock для слотов (запрещено).
- **Проверки / tier:** Tier 4; скриншоты компонентов; snapshot_layout.
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА №2: ref на КОРНЕВОЙ reusable-фрейм не
  рендерится (пустой кадр) — мастера держать внутри контейнер-фрейма
  («02 Sections»), тогда инстансы рендерятся. НАХОДКА №3: при ресайзе
  контейнера соседние корневые ноды геометрически «всасываются» в него
  (мобильная страница припарковалась внутрь) — после ресайзов проверять корень.

### [Фаза 5-pen] Страницы — verification note

- **Дата:** 2026-07-06
- **Запрос / задача:** home/desktop-1440 и home/mobile-390 из инстансов секций.
- **Решение:** обе страницы — вертикальные фреймы, дети только ref-инстансы
  9 секций; мобильная — theme viewport=mobile (типографика переключается осью).
  Высоты: 8439 / 11411.
- **Источник / evidence:** get_screenshot страниц; snapshot_layout.
- **Применённые rule ID:** `instances-only`, `composition-cascade`
- **Отвергнутые альтернативы:** сборка секций прямо в страницах (ломает
  паритет instances-only).
- **Проверки / tier:** Tier 4; порядок секций = content-doc.
- **Риски:** нет.

### [Фаза 6-pen] Верификация — verification note

- **Дата:** 2026-07-06
- **Запрос / задача:** три слоя docs/verification.md средствами Pencil.
- **Решение:** (1) аудит: search_all_unique_properties в desktop-приложении
  НЕ реализован («No handler found») — аудит скриптом по JSON документа
  (audit-pen.mjs): 0 сырых цветов/шрифтов/кеглей/радиусов; 125 gap/padding
  привязаны к $space-* (изначально были числами — поймано аудитом); тексты
  76/76; instances-only чист; (2) snapshot_layout: пойманы и исправлены
  переполнения FAQ-mobile и слогана футера-mobile; остаточный clip — лента
  полароидов (реф-аутентично); (3) отчёт project/verification-report.md.
  Скриншоты 22 узлов в verification-shots/ (flaky: часть вызовов с 2-3 попытки;
  между вызовами нужны паузы, иначе сервер отдаёт обзор холста вместо узла).
  Экспорт: export_nodes на страницах 1440×8439 падает/виснет (секции — ок);
  export_html страницы работает (229КБ).
- **Источник / evidence:** audit-report.json; layout-final2.json;
  verification-shots/.
- **Применённые rule ID:** `no-detached-values`, `worklog-required`,
  `composition-cascade`
- **Отвергнутые альтернативы:** аудит только глазами (нечестно при живом JSON).
- **Проверки / tier:** Tier 4.
- **Риски:** НАХОДКА ДЛЯ КОМПЛЕКТА №4: инструментарий MCP различается между
  бинарниками/приложениями Pencil (desktop без open_document и
  search_all_unique_properties; свежий сервер без set_variables как
  отдельного тула, но с export_html) — pencil-path.md должен давать
  fallback-аудит по JSON. НАХОДКА №5: рабочий .pen сохраняется приложением
  не сразу — перед git-коммитом просить оператора Cmd+S (актуальное
  состояние живёт в ~/.pencil/backup/<hash>).

### [Фаза 7] Harvest выполнен (режим владельца; гейты 3–4 прогона отложены)

- **Дата:** 2026-07-06
- **Запрос / задача:** оформить путь Pencil в комплект (этап C) по решению
  владельца; визуальная приёмка прогона отложена оператором.
- **Решение:** новых паттернов в library/ нет (тот же продукт). В комплект
  внесено: docs/pencil-path.md (диагностика подключения, variables с осями тем,
  компоненты без вариант-сетов, аудит по JSON, deliverable, таблица
  соответствия гайдлайнов — все 5 находок этого worklog);
  scripts/tokens-to-pen-vars.mjs; режим `pencil` в контракт/workflow/шаблон
  worklog/скилл; README-матрица выбора пути (факты о Pencil перепроверены:
  free early access, macOS/Windows-x64/Linux, веб-версии нет, ИИ через
  подписку Claude, .pen — открытый JSON); ONBOARDING — блок Windows.
- **Источник / evidence:** записи «НАХОДКА ДЛЯ КОМПЛЕКТА» №1–5;
  pencil-mapping.md; WebSearch/WebFetch pencil.dev (2026-07-06).
- **Применённые rule ID:** `harvest-is-curated`, `gates-are-blocking`
  (статус гейтов зафиксирован честно: не пройдены, отложены)
- **Отвергнутые альтернативы:** ждать приёмки прогона перед оформлением
  (владелец явно распорядился стартовать этап C).
- **Проверки / tier:** генератор pen-vars прогнан на examples-токенах (smoke).
- **Риски:** ~~если приёмка гейтов 3–4 вернёт правки — pencil-path.md может
  потребовать уточнений~~ — снят: гейты 3–4 приняты 2026-07-06 без правок
  (см. таблицу гейтов), pencil-path.md актуален.

## Источники композиции

| Страница / секция | Источник (`reference` / `library` / `invented`) | Evidence |
| --- | --- | --- |
| home/hero (+nav) | reference | inventory: home-hero, nav-header |
| home/manifesto | reference | inventory: home-about |
| home/directions | reference | inventory: home-classes |
| home/teachers | invented | = сданное Figma-исполнение (анатомия Card/Class + сетка home-classes) |
| home/schedule | reference | inventory: timetable-schedule |
| home/pricing | reference | inventory: store-pricing + сетка home-classes |
| home/faq | invented | = сданное Figma-исполнение (список с делителями) |
| home/cta | reference (частично) | inventory: home-events; форма — по полям футера |
| home/footer | reference | inventory: home-footer |

## Утверждённые исключения

| Узел / место | Правило-исключение | Что именно отвязано | Мотивировка | Кто утвердил, дата |
| --- | --- | --- | --- | --- |
| Nav/Header > brand | `no-detached-values` | кегль 28 вне ступеней | текст-логотип (= исключение исходного прогона) | предъявить на гейте 3 |
| Nav/Header (mobile) > burger | `no-detached-values` | глиф ☰, кегль 20 | = исключение исходного прогона | предъявить на гейте 3 |
| effect.shadow компонентов Polaroid | `no-detached-values` | геометрия тени (-24/4/40) числами | в Pencil нет эффект-стилей; цвет тени привязан к palette-переменной | предъявить на гейте 3 |
| ширины переноса заголовков/колонок | `no-detached-values` | фиксированные ширины (аналог блока геометрии HTML-пути) | геометрия макета, не токены | предъявить на гейте 3 |
| составные заголовки (h1/h2/display row) | `no-detached-values` | gap 9–14px между словами | ширина пробела между обычной и курсивной частью (в Pencil нет rich-text) — типографская геометрия | предъявить на гейте 3 |
| капс лейблов/CTA | тексты дословно | «НАПРАВЛЕНИЯ», «ЗАПИСАТЬСЯ…» капсом в контенте | в Pencil нет text-transform; капс = стиль лейблов референса, регистр источника сохранён в content-doc | предъявить на гейте 3 |

## Ассеты-плейсхолдеры

| Секция | Описание желаемого ассета (сюжет, стиль, формат) |
| --- | --- |
| hero | фон: фото/видео практики в светлой студии, мягкий утренний свет, тёплая гамма, 16:9 (в .pen — заливка surface-alt) |
| manifesto | фон: расфокусированная тёплая фактура, горизонтальный (в .pen — цвет bg) |
| directions | 3 фото 4:5 — слоты «[ ФОТО НАПРАВЛЕНИЯ ]» |
| teachers | 3 портрета 4:5 — слоты «[ ПОРТРЕТ ]» |
| cta | фон: тёплая темнота (в .pen — тёмный bg темой dark) |
| footer | 3 полароида: жизнь студии, квадратные — слоты «[ ФОТО ]» |
