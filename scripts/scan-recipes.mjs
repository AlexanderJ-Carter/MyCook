import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

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

export function scanAllRecipes() {
    const list = [];
    const cooklikehocDir = path.join(ROOT, 'cooklikehoc');
    const howtocookDir = path.join(ROOT, 'howtocook');

    if (fs.existsSync(cooklikehocDir)) {
        collectMd(cooklikehocDir, 'cooklikehoc', list);
    }

    if (fs.existsSync(howtocookDir)) {
        const dishes = path.join(howtocookDir, 'dishes');
        if (fs.existsSync(dishes)) {
            for (const cat of fs.readdirSync(dishes)) {
                if (!fs.statSync(path.join(dishes, cat)).isDirectory()) continue;
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

    return list;
}

export function computeStats(recipes) {
    const cooklikehocCategories = new Set();
    const howtocookCategories = new Set();
    let cooklikehocDishes = 0;
    let howtocookDishes = 0;
    let latestMtime = 0;

    for (const item of recipes) {
        latestMtime = Math.max(latestMtime, item.mtime);
        const segments = item.link.split('/').filter(Boolean);
        if (item.source === 'cooklikehoc') {
            cooklikehocDishes++;
            if (segments[1]) cooklikehocCategories.add(segments[1]);
        } else {
            howtocookDishes++;
            if (segments[1] === 'dishes' && segments[2]) {
                howtocookCategories.add(segments[2]);
            } else if (segments[1]) {
                howtocookCategories.add(segments[1]);
            }
        }
    }

    const cooklikehoc = {
        categories: cooklikehocCategories.size,
        dishes: cooklikehocDishes,
    };
    const howtocook = {
        categories: howtocookCategories.size,
        dishes: howtocookDishes,
    };

    return {
        cooklikehoc,
        howtocook,
        total: cooklikehoc.dishes + howtocook.dishes,
        totalCategories: cooklikehoc.categories + howtocook.categories,
        lastUpdated: new Date(latestMtime || Date.now()).toISOString().split('T')[0],
        generatedAt: new Date().toISOString(),
    };
}
