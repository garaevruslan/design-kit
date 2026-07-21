#!/usr/bin/env node
/**
 * lint-slop.mjs — machine detection of AI-slop tells (design-kit, phase 6, layer 1).
 *
 * Usage:
 *   node scripts/lint-slop.mjs <project-dir>
 *   node scripts/lint-slop.mjs <project-dir>/prototype --worklog <path> --tokens <path>
 *
 * Rules live in docs/anti-patterns.md — this script implements the [греп] subset.
 * T-numbers here MUST match that catalog; it is the source of truth, not this file.
 *
 * Scoping (`no-invented-ai-tells`, DESIGN-CONTRACT.md):
 *   Findings on sections whose composition source is `reference` or `library` are
 *   downgraded to WARN "reference-inherited" — the kit reproduces the reference's
 *   system, it does not judge it. Only `invented` sections carry full severity.
 *   Exception: craft rules (T11/T13/T25/T26, docs/assembly-rules.md) apply to every
 *   section — they describe assembly defects, not style. Those are visual/DOM-metric
 *   checks and are NOT implemented here; see "не реализовано" in the report.
 *
 * Severity mapping (docs/verification.md):  ban → major, system → minor, flag → warning.
 * Thresholds are always WARN, never ERROR: value ranges come from the reference.
 *
 * Output format:  ERROR|WARN: T# · <severity> · <file>:<line> — <message>
 * Exit code: 1 if any ERROR, 0 if only warnings (or clean).
 * No external dependencies.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";

// ------------------------------------------------------------------ catalog

// severity: "ban" | "system" | "flag"  →  major | minor | warning
const SEVERITY_WORD = { ban: "major", system: "minor", flag: "warning" };

const RULES = {
  T1:  { severity: "ban",    title: "цветной border-left как акцент" },
  T3:  { severity: "system", title: "капс без трекинга" },
  T5:  { severity: "system", title: "тени без системы" },
  T6:  { severity: "ban",    title: "indigo/violet акцент и градиент" },
  T9:  { severity: "system", title: "бюджет акцента" },
  T12: { severity: "system", title: "hover-тень рефлексом" },
  T14: { severity: "system", title: "дефолтный шрифт / >3 семейств" },
  T19: { severity: "system", title: "motion рефлексом" },
  T20: { severity: "system", title: "цветовые крайности" },
  T21: { severity: "system", title: "копирайт-слоп" },
  T23: { severity: "ban",    title: "пульсирующая точка-статус" },
  T24: { severity: "ban",    title: "подчёркивание как аффорданс кнопки" },
  T30: { severity: "system", title: "заголовок-простыня / перенос в кнопке" },
  T32: { severity: "flag",   title: "лендинг-клише в hero" },
  T34: { severity: "flag",   title: "больше одного marquee" },
  T35: { severity: "ban",    title: "гарнитура вне утверждённой системы" },
  T36: { severity: "system", title: "разнобой скруглений" },
  RAW: { severity: "system", title: "сырые значения вне токенов" },
};

// Rules that need rendering or DOM metrics — cannot be grepped. Reported as such.
const VISUAL_ONLY = {
  T4:  "пастельные статус-пилюли (форма+пара оттенков — по рендеру)",
  T7:  "ряд одинаковых стат-карточек (связка — по рендеру)",
  T8:  "плоские веса действий (семантика лейблов)",
  T10: "флаги стран в таблицах",
  T17: "100vh-hero и шаблон лендинга (ритм секций)",
  T18: "всё в карточках, всё по центру",
  T22: "мем-теллы bento/glass/aurora",
  T28: "hero не влезает в первый экран (высота рендера)",
  T29: "повтор layout-семейства (ритм страницы)",
  T31: "длинный список голым ul (уместность формата)",
  T33: "логотипы клиентов с подписями",
  T11: "габарит ряда зависит от состояния (assembly-rules)",
  T13: "принцип выравнивания в ряду (assembly-rules)",
  T25: "высоты соседних контролов (assembly-rules)",
  T26: "общие оси сиблинг-карточек (assembly-rules)",
};

// T6 — задокументированные дефолтные indigo/violet значения.
const INDIGO_HEX = [
  "#6366f1", "#4f46e5", "#4338ca", "#3730a3",
  "#8b5cf6", "#7c3aed", "#a855f7", "#818cf8", "#7f5af0",
];

// T14 — гарнитуры, на которые сходятся модели «из памяти».
const DEFAULT_FONTS = [
  "inter", "roboto", "open sans", "poppins", "lato", "geist",
  "nunito", "montserrat", "source sans pro",
];

// T21 — англоязычные баззворды. Русскую микрокопию regex не ловит:
// её гоняет текстовый скилл `anti-slop` отдельно (см. docs/anti-patterns.md).
const BUZZWORDS = /\b(Elevate|Unlock|Supercharge|Seamless|Empower|Streamline|Leverage|Revolutioniz\w*|Cutting-edge|Game-chang\w*)\b/gi;
const GENERIC_CTA = /^\s*(Get Started|Learn More|Sign Up Now|Discover More|Explore Now)\s*$/i;

const MAX_RAW_VALUES = 12;   // сырых значений вне токенов
const MAX_FONT_FAMILIES = 3;
const MAX_SHADOW_LEVELS = 2;
const MIN_CAPS_TRACKING = 0.06; // em
const ACCENT_RULE_BUDGET = 8;   // распинок акцента по правилам библиотеки

// ------------------------------------------------------------------ findings

const findings = [];
const clean = new Set(Object.keys(RULES));

let suppressed = 0;

/**
 * @param {string} rule   T-number, key of RULES
 * @param {string} where  "file:line"
 * @param {string} msg
 * @param {object} opts   { section, threshold, needle }
 *   needle — фрагмент (hex, имя гарнитуры), по которому находку можно узнать
 *   в списке «Утверждённые исключения» worklog.
 */
