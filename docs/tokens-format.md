# Формат tokens.json

Схема файла `project/tokens.json` — машинного источника правды дизайн-системы (фаза 2).
Всё, что попадает в Figma variables (фаза 4) и HTML-прототип (fallback), генерируется
из этого файла. Человекочитаемое объяснение значений — `project/design-system.md`
(шаблон `templates/design-system.md`); при расхождении прав tokens.json.

Валидация: `node scripts/validate-tokens.mjs project/tokens.json` — обязана пройти
без ошибок до предъявления гейта 1. Полный валидный пример — `templates/tokens.example.json`.

Язык: все ключи и имена токенов — английские, kebab-case (`text-muted`, `body-lg`).

## Главный принцип: примитивы → роли → компоненты

Три уровня, ссылки только «вниз»:

1. **Примитивы** (`color.palette`) — сырые значения, извлечённые из референса:
   `blue-700: #2450C7`. Примитив ничего не знает о своём применении.
2. **Семантические роли** (`color.roles` / `color.modes`) — назначение: `accent`,
   `text-muted`, `border`. Роль не содержит собственного значения — только `ref`
   на имя примитива из palette.
3. **Компоненты** (фаза 4) используют **только роли**, никогда примитивы напрямую.
   Кнопка красится в `accent`, не в `blue-700`.

Зачем: смена палитры (или режима light/dark) — это переназначение `ref`'ов ролей,
компоненты не трогаются. Аудит фазы 6 (`no-detached-values`) проверяет привязку
именно к ролям.

## Формат значения (value node)

Любое листовое значение записывается либо коротко, либо объектом с происхождением:

```json
"base": 4
```

```json
"base": { "value": 4, "source": "css" }
```

```json
"pill": { "value": 999, "source": "vision", "confidence": "medium" }
```

- `source`: `"css"` (извлечено из живого DOM, extraction-css.md) или `"vision"`
  (снято с картинки, extraction-vision.md).
- `confidence`: `"high" | "medium" | "low"` — **обязательно** при `source: "vision"`
  (правило `vision-values-snapped`). Для `source: "css"` не нужно.
- `confidence: "low"` валидатор помечает предупреждением — такие значения человек
  смотрит на гейте 1 в первую очередь.

Валидатор понимает оба написания везде, где ниже стоит конкретное число или строка.

## Верхний уровень

```json
{
  "meta": { ... },
  "color": { ... },
  "typography": { ... },
  "spacing": { ... },
  "radius": { ... },
  "shadows": { ... },
  "breakpoints": { ... },
  "grid": { ... },
  "motion": { ... }
}
```

Первые восемь разделов обязательны. Девятый — `motion` — **опциональный**: он есть
только у анимируемого проекта (`docs/motion.md`); статический проект и проекты,
созданные до появления группы, валидны без него.

### meta

| Поле | Тип | Описание |
| --- | --- | --- |
| `project` | string | Имя проекта. |
| `sourceRefs` | string[] | Референсы (URL и/или файлы), из которых извлечена система. Непустой массив. |
| `extractionMethod` | `"css" \| "vision" \| "mixed"` | Путь извлечения фазы 1. |
| `date` | string | Дата фиксации, `YYYY-MM-DD`. |

### color

```json
"color": {
  "palette": {
    "white":    { "value": "#FFFFFF", "source": "css" },
    "blue-700": { "value": "#2450C7", "source": "css" }
  },
  "roles": {
    "bg":   { "ref": "white" },
    "accent": { "ref": "blue-700" }
  },
  "modes": {
    "light": { "bg": { "ref": "white" }, ... },
    "dark":  { "bg": { "ref": "ink-950" }, ... }
  }
}
```

- `palette` — примитивы. Имена: `семейство-градация` (`ink-900`, `gray-300`) или
  простые (`white`). Значения — hex `#RRGGBB` (для валидатора контрастов допустим
  и `#RGB`; прозрачность в примитивах палитры не используется — композиты
  раскладываются на этапе извлечения).
- `roles` — карта роль → `{ "ref": "<имя примитива>" }`. Допустима краткая запись
  строкой (`"bg": "white"`), но рекомендуется объект — в него можно добавить
  `source`/`confidence`.
- **Обязательный минимальный набор ролей** (валидатор требует каждую):
  `bg`, `surface`, `text`, `text-muted`, `accent`, `accent-contrast`, `border`,
  `success`, `warning`, `danger`.
  Дополнительные роли (например `accent-hover`, `surface-raised`) — по необходимости,
  но каждая обязана ссылаться на примитив.
