import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export const DATA_ROOT = process.env.MYCOOK_DATA || path.join(ROOT, 'public');
export const SITE_URL = (process.env.SITE_URL || 'https://cook.alexander.xin').replace(/\/$/, '');

// 按文件 mtime 失效的缓存：长驻 HTTP MCP 在重新生成 JSON 后能感知更新，
// 而非一直返回旧数据。代价是每次调用多一次 statSync，可忽略。
const cache = new Map(); // relativePath -> { data, mtimeMs }

function readJson(relativePath) {
    const filePath = path.join(DATA_ROOT, relativePath);
    let stat;
    try {
        stat = fs.statSync(filePath);
    } catch {
        // 文件不存在（或不可访问），不缓存 null，便于下次重试
        return null;
    }
    const cached = cache.get(relativePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.data;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    cache.set(relativePath, { data, mtimeMs: stat.mtimeMs });
    return data;
}

function normalizePath(pathname) {
    let normalized = String(pathname || '').trim();
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;
    normalized = normalized.replace(/\/$/, '') || '/';
    return normalized;
}

function resolveMarkdownPath(urlPath) {
    const clean = normalizePath(urlPath);
    if (clean === '/') return path.join(DATA_ROOT, 'index.md');
    const candidates = [
        path.join(DATA_ROOT, `${clean.slice(1)}.md`),
        path.join(DATA_ROOT, clean.slice(1), 'index.md'),
    ];
    // 旧版索引把「文件夹名=菜名」的菜折叠成 4 段路径；展开到 folder/<folder>.md 镜像兜底
    const parts = clean.split('/').filter(Boolean);
    if (parts.length === 4 && parts[0] === 'howtocook' && parts[1] === 'dishes') {
        candidates.push(path.join(DATA_ROOT, clean.slice(1), `${parts[3]}.md`));
    }
    return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function linkFor(pathname) {
    const normalized = normalizePath(pathname);
    return `${SITE_URL}${normalized === '/' ? '/' : normalized}`;
}

function isDishItem(item) {
    const link = String(item?.link || '');
    return link.startsWith('/cooklikehoc/') || link.startsWith('/howtocook/dishes/');
}

/** Common spoken names → titles that exist in the index. */
const RECIPE_ALIASES = [
    ['番茄炒蛋', '西红柿炒鸡蛋'],
    ['番茄鸡蛋', '西红柿炒鸡蛋'],
    ['西红柿炒蛋', '西红柿炒鸡蛋'],
    ['蛋炒饭', '米饭'],
    ['红烧肉', '简易红烧肉'],
];

/** 口语食材名 → pantry.json 里的规范名（ask 与检索共用，避免两处各自维护） */
export const INGREDIENT_ALIASES = {
    西红柿: '番茄',
    洋芋: '土豆',
    马铃薯: '土豆',
    卷心菜: '包菜',
    圆白菜: '包菜',
    甘蓝: '包菜',
    菜花: '花菜',
    花椰菜: '花菜',
    蘑菇: '菌菇',
    香菇: '菌菇',
};

/** pantry 未启用时的兜底常见食材 */
const COMMON_INGREDIENTS = [
    '鸡蛋', '土豆', '鸡肉', '猪肉', '牛肉', '番茄', '豆腐', '青椒', '洋葱', '胡萝卜',
];

/** 从问句里提取命中的规范食材名（含口语别名归一），供 ask 与按食材检索共用。 */
export function extractIngredientHits(question) {
    const text = String(question || '');
    if (!text) return [];
    const pantry = listPantryIngredients();
    const names = new Set(COMMON_INGREDIENTS);
    for (const item of pantry.enabled ? pantry.ingredients || [] : []) {
        if (item?.name) names.add(item.name);
    }
    const hits = [];
    for (const name of names) {
        if (name && text.includes(name) && !hits.includes(name)) hits.push(name);
    }
    for (const [spoken, canonical] of Object.entries(INGREDIENT_ALIASES)) {
        if (text.includes(spoken) && names.has(canonical) && !hits.includes(canonical)) {
            hits.push(canonical);
        }
    }
    return hits.slice(0, 8);
}

export function expandSearchQueries(query) {
    const raw = String(query || '').trim();
    if (!raw) return [];
    const out = new Set([raw]);

    const addVariants = (text) => {
        if (!text) return;
        out.add(text);
        if (text.includes('番茄')) out.add(text.replace(/番茄/g, '西红柿'));
        if (text.includes('西红柿')) out.add(text.replace(/西红柿/g, '番茄'));
        for (const [spoken, canonical] of RECIPE_ALIASES) {
            if (text.includes(spoken)) out.add(canonical);
        }
    };

    addVariants(raw);
    // Strip filler so 「怎么做番茄炒蛋」 still hits dish titles.
    addVariants(
        raw
            .replace(
                /怎么做|如何做|的做法|做法|菜谱|教我|想吃|我想|请问|一下|呢|啊|吗|？|\?/g,
                '',
            )
            .trim(),
    );
    return [...out].filter(Boolean);
}

function scoreTitle(title, queries) {
    const t = String(title || '').toLowerCase();
    let best = 0;
    for (const q of queries) {
        const ql = String(q).toLowerCase();
        if (!ql) continue;
        if (t === ql) best = Math.max(best, 100);
        else if (t.includes(ql)) best = Math.max(best, 70 + Math.min(ql.length, 20));
        else if (ql.includes(t) && t.length >= 2) best = Math.max(best, 40);
    }
    return best;
}

export function searchRecipes({ query = '', limit = 10, source } = {}) {
    const data = readJson('recipes-index.json');
    if (!data?.items) return { total: 0, matched: 0, items: [] };

    let items = data.items.filter(isDishItem);
    if (source) items = items.filter((item) => item.source === source);

    const queries = expandSearchQueries(query);
    let ranked = items;
    if (queries.length) {
        ranked = items
            .map((item) => ({ item, score: scoreTitle(item.title, queries) }))
            .filter((row) => row.score > 0)
            .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'zh'))
            .map((row) => row.item);
    }

    return {
        total: data.total,
        matched: ranked.length,
        items: ranked.slice(0, Math.min(Math.max(limit, 1), 50)).map((item) => ({
            title: item.title,
            link: linkFor(item.link),
            path: normalizePath(item.link),
            source: item.source,
        })),
    };
}

