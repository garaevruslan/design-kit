#!/usr/bin/env node
/**
 * tokens-to-css.mjs — generate tokens.css from tokens.json (fallback-html path).
 *
 * Usage: node scripts/tokens-to-css.mjs [path/to/tokens.json] [path/to/tokens.css]
 * Defaults (от корня проекта): project/tokens.json -> project/prototype/tokens.css.
 * Порог мобильного media query: breakpoints.threshold из tokens.json, иначе 768.
 *
 * Mirrors шаг 1 фазы 4 (docs/fallback-html.md): custom properties 1:1 from
 * tokens.json — no property beyond tokens.json, no tokens.json key without a
 * property, names 1:1. Dark mode -> [data-theme="dark"]; mobile type scale ->
 * @media (max-width: 767px) — breakpoints are the only raw numbers allowed
 * in @media (CSS cannot var() there); origin: tokens.json + reference-study §6.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const tokensPath = resolve(process.argv[2] ?? "project/tokens.json");
const outPath = resolve(process.argv[3] ?? "project/prototype/tokens.css");

const t = JSON.parse(readFileSync(tokensPath, "utf8"));
const L = [];

/** Unwrap a value node: plain literal or { value, ... }. */
const val = (x) => (x !== null && typeof x === "object" && "value" in x ? x.value : x);

L.push(`/* tokens.css — GENERATED from project/tokens.json by tokens-to-css.mjs.`);
L.push(` * DO NOT EDIT BY HAND — правь tokens.json и перегенерируй (no-detached-values).`);
L.push(` * Проект: ${t.meta.project}; дата генерации: источник tokens.json от ${t.meta.date}. */`);
L.push(``);
L.push(`:root {`);

L.push(`  /* color.palette — примитивы */`);
for (const [k, v] of Object.entries(t.color.palette)) {
  L.push(`  --palette-${k}: ${v.value};`);
}

L.push(``);
L.push(`  /* color.modes.light — семантические роли (режим light = дефолт) */`);
for (const [role, v] of Object.entries(t.color.modes.light)) {
  L.push(`  --color-${role}: var(--palette-${v.ref});`);
}

L.push(``);
L.push(`  /* typography.fontFamilies */`);
for (const [k, v] of Object.entries(t.typography.fontFamilies)) {
  L.push(`  --font-${k}: "${v.family}", ${v.fallback};`);
}

L.push(``);
L.push(`  /* typography.typeScale — desktop (режим desktop коллекции typography) */`);
for (const [step, m] of Object.entries(t.typography.typeScale)) {
  const d = m.desktop;
  L.push(`  --text-${step}-size: ${d.size}px;`);
  L.push(`  --text-${step}-line: ${d.lineHeight};`);
  L.push(`  --text-${step}-weight: ${d.weight};`);
  L.push(`  --text-${step}-ls: ${d.letterSpacing ?? 0}em;`);
}

L.push(``);
L.push(`  /* spacing.scale (base ${t.spacing.base}) */`);
for (const s of t.spacing.scale) {
  L.push(`  --space-${s}: ${s}px;`);
}

L.push(``);
L.push(`  /* radius */`);
for (const [k, v] of Object.entries(t.radius)) {
  L.push(`  --radius-${k}: ${v}px;`);
}

L.push(``);
L.push(`  /* shadows */`);
for (const [k, v] of Object.entries(t.shadows)) {
  L.push(`  --shadow-${k}: ${v.value};`);
}

L.push(``);
L.push(`  /* grid */`);
for (const [bp, g] of Object.entries(t.grid)) {
  L.push(`  --container-${bp}: ${g.container}px;`);
  L.push(`  --gutter-${bp}: ${g.gutter}px;`);
}

if (t.motion && (t.motion.durations || t.motion.easings)) {
  L.push(``);
  L.push(`  /* motion (optional) — durations in ms, easings as timing-functions */`);
  for (const [k, v] of Object.entries(t.motion.durations ?? {})) {
    L.push(`  --motion-duration-${k}: ${val(v)}ms;`);
  }
  for (const [k, v] of Object.entries(t.motion.easings ?? {})) {
    L.push(`  --motion-ease-${k}: ${val(v)};`);
  }
}

L.push(`}`);
L.push(``);
L.push(`/* color.modes.dark — секционная инверсия (тёмные секции: cta, footer) */`);
L.push(`[data-theme="dark"] {`);
for (const [role, v] of Object.entries(t.color.modes.dark)) {
  L.push(`  --color-${role}: var(--palette-${v.ref});`);
}
L.push(`}`);
L.push(``);
const threshold = (t.breakpoints.threshold ?? 768) - 1;
L.push(`/* typography.typeScale — mobile (режим mobile коллекции typography).`);
L.push(`   ${threshold} — порог смены значений (breakpoints.threshold tokens.json либо дефолт 768);`);
L.push(`   брейкпоинты макетов из tokens.json: desktop ${t.breakpoints.desktop} / mobile ${t.breakpoints.mobile}. */`);
L.push(`@media (max-width: ${threshold}px) {`);
L.push(`  :root {`);
for (const [step, m] of Object.entries(t.typography.typeScale)) {
  const d = m.mobile;
  L.push(`    --text-${step}-size: ${d.size}px;`);
  L.push(`    --text-${step}-line: ${d.lineHeight};`);
  L.push(`    --text-${step}-weight: ${d.weight};`);
  L.push(`    --text-${step}-ls: ${d.letterSpacing ?? 0}em;`);
}
L.push(`  }`);
L.push(`}`);
L.push(``);

writeFileSync(outPath, L.join("\n"));
console.log(`OK: ${outPath} generated from ${tokensPath}`);
