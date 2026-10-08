/**
 * Public kitchen ask endpoint helpers (rate-limited, CORS, tool-first, Omni optional).
 */
import {
    SITE_URL,
    getMarkdownByPath,
    listPantryIngredients,
    randomRecipe,
    searchByIngredients,
    searchRecipes,
    searchTips,
} from '../scripts/mcp-tools.mjs';

const ALLOWED_ORIGINS = new Set([
    'https://cook.alexander.xin',
    'https://mycook.alexander.xin',
    'https://www.alexander.xin',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:4173',
    'http://localhost:4173',
]);

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateBuckets = new Map();

export function corsHeaders(origin) {
    const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://cook.alexander.xin';
    return {
        'Access-Control-Allow-Origin': allow,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
        Vary: 'Origin',
    };
}

export function isOriginAllowed(origin) {
    if (!origin) return true;
    return ALLOWED_ORIGINS.has(origin);
}

function sanitizeQuestion(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/\s+/g, ' ').trim().slice(0, 400);
}

function sanitizeMessages(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    let total = 0;
    for (const item of raw.slice(-10)) {
        if (!item || typeof item !== 'object') continue;
        const role = item.role;
        const text = sanitizeQuestion(item.text);
        if ((role !== 'user' && role !== 'assistant') || !text) continue;
        if (total + text.length > 2000) break;
        total += text.length;
        out.push({ role, text });
    }
    return out;
}

function clientIp(req) {
    const cf = req.get?.('cf-connecting-ip')?.trim();
    if (cf) return cf;
    const xff = req.get?.('x-forwarded-for')?.split(',')[0]?.trim();
    if (xff) return xff;
    return req.ip || 'unknown';
}

function takeRateSlot(ip) {
    const now = Date.now();
    const prev = rateBuckets.get(ip) || [];
    const recent = prev.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX) {
        rateBuckets.set(ip, recent);
        return false;
    }
    recent.push(now);
    rateBuckets.set(ip, recent);
    return true;
}

function isSafePath(pathname) {
    if (typeof pathname !== 'string') return false;
    if (!pathname.startsWith('/')) return false;
    if (pathname.includes('..') || pathname.includes('//')) return false;
    return (
        pathname.startsWith('/cooklikehoc/') ||
        pathname.startsWith('/howtocook/dishes/') ||
        pathname.startsWith('/howtocook/tips/') ||
        pathname === '/' ||
        pathname.startsWith('/en/')
    );
}

function extractIngredients(question) {
    const pantry = listPantryIngredients();
    const names = pantry.enabled ? pantry.ingredients || [] : [];
    const hit = [];
    for (const name of names) {
        if (name && question.includes(name)) hit.push(name);
    }
    for (const name of ['番茄', '西红柿', '鸡蛋', '土豆', '豆腐', '青椒', '牛肉', '猪肉', '鸡肉']) {
        if (question.includes(name) && !hit.includes(name)) hit.push(name === '西红柿' ? '番茄' : name);
    }
    return hit.slice(0, 8);
}

function wantsRandom(question) {
    return /随机|随便|今天吃什么|今晚吃什么|不知道吃什么|推荐一道/.test(question);
}

function wantsTips(question) {
    return /技巧|怎么洗|备菜|刀工|火候|保鲜|禁忌|油温|焯水|去腥|空气炸|微波|高压|洗碗|食品安全|腌制|糖色|学习蒸|学习煮|学习炒/.test(
        question,
    );
}

function attachExcerpt(tool) {
    const path = tool?.actions?.[0]?.path || tool?.hits?.[0]?.path;
    if (!path) return tool;
    const md = getMarkdownByPath(path);
    if (!md.found || !md.excerpt) return tool;
    return {
        ...tool,
        facts: `${tool.facts || ''}\n正文摘录（${path}）：\n${md.excerpt}`,
    };
}