export function getRecipe(pathname) {
    const data = readJson('recipes-index.json');
    if (!data?.items) return { found: false, path: normalizePath(pathname) };

    const normalized = normalizePath(pathname);
    let item = data.items.find(
        (entry) => entry.link === normalized || entry.link === `${normalized}/`,
    );
    if (!item) {
        // 旧版 4 段折叠链接兜底：匹配恰好多一段的完整形态（/dishes/<cat>/<folder> → .../<folder>/<title>）
        item = data.items.find(
            (entry) =>
                entry.link.startsWith(`${normalized}/`) &&
                entry.link.split('/').length === normalized.split('/').length + 1,
        );
    }
    if (!item) return { found: false, path: normalized };

    return {
        found: true,
        title: item.title,
        path: item.link,
        link: linkFor(item.link),
        source: item.source,
        markdownPath: `${item.link}.md`,
    };
}

export function getRecipeMarkdown(pathname) {
    const meta = getRecipe(pathname);
    if (!meta.found) return meta;

    const markdownPath = resolveMarkdownPath(meta.path);
    if (!markdownPath) {
        return { found: true, ...meta, markdown: null, error: 'Markdown mirror not found' };
    }

    const markdown = fs.readFileSync(markdownPath, 'utf8');
    return {
        found: true,
        title: meta.title,
        path: meta.path,
        link: meta.link,
        source: meta.source,
        markdown,
        tokens: Math.ceil(markdown.length / 4),
    };
}

export function getSiteStats() {
    return readJson('stats.json') || { error: 'stats.json not found' };
}

