/**
 * 扫描 cooklikehoc/ 与 howtocook/ 下的菜谱 .md，
 * 写出 public/recent.json（最近更新）与 public/recipes-index.json（全量索引）。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROOT, scanAllRecipes } from './scan-recipes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const RECENT_FILE = path.join(PUBLIC_DIR, 'recent.json');
const INDEX_FILE = path.join(PUBLIC_DIR, 'recipes-index.json');
const MAX_RECENT = 16;

const list = scanAllRecipes();
list.sort((a, b) => b.mtime - a.mtime);

const recentItems = list.slice(0, MAX_RECENT).map(({ title, link, source, mtime }) => ({
    title,
    link,
    source,
    date: new Date(mtime).toISOString().split('T')[0],
}));

const indexItems = list.map(({ title, link, source }) => ({ title, link, source }));

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

fs.writeFileSync(
    RECENT_FILE,
    JSON.stringify({ items: recentItems, generatedAt: new Date().toISOString() }, null, 0),
    'utf8',
);

fs.writeFileSync(
    INDEX_FILE,
    JSON.stringify(
        {
            total: indexItems.length,
            items: indexItems,
            generatedAt: new Date().toISOString(),
        },
        null,
        0,
    ),
    'utf8',
);

console.log(
    `[generate-recent] wrote ${recentItems.length} recent + ${indexItems.length} index recipes`,
);