/** Tool-first retrieval; returns structured answer when confident. */
export function runKitchenTool(question) {
    const q = question.trim();
    if (!q) return null;

    if (wantsRandom(q)) {
        const r = randomRecipe({});
        if (!r.found) return null;
        return {
            id: 'random_recipe',
            answer: `不如先做「${r.title}」？打开菜谱就能跟做。`,
            suggestions: [
                { label: '再来一道', question: '再随机推荐一道菜' },
                { label: '按食材找', question: '冰箱里有鸡蛋和番茄能做什么' },
            ],
            actions: [{ type: 'navigate', path: r.path, label: r.title }],
            facts: `随机菜谱：${r.title} → ${r.path}`,
            hits: [r],
        };
    }

    const ingredients = extractIngredients(q);
    if (ingredients.length >= 1 && /冰箱|手头|只有|有点|能做|做什么|有什么菜/.test(q)) {
        const by = searchByIngredients({ ingredients, limit: 6 });
        if (by.enabled && by.items?.length) {
            const top = by.items.slice(0, 3);
            const lines = top.map((item, i) => `${i + 1}. ${item.name}`).join('\n');
            const navHits = [];
            for (const item of top) {
                const found = searchRecipes({ query: item.name, limit: 1 });
                if (found.items?.[0]) navHits.push(found.items[0]);
            }
            return {
                id: 'search_by_ingredients',
                answer: `按手头「${ingredients.join('、')}」对上了这些菜：\n${lines}\n点下面链接进站内菜谱。`,
                suggestions: [
                    { label: '再收窄', question: `只要用${ingredients[0]}的快手菜` },
                    { label: '随机一道', question: '随机推荐一道菜' },
                ],
                actions: navHits.slice(0, 3).map((h) => ({
                    type: 'navigate',
                    path: h.path,
                    label: h.title,
                })),
                facts: `食材 ${ingredients.join(',')} → ${top.map((t) => t.name).join(' / ')}`,
                hits: navHits,
            };
        }
    }

    if (wantsTips(q)) {
        const tips = searchTips({ query: q, limit: 4 });
        if (tips.items?.length) {
            const top = tips.items[0];
            return attachExcerpt({
                id: 'search_tips',
                answer: `技巧里有「${top.title}」，可以先看这篇；我也能按文内要点帮你概括。`,
                suggestions: tips.items.slice(1, 3).map((t) => ({
                    label: t.title.slice(0, 8),
                    question: t.title,
                })),
                actions: [{ type: 'navigate', path: top.path, label: top.title }],
                facts: `技巧：${tips.items.map((t) => t.title).join(' / ')}`,
                hits: tips.items,
            });
        }
    }

    const recipes = searchRecipes({ query: q, limit: 6 });
    if (recipes.items?.length) {
        const top = recipes.items.slice(0, 3);
        const lines = top.map((item, i) => `${i + 1}. ${item.title}`).join('\n');
        return attachExcerpt({
            id: 'search_recipes',
            answer: `站内搜到这些相关菜谱：\n${lines}`,
            suggestions: [
                { label: '随机一道', question: '随机推荐一道菜' },
                { label: '开冰箱', question: '冰箱里有鸡蛋和番茄能做什么' },
            ],
            actions: top.map((h) => ({ type: 'navigate', path: h.path, label: h.title })),
            facts: `检索「${q}」→ ${top.map((t) => `${t.title}(${t.path})`).join('；')}`,
            hits: top,
        });
    }

    // Last-chance tip scan for technique questions that missed the keyword list.
    const tips = searchTips({ query: q, limit: 3 });
    if (tips.items?.length && /怎么|如何|判断|为什么|注意/.test(q)) {
        const top = tips.items[0];
        return attachExcerpt({
            id: 'search_tips',
            answer: `和这个问题最接近的是「${top.title}」。`,
            suggestions: [{ label: '随机一道', question: '随机推荐一道菜' }],
            actions: [{ type: 'navigate', path: top.path, label: top.title }],
            facts: `技巧兜底：${top.title} → ${top.path}`,
            hits: tips.items,
        });
    }

    return null;
}

function parseOmniJson(content) {
    const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
        return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
        return null;
    }
}

function sanitizePayload(raw, fallbackTool) {
    const answer =
        typeof raw?.answer === 'string' && raw.answer.trim()
            ? raw.answer.trim().slice(0, 1200)
            : fallbackTool?.answer || '这会儿没整理出完整答句，可以换个菜名或食材再问。';

    const suggestions = Array.isArray(raw?.suggestions)
        ? raw.suggestions
              .filter((s) => s && typeof s.label === 'string' && typeof s.question === 'string')
              .slice(0, 3)
              .map((s) => ({
                  label: s.label.trim().slice(0, 12),
                  question: s.question.trim().slice(0, 80),
              }))
        : fallbackTool?.suggestions || [];

    const actions = [];
    if (Array.isArray(raw?.actions)) {
        for (const a of raw.actions.slice(0, 5)) {
            if (a?.type === 'navigate' && isSafePath(a.path)) {
                actions.push({
                    type: 'navigate',
                    path: a.path,
                    label: String(a.label || a.path).slice(0, 40),
                });
            }
        }
    }
    if (!actions.length && fallbackTool?.actions?.length) {
        actions.push(...fallbackTool.actions.filter((a) => isSafePath(a.path)));
    }

    return { answer, suggestions, actions };
}

