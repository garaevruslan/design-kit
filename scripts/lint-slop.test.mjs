#!/usr/bin/env node
/**
 * lint-slop.test.mjs — регрессионная проверка lint-slop.mjs.
 *
 * Usage:  node scripts/lint-slop.test.mjs
 * Exit code: 1 если хоть одна проверка провалилась.
 *
 * Зачем: линтер, который ничего не находит, неотличим от сломанного. Чистый прогон
 * на сданном проекте выглядит одинаково и когда всё хорошо, и когда парсер
 * развалился после рефакторинга. Фикстура `fixtures/slop/` намеренно грязная —
 * если правило перестало срабатывать, тест это скажет.
 *
 * Проверяется не только детекция, но и дисциплина комплекта:
 * scoping «референс побеждает», гашение по «Утверждённым исключениям»
 * и честность отчёта (группа «Чисто по», список нереализованного).
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const linter = join(here, "lint-slop.mjs");
const fixture = join(here, "fixtures", "slop");

// --------------------------------------------------------------- run linter

let stdout = "";
let exitCode = 0;
try {
  stdout = execFileSync(process.execPath, [linter, fixture], { encoding: "utf8" });
} catch (e) {
  stdout = e.stdout ?? "";
  exitCode = e.status ?? 1;
}

const lines = stdout.split("\n");
const findings = lines.filter((l) => /^(ERROR|WARN):/.test(l));

// ------------------------------------------------------------------ asserts

const failures = [];
const check = (name, ok, detail = "") => {
  if (!ok) failures.push(detail ? `${name} — ${detail}` : name);
};

/** Есть находка правила `rule`, удовлетворяющая предикату. */
const has = (rule, pred = () => true) =>
  findings.some((l) => new RegExp(`^(ERROR|WARN): ${rule} · `).test(l) && pred(l));

// 1. Баны на invented/глобальных правилах дают ERROR.
for (const rule of ["T1", "T6", "T23", "T24"]) {
  check(`${rule} даёт ERROR`, has(rule, (l) => l.startsWith("ERROR:")));
}

// 2. Системные правила и пороги срабатывают (как WARN).
for (const rule of ["T3", "T5", "T9", "T14", "T19", "T20", "T21", "T30", "T36"]) {
  check(`${rule} срабатывает`, has(rule));
}

// 2a. Разворачивание var(--…) сквозь :root. Проверять сам факт срабатывания T3
//     недостаточно: со сломанным резолвингом правило всё равно стреляет, но другим
//     сообщением («не развернулся»). Тест обязан отличать одно от другого — иначе
//     деградация резолвинга проходит мимо. Поймано при проверке теста на поломку.
check("var(--…) разворачивается в число",
  has("T3", (l) => /label-tight/.test(l) && /0\.02em/.test(l)),
  "ожидалось сообщение с развёрнутым значением трекинга");
check("нет находок «не развернулся»",
  !findings.some((l) => /не развернулся/.test(l)),
  "значение не удалось развернуть — резолвинг var(--…) сломан");

// 3. Флаги.
for (const rule of ["T32", "T34"]) {
  check(`${rule} срабатывает`, has(rule));
}

// 4. Пороги никогда не ERROR (иначе прогон падал бы на живом референсе —
//    см. коммит 2803a1a, интерлиньяж 0.8-1.0).
for (const rule of ["T3", "T5", "T9", "T36", "T30"]) {
  check(`${rule} не поднимается до ERROR`, !has(rule, (l) => l.startsWith("ERROR:")),
    "порог обязан оставаться WARN");
}

// 5. Scoping: находки на reference-секции понижены и помечены.
check("hero (reference) помечен reference-inherited",
  findings.some((l) => /index\.html/.test(l) && /reference-inherited/.test(l)));
check("reference-находки понижены до warning",
  findings.every((l) => !/reference-inherited/.test(l) || / · warning · /.test(l)),
  "унаследованное из референса обязано быть warning");

// 6. Scoping: invented-секция сохраняет полную строгость.
check("teachers (invented) без пометки reference-inherited",
  findings.some((l) => /секции teachers/.test(l) && !/reference-inherited/.test(l)));

// 7. Гашение по «Утверждённым исключениям»: T12 в worklog → не находка.
check("T12 погашен исключением", !has("T12"), "правило есть в «Утверждённых исключениях»");
check("T12 ушёл в «Чисто по»", /Чисто по:.*\bT12\b/.test(stdout));
check("счётчик погашенных напечатан", /Погашено списком «Утверждённые исключения»: [1-9]/.test(stdout));

// 8. Честность отчёта.
check("напечатана группа «Чисто по»", /Чисто по:/.test(stdout));
check("перечислено нереализованное грепом", /Не реализовано грепом/.test(stdout));
check("worklog найден (нет предупреждения о scoping)",
  !/scoping «референс побеждает» не применён/.test(stdout));

// 9. Код возврата.
check("exit code 1 при наличии ERROR", exitCode === 1, `получен ${exitCode}`);

// -------------------------------------------------------------------- report

const total = 9;
if (failures.length) {
  console.error(`ПРОВАЛ: ${failures.length} проверок из ~${total} групп\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("\nВывод линтера:\n");
  console.error(stdout);
  process.exit(1);
}

console.log(`OK: lint-slop.mjs — все проверки пройдены (${findings.length} находок на фикстуре, exit ${exitCode})`);