- `modes` — опционально. Если тем нет, заполняется только `roles` (единственный режим).
  Если режимы есть (`light`/`dark`), **каждый** режим содержит полный набор
  обязательных ролей; верхнеуровневый `roles` тогда можно не писать. Валидатор
  проверяет полноту ролей, разрешимость `ref`'ов и WCAG-контрасты в каждом режиме
  отдельно.

Контрасты (WCAG 2.1, проверяются валидатором в каждом режиме):

| Пара | Минимум | Смысл |
| --- | --- | --- |
| `text` / `bg` | 4.5 | Основной текст читается (AA, normal text). |
| `text-muted` / `bg` | 3.0 | Вторичный текст различим (AA, large/secondary). |
| `accent-contrast` / `accent` | 4.5 | Текст на акцентных кнопках читается. |

### typography

```json
"typography": {
  "fontFamilies": {
    "heading": {
      "family": "Space Grotesk",
      "fallback": "system-ui, sans-serif",
      "license": "SIL OFL 1.1 (Google Fonts); font-license-check passed 2026-07-05",
      "replacedFrom": "Söhne — коммерческий, лицензии нет",
      "source": "css"
    },
    "body": { "family": "Inter", "fallback": "system-ui, sans-serif", "license": "..." }
  },
  "typeScale": {
    "body": {
      "desktop": { "size": 16, "lineHeight": 1.6, "weight": 400, "letterSpacing": 0 },
      "mobile":  { "size": 15, "lineHeight": 1.6, "weight": 400, "letterSpacing": 0 }
    }
  }
}
```

- `fontFamilies` — минимум одна запись; типично `heading` и `body`. Поля:
  - `family` — имя шрифта (обязательное);
  - `fallback` — CSS-стек подстраховки (рекомендуется);
  - `license` — **обязательное**: результат проверки `font-license-check`
    (лицензия, где подтверждена, дата). Шрифт без заполненной лицензии не проходит
    валидацию;
  - `replacedFrom` — опционально: какой шрифт референса заменён этим и почему
    (мотивировка подробно — в design-system.md).
- `typeScale` — **обязательные именованные шаги**: `display`, `h1`, `h2`, `h3`,
  `body-lg`, `body`, `caption`. У каждого шага — объекты `desktop` и `mobile`
  (соответствуют брейкпоинтам) с полями:
  - `size` — px, число;
  - `lineHeight` — безразмерный множитель, допустимый диапазон **1.0–2.0**
    (не px! `24px/16px` записывается как `1.5`);
  - `weight` — 100–900;
  - `letterSpacing` — em, число (0 допустим, отрицательные для крупных кеглей — норма).
- Монотонность: в порядке `caption ≤ body ≤ body-lg ≤ h3 ≤ h2 ≤ h1 ≤ display`
  размер каждого шага ≥ предыдущего — отдельно для desktop и для mobile.
  Нарушение = ошибка валидации.

### spacing

```json
"spacing": {
  "base": 4,
  "scale": [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
}
```

- `base` — базовый шаг ритма (обычно 4 или 8), определяется частотным анализом фазы 1.
- `scale` — массив допустимых отступов. Каждое значение **кратно `base`** (ошибка,
  если нет) и по возрастанию (предупреждение, если нет). Отступы вне шкалы в макетах
  запрещены (`no-detached-values`).

### radius

Именованная шкала радиусов, px:

```json
"radius": { "none": 0, "sm": 6, "md": 10, "lg": 16, "pill": 999 }
```

Имена свободные, но фиксированные для проекта; минимум одна запись. `999` —
конвенция «полная пилюля».

### shadows

Именованные тени, значение — строка в CSS-синтаксисе `box-shadow`:

```json
"shadows": {
  "sm": { "value": "0 1px 2px rgba(14, 17, 22, 0.08)", "source": "css" },
  "md": { "value": "0 4px 12px rgba(14, 17, 22, 0.10)", "source": "css" }
}
```

Тени из vision-пути — всегда `confidence: "low"` или `"medium"` (композит с фоном,
см. extraction-vision.md).

### breakpoints

Ширины дизайн-макетов, px. Обязательны `desktop` и `mobile`; промежуточные
(`tablet`) — опционально:

