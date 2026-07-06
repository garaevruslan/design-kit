#!/usr/bin/env node
/**
 * fetch-icons.mjs — pull pixel-perfect SVG icons from the Reicon collection
 * (github.com/dqev/reicon, MIT, 2680+ icons, 24×24, weights Outline & Filled).
 *
 * The kit stores NO icons of its own (docs/icons.md): this script caches the
 * upstream icon-data.json once per project and extracts named icons on demand.
 *
 * Usage:
 *   # search the collection by name and description tags (pick a name):
 *   node scripts/fetch-icons.mjs --search calendar
 *
 *   # extract icons of the project's chosen weight into project/assets/icons/:
 *   node scripts/fetch-icons.mjs --weight outline calendar arrow-right2 user
 *
 *   # options:
 *   --weight outline|filled   required for extraction (icon-single-weight)
 *   --out <dir>               output dir (default: project/assets/icons)
 *   --cache <file>            cache path (default: project/.cache/reicon/icon-data.json)
 *   --refresh                 re-download icon-data.json even if cached
 *   --source <url>            override upstream icon-data.json URL
 *
 * icon-data.json shape: { weights:[...], categories:{ <cat>:{ icons:{
 *   <name>:{ description:[tags], weights:{ Outline:{code}, Filled:{code} } } } } } }.
 * `code` is the inner SVG markup (paths with fill="currentColor"); this script
 * wraps it in a 24×24 <svg> so icon color inherits from CSS `color`
 * (icon-color-from-roles). No external dependencies.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

const SOURCE_URL = "https://raw.githubusercontent.com/dqev/reicon/main/data/icon-data.json";

// ------------------------------------------------------------- arg parsing

function parseArgs(argv) {
  const opts = { names: [], search: null, weight: null, out: null, cache: null, refresh: false, source: SOURCE_URL };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--search") opts.search = argv[++i] ?? "";
    else if (a === "--weight") opts.weight = (argv[++i] ?? "").toLowerCase();
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--cache") opts.cache = argv[++i];
    else if (a === "--source") opts.source = argv[++i];
    else if (a === "--refresh") opts.refresh = true;
    else if (a.startsWith("--")) fail(`unknown option: ${a}`);
    else opts.names.push(a);
  }
  return opts;
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------- data load

async function loadData(cachePath, sourceUrl, refresh) {
  if (existsSync(cachePath) && !refresh) {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  }
  if (typeof fetch !== "function") {
    fail("global fetch unavailable (need Node 18+); or place icon-data.json at the --cache path manually");
  }
  process.stderr.write(`fetching ${sourceUrl} …\n`);
  let res;
  try {
    res = await fetch(sourceUrl);
  } catch (e) {
    fail(`download failed (${e.message}); check network or pass a local --cache file`);
  }
  if (!res.ok) fail(`download failed: HTTP ${res.status} for ${sourceUrl}`);
  const text = await res.text();
  const cacheDir = dirname(cachePath);
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cachePath, text);
  // Keep the ~9 MB cache out of git (docs/icons.md: cache is not committed).
  writeFileSync(join(cacheDir, ".gitignore"), "*\n");
  process.stderr.write(`cached → ${cachePath}\n`);
  return JSON.parse(text);
}

/** Flatten categories → Map(name → { category, description, weights }). */
function buildIndex(data) {
  const index = new Map();
  for (const [category, cat] of Object.entries(data.categories ?? {})) {
    for (const [name, icon] of Object.entries(cat.icons ?? {})) {
      index.set(name, { category, description: icon.description ?? [], weights: icon.weights ?? {} });
    }
  }
  return index;
}

// ------------------------------------------------------------------- render

/** Wrap Reicon inner markup in a 24×24 <svg>; paths carry fill="currentColor". */
function toSvg(innerCode) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">${innerCode}</svg>\n`;
}

/** Resolve the requested weight ("outline"/"filled") to a data key, or null. */
function weightKey(icon, weight) {
  const want = weight === "outline" ? "Outline" : weight === "filled" ? "Filled" : null;
  if (want && icon.weights[want]?.code) return want;
  return null;
}

// --------------------------------------------------------------------- main

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cachePath = resolve(opts.cache ?? "project/.cache/reicon/icon-data.json");
  const data = await loadData(cachePath, opts.source, opts.refresh);
  const index = buildIndex(data);

  // --- search mode: print candidate names, no files written.
  if (opts.search !== null) {
    const q = opts.search.toLowerCase();
    const hits = [];
    for (const [name, icon] of index) {
      const inName = name.toLowerCase().includes(q);
      const inTags = icon.description.some((d) => d.toLowerCase().includes(q));
      if (inName || inTags) hits.push({ name, icon, exact: name.toLowerCase() === q, inName });
    }
    if (hits.length === 0) {
      console.log(`no icons match "${opts.search}" (searched ${index.size} names + tags)`);
      return;
    }
    // Exact name first, then name matches, then tag-only matches; alphabetical within.
    hits.sort((a, b) => (b.exact - a.exact) || (b.inName - a.inName) || a.name.localeCompare(b.name));
    console.log(`${hits.length} match(es) for "${opts.search}":\n`);
    for (const { name, icon } of hits.slice(0, 60)) {
      const tags = icon.description.length ? `  — ${icon.description.join(", ")}` : "";
      console.log(`  ${name}  [${icon.category}]${tags}`);
    }
    if (hits.length > 60) console.log(`  … and ${hits.length - 60} more (narrow the query)`);
    return;
  }

  // --- extraction mode.
  if (opts.names.length === 0) {
    fail("nothing to do: pass icon names to extract, or --search <term> to find them");
  }
  if (opts.weight !== "outline" && opts.weight !== "filled") {
    fail("--weight outline|filled is required for extraction (icon-single-weight: one weight per project, fixed in phase 1)");
  }

  const outDir = resolve(opts.out ?? "project/assets/icons");
  mkdirSync(outDir, { recursive: true });

  const missing = [];
  const noWeight = [];
  let written = 0;
  for (const name of opts.names) {
    const icon = index.get(name);
    if (!icon) { missing.push(name); continue; }
    const key = weightKey(icon, opts.weight);
    if (!key) { noWeight.push(name); continue; }
    writeFileSync(join(outDir, `${name}.svg`), toSvg(icon.weights[key].code));
    written++;
  }

  console.log(`OK: ${written}/${opts.names.length} icon(s) → ${outDir} (weight: ${opts.weight})`);
  if (noWeight.length) console.warn(`WARN: no "${opts.weight}" weight for: ${noWeight.join(", ")}`);
  if (missing.length) {
    console.error(`ERROR: not found in Reicon: ${missing.join(", ")}`);
    console.error(`       find the right name with: node scripts/fetch-icons.mjs --search <term>`);
    console.error(`       do NOT hand-draw or mix another collection (icons-from-collection).`);
    process.exit(1);
  }
}

main();
