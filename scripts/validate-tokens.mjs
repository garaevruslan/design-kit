#!/usr/bin/env node
/**
 * validate-tokens.mjs — validator for project/tokens.json (design-kit, phase 2).
 *
 * Usage:  node scripts/validate-tokens.mjs project/tokens.json
 *
 * Checks:
 *   1. Structural completeness (all required sections, roles, type steps).
 *   2. Every semantic role references an existing palette primitive.
 *   3. Scale consistency (spacing multiples of base, monotonic type scale,
 *      line-height within 1.0–2.0).
 *   4. WCAG 2.1 contrast ratios (text/bg >= 4.5, text-muted/bg >= 3.0,
 *      accent-contrast/accent >= 4.5) for every color mode.
 *   5. Every font family has a non-empty `license` field (font-license-check).
 *   6. Every value with source "vision" carries a `confidence` field
 *      (vision-values-snapped).
 *
 * Output format:  ERROR|WARN: json.path — message
 * Exit code: 1 if any errors, 0 if only warnings (or clean).
 * No external dependencies.
 */

import { readFileSync } from "node:fs";

const REQUIRED_SECTIONS = [
  "meta", "color", "typography", "spacing",
  "radius", "shadows", "breakpoints", "grid",
];

const REQUIRED_ROLES = [
  "bg", "surface", "text", "text-muted", "accent",
  "accent-contrast", "border", "success", "warning", "danger",
];

// Ascending by expected font size; monotonicity is checked in this order.
const TYPE_STEPS_ASC = ["caption", "body", "body-lg", "h3", "h2", "h1", "display"];
const STEP_PLATFORMS = ["desktop", "mobile"];
const STEP_FIELDS = ["size", "lineHeight", "weight", "letterSpacing"];

const CONTRAST_PAIRS = [
  { fg: "text", bg: "bg", min: 4.5 },
  { fg: "text-muted", bg: "bg", min: 3.0 },
  { fg: "accent-contrast", bg: "accent", min: 4.5 },
];

const CONFIDENCE_LEVELS = ["high", "medium", "low"];

const errors = [];
const warnings = [];
const err = (path, msg) => errors.push(`ERROR: ${path} — ${msg}`);
const warn = (path, msg) => warnings.push(`WARN: ${path} — ${msg}`);

// ---------------------------------------------------------------- helpers

/** Unwrap a value node: either a plain literal or { value, source, confidence }. */
function unwrap(node) {
  if (node !== null && typeof node === "object" && !Array.isArray(node) && "value" in node) {
    return node.value;
  }
  return node;
}

/** Read a role node: "primitive-name" or { ref: "primitive-name", ... }. */
function roleRef(node) {
  if (typeof node === "string") return node;
  if (node !== null && typeof node === "object" && typeof node.ref === "string") return node.ref;
  return null;
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function requireNumber(value, path, { min = -Infinity, max = Infinity, integer = false } = {}) {
  const v = unwrap(value);
  if (typeof v !== "number" || !Number.isFinite(v)) {
    err(path, `expected a finite number, got ${JSON.stringify(v)}`);
    return null;
  }
  if (v < min || v > max) {
    err(path, `value ${v} is out of allowed range [${min}, ${max}]`);
    return null;
  }
  if (integer && !Number.isInteger(v)) {
    err(path, `expected an integer, got ${v}`);
    return null;
  }
  return v;
}

function requireString(value, path) {
  const v = unwrap(value);
  if (typeof v !== "string" || v.trim() === "") {
    err(path, `expected a non-empty string, got ${JSON.stringify(v)}`);
    return null;
  }
  return v;
}

// ------------------------------------------------------- WCAG 2.1 contrast

/** Parse #RGB / #RRGGBB (optionally #RRGGBBAA) into [r, g, b] 0–255, or null. */
function parseHex(str) {
  if (typeof str !== "string") return null;
  const m = str.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  if (hex.length === 8) hex = hex.slice(0, 6); // ignore alpha for contrast
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** WCAG 2.1 relative luminance of an sRGB color. */
function relativeLuminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG 2.1 contrast ratio between two colors, always >= 1. */
function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// -------------------------------------------------- provenance (check 6)

/** Recursively verify source/confidence on every value node. */
function checkProvenance(node, path) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => checkProvenance(item, `${path}[${i}]`));
    return;
  }
  if (!isPlainObject(node)) return;

  if ("source" in node) {
    const s = node.source;
    if (s !== "css" && s !== "vision") {
      err(`${path}.source`, `must be "css" or "vision", got ${JSON.stringify(s)}`);
    } else if (s === "vision") {
      if (!("confidence" in node)) {
        err(path, `value with source "vision" must have a confidence field (vision-values-snapped)`);
      } else if (!CONFIDENCE_LEVELS.includes(node.confidence)) {
        err(`${path}.confidence`, `must be one of ${CONFIDENCE_LEVELS.join("|")}, got ${JSON.stringify(node.confidence)}`);
      } else if (node.confidence === "low") {
        warn(path, `low-confidence vision value — review explicitly at gate 1`);
      }
    }
  } else if ("confidence" in node) {
    warn(path, `confidence given without source — set source: "vision" or drop confidence`);
  }

  for (const [key, value] of Object.entries(node)) {
    checkProvenance(value, path ? `${path}.${key}` : key);
  }
}