```json
"breakpoints": { "desktop": 1440, "mobile": 390 }
```

### grid

Сетка **на каждый брейкпоинт** (ключи совпадают с `breakpoints`):

```json
"grid": {
  "desktop": { "container": 1200, "columns": 12, "gutter": 24 },
  "mobile":  { "container": 358,  "columns": 4,  "gutter": 16 }
}
```

- `container` — ширина контентной области, px (≤ ширины брейкпоинта);
- `columns` — число колонок;
- `gutter` — межколонник, px (значение из spacing.scale — рекомендация,
  не требование валидатора).

### motion (опционально)

Девятый раздел, **опциональный**: заполняется, только если проект анимируется
(`docs/motion.md`). Статический проект и проекты без группы валидны.

```json
"motion": {
  "durations": { "fast": 250, "base": 400, "slow": 700 },
  "easings": {
    "standard":   { "value": "cubic-bezier(0.4, 0, 0.2, 1)", "source": "css" },
    "emphasized": "cubic-bezier(0.2, 0, 0, 1)"
  }
}
```

- `durations` — именованные длительности в миллисекундах (число). Значения — из
  уровня A референса (реальные `transition-duration`) или дефолтов каталога
  `library/motion/`.
- `easings` — именованные timing-function в CSS-синтаксисе (строка; допустима запись
  объектом с `source`/`confidence`, как у прочих значений).
- Оба подраздела опциональны внутри `motion`; при наличии — непустые. Из этих значений
  HTML-путь генерирует `--motion-duration-*` / `--motion-ease-*` (`tokens-to-css.mjs`);
  на них ссылаются motion-spec и скелеты `library/motion/`.

## Полный пример

Тот же файл лежит в `templates/tokens.example.json` и проходит валидатор без ошибок.

