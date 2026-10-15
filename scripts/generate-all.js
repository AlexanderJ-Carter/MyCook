/**
 * 一次扫描产出 recent.json、recipes-index.json、stats.json，再生成 agent 发现文件。
 */
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { ROOT, scanAllRecipes, scanTips, computeStats, isDishLink } from './scan-recipes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const CACHE_FILE = path.join(ROOT, '.vitepress', 'cache', 'live-index.json');
const LIVE_INDEX_TTL_MS = 60 * 60 * 1000; // 线上索引缓存 1 小时，dev 反复启动不再各拉一次
const MAX_RECENT = 16;

function writeJson(file, data, pretty = false) {
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, pretty ? 2 : 0), 'utf8');
}

const recipes = scanAllRecipes().filter((item) => isDishLink(item.link));

/**
 * Diff against the live index so bulk sync/shallow clones still surface new dishes.
 * MYCOOK_SKIP_LIVE_INDEX=1（docs:dev 使用）直接跳过，不再网络阻塞。
 * 结果带 TTL 落盘缓存，离线/限速时用上次的结果。
 */
async function liveIndexLinks() {
    if (process.env.MYCOOK_SKIP_LIVE_INDEX === '1') return null;

    let cached = null;
    try {
        const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        if (Date.now() - raw.fetchedAt < LIVE_INDEX_TTL_MS) cached = raw.links;
    } catch {
        /* 无缓存或缓存损坏，走网络 */
    }
    if (Array.isArray(cached)) return new Set(cached);

    const url = process.env.MYCOOK_LIVE_INDEX || 'https://cook.alexander.xin/recipes-index.json';
    let links = null;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (res.ok) {
            const data = await res.json();
            links = data.items
                ?.map((item) => item?.link)
                .filter((link) => link && isDishLink(link));
        }
    } catch {
        /* 离线/超时：退回缓存（哪怕过期） */
    }

    if (links) {
        try {
            fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
            fs.writeFileSync(CACHE_FILE, JSON.stringify({ fetchedAt: Date.now(), links }), 'utf8');
        } catch {
            /* 缓存写失败不影响生成 */
        }
        return new Set(links);
    }

    try {
        const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        if (Array.isArray(raw.links)) return new Set(raw.links);
    } catch {
        /* 彻底没有参照数据 */
    }
    return null;
}

const previous = await liveIndexLinks();
let recentSource = [];
if (previous) {
    // 旧索引曾把「文件夹名=菜名」的菜折叠成 4 段链接；新链接多一段，不算「新菜」
    const collapsedVariant = (link) => {
        const parts = link.split('/').filter(Boolean);
        if (
            parts.length === 5 &&
            parts[0] === 'howtocook' &&
            parts[1] === 'dishes' &&
            parts[3] === parts[4]
        ) {
            return `/${parts.slice(0, 4).join('/')}`;
        }
        return null;
    };
    const added = recipes
        .filter((item) => {
            if (previous.has(item.link)) return false;
            const collapsed = collapsedVariant(item.link);
            return !(collapsed && previous.has(collapsed));
        })
        .sort((a, b) => b.mtime - a.mtime || a.title.localeCompare(b.title, 'zh'));
    recentSource = added.slice(0, MAX_RECENT);
}
if (recentSource.length < MAX_RECENT) {
    const rest = [...recipes].sort(
        (a, b) => b.mtime - a.mtime || a.title.localeCompare(b.title, 'zh'),
    );
    const seen = new Set(recentSource.map((r) => r.link));
    for (const item of rest) {
        if (seen.has(item.link)) continue;
        seen.add(item.link);
        recentSource.push(item);
        if (recentSource.length >= MAX_RECENT) break;
    }
}

const recentItems = recentSource.map(({ title, link, source, mtime }) => ({
    title,
    link,
    source,
    date: new Date(mtime).toISOString().split('T')[0],
}));

const indexItems = recipes.map(({ title, link, source }) => ({ title, link, source }));
const stats = computeStats(recipes);

writeJson(path.join(PUBLIC_DIR, 'recent.json'), {
    items: recentItems,
    generatedAt: new Date().toISOString(),
});

writeJson(path.join(PUBLIC_DIR, 'recipes-index.json'), {
    total: indexItems.length,
    items: indexItems,
    generatedAt: new Date().toISOString(),
});

writeJson(path.join(PUBLIC_DIR, 'stats.json'), stats, true);

const tipsItems = scanTips().map(({ title, link }) => {
        const segments = link.split('/').filter(Boolean);
        const sub = segments[2];
        const category = sub === 'learn' || sub === 'advanced' ? sub : 'general';
        return { title, link, category };
    });

writeJson(path.join(PUBLIC_DIR, 'tips-index.json'), {
    total: tipsItems.length,
    items: tipsItems,
    generatedAt: new Date().toISOString(),
});

console.log(
    `[generate-all] ${indexItems.length} recipes, ${tipsItems.length} tips, ${recentItems.length} recent, stats written`,
);

/** 后处理（agent 发现 / 集成数据）互不依赖，并行跑省一轮等待。 */
function runNode(script) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [script], { cwd: ROOT, stdio: 'inherit' });
        child.on('error', reject);
        child.on('close', (code) =>
            code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`)),
        );
    });
}

const postSteps = [runNode('scripts/generate-agent-discovery.js')];
if (process.env.SKIP_INTEGRATIONS !== '1') {
    postSteps.push(runNode('scripts/sync-integrations.js'));
}
await Promise.all(postSteps);
