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
    return normalized.replace(/\/$/, '') || '/';
}

function resolveMarkdownPath(urlPath) {
    const clean = normalizePath(urlPath);
    if (clean === '/') return path.join(DATA_ROOT, 'index.md');
    const candidates = [
        path.join(DATA_ROOT, `${clean.slice(1)}.md`),
        path.join(DATA_ROOT, clean.slice(1), 'index.md'),
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function linkFor(pathname) {
    const normalized = normalizePath(pathname);
    return `${SITE_URL}${normalized === '/' ? '/' : normalized}`;
}

export function searchRecipes({ query = '', limit = 10, source } = {}) {
    const data = readJson('recipes-index.json');
    if (!data?.items) return { total: 0, matched: 0, items: [] };

    const keyword = String(query).trim().toLowerCase();
    let items = data.items;
    if (source) items = items.filter((item) => item.source === source);
    if (keyword) items = items.filter((item) => item.title.toLowerCase().includes(keyword));

    return {
        total: data.total,
        matched: items.length,
        items: items.slice(0, Math.min(Math.max(limit, 1), 50)).map((item) => ({
            title: item.title,
            link: linkFor(item.link),
            path: item.link,
            source: item.source,
        })),
    };
}

export function getRecipe(pathname) {
    const data = readJson('recipes-index.json');
    if (!data?.items) return { found: false, path: normalizePath(pathname) };

    const normalized = normalizePath(pathname);
    const item = data.items.find(
        (entry) => entry.link === normalized || entry.link === `${normalized}/`,
    );
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

    const items = pantry.recipes
        .filter((recipe) => [...need].every((name) => recipe.stuff.includes(name)))
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

    let pool = data.items;
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

    const keyword = String(query).trim().toLowerCase();
    let items = data.items;
    if (keyword) {
        items = items.filter(
            (item) =>
                item.title.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword),
        );
    }

    return {
        total: data.total,
        matched: items.length,
        items: items.slice(0, Math.min(Math.max(limit, 1), 30)).map((item) => ({
            title: item.title,
            link: linkFor(item.link),
            path: item.link,
            category: item.category,
        })),
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