// ------------------------------------------------------------ section: meta

function validateMeta(meta) {
  if (!isPlainObject(meta)) return; // reported by section check
  requireString(meta.project, "meta.project");
  if (!Array.isArray(meta.sourceRefs) || meta.sourceRefs.length === 0) {
    err("meta.sourceRefs", "expected a non-empty array of reference URLs/files");
  } else {
    meta.sourceRefs.forEach((ref, i) => requireString(ref, `meta.sourceRefs[${i}]`));
  }
  const method = unwrap(meta.extractionMethod);
  if (!["css", "vision", "mixed"].includes(method)) {
    err("meta.extractionMethod", `must be "css", "vision" or "mixed", got ${JSON.stringify(method)}`);
  }
  const date = requireString(meta.date, "meta.date");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    warn("meta.date", `expected YYYY-MM-DD format, got "${date}"`);
  }
}

// ----------------------------------------------------------- section: color

function validateColor(color) {
  if (!isPlainObject(color)) return;

  // Palette primitives.
  const palette = color.palette;
  const paletteColors = new Map(); // name -> parsed rgb or null
  if (!isPlainObject(palette) || Object.keys(palette).length === 0) {
    err("color.palette", "expected a non-empty object of color primitives");
  } else {
    for (const [name, node] of Object.entries(palette)) {
      const value = requireString(node, `color.palette.${name}`);
      if (value === null) continue;
      const rgb = parseHex(value);
      if (rgb === null) {
        warn(`color.palette.${name}`, `value "${value}" is not #RGB/#RRGGBB hex — contrast checks will skip it`);
      }
      paletteColors.set(name, rgb);
    }
  }

  // Collect modes: explicit color.modes and/or top-level color.roles.
  const modes = []; // { name, path, roles }
  if (isPlainObject(color.roles)) {
    modes.push({ name: "default", path: "color.roles", roles: color.roles });
  }
  if ("modes" in color) {
    if (!isPlainObject(color.modes) || Object.keys(color.modes).length === 0) {
      err("color.modes", "expected a non-empty object of modes (e.g. light/dark)");
    } else {
      for (const [modeName, roles] of Object.entries(color.modes)) {
        if (!isPlainObject(roles)) {
          err(`color.modes.${modeName}`, "expected an object mapping roles to palette refs");
          continue;
        }
        modes.push({ name: modeName, path: `color.modes.${modeName}`, roles });
      }
    }
  }
  if (modes.length === 0) {
    err("color", "expected color.roles (single mode) and/or color.modes (light/dark)");
    return;
  }

  const usedPrimitives = new Set();

  for (const mode of modes) {
    const resolved = new Map(); // role -> primitive name

    // Required roles present, every role resolves to an existing primitive.
    for (const role of REQUIRED_ROLES) {
      if (!(role in mode.roles)) {
        err(`${mode.path}.${role}`, `required role is missing (mode "${mode.name}")`);
      }
    }
    for (const [role, node] of Object.entries(mode.roles)) {
      const ref = roleRef(node);
      if (ref === null) {
        err(`${mode.path}.${role}`, `expected { "ref": "<palette name>" } or a palette name string`);
        continue;
      }
      if (!paletteColors.has(ref)) {
        err(`${mode.path}.${role}`, `references unknown palette primitive "${ref}"`);
        continue;
      }
      usedPrimitives.add(ref);
      resolved.set(role, ref);
    }

    // WCAG contrast pairs per mode.
    for (const { fg, bg, min } of CONTRAST_PAIRS) {
      const fgRef = resolved.get(fg);
      const bgRef = resolved.get(bg);
      if (!fgRef || !bgRef) continue; // missing/unresolved already reported
      const fgRgb = paletteColors.get(fgRef);
      const bgRgb = paletteColors.get(bgRef);
      if (!fgRgb || !bgRgb) continue; // non-hex already warned
      const ratio = contrastRatio(fgRgb, bgRgb);
      if (ratio < min) {
        err(
          `${mode.path}.${fg}`,
          `WCAG contrast ${fg} (${fgRef}) vs ${bg} (${bgRef}) is ${ratio.toFixed(2)}, required >= ${min} (mode "${mode.name}")`,
        );
      }
    }
  }

  // Unused primitives are legal but suspicious.
  for (const name of paletteColors.keys()) {
    if (!usedPrimitives.has(name)) {
      warn(`color.palette.${name}`, "primitive is not referenced by any role in any mode");
    }
  }
}

