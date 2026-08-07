/**
 * 一次扫描产出 recent.json、recipes-index.json、stats.json，再生成 agent 发现文件。
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { ROOT, scanAllRecipes, computeStats } from './scan-recipes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const MAX_RECENT = 16;

function writeJson(file, data, pretty = false) {
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, pretty ? 2 : 0), 'utf8');
}

const recipes = scanAllRecipes();
recipes.sort((a, b) => b.mtime - a.mtime);

const recentItems = recipes.slice(0, MAX_RECENT).map(({ title, link, source, mtime }) => ({
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

const tipsItems = recipes
    .filter((item) => item.link.startsWith('/howtocook/tips/'))
    .map(({ title, link }) => {
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
