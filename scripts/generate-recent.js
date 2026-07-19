/**
 * 扫描 cooklikehoc/ 与 howtocook/ 下的菜谱 .md，
 * 写出 public/recent.json（最近更新）与 public/recipes-index.json（全量索引）。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const RECENT_FILE = path.join(PUBLIC_DIR, 'recent.json');
const INDEX_FILE = path.join(PUBLIC_DIR, 'recipes-index.json');
const MAX_RECENT = 16;

const META_TITLES = new Set([
    'about',
    'index',
    'readme',
    'contributing',
    'fork_info',
    'security',
    'code_of_conduct',
    'changelog',
    'license',
    'authors',
]);

function isMetaTitle(title) {
    return META_TITLES.has(title.toLowerCase().replace(/\s+/g, '_'));
}

function collectMd(dir, basePath, list) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (!name.startsWith('.') && name !== 'images') {
                collectMd(full, basePath, list);
            }
            continue;
        }
        if (!name.endsWith('.md') || name.toLowerCase() === 'readme.md') continue;
        const title = name.replace(/\.md$/i, '');
        if (isMetaTitle(title)) continue;
        const rel = path
            .relative(path.join(ROOT, basePath), full)
            .replace(/\\/g, '/')
            .replace(/\.md$/i, '');
        list.push({
            title,
            link: `/${basePath}/${rel}`,
            source: basePath.startsWith('cooklikehoc') ? 'cooklikehoc' : 'howtocook',
            mtime: stat.mtimeMs,
        });
    }
}

function collectMdHowToCook(dir, basePath, list) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            const subMd = fs.readdirSync(full).find((f) => f.endsWith('.md'));
            if (!subMd) continue;
            const title = subMd.replace(/\.md$/i, '');
            if (isMetaTitle(title)) continue;
            list.push({
                title,
                link: `/${basePath}/${name}/${title}`,
                source: 'howtocook',
                mtime: fs.statSync(path.join(full, subMd)).mtimeMs,
            });
            continue;
        }
        if (!name.endsWith('.md')) continue;
        const title = name.replace(/\.md$/i, '');
        if (isMetaTitle(title)) continue;
        list.push({
            title,
            link: `/${basePath}/${title}`,
            source: 'howtocook',
            mtime: stat.mtimeMs,
        });
    }
}

const list = [];
const cooklikehocDir = path.join(ROOT, 'cooklikehoc');
const howtocookDir = path.join(ROOT, 'howtocook');

if (fs.existsSync(cooklikehocDir)) {
    collectMd(cooklikehocDir, 'cooklikehoc', list);
}

if (fs.existsSync(howtocookDir)) {
    const dishes = path.join(howtocookDir, 'dishes');
    if (fs.existsSync(dishes)) {
        const cats = fs
            .readdirSync(dishes)
            .filter((e) => fs.statSync(path.join(dishes, e)).isDirectory());
        for (const cat of cats) {
            collectMdHowToCook(
                path.join(dishes, cat),
                `howtocook/dishes/${cat}`,
                list,
            );
        }
    }
    for (const sub of ['tips', 'starsystem']) {
        const p = path.join(howtocookDir, sub);
        if (fs.existsSync(p)) collectMd(p, `howtocook/${sub}`, list);
    }
}

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