// ------------------------------------------------------ section: typography

function validateTypography(typography) {
  if (!isPlainObject(typography)) return;

  // Font families + licenses (font-license-check).
  const families = typography.fontFamilies;
  if (!isPlainObject(families) || Object.keys(families).length === 0) {
    err("typography.fontFamilies", "expected a non-empty object of font families");
  } else {
    for (const [name, def] of Object.entries(families)) {
      if (!isPlainObject(def)) {
        err(`typography.fontFamilies.${name}`, "expected an object with family and license fields");
        continue;
      }
      requireString(def.family, `typography.fontFamilies.${name}.family`);
      const license = unwrap(def.license);
      if (typeof license !== "string" || license.trim() === "") {
        err(
          `typography.fontFamilies.${name}.license`,
          "license confirmation is required (font-license-check); fill it or replace the font",
        );
      } else if (/\b(todo|tbd|unknown|\?)\b/i.test(license)) {
        warn(`typography.fontFamilies.${name}.license`, `license looks unresolved: "${license}"`);
      }
    }
  }

  // Type scale: required steps, required fields, sane line-heights.
  const scale = typography.typeScale;
  if (!isPlainObject(scale)) {
    err("typography.typeScale", "expected an object with named type steps");
    return;
  }
  const sizes = { desktop: {}, mobile: {} }; // platform -> step -> size

  for (const step of TYPE_STEPS_ASC) {
    const stepNode = scale[step];
    if (!isPlainObject(stepNode)) {
      err(`typography.typeScale.${step}`, "required type step is missing");
      continue;
    }
    for (const platform of STEP_PLATFORMS) {
      const p = stepNode[platform];
      const pPath = `typography.typeScale.${step}.${platform}`;
      if (!isPlainObject(p)) {
        err(pPath, `missing ${platform} values (each step needs desktop and mobile)`);
        continue;
      }
      for (const field of STEP_FIELDS) {
        if (!(field in p)) err(`${pPath}.${field}`, "required field is missing");
      }
      const size = requireNumber(p.size, `${pPath}.size`, { min: 1 });
      if (size !== null) sizes[platform][step] = size;
      const lh = unwrap(p.lineHeight);
      if (typeof lh !== "number" || !Number.isFinite(lh)) {
        if ("lineHeight" in p) err(`${pPath}.lineHeight`, `expected a number, got ${JSON.stringify(lh)}`);
      } else if (lh < 1.0 || lh > 2.0) {
        err(
          `${pPath}.lineHeight`,
          `must be a unitless multiplier within 1.0–2.0, got ${lh}${lh > 3 ? " (looks like px — divide by font size)" : ""}`,
        );
      }
      if ("weight" in p) requireNumber(p.weight, `${pPath}.weight`, { min: 100, max: 900 });
      if ("letterSpacing" in p) requireNumber(p.letterSpacing, `${pPath}.letterSpacing`, { min: -1, max: 1 });
    }
  }

  // Extra (non-required) steps are allowed but flagged for awareness.
  for (const step of Object.keys(scale)) {
    if (!TYPE_STEPS_ASC.includes(step)) {
      warn(`typography.typeScale.${step}`, "non-standard type step — make sure components actually need it");
    }
  }

  // Monotonicity: caption <= body <= body-lg <= h3 <= h2 <= h1 <= display.
  for (const platform of STEP_PLATFORMS) {
    for (let i = 1; i < TYPE_STEPS_ASC.length; i++) {
      const prev = TYPE_STEPS_ASC[i - 1];
      const curr = TYPE_STEPS_ASC[i];
      const a = sizes[platform][prev];
      const b = sizes[platform][curr];
      if (a === undefined || b === undefined) continue;
      if (b < a) {
        err(
          `typography.typeScale.${curr}.${platform}.size`,
          `type scale is not monotonic: ${curr} (${b}px) < ${prev} (${a}px)`,
        );
      }
    }
  }
}

// --------------------------------------------------------- section: spacing