async function callOmni(question, history, tool) {
    const base = process.env.OMNI_URL?.replace(/\/$/, '');
    const key = process.env.OMNI_KEY;
    const model = process.env.OMNI_MODEL;
    if (!base || !key || !model) return null;

    const hasFacts = Boolean(tool?.facts);
    const system = [
        '你是 MyCook 厨助手，帮访客在 cook.alexander.xin / mycook.alexander.xin 找菜谱与厨房技巧。',
        hasFacts
            ? '必须以「检索实况」与正文摘录为依据回答：可概括步骤/火候/注意点，禁止编造不在摘录里的克数或步骤。'
            : '当前没有站内检索命中。如实说明没对上菜名，并建议换「西红柿炒鸡蛋」等常见写法，或随机一道；不要编造菜谱步骤。',
        '只输出一个 JSON：{"answer":"…","suggestions":[{"label":"…","question":"…"}],"actions":[{"type":"navigate","path":"/cooklikehoc/…或/howtocook/…","label":"…"}]}',
        'answer 2～5 句，与用户同语言；suggestions 最多 2 条；actions 只用实况里的 path。',
        `站点：${SITE_URL}`,
        hasFacts ? `\n检索实况：\n${tool.facts}` : '\n检索实况：无命中。',
    ].join('\n');

    const messages = [{ role: 'system', content: system }];
    for (const m of history.slice(-6)) {
        messages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text });
    }
    messages.push({ role: 'user', content: question });

    try {
        const res = await fetch(`${base}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
                model,
                temperature: 0.35,
                max_tokens: 1200,
                messages,
            }),
            signal: AbortSignal.timeout(25000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) return null;
        const parsed = parseOmniJson(content);
        if (!parsed) return null;
        return { ...sanitizePayload(parsed, tool), model };
    } catch {
        return null;
    }
}

/**
 * Express handler: OPTIONS/POST /ask
 */
export async function handleAsk(req, res) {
    const origin = req.get('Origin') || null;
    const headers = corsHeaders(origin);

    if (req.method === 'OPTIONS') {
        res.set(headers).status(204).end();
        return;
    }

    if (origin && !isOriginAllowed(origin)) {
        res.set(headers).status(403).json({ error: 'Origin not allowed' });
        return;
    }

    const question = sanitizeQuestion(req.body?.question);
    if (!question) {
        res.set(headers).status(400).json({ error: 'Question is required' });
        return;
    }

    if (!takeRateSlot(clientIp(req))) {
        res.set(headers).status(429).json({ error: 'Too many questions. Try again later.' });
        return;
    }

    const history = sanitizeMessages(req.body?.messages);
    const wantLlm = req.body?.llm !== false;
    const tool = runKitchenTool(question);

    // Strong tool hits that need no rewrite
    if (tool && tool.id === 'random_recipe') {
        res.set(headers).json({
            answer: tool.answer,
            suggestions: tool.suggestions,
            actions: tool.actions,
            mode: 'tool',
            tool: tool.id,
        });
        return;
    }

    if (tool && tool.id === 'search_by_ingredients' && tool.hits?.length) {
        res.set(headers).json({
            answer: tool.answer,
            suggestions: tool.suggestions,
            actions: tool.actions,
            mode: 'tool',
            tool: tool.id,
        });
        return;
    }

    if (tool && !wantLlm) {
        res.set(headers).json({
            answer: tool.answer,
            suggestions: tool.suggestions,
            actions: tool.actions,
            mode: 'tool',
            tool: tool.id,
        });
        return;
    }

    if (wantLlm) {
        const llm = await callOmni(question, history, tool);
        if (llm) {
            res.set(headers).json({
                answer: llm.answer,
                suggestions: llm.suggestions,
                actions: llm.actions,
                mode: 'llm',
                tool: tool?.id || null,
                model: llm.model || process.env.OMNI_MODEL || null,
            });
            return;
        }
    }

    if (tool) {
        res.set(headers).json({
            answer: tool.answer,
            suggestions: tool.suggestions,
            actions: tool.actions,
            mode: 'tool',
            tool: tool.id,
        });
        return;
    }

    const fallback = randomRecipe({});
    res.set(headers).json({
        answer: fallback.found
            ? `没直接对上关键词。可以换个菜名/食材再问，或先看看「${fallback.title}」。`
            : '没找到匹配菜谱，换个菜名或食材再试试。',
        suggestions: [
            { label: '随机一道', question: '随机推荐一道菜' },
            { label: '番茄鸡蛋', question: '冰箱里有鸡蛋和番茄能做什么' },
        ],
        actions: fallback.found
            ? [{ type: 'navigate', path: fallback.path, label: fallback.title }]
            : [],
        mode: 'none',
    });
}
