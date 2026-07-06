# Extraction: CSS-путь (живой сайт)

Правила фазы 1 для референса-URL. Извлечение выполняется через управляемый браузер
(chrome-devtools MCP / claude-in-chrome), основной инструмент — `evaluate_script`.
Результат фиксируется в `project/reference-study.md` со статусом `ran-original`.

Действуют правила контракта: `reference-source-of-truth` (значения берутся только из
живого DOM, не «на глаз» со скриншота при доступном сайте) и `font-license-check`
(каждый найденный шрифт проверяется на лицензию до фазы 2).

## Порядок работы

1. Открыть сайт на десктопной ширине (1440px). Дождаться полной загрузки, закрыть
   cookie-баннеры/попапы — они искажают computed styles и скриншоты.
2. Извлечь данные по разделам ниже (переменные → палитра → типографика → spacing →
   радиусы/тени → брейкпоинты → сетка).
3. Повторить пункт 2 на мобильной ширине (390px) — минимум типографику и spacing.
4. Многостраничный сайт: обойти минимум главную + 1–2 внутренние страницы разных
   типов (например, каталог и статью). Ключевые состояния (hover кнопок, открытое
   меню, активный таб) инспектировать точечно.
5. Снять эталонные скриншоты (см. ниже).
6. Заполнить `reference-study.md` и `reference-inventory.md` по шаблонам.

## Evidence — обязательное правило

Каждое извлечённое значение фиксируется с evidence: **страница (URL), селектор,
сырое значение**. Значение без evidence не имеет права попасть в study.
Формат в артефакте: `#0F172A — body text (p, .prose), page: /`, `24px gap — card grid
(.cards), page: /pricing`.

## Что извлекать

### 1. CSS-переменные

Все custom properties из `:root`, `html`, `body` и тематических классов
(`.dark`, `[data-theme]`). Это самый надёжный сигнал авторской системы — если
переменные есть, они приоритетнее частотного анализа.

```js
() => {
  const out = {};
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; } // CORS
    for (const r of rules) {
      if (!r.selectorText || !/:root|html|body|\[data-theme|\.dark/.test(r.selectorText)) continue;
      for (const prop of r.style) if (prop.startsWith('--'))
        (out[r.selectorText] ??= {})[prop] = r.style.getPropertyValue(prop).trim();
    }
  }
  return out;
}
```

Cross-origin стили недоступны через cssRules — тогда снимать `getComputedStyle(document.documentElement)`
по известным именам переменных или переходить к computed-анализу ниже.

### 2. Палитра из computed styles

Обойти все видимые элементы, собрать цвета и сгруппировать по ролям:
**background / text / accent (кнопки, ссылки, активные состояния) / border**.
Для каждого цвета — частота и примеры селекторов (evidence).

```js
() => {
  const acc = {}; // color -> {count, roles:Set, samples:Set}
  const add = (c, role, sel) => {
    if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return;
    const e = acc[c] ??= { count: 0, roles: new Set(), samples: new Set() };
    e.count++; e.roles.add(role); if (e.samples.size < 3) e.samples.add(sel);
  };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const s = getComputedStyle(el);
    const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/)[0] : '');
    add(s.backgroundColor, 'background', sel);
    add(s.color, /^(a|button)$/i.test(el.tagName) ? 'accent' : 'text', sel);
    if (s.borderTopWidth !== '0px') add(s.borderTopColor, 'border', sel);
  }
  return Object.entries(acc).map(([c, e]) =>
    ({ color: c, count: e.count, roles: [...e.roles], samples: [...e.samples] }))
    .sort((a, b) => b.count - a.count).slice(0, 40);
}
```

### 3. Шкала типографики

Все уникальные комбинации `font-family / font-size / font-weight / line-height`
с частотой и списком элементов, где встречаются (h1…h6, p, a, button, li, label и т.д.).
Тот же паттерн обхода, ключ — `[fontFamily, fontSize, fontWeight, lineHeight].join('|')`,
в значении — count и до 5 примеров тегов/селекторов. Отдельно зафиксировать список
font-family (первый шрифт стека) для `font-license-check`.

### 4. Spacing-ритм

Частотный анализ значений `padding-*`, `margin-*`, `gap` по всем видимым элементам
(собрать в словарь `px → count`, отбросить 0). По топу частот определить базовый шаг
(обычно 4 или 8) и фактическую шкалу (например 8/16/24/32/48/64/96). Значения вне
шкалы отметить как выбросы с evidence.

### 5. Радиусы и тени

Уникальные `border-radius` и `box-shadow` с частотой и примерами элементов
(кнопка / карточка / инпут / модалка).

### 6. Брейкпоинты, контейнер, сетка

