/**
 * 扫描 cooklikehoc/ 与 howtocook/ 下的 .md，按修改时间取最近 N 条，写入 public/recent.json
 * 在 docs:build 前执行（见 package.json prebuild）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_FILE = path.join(PUBLIC_DIR, 'recent.json');
const MAX_ITEMS = 14;

function collectMd(dir, basePath, list) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const name of entries) {
        const full = path.join(dir, name);
        const rel = path.relative(ROOT, full);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (!name.startsWith('.') && name !== 'images')
                collectMd(full, basePath, list);
        } else if (
            name.endsWith('.md') &&
            name !== 'README.md' &&
            name.toLowerCase() !== 'readme.md'
        ) {
            const rel = path
                .relative(path.join(ROOT, basePath), full)
                .replace(/\\/g, '/')
                .replace(/\.md$/i, '');
            const link = '/' + basePath + '/' + rel;
            const title = name.replace(/\.md$/i, '');
            list.push({ title, link, mtime: stat.mtimeMs });
        }
    }
}

function collectMdHowToCook(dir, basePath, list) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const name of entries) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            const subMd = fs.readdirSync(full).find((f) => f.endsWith('.md'));
            if (subMd) {
                const link =
                    '/' +
                    basePath +
                    '/' +
                    name +
                    '/' +
                    subMd.replace(/\.md$/i, '');
                const title = subMd.replace(/\.md$/i, '');
                list.push({
                    title,
                    link,
                    mtime: fs.statSync(path.join(full, subMd)).mtimeMs,
                });
            }
        } else if (name.endsWith('.md')) {
            const link = '/' + basePath + '/' + name.replace(/\.md$/i, '');
            const title = name.replace(/\.md$/i, '');
            list.push({ title, link, mtime: stat.mtimeMs });
        }
    }
}

const list = [];
const cooklikehocDir = path.join(ROOT, 'cooklikehoc');
const howtocookDir = path.join(ROOT, 'howtocook');

if (fs.existsSync(cooklikehocDir))
    collectMd(cooklikehocDir, 'cooklikehoc', list);
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
const items = list
    .slice(0, MAX_ITEMS)
    .map(({ title, link }) => ({ title, link }));

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify({ items }, null, 0), 'utf8');
console.log(
    '[generate-recent] wrote',
    items.length,
    'items to public/recent.json',
);
