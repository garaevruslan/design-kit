#!/usr/bin/env node
/**
 * audit-figma.mjs — офлайн-аудит дампа дерева Figma (фаза 6, слой 1).
 *
 * Usage:
 *   node scripts/audit-figma.mjs project/figma-dump.json
 *   node scripts/audit-figma.mjs <dump...> [--worklog <path>] [--tokens <path>]
 *
 * Вход — JSON, снятый `scripts/figma/dump-tree.js` через use_figma. Несколько
 * дампов (по фрейму страницы на вызов) можно передать списком — они сольются.
 *
 * ОБЛАСТЬ ДЕЙСТВИЯ. Слой 1 НЕ скоупится источником композиции, в отличие от
 * каталога анти-паттернов (слой 2, scripts/lint-slop.mjs). Композиция может
 * прийти из референса — значения обязаны прийти из tokens.json всегда
 * (`reference-source-of-truth`). Поэтому worklog нужен здесь только ради списка
 * «Утверждённые исключения», а таблица «Источники композиции» не читается.
 *
 * Output format:  ERROR|WARN: <правило> · <узел> — <сообщение>
 * Exit code: 1 если есть ERROR, 0 если только предупреждения (или чисто).
 * Без внешних зависимостей.
 */

import { readFileSync, existsSync } from "node:fs";

// ------------------------------------------------------------------ правила

const RULES = {
  "detached-fill":    "заливка не привязана к переменной или стилю",
  "detached-stroke":  "обводка не привязана к переменной или стилю",
  "detached-type":    "типографика не через текст-стиль или переменную",
  "detached-radius":  "радиус не привязан",
  "detached-spacing": "отступ или зазор не привязан",
  "detached-effect":  "тень не через effect-стиль",
  "autolayout":       "контейнер с детьми без autolayout",
  "mixed-value":      "смешанное значение — машинно не проверяется",
};

// Что дампом не проверяется вовсе — печатается в конце, чтобы чистый прогон
// не читался как «проверено всё».
const NOT_COVERED = {
  "тексты против content-doc": "сверка дословности (проверка №5 слоя 1)",
  "полнота секций":            "каждая секция content-doc присутствует (№2)",
  "покрытие inventory":        "заявленные паттерны реализованы (№3)",
  "иконки":                    "имена из коллекции Reicon, один вес (№6)",
  "скриншот-сверка":           "слой 2 — композиция и иерархия против эталона",
};

const errors = [];
const warnings = [];
const clean = new Set(Object.keys(RULES));
let suppressed = 0;

let approvedExceptions = "";

/**
 * Гашение — централизованно, до классификации. Так правило, автор которого забыл
 * вызвать проверку, не может проигнорировать утверждённое человеком решение
 * (урок lint-slop.mjs: T12 срабатывал вопреки исключению).
 */
function isApproved(rule, needle) {
  if (!approvedExceptions) return false;
  if (approvedExceptions.includes(rule)) return true;
  if (needle && String(needle).length > 3 && approvedExceptions.includes(String(needle))) return true;
  return false;
}

function finding(level, rule, node, msg, needle = null) {
  if (isApproved(rule, needle)) { suppressed++; return; }
  clean.delete(rule);
  const where = `${node.name} (${node.id})`;
  const line = `${level}: ${rule} · ${where} — ${msg}`;
  (level === "ERROR" ? errors : warnings).push(line);
}

const err = (rule, node, msg, needle) => finding("ERROR", rule, node, msg, needle);
const warn = (rule, node, msg, needle) => finding("WARN", rule, node, msg, needle);

// ------------------------------------------------------------------ проверки

const CONTAINERS = new Set(["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"]);

/** Есть ли у узла привязка хоть по одному из ключей. */
const bound = (node, ...keys) =>
  Array.isArray(node.boundKeys) && keys.some((k) => node.boundKeys.includes(k));

function auditNode(node, childCount, tokens) {
  // --- заливки и обводки -------------------------------------------------
  for (const [prop, rule, styleKey] of [
    ["fills", "detached-fill", "fillStyleId"],
    ["strokes", "detached-stroke", "strokeStyleId"],
  ]) {
    const paints = node[prop];
    if (paints === "MIXED") {
      warn("mixed-value", node, `${prop}: смешанные значения — проверить глазами`);
      continue;
    }
    if (!Array.isArray(paints) || node[styleKey]) continue;
    for (const p of paints) {
      if (p.vis === false || p.b) continue;
      const val = p.v ?? p.t;
      err(rule, node, `${prop}: ${val} — значение из tokens.json через переменную или стиль`, val);
    }
  }

  // --- типографика -------------------------------------------------------
  if (node.type === "TEXT" && !node.textStyleId && !bound(node, "fontSize", "fontFamily", "fontStyle")) {
    const shown = [node.font, node.fontSize].filter(Boolean).join(" / ");
    err("detached-type", node, `${shown || "шрифт"} — типографика через текст-стиль системы`, node.font);
  }

  // --- радиус ------------------------------------------------------------
  if (typeof node.radius === "number" && node.radius > 0 && !bound(node, "topLeftRadius", "cornerRadius")) {
    const inScale = tokens.radius.includes(node.radius);
    err("detached-radius", node, inScale
      ? `${node.radius} — значение из шкалы radius, но не привязано (не хватает биндинга)`
      : `${node.radius} — нет в шкале tokens.json.radius`, node.radius);
  } else if (node.radius === "MIXED") {
    warn("mixed-value", node, "радиусы углов различаются — проверить глазами");
  }

  // --- отступы и зазоры --------------------------------------------------
  if (typeof node.gap === "number" && node.gap > 0 && !bound(node, "itemSpacing")) {
    const inScale = tokens.spacing.includes(node.gap);
    err("detached-spacing", node, inScale
      ? `gap ${node.gap} — из шкалы spacing, но не привязан`
      : `gap ${node.gap} — нет в шкале tokens.json.spacing`, node.gap);
  }
  if (Array.isArray(node.padding) && node.padding.some((v) => v > 0)) {
    const padKeys = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
    if (!bound(node, ...padKeys)) {
      err("detached-spacing", node, `padding [${node.padding.join(", ")}] — отступы через переменные spacing`);
    }
  }

  // --- тени --------------------------------------------------------------
  if (Array.isArray(node.effects) && node.effects.some((e) => /SHADOW/.test(e)) && !node.effectStyleId) {
    err("detached-effect", node, `${node.effects.join(", ")} — тень через effect-стиль из tokens.json.shadows`);
  }

  // --- autolayout --------------------------------------------------------
  if (CONTAINERS.has(node.type) && childCount > 0 && node.layoutMode === "NONE") {
    err("autolayout", node, `${childCount} детей без autolayout — исключения именуются в worklog`);
  }
}