- Брейкпоинты — из media queries: обойти `document.styleSheets`, собрать
  `rule.conditionText` у `CSSMediaRule`, выписать уникальные min/max-width.
- Контейнер — `max-width` и горизонтальные паддинги основного wrapper'а.
- Сетка — число колонок и gap ключевых `display: grid/flex` секций.

### 7. Моушен (уровни A и B)

Моушен извлекается двумя уровнями достоверности (`docs/motion.md`, правило
`motion-observed-classified`). Результат — раздел «Моушен» в reference-study.md.

**Уровень A — детерминированное чтение CSSOM** (confidence `high`). Это чтение кода,
не наблюдение: читаем transitions, keyframes, `:hover`/`:focus` прямо из правил (курсор
наводить не нужно), sticky/fixed и подключённые библиотеки.

```js
() => {
  const out = { transitions: [], keyframes: [], hoverRules: [], sticky: [], libs: {} };
  const push = (arr, v) => { if (v && arr.length < 40 && !arr.includes(v)) arr.push(v); };
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (s.transitionDuration !== '0s')
      push(out.transitions, `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`);
    if (s.animationName !== 'none') push(out.keyframes, `${s.animationName} ${s.animationDuration} ${s.animationTimingFunction}`);
    if (s.position === 'sticky' || s.position === 'fixed') {
      const sel = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
      push(out.sticky, `${s.position}: ${sel}`);
    }
  }
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; } // CORS
    for (const r of rules) if (r.selectorText && /:hover|:focus/.test(r.selectorText)) push(out.hoverRules, r.selectorText);
    for (const r of rules) if (r.type === CSSRule.KEYFRAMES_RULE) push(out.keyframes, `@keyframes ${r.name}`);
  }
  out.libs = { gsap: !!window.gsap, ScrollTrigger: !!(window.ScrollTrigger || window.gsap?.ScrollTrigger),
    lenis: !!window.Lenis, aos: !!document.querySelector('[data-aos]'),
    framerMotion: !!document.querySelector('[data-framer-name],[style*="transform"][data-projection-id]') };
  return out;
}
```

Из уровня A берутся **реальные длительности и easing** — они пойдут в группу `motion`
tokens.json. Пометка: `source: css`.

**Уровень B — классификация поведения** (confidence `medium`, пометка обязательна).
Программный скролл страницы с сэмплированием `transform`/`opacity` ключевых секций;
результат — не значения, а имя паттерна из `library/motion/` («секция ведёт себя как
sticky-stack / horizontal-pan / reveal / stagger»). Числа для этого паттерна берутся из
уровня A или из дефолтов каталога, **не выдумываются из наблюдения**. Секции без моушена
в референсе моушена не получают (или получают уровень C на фазе 5 — изобретение).

## Эталонные скриншоты

Каждая видимая секция каждой инспектируемой страницы → скриншот в
`project/reference-shots/`, имена `<page>--<section>.png`
(например `home--hero.png`, `pricing--faq.png`). Каждую секцию снимать на двух
ширинах: десктоп 1440px и мобильная 390px (мобильные — с суффиксом `--mobile`).
Эти скриншоты — эталон для QA фазы 6, не источник значений (`reference-source-of-truth`).

## Чек-лист выхода

- [ ] CSS-переменные сняты (или зафиксировано, что их нет / недоступны из-за CORS)
- [ ] Палитра сгруппирована по ролям, каждый цвет с evidence
- [ ] Типографика: все комбинации с частотой и элементами; шрифты — в проверку лицензий
- [ ] Spacing: частотная таблица, базовый шаг, шкала, выбросы
- [ ] Радиусы, тени, брейкпоинты, контейнер/сетка зафиксированы
- [ ] Иконки: стиль зафиксирован (вес, штрих, размер) → выбор веса Reicon (docs/icons.md §Фаза 1)
- [ ] Моушен: уровень A (CSSOM: transitions/keyframes/hover/sticky/libs) снят; уровень B — классификация паттернов, значения не выдуманы
- [ ] Несколько страниц/состояний покрыты (или сайт одностраничный — отмечено)
- [ ] Скриншоты всех секций в reference-shots/, десктоп + мобайл
- [ ] reference-study.md заполнен, статус `ran-original`

## Языковое покрытие шрифтов (урок прогона yoga-school-demo)

Референс может быть на другом языке, чем контент проекта. Для каждого найденного
шрифта проверять не только лицензию (`font-license-check`), но и:

- глифовое покрытие под язык КОНТЕНТА (кириллица и т.д.) — Latin-only шрифт при
  русском контенте Figma молча заменит фолбэком, это видно только рендером;
- доступность семейства в шрифтовой библиотеке Figma (`listAvailableFontsAsync`).

Провал любой оси → подбор аналога по характеру, замена фиксируется в design-system.md.
