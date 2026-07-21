/**
 * dump-tree.js — снимок дерева Figma для офлайн-аудита (фаза 6, слой 1).
 *
 * ЭТОТ ФАЙЛ НЕ ЗАПУСКАЕТСЯ ЧЕРЕЗ NODE. Это тело для MCP-вызова:
 *   use_figma({ fileKey, skillNames: 'figma-use', code: <содержимое этого файла> })
 * Перед вызовом обязателен скилл `figma-use` (docs/assembly-rules.md).
 *
 * Возвращённый JSON агент кладёт в `project/figma-dump.json`, дальше его линтует
 * офлайн `scripts/audit-figma.mjs`. Зачем через диск: аудит становится
 * воспроизводимым, диффается между прогонами и перепроверяется без сети.
 *
 * ПОЧЕМУ PLUGIN API, А НЕ READ-ИНСТРУМЕНТЫ (проверено 2026-07-21):
 *   get_metadata      → только структура и геометрия, ни заливок, ни привязок;
 *   get_variable_defs → плоский набор переменных поддерева; не говорит, какой
 *                       узел какую использует, и НЕ показывает непривязанное —
 *                       а правилу no-detached-values нужно именно непривязанное;
 *   get_design_context→ сгенерированный код и скриншот, не данные узла.
 * Привязки на уровне узла (`paint.boundVariables.color.id`, `node.boundVariables`)
 * доступны только здесь.
 *
 * НАСТРОЙКА ПЕРЕД ВЫЗОВОМ — две строки ниже:
 *   ROOT_ID — id фрейма страницы (`home/desktop-1440` и т.п.) или фрейма секции;
 *   PAGE    — имя страницы Figma, если корень не на первой (иначе null).
 *
 * ОБЪЁМ. Снимать по одному фрейму страницы за вызов и склеивать дампы: полная
 * страница макетов даёт тысячи узлов, и ответ упрётся в лимит. `meta.rootId`
 * в каждом дампе позволяет склейку различить.
 */

const ROOT_ID = '2:45';
const PAGE = null;

if (PAGE) {
  const p = figma.root.children.find((x) => x.name === PAGE);
  if (!p) throw new Error(`страница "${PAGE}" не найдена`);
  await figma.setCurrentPageAsync(p);
}

figma.skipInvisibleInstanceChildren = true;

const M = figma.mixed;
const mx = (v) => (v === M ? 'MIXED' : v);
const hx = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');

/** Заливки/обводки: значение + к какой переменной привязано (null = отвязано). */
const P = (l) =>
  Array.isArray(l)
    ? l.map((p) => ({
        t: p.type,
        v: p.type === 'SOLID' ? hx(p.color) : null,
        o: p.opacity ?? 1,
        vis: p.visible !== false,
        b: p.boundVariables?.color?.id ?? null,
      }))
    : mx(l);

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) throw new Error(`узел ${ROOT_ID} не найден на странице ${figma.currentPage.name}`);

const nodes = [];
(function walk(n, parent) {
  const o = { id: n.id, name: n.name, type: n.type, parent };

  if ('x' in n) o.box = [n.x, n.y, n.width, n.height].map(Math.round);
  if ('layoutMode' in n) o.layoutMode = n.layoutMode;
  if ('layoutSizingHorizontal' in n) o.sizing = [n.layoutSizingHorizontal, n.layoutSizingVertical];

  if ('fills' in n) o.fills = P(n.fills);
  if ('strokes' in n) o.strokes = P(n.strokes);
  if (n.fillStyleId) o.fillStyleId = mx(n.fillStyleId);
  if (n.strokeStyleId) o.strokeStyleId = n.strokeStyleId;
  if (n.textStyleId) o.textStyleId = mx(n.textStyleId);
  if (n.effectStyleId) o.effectStyleId = n.effectStyleId;

  // Прямые привязки узла: fills, strokes, itemSpacing, paddingLeft, fontSize…
  if (n.boundVariables && Object.keys(n.boundVariables).length) {
    o.boundKeys = Object.keys(n.boundVariables);
  }

  if (n.type === 'TEXT') {
    o.chars = n.characters;
    o.fontSize = mx(n.fontSize);
    o.font = n.fontName === M ? 'MIXED' : `${n.fontName.family} ${n.fontName.style}`;
    o.textCase = mx(n.textCase);
    o.ls = mx(n.letterSpacing);
    o.lh = mx(n.lineHeight);
  }

  if ('cornerRadius' in n) o.radius = mx(n.cornerRadius);
  if ('paddingLeft' in n) o.padding = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft];
  if ('itemSpacing' in n) o.gap = n.itemSpacing;
  if (n.effects?.length) o.effects = n.effects.map((e) => e.type);
  if (n.type === 'INSTANCE') o.mainComponentId = n.mainComponent?.id ?? null;

  nodes.push(o);
  if ('children' in n) n.children.forEach((c) => walk(c, n.id));
})(root, null);

return {
  meta: {
    fileKey: figma.fileKey ?? null,
    page: figma.currentPage.name,
    rootId: ROOT_ID,
    rootName: root.name,
    nodeCount: nodes.length,
    generator: 'dump-tree.js v1',
  },
  nodes,
};
