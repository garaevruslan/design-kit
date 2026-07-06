#!/usr/bin/env node
/**
 * create-project.mjs — scaffold a new design-kit project folder.
 *
 * Usage:  node scripts/create-project.mjs <target-dir>
 * Example: node design-kit/scripts/create-project.mjs ../my-landing
 *
 * Copies the frozen kit snapshot (DESIGN-CONTRACT.md, docs/, templates/,
 * scripts/) into the target, creates an empty project/ workspace, pre-fills
 * project/inputs.md with the kit version and project/worklog.md from the
 * template. The pattern library (library/) is NOT copied — agents read it
 * from the kit clone (see DESIGN-CONTRACT.md).
 */

import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, resolve, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/create-project.mjs <target-dir>");
  process.exit(1);
}

const dest = resolve(process.cwd(), target);
if (existsSync(join(dest, "DESIGN-CONTRACT.md"))) {
  console.error(`ERROR: ${dest} already looks like a design-kit project (DESIGN-CONTRACT.md exists).`);
  process.exit(1);
}

let version = "unknown";
try {
  version = execSync("git describe --tags --always", { cwd: kitRoot }).toString().trim();
} catch { /* not a git clone — keep "unknown" */ }

mkdirSync(join(dest, "project", "reference-shots"), { recursive: true });
cpSync(join(kitRoot, "DESIGN-CONTRACT.md"), join(dest, "DESIGN-CONTRACT.md"));
for (const dir of ["docs", "templates", "scripts"]) {
  cpSync(join(kitRoot, dir), join(dest, dir), { recursive: true });
}

const projectName = basename(dest);
const today = new Date().toISOString().slice(0, 10);

writeFileSync(join(dest, "project", "inputs.md"), `# inputs — ${projectName}

| Поле | Значение |
| --- | --- |
| Версия комплекта | ${version} (репо: ${kitRoot}) |
| Дата старта | ${today} |

## Референсы

- <!-- URL живого сайта и/или пути к скриншотам -->

## Бриф

- **Продукт:** <!-- что за сайт/продукт -->
- **Тип и масштаб:** <!-- лендинг 1 страница / многостраничник N страниц -->
- **Контент:** <!-- готов (где лежит) / генерируется из брифа -->
- **Аудитория:**
- **Целевое действие:**

## Брейкпоинты

- desktop 1440 + mobile 390 <!-- или свои -->
`);

let worklog = readFileSync(join(kitRoot, "templates", "worklog.md"), "utf8");
worklog = worklog
  .replace("# Worklog — <название проекта>", `# Worklog — ${projectName}`)
  .replace("| Проект | <имя / клиент / кодовое имя> |", `| Проект | ${projectName} |`)
  .replace("| Дата старта | <YYYY-MM-DD> |", `| Дата старта | ${today} |`);
writeFileSync(join(dest, "project", "worklog.md"), worklog);

console.log(`OK: project scaffolded at ${dest}`);
console.log(`    kit version: ${version}`);
console.log(`    next: заполни project/inputs.md и скажи агенту «продолжаем проект design-kit в ${dest}»`);