// -------------------------------------------------------------------- ввод

function loadDump(path) {
  let raw;
  try { raw = readFileSync(path, "utf8"); }
  catch (e) { console.error(`ERROR: ${path} — не читается (${e.message})`); process.exit(1); }

  let json;
  try { json = JSON.parse(raw); }
  catch (e) { console.error(`ERROR: ${path} — невалидный JSON (${e.message})`); process.exit(1); }

  if (!json || !Array.isArray(json.nodes)) {
    console.error(`ERROR: ${path} — нет массива nodes; это точно вывод dump-tree.js?`);
    process.exit(1);
  }
  return json;
}

/** Шкалы из tokens.json — чтобы отличать «не привязано» от «вообще не из системы». */
function loadTokens(path) {
  const empty = { radius: [], spacing: [] };
  if (!path || !existsSync(path)) return empty;
  try {
    const t = JSON.parse(readFileSync(path, "utf8"));
    const nums = (obj) => Object.values(obj ?? {})
      .map((v) => (v && typeof v === "object" && "value" in v ? v.value : v))
      .filter((v) => typeof v === "number");
    return { radius: nums(t.radius), spacing: nums(t.spacing?.scale ?? t.spacing) };
  } catch { return empty; }
}

function loadExceptions(path) {
  if (!path || !existsSync(path)) return "";
  const text = readFileSync(path, "utf8");
  const start = text.indexOf("## Утверждённые исключения");
  if (start === -1) return "";
  const rest = text.slice(start);
  const end = rest.indexOf("\n## ", 3);
  return end === -1 ? rest : rest.slice(0, end);
}

// ------------------------------------------------------------------- запуск

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.error("Usage: node scripts/audit-figma.mjs <dump.json...> [--worklog <path>] [--tokens <path>]");
    process.exit(2);
  }

  const dumps = [];
  let worklogPath = null;
  let tokensPath = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--worklog") worklogPath = argv[++i];
    else if (argv[i] === "--tokens") tokensPath = argv[++i];
    else dumps.push(argv[i]);
  }

  approvedExceptions = loadExceptions(worklogPath);
  const tokens = loadTokens(tokensPath);

  const roots = [];
  const all = [];
  for (const d of dumps) {
    const json = loadDump(d);
    roots.push(`${json.meta?.rootName ?? "?"} (${json.meta?.rootId ?? "?"}, ${json.nodes.length} узлов)`);
    all.push(...json.nodes);
  }

  // Число детей — из поля parent, отдельного счётчика в дампе нет.
  const childCount = new Map();
  for (const n of all) {
    if (n.parent) childCount.set(n.parent, (childCount.get(n.parent) ?? 0) + 1);
  }

  for (const n of all) auditNode(n, childCount.get(n.id) ?? 0, tokens);

  // ------------------------------------------------------------- отчёт
  if (errors.length) { console.log("— Отвязанные значения и структура —"); errors.forEach((l) => console.log(l)); }
  if (warnings.length) { if (errors.length) console.log(""); console.log("— Требует глаз —"); warnings.forEach((l) => console.log(l)); }

  console.log("");
  console.log(`Проверено: ${all.length} узлов; корни: ${roots.join("; ")}`);
  console.log(`Чисто по: ${[...clean].sort().join(", ") || "—"}`);
  if (suppressed) console.log(`Погашено списком «Утверждённые исключения»: ${suppressed}`);
  console.log(`Дампом не покрывается: ${Object.keys(NOT_COVERED).join("; ")}`);
  if (!worklogPath) console.log("ВНИМАНИЕ: worklog не передан — «Утверждённые исключения» не учтены, находки в полной строгости");
  if (!tokensPath) console.log("ВНИМАНИЕ: tokens.json не передан — шкалы radius/spacing не сверялись");
  console.log(`Итого: ${errors.length} error(s), ${warnings.length} warning(s)`);

  process.exit(errors.length ? 1 : 0);
}

main();
