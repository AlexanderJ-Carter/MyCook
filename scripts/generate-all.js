/**
 * 一次扫描产出 recent.json、recipes-index.json、stats.json，再生成 agent 发现文件。
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { ROOT, scanAllRecipes, scanTips, computeStats, isDishLink } from './scan-recipes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const MAX_RECENT = 16;

function writeJson(file, data, pretty = false) {
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, pretty ? 2 : 0), 'utf8');
}

const recipes = scanAllRecipes().filter((item) => isDishLink(item.link));

/** Diff against the live index so bulk sync/shallow clones still surface new dishes. */
function liveIndexLinks() {
    const url = process.env.MYCOOK_LIVE_INDEX || 'https://cook.alexander.xin/recipes-index.json';
    const result = spawnSync(
        'curl',
        ['-fsSL', '--max-time', '20', url],
        { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
    );
    if (result.status !== 0 || !result.stdout) return null;
    try {
        const data = JSON.parse(result.stdout);
        const links = new Set();
        for (const item of data.items || []) {
            if (item?.link && isDishLink(item.link)) links.add(item.link);
        }
        return links;
    } catch {
        return null;
    }
}

const byLink = new Map(recipes.map((item) => [item.link, item]));
const previous = liveIndexLinks();
let recentSource = [];
if (previous) {
    const added = recipes
        .filter((item) => !previous.has(item.link))
        .sort((a, b) => b.mtime - a.mtime || a.title.localeCompare(b.title, 'zh'));
    recentSource = added.slice(0, MAX_RECENT);
}
if (recentSource.length < MAX_RECENT) {
    const rest = [...recipes].sort(
        (a, b) => b.mtime - a.mtime || a.title.localeCompare(b.title, 'zh'),
    );
    for (const item of rest) {
        if (recentSource.some((r) => r.link === item.link)) continue;
        // Skip known non-dish leftovers if any slipped into a previous live index.
        if (!isDishLink(item.link)) continue;
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

const agentResult = spawnSync(process.execPath, ['scripts/generate-agent-discovery.js'], {
    cwd: ROOT,
    stdio: 'inherit',
});

if (agentResult.status !== 0) {
    process.exit(agentResult.status ?? 1);
}

if (process.env.SKIP_INTEGRATIONS !== '1') {
    const intResult = spawnSync(process.execPath, ['scripts/sync-integrations.js'], {
        cwd: ROOT,
        stdio: 'inherit',
    });
    if (intResult.status !== 0) {
        process.exit(intResult.status ?? 1);
    }
}