function finding(rule, where, msg, opts = {}) {
  const { section = null, threshold = false, needle = null } = opts;
  const spec = RULES[rule];

  // Гашение — централизованно, до всякой классификации: иначе правило, автор
  // которого забыл вызвать проверку, игнорирует утверждённые человеком решения.
  if (isApprovedException(rule, needle)) {
    suppressed++;
    return;
  }

  clean.delete(rule);

  const src = section ? sectionSource(section) : null;
  const inherited = src === "reference" || src === "library";

  // Порог — всегда WARN. Унаследованное из референса — всегда WARN.
  const level = threshold || inherited || spec.severity !== "ban" ? "WARN" : "ERROR";
  const severity = inherited ? "warning" : SEVERITY_WORD[spec.severity];

  findings.push({
    rule, level, severity, where, msg, section,
    note: inherited ? `reference-inherited (источник секции: ${src})` : null,
  });
}

// ------------------------------------------------------------------ worklog

let sectionSources = new Map(); // slug → "reference" | "library" | "invented"
let approvedExceptions = "";

/** Источник композиции секции; null — секция не найдена в worklog. */
function sectionSource(slug) {
  if (!slug) return null;
  return sectionSources.get(slug) ?? null;
}

/**
 * Разбирает worklog: таблицу «Источники композиции» и блок «Утверждённые исключения».
 * Формат строки таблицы: `| home/hero (+nav) | reference | evidence |`
 */
function parseWorklog(text) {
  const map = new Map();

  const secStart = text.indexOf("## Источники композиции");
  if (secStart !== -1) {
    const rest = text.slice(secStart);
    const secEnd = rest.indexOf("\n## ", 3);
    const block = secEnd === -1 ? rest : rest.slice(0, secEnd);

    for (const line of block.split("\n")) {
      if (!line.trim().startsWith("|")) continue;
      const cells = line.split("|").map((c) => c.trim());
      if (cells.length < 3) continue;
      const [, name, source] = cells;
      if (!name || /^-+$/.test(name) || /Страница/.test(name)) continue;

      const m = source.match(/\b(reference|library|invented)\b/);
      if (!m) continue;

      // `home/hero (+nav)` → slug `hero`; кладём и полное имя, и короткое.
      const full = name.replace(/\(.*?\)/g, "").trim();
      const short = full.includes("/") ? full.slice(full.lastIndexOf("/") + 1).trim() : full;
      map.set(full.toLowerCase(), m[1]);
      map.set(short.toLowerCase(), m[1]);
    }
  }

  const excStart = text.indexOf("## Утверждённые исключения");
  if (excStart !== -1) {
    const rest = text.slice(excStart);
    const excEnd = rest.indexOf("\n## ", 3);
    approvedExceptions = excEnd === -1 ? rest : rest.slice(0, excEnd);
  }

  return map;
}