```json
{
  "meta": {
    "project": "Nordwind Logistics — B2B landing",
    "sourceRefs": [
      "https://reference-site.example.com",
      "project/reference-shots/pricing-mobile.png"
    ],
    "extractionMethod": "mixed",
    "date": "2026-07-05"
  },
  "color": {
    "palette": {
      "white":     { "value": "#FFFFFF", "source": "css" },
      "gray-100":  { "value": "#F2F4F8", "source": "css" },
      "gray-300":  { "value": "#C6CDD8", "source": "css" },
      "gray-500":  { "value": "#5B6675", "source": "css" },
      "ink-700":   { "value": "#3D4657", "source": "css" },
      "ink-900":   { "value": "#1A1F29", "source": "css" },
      "ink-950":   { "value": "#0E1116", "source": "css" },
      "blue-300":  { "value": "#93B0FF", "source": "css" },
      "blue-700":  { "value": "#2450C7", "source": "css" },
      "green-600": { "value": "#178A50", "source": "css" },
      "amber-500": { "value": "#E8A13C", "source": "vision", "confidence": "medium" },
      "red-600":   { "value": "#D24040", "source": "css" }
    },
    "modes": {
      "light": {
        "bg":              { "ref": "white" },
        "surface":         { "ref": "gray-100" },
        "text":            { "ref": "ink-900" },
        "text-muted":      { "ref": "gray-500" },
        "accent":          { "ref": "blue-700" },
        "accent-contrast": { "ref": "white" },
        "border":          { "ref": "gray-300" },
        "success":         { "ref": "green-600" },
        "warning":         { "ref": "amber-500" },
        "danger":          { "ref": "red-600" }
      },
      "dark": {
        "bg":              { "ref": "ink-950" },
        "surface":         { "ref": "ink-900" },
        "text":            { "ref": "gray-100" },
        "text-muted":      { "ref": "gray-300" },
        "accent":          { "ref": "blue-300" },
        "accent-contrast": { "ref": "ink-950" },
        "border":          { "ref": "ink-700" },
        "success":         { "ref": "green-600" },
        "warning":         { "ref": "amber-500" },
        "danger":          { "ref": "red-600" }
      }
    }
  },
  "typography": {
    "fontFamilies": {
      "heading": {
        "family": "Space Grotesk",
        "fallback": "system-ui, sans-serif",
        "license": "SIL OFL 1.1 (Google Fonts); font-license-check passed 2026-07-05",
        "replacedFrom": "Söhne (commercial, license not confirmed)",
        "source": "css"
      },
      "body": {
        "family": "Inter",
        "fallback": "system-ui, sans-serif",
        "license": "SIL OFL 1.1 (Google Fonts); font-license-check passed 2026-07-05",
        "source": "css"
      }
    },
    "typeScale": {
      "caption": {
        "desktop": { "size": 13, "lineHeight": 1.4,  "weight": 500, "letterSpacing": 0.01 },
        "mobile":  { "size": 12, "lineHeight": 1.4,  "weight": 500, "letterSpacing": 0.01 }
      },
      "body": {
        "desktop": { "size": 16, "lineHeight": 1.6,  "weight": 400, "letterSpacing": 0 },
        "mobile":  { "size": 15, "lineHeight": 1.6,  "weight": 400, "letterSpacing": 0 }
      },
      "body-lg": {
        "desktop": { "size": 18, "lineHeight": 1.6,  "weight": 400, "letterSpacing": 0 },
        "mobile":  { "size": 16, "lineHeight": 1.6,  "weight": 400, "letterSpacing": 0 }
      },
      "h3": {
        "desktop": { "size": 24, "lineHeight": 1.3,  "weight": 600, "letterSpacing": -0.01 },
        "mobile":  { "size": 20, "lineHeight": 1.35, "weight": 600, "letterSpacing": -0.01 }
      },
      "h2": {
        "desktop": { "size": 32, "lineHeight": 1.25, "weight": 600, "letterSpacing": -0.015 },
        "mobile":  { "size": 26, "lineHeight": 1.3,  "weight": 600, "letterSpacing": -0.01 }
      },
      "h1": {
        "desktop": { "size": 48, "lineHeight": 1.15, "weight": 700, "letterSpacing": -0.02 },
        "mobile":  { "size": 34, "lineHeight": 1.2,  "weight": 700, "letterSpacing": -0.015 }
      },
      "display": {
        "desktop": { "size": 64, "lineHeight": 1.05, "weight": 700, "letterSpacing": -0.025 },
        "mobile":  { "size": 40, "lineHeight": 1.1,  "weight": 700, "letterSpacing": -0.02 }
      }
    }
  },
  "spacing": {
    "base": 4,
    "scale": [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
  },
  "radius": {
    "none": 0,
    "sm": 6,
    "md": 10,
    "lg": 16,
    "pill": 999
  },
  "shadows": {
    "sm": { "value": "0 1px 2px rgba(14, 17, 22, 0.08)", "source": "css" },
    "md": { "value": "0 4px 12px rgba(14, 17, 22, 0.10)", "source": "css" },
    "lg": { "value": "0 16px 40px rgba(14, 17, 22, 0.14)", "source": "vision", "confidence": "medium" }
  },
  "breakpoints": {
    "desktop": 1440,
    "mobile": 390
  },
  "grid": {
    "desktop": { "container": 1200, "columns": 12, "gutter": 24 },
    "mobile":  { "container": 358,  "columns": 4,  "gutter": 16 }
  }
}
```

## Что проверяет валидатор

`scripts/validate-tokens.mjs`, без внешних зависимостей. `ERROR` → exit 1
(гейт 1 не предъявляется), только `WARN` → exit 0 (предупреждения выносятся
на гейт 1 списком).

1. **Структурная полнота** — все восемь разделов; все обязательные роли в каждом
   режиме; все семь шагов typeScale с desktop и mobile; обязательные поля meta,
   spacing, breakpoints (desktop+mobile), grid на каждый брейкпоинт.
2. **Разрешимость ссылок** — каждый `ref` роли указывает на существующий примитив
   palette. Неиспользуемые примитивы — предупреждение.
3. **Консистентность шкал** — spacing.scale кратен base; typeScale монотонна по
   размеру (desktop и mobile отдельно); lineHeight в диапазоне 1.0–2.0.
4. **WCAG 2.1 контрасты** — relative luminance + contrast ratio; пары
   `text/bg ≥ 4.5`, `text-muted/bg ≥ 3.0`, `accent-contrast/accent ≥ 4.5`
   в каждом режиме.
5. **Лицензии шрифтов** — у каждого fontFamily непустое поле `license`
   (`font-license-check`).
6. **Происхождение** — у каждого значения с `source: "vision"` есть `confidence`
   (`vision-values-snapped`); `confidence: "low"` — предупреждение.
7. **motion (если раздел есть)** — опционально: `durations` — положительные числа (ms),
   `easings` — непустые строки; присутствующие подразделы непусты. Отсутствие всей
   группы ошибкой не является.