export function getRecentUpdates() {
    return readJson('recent.json') || { error: 'recent.json not found' };
}

export function searchByIngredients({ ingredients = [], limit = 12 } = {}) {
    const pantry = readJson('pantry.json');
    if (!pantry?.enabled || !pantry.recipes?.length) {
        return { enabled: false, matched: 0, items: [] };
    }

    const need = new Set(
        ingredients.map((item) => String(item).trim()).filter(Boolean),
    );
    if (!need.size) return { enabled: true, matched: 0, items: [] };

    const needList = [...need];
    const items = pantry.recipes
        .filter((recipe) => needList.every((name) => recipe.stuff.includes(name)))
        .slice(0, Math.min(Math.max(limit, 1), 30))
        .map((recipe) => ({
            name: recipe.name,
            ingredients: recipe.stuff,
            bv: recipe.bv || null,
            bilibili: recipe.bv ? `https://www.bilibili.com/video/BV${recipe.bv.replace(/^BV/, '')}` : null,
        }));

    return { enabled: true, matched: items.length, items };
}

export function randomRecipe({ source } = {}) {
    const data = readJson('recipes-index.json');
    if (!data?.items?.length) return { found: false };

    let pool = data.items.filter(isDishItem);
    if (source) pool = pool.filter((item) => item.source === source);
    if (!pool.length) return { found: false, source: source || 'all' };

    const item = pool[Math.floor(Math.random() * pool.length)];
    return {
        found: true,
        title: item.title,
        path: item.link,
        link: linkFor(item.link),
        source: item.source,
    };
}

export function listPantryIngredients() {
    const pantry = readJson('pantry.json');
    if (!pantry?.enabled) return { enabled: false, ingredients: [] };
    return { enabled: true, ingredients: pantry.ingredients ?? [] };
}

export function searchTips({ query = '', limit = 10 } = {}) {
    const data = readJson('tips-index.json');
    if (!data?.items) return { total: 0, matched: 0, items: [] };

    const raw = String(query).trim().toLowerCase();
    let ranked = data.items;
    if (raw) {
        ranked = data.items
            .map((item) => {
                const title = String(item.title || '').toLowerCase();
                let score = 0;
                if (title && raw.includes(title)) score = 90;
                else if (title && title.length >= 2 && raw.includes(title.slice(0, 2))) {
                    // prefer longer title overlap, e.g. 油温判断技巧
                    const hit = [...title].filter((ch, i) => i < title.length - 1 && raw.includes(title.slice(i, i + 2))).length;
                    score = hit * 8;
                    if (raw.includes('油温') && title.includes('油温')) score += 40;
                    if (raw.includes('火候') && title.includes('油温')) score += 20;
                }
                if (String(item.category || '').toLowerCase().includes(raw)) score += 10;
                return { item, score };
            })
            .filter((row) => row.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((row) => row.item);
    }

    return {
        total: data.total,
        matched: ranked.length,
        items: ranked.slice(0, Math.min(Math.max(limit, 1), 30)).map((item) => ({
            title: item.title,
            link: linkFor(item.link),
            path: normalizePath(item.link),
            category: item.category,
        })),
    };
}

/** Load markdown mirror for any site path (recipe or tip). */
export function getMarkdownByPath(pathname) {
    const normalized = normalizePath(pathname);
    const markdownPath = resolveMarkdownPath(normalized);
    if (!markdownPath) return { found: false, path: normalized };
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    return {
        found: true,
        path: normalized,
        link: linkFor(normalized),
        markdown,
        excerpt: markdown.replace(/\s+/g, ' ').trim().slice(0, 1200),
    };
}

export function buildAiPrompt({ title, body, url }) {
    return `你是 MyCook 厨房助手。以下是「${title}」的菜谱正文。请根据用户问题回答：备菜顺序、 substitutions、火候、计时、份量换算等。若正文未提及，请明确说明并给出合理建议。

---
${body}
---

来源：${url}
站点：${SITE_URL}`;
}