/**
 * Защита от over-flag: находка гасится, если её правило или совпавший фрагмент
 * назван в «Утверждённых исключениях» worklog. Список общий со слоем 1
 * верификации — второй не заводится (docs/anti-patterns.md).
 */
function isApprovedException(rule, needle) {
  if (!approvedExceptions) return false;
  if (new RegExp(`\\b${rule}\\b`).test(approvedExceptions)) return true;
  if (needle && needle.length > 3 && approvedExceptions.includes(needle)) return true;
  return false;
}

// ------------------------------------------------------------------ CSS parse

/** Заменяет комментарии пробелами, сохраняя позиции и переводы строк. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

/**
 * Плоский разбор CSS: возвращает правила всех уровней (включая вложенные в @media),
 * каждое — { selector, body, line }. At-правила отдаются отдельно.
 */
function parseCss(raw) {
  const css = stripComments(raw);
  const rules = [];
  const atRules = [];

  let depth = 0;
  let bufStart = 0;
  const stack = [];

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      const selector = css.slice(bufStart, i).trim();
      stack.push({ selector, start: i + 1, line: lineAt(css, bufStart) });
      depth++;
      bufStart = i + 1;
    } else if (ch === "}") {
      const open = stack.pop();
      depth--;
      if (open) {
        const body = css.slice(open.start, i);
        const entry = { selector: open.selector, body, line: open.line };
        if (open.selector.startsWith("@")) atRules.push(entry);
        else rules.push(entry);
      }
      bufStart = i + 1;
    }
  }
  return { rules, atRules };
}

/** Объявления правила: [{ prop, value }] */
function decls(body) {
  return body
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d && d.includes(":") && !d.includes("{"))
    .map((d) => {
      const idx = d.indexOf(":");
      return { prop: d.slice(0, idx).trim().toLowerCase(), value: d.slice(idx + 1).trim() };
    });
}

const isRoot = (sel) => /^:root\b/.test(sel) || /^html\b/.test(sel);

/**
 * Значения кастомных свойств из :root всех файлов проекта.
 * Без этого правила-пороги немы на реальном прототипе: там каждое значение —
 * `var(--…)`, а сравнивать нужно то, во что оно разворачивается.
 */
const rootVars = new Map();

function collectRootVars(raw) {
  for (const rule of parseCss(raw).rules) {
    if (!isRoot(rule.selector)) continue;
    for (const { prop, value } of decls(rule.body)) {
      if (prop.startsWith("--")) rootVars.set(prop, value);
    }
  }
}