function validateSpacing(spacing) {
  if (!isPlainObject(spacing)) return;
  const base = requireNumber(spacing.base, "spacing.base", { min: 1 });
  const scale = unwrap(spacing.scale);
  if (!Array.isArray(scale) || scale.length === 0) {
    err("spacing.scale", "expected a non-empty array of spacing steps");
    return;
  }
  let prev = -Infinity;
  let ascending = true;
  scale.forEach((stepNode, i) => {
    const step = requireNumber(stepNode, `spacing.scale[${i}]`, { min: 0 });
    if (step === null) return;
    if (base !== null && step % base !== 0) {
      err(`spacing.scale[${i}]`, `${step} is not a multiple of spacing.base (${base})`);
    }
    if (step <= prev) ascending = false;
    prev = step;
  });
  if (!ascending) {
    warn("spacing.scale", "steps are not strictly ascending — sort the scale");
  }
}

// ---------------------------------------------------------- section: radius

function validateRadius(radius) {
  if (!isPlainObject(radius) || Object.keys(radius).length === 0) {
    if (radius !== undefined) err("radius", "expected a non-empty object of named radius steps");
    return;
  }
  for (const name of Object.keys(radius)) {
    requireNumber(radius[name], `radius.${name}`, { min: 0 });
  }
}

// --------------------------------------------------------- section: shadows

function validateShadows(shadows) {
  if (!isPlainObject(shadows) || Object.keys(shadows).length === 0) {
    if (shadows !== undefined) err("shadows", "expected a non-empty object of named shadows");
    return;
  }
  for (const name of Object.keys(shadows)) {
    requireString(shadows[name], `shadows.${name}`);
  }
}

// ---------------------------------------------- sections: breakpoints, grid

function validateBreakpointsAndGrid(breakpoints, grid) {
  const bpNames = [];
  if (!isPlainObject(breakpoints)) {
    if (breakpoints !== undefined) err("breakpoints", "expected an object of named breakpoint widths");
  } else {
    for (const required of ["desktop", "mobile"]) {
      if (!(required in breakpoints)) {
        err(`breakpoints.${required}`, "required breakpoint is missing");
      }
    }
    for (const [name, node] of Object.entries(breakpoints)) {
      const width = requireNumber(node, `breakpoints.${name}`, { min: 1 });
      if (width !== null) bpNames.push([name, width]);
    }
  }

  if (!isPlainObject(grid)) {
    if (grid !== undefined) err("grid", "expected an object with a grid definition per breakpoint");
    return;
  }
  for (const [bpName, bpWidth] of bpNames) {
    const g = grid[bpName];
    if (!isPlainObject(g)) {
      err(`grid.${bpName}`, `missing grid definition for breakpoint "${bpName}"`);
      continue;
    }
    const container = requireNumber(g.container, `grid.${bpName}.container`, { min: 1 });
    requireNumber(g.columns, `grid.${bpName}.columns`, { min: 1, integer: true });
    requireNumber(g.gutter, `grid.${bpName}.gutter`, { min: 0 });
    if (container !== null && container > bpWidth) {
      warn(`grid.${bpName}.container`, `container (${container}) is wider than the "${bpName}" breakpoint (${bpWidth})`);
    }
  }
  for (const name of Object.keys(grid)) {
    if (!bpNames.some(([bp]) => bp === name)) {
      warn(`grid.${name}`, `grid entry has no matching breakpoint "${name}"`);
    }
  }
}

// ------------------------------------------------------------------- main

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/validate-tokens.mjs <path/to/tokens.json>");
    process.exit(1);
  }

  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch (e) {
    console.error(`ERROR: ${file} — cannot read file (${e.message})`);
    process.exit(1);
  }

  let tokens;
  try {
    tokens = JSON.parse(raw);
  } catch (e) {
    console.error(`ERROR: ${file} — invalid JSON (${e.message})`);
    process.exit(1);
  }
  if (!isPlainObject(tokens)) {
    console.error(`ERROR: ${file} — root must be a JSON object`);
    process.exit(1);
  }

  // 1. Structural completeness (top level).
  for (const section of REQUIRED_SECTIONS) {
    if (!isPlainObject(tokens[section])) {
      err(section, "required section is missing or not an object");
    }
  }

  validateMeta(tokens.meta);
  validateColor(tokens.color);
  validateTypography(tokens.typography);
  validateSpacing(tokens.spacing);
  validateRadius(tokens.radius);
  validateShadows(tokens.shadows);
  validateBreakpointsAndGrid(tokens.breakpoints, tokens.grid);

  // 6. Provenance: source/confidence on every value node in the document.
  checkProvenance(tokens, "");

  for (const line of errors) console.error(line);
  for (const line of warnings) console.warn(line);

  const summary = `${errors.length} error(s), ${warnings.length} warning(s)`;
  if (errors.length > 0) {
    console.error(`\nFAIL: ${file} — ${summary}`);
    process.exit(1);
  }
  console.log(`${errors.length + warnings.length ? "\n" : ""}OK: ${file} — ${summary}`);
  process.exit(0);
}

main();
