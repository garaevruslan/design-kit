#!/usr/bin/env node
/**
 * tokens-to-pen-vars.mjs — generate a Pencil `SetVariables(...)` batch_design
 * snippet from tokens.json (pencil path, docs/pencil-path.md).
 *
 * Usage: node scripts/tokens-to-pen-vars.mjs [path/to/tokens.json] [out.js]
 * Defaults: project/tokens.json -> stdout.
 *
 * Names 1:1 с ключами tokens.json (как variables Figma и tokens.css):
 * palette-*, color-<роль> (ось mode: light|dark), font-heading/-body,
 * text-<ступень>-size/-line/-ls (ось viewport: desktop|mobile; ls в px =
 * em × size по режимам), space-*, radius-*.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const tokensPath = resolve(process.argv[2] ?? "project/tokens.json");
const t = JSON.parse(readFileSync(tokensPath, "utf8"));
const vars = {};

for (const [k, v] of Object.entries(t.color.palette)) {
  vars[`palette-${k}`] = { type: "color", value: v.value };
}
for (const role of Object.keys(t.color.modes.light)) {
  vars[`color-${role}`] = { type: "color", value: [
    { value: `$palette-${t.color.modes.light[role].ref}`, theme: { mode: "light" } },
    { value: `$palette-${t.color.modes.dark[role].ref}`, theme: { mode: "dark" } },
  ]};
}
vars["font-heading"] = { type: "string", value: t.typography.fontFamilies.heading.family };
vars["font-body"] = { type: "string", value: t.typography.fontFamilies.body.family };
for (const [step, m] of Object.entries(t.typography.typeScale)) {
  const themed = (dv, mv) => [
    { value: dv, theme: { viewport: "desktop" } },
    { value: mv, theme: { viewport: "mobile" } },
  ];
  vars[`text-${step}-size`] = { type: "number", value: themed(m.desktop.size, m.mobile.size) };
  vars[`text-${step}-line`] = { type: "number", value: themed(m.desktop.lineHeight, m.mobile.lineHeight) };
  const ls = (x) => Math.round((x.letterSpacing ?? 0) * x.size * 100) / 100;
  vars[`text-${step}-ls`] = { type: "number", value: themed(ls(m.desktop), ls(m.mobile)) };
}
for (const s of t.spacing.scale) vars[`space-${s}`] = { type: "number", value: s };
for (const [k, v] of Object.entries(t.radius)) vars[`radius-${k}`] = { type: "number", value: v };

const js = `SetVariables(${JSON.stringify(vars)})`;
if (process.argv[3]) {
  writeFileSync(resolve(process.argv[3]), js);
  console.log(`OK: ${process.argv[3]} — ${Object.keys(vars).length} variables, ${js.length} bytes`);
  if (js.length > 3500) console.log("WARN: сниппет >3.5КБ — stdio-сервер Pencil режет ~4КБ, дели SetVariables на части");
} else {
  console.log(js);
}