/** Разворачивает var(--x[, fallback]) по цепочке; глубина ограничена от циклов. */
function resolveVar(value, depth = 0) {
  if (typeof value !== "string" || depth > 5 || !value.includes("var(")) return value;
  const out = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (m, name, fallback) => {
    if (rootVars.has(name)) return rootVars.get(name);
    return fallback !== undefined ? fallback.trim() : m;
  });
  return out === value ? out : resolveVar(out, depth + 1);
}
const isActionSelector = (sel) =>
  /(^|[\s,>+~])(button|\.btn[\w-]*|\.button[\w-]*|\[role=["']?button)/i.test(sel);

/** letter-spacing в em; поддерживает em и px (px→em по 16). */
function letterSpacingEm(value) {
  const m = String(value).match(/(-?[\d.]+)\s*(em|rem|px)?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2] || "";
  if (unit === "px") return n / 16;
  return n;
}

// ------------------------------------------------------------------ CSS rules

function lintCss(file, raw) {
  const { rules, atRules } = parseCss(raw);
  const label = basename(file);

  const fontFamilies = new Set();
  const shadowValues = new Set();
  const rawRadius = new Set();
  let rawValueCount = 0;
  let accentRules = 0;
  const pulseKeyframes = new Set();

  for (const at of atRules) {
    const m = at.selector.match(/@keyframes\s+([\w-]+)/i);
    if (m && /pulse|ping|blink|breath/i.test(m[1])) pulseKeyframes.add(m[1].toLowerCase());
  }

  for (const rule of rules) {
    const { selector, body, line } = rule;
    const at = `${label}:${line}`;
    const root = isRoot(selector);
    const d = decls(body);

    const has = (prop) => d.find((x) => x.prop === prop);
    const val = (prop) => has(prop)?.value ?? "";

    // --- T6 · indigo/violet ------------------------------------------------
    const lower = body.toLowerCase();
    for (const hex of INDIGO_HEX) {
      if (!lower.includes(hex)) continue;
      finding("T6", at, root
        ? `дефолтный indigo/violet ${hex} в токенах («${selector}») — значение должно быть извлечено из референса`
        : `дефолтный indigo/violet ${hex} в «${selector}» — акцент берётся из ролей tokens.json`,
        { needle: hex });
    }
    if (/linear-gradient\([^)]*13[05]deg/i.test(body) && /#(6366f1|8b5cf6|7c3aed|4f46e5)/i.test(body)) {
      finding("T6", at, `диагональный indigo-градиент в «${selector}»`);
    }
    if (/background-clip:\s*text/i.test(body) && /color:\s*transparent/i.test(body) && /gradient/i.test(body)) {
      finding("T6", at, `градиентный текст (bg-clip:text + transparent) в «${selector}»`);
    }

    // --- T20 · чистые #000 / #fff -----------------------------------------
    if (!root) {
      const pure = body.match(/#(?:000000|000|ffffff|fff)\b/gi) || [];
      for (const p of pure) {
        finding("T20", at, `чистый ${p} в «${selector}» — базовые цвета с подмесом, значение из токенов`, { needle: p });
      }
    }
    if (/(box-shadow|filter):[^;]*(0\s+0\s+\d+px[^;]*)(#|rgb)/i.test(body) && /glow|neon/i.test(selector)) {
      finding("T20", at, `неоновое свечение в «${selector}»`);
    }

    // --- T14 / T35 · гарнитуры --------------------------------------------
    for (const { prop, value } of d) {
      if (prop !== "font-family" && !(root && /^--font/.test(prop))) continue;
      if (value.includes("var(")) continue;
      for (const fam of value.split(",")) {
        const name = fam.trim().replace(/^["']|["']$/g, "").toLowerCase();
        if (!name || ["sans-serif", "serif", "monospace", "system-ui", "-apple-system", "inherit", "cursive"].includes(name)) continue;
        fontFamilies.add(name);
        if (DEFAULT_FONTS.includes(name)) {
          finding("T14", at, `гарнитура «${name}» — дефолт, на который сходятся модели; проверить, что она реально извлечена из референса`, { needle: name });
        }
      }
    }

    // --- T5 · тени ---------------------------------------------------------
    const shadow = has("box-shadow");
    if (shadow && !/^\s*(none|inherit)/.test(shadow.value)) {
      shadowValues.add(resolveVar(shadow.value).replace(/\s+/g, " "));
      if (!shadow.value.includes("var(")) {
        finding("T5", at, `сырая тень в «${selector}» — elevation живёт в tokens.json.shadows`, { needle: shadow.value });
      }
    }

    // --- T12 · hover-тень рефлексом ---------------------------------------
    if (/:hover/.test(selector) && shadow) {
      const changesSurface = d.some((x) => /^(background|background-color|border|border-color|color)$/.test(x.prop));
      if (!changesSurface) {
        finding("T12", at, `hover меняет только тень в «${selector}» — hover через фон/бордер по токенам`);
      }
    }

    // --- T36 · скругления --------------------------------------------------
    const radius = has("border-radius");
    if (radius && !radius.value.includes("var(")) {
      const v = radius.value.trim();
      // пилюля и круг — осознанные формы, не разнобой шкалы
      if (!/^(9999px|50%|100%|999px|1e5px)$/.test(v)) rawRadius.add(v);
    }

    // --- T1 · цветной border-left + скругление ----------------------------
    const bl = d.find((x) => x.prop === "border-left" || x.prop === "border-left-color");
    if (bl && radius && !/^0/.test(radius.value) && !/transparent|none/i.test(bl.value)) {
      finding("T1", at, `цветная полоска слева + скругление в «${selector}» — убрать либо радиус, либо полоску`);
    }

    // --- T3 · капс без трекинга -------------------------------------------
    if (/uppercase/i.test(val("text-transform"))) {
      const ls = has("letter-spacing");
      const resolved = ls ? resolveVar(ls.value) : null;
      const em = resolved ? letterSpacingEm(resolved) : null;
      if (!ls) {
        finding("T3", at, `uppercase без letter-spacing в «${selector}» — капсу нужен трекинг ≥${MIN_CAPS_TRACKING}em`);
      } else if (em === null) {
        finding("T3", at, `uppercase в «${selector}»: трекинг «${ls.value}» не развернулся в число — проверить глазами`, { threshold: true });
      } else if (em < MIN_CAPS_TRACKING) {
        const shown = resolved === ls.value ? resolved : `${ls.value} → ${resolved}`;
        finding("T3", at, `uppercase с трекингом ${shown} в «${selector}» — минимум ${MIN_CAPS_TRACKING}em`, { threshold: true });
      }
    }

    // --- T19 · motion рефлексом -------------------------------------------
    for (const { prop, value } of d) {
      if ((prop === "transition" || prop === "transition-property") && /(^|\s)all(\s|,|$)/.test(value)) {
        finding("T19", at, `transition: all в «${selector}» — перечислить конкретные свойства`);
      }
    }
    if (/:hover/.test(selector) && /transform:\s*scale\(1\.0[3-9]/i.test(body)) {
      finding("T19", at, `универсальный hover-scale в «${selector}» — одна осмысленная микро-интеракция вместо ковра`);
    }

    // --- T23 · пульсирующая точка -----------------------------------------
    const anim = has("animation") || has("animation-name");
    if (anim && /infinite/i.test(body)) {
      const usesPulse = [...pulseKeyframes].some((k) => anim.value.toLowerCase().includes(k));
      const dotLike = /border-radius:\s*(50%|9999px)/i.test(body) &&
        /(width|height):\s*(2|3|4|6|8|10|12)px/i.test(body);
      if (usesPulse || (dotLike && /infinite/i.test(anim.value))) {
        finding("T23", at, `вечная пульсация в «${selector}» — точка статичная, пульс только на реальное событие`);
      }
    }

    // --- T24 · подчёркивание как аффорданс кнопки -------------------------
    if (isActionSelector(selector)) {
      const td = has("text-decoration") || has("text-decoration-line");
      if (td && /underline/i.test(td.value)) {
        finding("T24", at, `подчёркивание на роли действия «${selector}» — аффорданс кнопки цветом/весом/фоном`);
      }
    }

    // --- T9 · бюджет акцента ----------------------------------------------
    if (!root && /var\(--color-accent\b/.test(body)) accentRules++;

    // --- сырые значения вне токенов ---------------------------------------
    if (!root) {
      const hexes = body.match(/#[0-9a-f]{3,8}\b/gi) || [];
      rawValueCount += hexes.length;
    }
  }

  // --- агрегаты по файлу ---------------------------------------------------
  if (fontFamilies.size > MAX_FONT_FAMILIES) {
    finding("T14", label, `${fontFamilies.size} гарнитур (${[...fontFamilies].join(", ")}) — предел ${MAX_FONT_FAMILIES}`, { threshold: true });
  }
  if (shadowValues.size > MAX_SHADOW_LEVELS) {
    finding("T5", label, `${shadowValues.size} различных теней — одна elevation-система, максимум ${MAX_SHADOW_LEVELS} уровня со смыслом`, { threshold: true });
  }
  if (rawRadius.size > 2) {
    finding("T36", label, `${rawRadius.size} сырых значений радиуса (${[...rawRadius].join(", ")}) — скругления из шкалы tokens.json.radius`, { threshold: true });
  }
  if (rawValueCount > MAX_RAW_VALUES) {
    finding("RAW", label, `${rawValueCount} сырых hex вне :root (предел ${MAX_RAW_VALUES}) — токены не соблюдены, см. no-detached-values`, { threshold: true });
  }
  if (accentRules > ACCENT_RULE_BUDGET) {
    finding("T9", label, `акцент используется в ${accentRules} правилах — бюджет ≤2 видимых применения на экран; подтвердить по рендеру`, { threshold: true });
  }

  return { fontFamilies };
}

// ----------------------------------------------------------------- HTML rules

/** Секции страницы: [{ slug, html, line }] по классу `section-<slug>` или id. */
function splitSections(html) {
  const out = [];
  const re = /<section\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const cls = /class="([^"]*)"/i.exec(attrs)?.[1] ?? "";
    const id = /id="([^"]*)"/i.exec(attrs)?.[1] ?? "";
    const slugCls = /section-([\w-]+)/.exec(cls)?.[1] ?? "";
    const slug = (slugCls || id).toLowerCase();

    const close = html.indexOf("</section>", re.lastIndex);
    out.push({
      slug,
      html: html.slice(re.lastIndex, close === -1 ? html.length : close),
      line: lineAt(html, m.index),
    });
  }
  return out;
}

const stripTags = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const wordCount = (s) => (s.match(/[\p{L}\p{N}'’-]+/gu) || []).length;

/** Русское склонение при числительном: 1 слово / 2 слова / 5 слов. */
function plural(n, one, few, many) {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
}
const words = (n) => `${n} ${plural(n, "слово", "слова", "слов")}`;

function lintHtml(file, html) {
  const label = basename(file);
  const sections = splitSections(html);

  // --- T34 · marquee -------------------------------------------------------
  const marquees = (html.match(/class="[^"]*marquee/gi) || []).length;
  if (marquees > 1) {
    finding("T34", label, `${marquees} marquee на странице — больше одной бегущей строки читается как рефлекс`);
  }

  for (const sec of sections) {
    const at = `${label}:${sec.line}`;
    const text = stripTags(sec.html);

    // --- T21 · копирайт-слоп ---------------------------------------------
    // Только сгенерированный контент; принятый от человека не судится.
    for (const bw of text.match(BUZZWORDS) || []) {
      finding("T21", at, `баззворд «${bw}» в секции ${sec.slug || "?"}`, { section: sec.slug, needle: bw });
    }

    // --- T30 · заголовок-простыня и перенос в кнопке ----------------------
    for (const h of sec.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || []) {
      const n = wordCount(stripTags(h));
      if (n > 8) {
        finding("T30", at, `заголовок из ${words(n)} в секции ${sec.slug || "?"} — предел ~8; правка текста через content-doc`, { section: sec.slug, threshold: true });
      }
    }
    for (const b of sec.html.match(/<(?:button|a)\b[^>]*class="[^"]*button[^"]*"[^>]*>([\s\S]*?)<\/(?:button|a)>/gi) || []) {
      const label2 = stripTags(b);
      const n = wordCount(label2);
      if (n > 3) {
        finding("T30", at, `лейбл CTA «${label2}» — ${words(n)}, предел 3`, { section: sec.slug, threshold: true });
      }
      if (GENERIC_CTA.test(label2)) {
        finding("T21", at, `generic CTA «${label2}» — глагол продукта вместо дежурного`, { section: sec.slug });
      }
    }

    // --- T32 · лендинг-клише в hero ---------------------------------------
    if (/hero|top/.test(sec.slug)) {
      if (/\bscroll\b|прокрут|листай/i.test(text)) {
        finding("T32", at, `подсказка «scroll» в hero — пользователь знает, что страница скроллится`, { section: sec.slug });
      }
      if (/\b(v\d+\.\d+|BETA|ALPHA|RC\d?)\b/.test(text)) {
        finding("T32", at, `версия/бейдж в hero без явного повода`, { section: sec.slug });
      }
    }
  }

  return { sections };
}

// ------------------------------------------------------------------- runner

function collectInputs(target) {
  const abs = resolve(target);
  if (!existsSync(abs)) {
    console.error(`ERROR: ${target} — path does not exist`);
    process.exit(1);
  }

  const css = [];
  const htm = [];
  let worklog = null;
  let tokens = null;

  const walk = (dir, depth = 0) => {
    if (depth > 3) return;
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".") || name === "node_modules") continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p, depth + 1);
      else if (name.endsWith(".css")) css.push(p);
      else if (name.endsWith(".html")) htm.push(p);
      else if (name === "worklog.md") worklog = worklog ?? p;
      else if (name === "tokens.json") tokens = tokens ?? p;
    }
  };

  if (statSync(abs).isDirectory()) walk(abs);
  else if (abs.endsWith(".css")) css.push(abs);
  else if (abs.endsWith(".html")) htm.push(abs);

  return { css, htm, worklog, tokens };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error("Usage: node scripts/lint-slop.mjs <project-dir> [--worklog <path>] [--tokens <path>]");
    process.exit(2);
  }

  const positional = [];
  let worklogArg = null;
  let tokensArg = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--worklog") worklogArg = argv[++i];
    else if (argv[i] === "--tokens") tokensArg = argv[++i];
    else positional.push(argv[i]);
  }

  const found = collectInputs(positional[0]);
  const worklogPath = worklogArg ?? found.worklog;
  const tokensPath = tokensArg ?? found.tokens;

  if (worklogPath && existsSync(worklogPath)) {
    sectionSources = parseWorklog(readFileSync(worklogPath, "utf8"));
  }

  // Гарнитуры утверждённой системы — для T35.
  let approvedFamilies = null;
  if (tokensPath && existsSync(tokensPath)) {
    try {
      const t = JSON.parse(readFileSync(tokensPath, "utf8"));
      const fams = t?.typography?.families ?? t?.typography?.fonts ?? null;
      if (fams) {
        approvedFamilies = new Set(
          Object.values(fams)
            .map((f) => String(f?.value ?? f?.family ?? f).toLowerCase().replace(/^["']|["']$/g, ""))
            .filter(Boolean),
        );
      }
    } catch { /* повреждённый tokens.json — забота validate-tokens.mjs */ }
  }

  // Пре-пасс: собрать :root-переменные ВСЕХ файлов до линта — токены и компоненты
  // обычно лежат в разных файлах, а разворачивать значения нужно сквозь оба.
  const cssSources = found.css.map((f) => [f, readFileSync(f, "utf8")]);
  for (const [, raw] of cssSources) collectRootVars(raw);

  const seenFamilies = new Set();
  for (const [f, raw] of cssSources) {
    const r = lintCss(f, raw);
    for (const fam of r.fontFamilies) seenFamilies.add(fam);
  }
  for (const f of found.htm) lintHtml(f, readFileSync(f, "utf8"));

  // T35 — гарнитура, которой нет в утверждённой системе.
  if (approvedFamilies && approvedFamilies.size) {
    for (const fam of seenFamilies) {
      const known = [...approvedFamilies].some((a) => a.includes(fam) || fam.includes(a));
      if (!known) {
        finding("T35", basename(tokensPath), `гарнитура «${fam}» есть в макете, но её нет в tokens.json — значения только из утверждённой системы`, { needle: fam });
      }
    }
  }

  // ------------------------------------------------------------- отчёт
  const errs = findings.filter((f) => f.level === "ERROR");
  const warns = findings.filter((f) => f.level === "WARN");

  const order = { major: 0, minor: 1, warning: 2 };
  const print = (list) => {
    for (const f of [...list].sort((a, b) => order[a.severity] - order[b.severity])) {
      const note = f.note ? ` [${f.note}]` : "";
      console.log(`${f.level}: ${f.rule} · ${f.severity} · ${f.where} — ${f.msg}${note}`);
    }
  };

  if (errs.length) { console.log("— Баны —"); print(errs); }
  if (warns.length) { if (errs.length) console.log(""); console.log("— Система и флаги —"); print(warns); }

  // «Чисто по» — обязательная группа отчёта (docs/anti-patterns.md).
  console.log("");
  console.log(`Чисто по: ${[...clean].sort().join(", ") || "—"}`);
  if (suppressed) {
    console.log(`Погашено списком «Утверждённые исключения»: ${suppressed}`);
  }
  console.log(`Не реализовано грепом (проверять глазами): ${Object.keys(VISUAL_ONLY).sort().join(", ")}`);
  if (!worklogPath) {
    console.log("ВНИМАНИЕ: worklog не найден — scoping «референс побеждает» не применён, все находки в полной строгости");
  }
  console.log(`Итого: ${errs.length} error(s), ${warns.length} warning(s); файлов: ${found.css.length} css, ${found.htm.length} html`);

  process.exit(errs.length ? 1 : 0);
}

main();
