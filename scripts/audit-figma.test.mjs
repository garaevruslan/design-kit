#!/usr/bin/env node
/**
 * audit-figma.test.mjs — регрессионная проверка audit-figma.mjs.
 *
 * Usage:  node scripts/audit-figma.test.mjs
 * Exit code: 1 если хоть одна проверка провалилась.
 *
 * Фикстура — живой дамп specimen прогона yoga-school-demo, см.
 * scripts/fixtures/figma/README.md. Проверяются и срабатывания, и ЧИСТОТА:
 * цвета в том дампе привязаны все, и если detached-fill вдруг начнёт стрелять —
 * это ложное срабатывание, которое тест обязан поймать не хуже пропуска.
 *
 * Тест сверяет ТЕКСТ находок, а не только их наличие. Урок lint-slop: сломанное
 * разворачивание var() не роняло тест, потому что правило продолжало срабатывать,
 * просто другим сообщением.
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const audit = join(here, "audit-figma.mjs");
const fixtures = join(here, "fixtures", "figma");
const dump = join(fixtures, "specimen-controls.json");
const worklog = join(fixtures, "worklog.md");
const tokens = join(here, "..", "examples", "yoga-school-demo", "project", "tokens.json");

function run(args) {
  // stderr перехватываем, а не наследуем: краевые прогоны намеренно печатают
  // usage и ошибки чтения — в выводе теста это шум.
  const opts = { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] };
  try {
    return { out: execFileSync(process.execPath, [audit, ...args], opts), code: 0 };
  } catch (e) {
    return { out: e.stdout ?? "", code: e.status ?? 1 };
  }
}

const failures = [];
const check = (name, ok, detail = "") => {
  if (!ok) failures.push(detail ? `${name} — ${detail}` : name);
};

// ---------------------------------------------- прогон 1: без исключений

const base = run([dump, "--tokens", tokens]);
const lines = base.out.split("\n").filter((l) => /^(ERROR|WARN):/.test(l));
const has = (rule, pred = () => true) =>
  lines.some((l) => new RegExp(`^(ERROR|WARN): ${rule} · `).test(l) && pred(l));
const count = (rule) => lines.filter((l) => l.includes(`: ${rule} · `)).length;

// 1. Правила, которые обязаны сработать на этом дампе.
check("detached-type срабатывает на текстах без текст-стиля", has("detached-type"));
check("detached-type покрывает все 4 текста", count("detached-type") === 4, `найдено ${count("detached-type")}`);
check("detached-radius срабатывает", has("detached-radius"));
check("detached-spacing срабатывает на gap", has("detached-spacing", (l) => /gap \d+/.test(l)));
check("detached-spacing срабатывает на padding", has("detached-spacing", (l) => /padding \[/.test(l)));

// 2. Сообщение различает «в шкале, но не привязано» и «нет в шкале».
//    Без этого поломка сверки со шкалами прошла бы незамеченной: правило
//    срабатывает в обоих случаях, отличается только текст.
check("радиус из шкалы описан как «не хватает биндинга»",
  has("detached-radius", (l) => /из шкалы radius, но не привязано/.test(l)),
  "сверка со шкалой tokens.json.radius не сработала");
check("gap из шкалы описан как «из шкалы spacing, но не привязан»",
  has("detached-spacing", (l) => /из шкалы spacing, но не привязан/.test(l)),
  "сверка со шкалой tokens.json.spacing не сработала");

// 3. Чистота: в этом дампе цвета привязаны ВСЕ. Ложное срабатывание здесь —
//    такой же дефект, как пропуск.
check("detached-fill чист (все заливки привязаны)", !has("detached-fill"));
check("detached-stroke чист", !has("detached-stroke"));
check("autolayout чист (все контейнеры с autolayout)", !has("autolayout"));
check("чистые правила перечислены в «Чисто по»",
  /Чисто по:.*detached-fill/.test(base.out) && /Чисто по:.*detached-stroke/.test(base.out));

// 4. Честность отчёта.
check("напечатано, что дампом не покрывается", /Дампом не покрывается:.*иконки/.test(base.out));
check("предупреждение об отсутствующем worklog", /worklog не передан/.test(base.out));
check("узлы посчитаны", /Проверено: 9 узлов/.test(base.out));
check("exit 1 при наличии ERROR", base.code === 1, `получен ${base.code}`);

// ------------------------------------- прогон 2: гашение по исключениям

const supp = run([dump, "--tokens", tokens, "--worklog", worklog]);
const suppLines = supp.out.split("\n").filter((l) => /^(ERROR|WARN):/.test(l));

check("detached-radius погашен списком исключений",
  !suppLines.some((l) => l.includes(": detached-radius · ")),
  "правило есть в «Утверждённых исключениях» worklog");
check("погашенное правило ушло в «Чисто по»", /Чисто по:.*detached-radius/.test(supp.out));
check("счётчик погашенных напечатан", /Погашено списком «Утверждённые исключения»: [1-9]/.test(supp.out));
check("остальные правила гашением не задеты",
  suppLines.some((l) => l.includes(": detached-type · ")),
  "гашение одного правила не должно глушить другие");
check("нет предупреждения о worklog, когда он передан", !/worklog не передан/.test(supp.out));

// ------------------------------------------------- прогон 3: краевые случаи

const noArgs = run([]);
check("без аргументов — usage и exit 2", noArgs.code === 2, `получен ${noArgs.code}`);

const badPath = run(["/nope/nope.json"]);
check("несуществующий файл — exit 1", badPath.code === 1);

// -------------------------------------------------------------------- итог

if (failures.length) {
  console.error(`ПРОВАЛ: ${failures.length} проверок\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("\nВывод аудита (прогон 1):\n");
  console.error(base.out);
  process.exit(1);
}

console.log(`OK: audit-figma.mjs — все проверки пройдены (${lines.length} находок на фикстуре, exit ${base.code})`);
