import fs from 'node:fs';
import path from 'node:path';

const DOC_EXT = ['.md'];
const ROOT = process.cwd();

const TOPLEVEL_EXCLUDE = new Set([
    '.git',
    '.github',
    '.vitepress',
    'node_modules',
    'scripts',
    'docker_support',
    'public',
    'docs',
]);
const COOKLIKEHOC_EXCLUDE = new Set(['images']);

const HOWTOCOOK_CATEGORY_TITLE = {
    vegetable_dish: '素菜',
    meat_dish: '荤菜',
    aquatic: '水产',
    breakfast: '早餐',
    staple: '主食',
    'semi-finished': '半成品加工',
    soup: '汤与粥',
    drink: '饮料',
    condiment: '酱料与其它',
    dessert: '甜品',
};

function isDirectory(p) {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

function isMarkdown(p) {
    return (
        fs.existsSync(p) &&
        fs.statSync(p).isFile() &&
        DOC_EXT.includes(path.extname(p))
    );
}

function titleFromName(name) {
    return name.replace(/\.md$/i, '');
}

function sortByPinyinOrName(a, b) {
    return a.localeCompare(b, 'zh-Hans-CN-u-co-pinyin');
}

function sectionToNavAndSidebar(
    basePath,
    baseLink,
    dirName,
    excludeSubdirs = new Set(),
    titleMap = {},
) {
    const abs = path.join(basePath, dirName);
    if (!isDirectory(abs)) return null;
    const files = fs
        .readdirSync(abs)
        .filter((f) => isMarkdown(path.join(abs, f)))
        .sort(sortByPinyinOrName);
    const displayTitle = titleMap[dirName] ?? dirName;
    const encodedDir = encodeURI(dirName);
    const items = files.map((f) => ({
        text: titleFromName(f),
        link: `${baseLink}/${encodedDir}/${encodeURI(f)}`,
    }));
    const readme = ['README.md', 'readme.md', 'index.md'].find((n) =>
        fs.existsSync(path.join(abs, n)),
    );
    const readmeURI = readme
        ? `${baseLink}/${encodedDir}/${encodeURI(readme)}`
        : undefined;
    let sectionLink;
    let sectionItems;
    if (readmeURI) {
        sectionLink = readmeURI;
        sectionItems = items.filter((i) => i.link !== readmeURI);
    } else {
        sectionLink = items[0]?.link ?? `${baseLink}/${encodedDir}/`;
        sectionItems = items.slice(1);
    }
    return {
        navItem: { text: displayTitle, link: sectionLink },
        sidebarKey: `${baseLink}/${encodedDir}/`,
        sidebarEntry: {
            text: displayTitle,
            link: sectionLink,
            items: sectionItems,
        },
    };
}

function scanContentRoot(contentRoot, baseLink, excludeSubdirs, titleMap = {}) {
    const abs = path.join(ROOT, contentRoot);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory())
        return { navItems: [], sidebar: {} };
    const entries = fs.readdirSync(abs);
    const dirs = entries
        .filter((e) => isDirectory(path.join(abs, e)))
        .filter((e) => !excludeSubdirs.has(e) && !e.startsWith('.'))
        .sort(sortByPinyinOrName);
    const navItems = [];
    const sidebar = {};
    for (const dir of dirs) {
        const result = sectionToNavAndSidebar(
            abs,
            baseLink,
            dir,
            new Set(),
            titleMap,
        );
        if (result) {
            navItems.push(result.navItem);
            sidebar[result.sidebarKey] = [result.sidebarEntry];
        }
    }
    return { navItems, sidebar };
}

/** HowToCook dishes: 分类下可能有直接 .md 或 子目录/子目录.md */
function sectionToNavAndSidebarHowToCookDishes(
    catPath,
    baseLink,
    catName,
    titleMap = {},
) {
    const displayTitle = titleMap[catName] ?? catName;
    const encodedCat = encodeURI(catName);
    const items = [];
    if (!fs.existsSync(catPath) || !fs.statSync(catPath).isDirectory())
        return null;
    const entries = fs.readdirSync(catPath).sort(sortByPinyinOrName);
    for (const e of entries) {
        const full = path.join(catPath, e);
        if (fs.statSync(full).isFile() && isMarkdown(full)) {
            items.push({
                text: titleFromName(e),
                link: `${baseLink}/${encodedCat}/${encodeURI(e)}`,
            });
        } else if (fs.statSync(full).isDirectory()) {
            const subMd = fs
                .readdirSync(full)
                .find((f) => isMarkdown(path.join(full, f)));
            if (subMd) {
                const encSub = encodeURI(e);
                items.push({
                    text: titleFromName(subMd),
                    link: `${baseLink}/${encodedCat}/${encSub}/${encodeURI(subMd)}`,
                });
            }
        }
    }
    if (items.length === 0) return null;
    const sectionLink = items[0].link;
    return {
        navItem: { text: displayTitle, link: sectionLink },
        sidebarKey: `${baseLink}/${encodedCat}/`,
        sidebarEntry: { text: displayTitle, link: sectionLink, items },
    };
}

export function generateNavAndSidebar(_rootDir) {
    const nav = [];
    const sidebar = {};

    const topDirs = fs
        .readdirSync(ROOT)
        .filter((e) => isDirectory(path.join(ROOT, e)))
        .filter((e) => !TOPLEVEL_EXCLUDE.has(e) && !e.startsWith('.'));

    for (const top of topDirs) {
        if (top === 'cooklikehoc') {
            const { navItems, sidebar: s } = scanContentRoot(
                'cooklikehoc',
                '/cooklikehoc',
                COOKLIKEHOC_EXCLUDE,
            );
            if (navItems.length > 0) {
                nav.push({
                    text: '老乡鸡风格',
                    link: navItems[0].link,
                    items: navItems.length > 1 ? navItems : undefined,
                });
                Object.assign(sidebar, s);
            }
        } else if (top === 'howtocook') {
            const howRoot = path.join(ROOT, 'howtocook');
            const dishesPath = path.join(howRoot, 'dishes');
            const navItems = [];
            if (fs.existsSync(dishesPath)) {
                const catDirs = fs
                    .readdirSync(dishesPath)
                    .filter((e) => isDirectory(path.join(dishesPath, e)))
                    .sort(sortByPinyinOrName);
                for (const cat of catDirs) {
                    const catPath = path.join(dishesPath, cat);
                    const result = sectionToNavAndSidebarHowToCookDishes(
                        catPath,
                        '/howtocook/dishes',
                        cat,
                        HOWTOCOOK_CATEGORY_TITLE,
                    );
                    if (result) {
                        navItems.push(result.navItem);
                        sidebar[result.sidebarKey] = [result.sidebarEntry];
                    }
                }
            }
            for (const sub of ['tips', 'starsystem']) {
                const p = path.join(howRoot, sub);
                if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
                    const result = sectionToNavAndSidebar(
                        howRoot,
                        '/howtocook',
                        sub,
                    );
                    if (result) {
                        navItems.push(result.navItem);
                        sidebar[result.sidebarKey] = [result.sidebarEntry];
                    }
                }
            }
            if (navItems.length > 0) {
                nav.push({
                    text: '程序员做饭',
                    link: navItems[0].link,
                    items: navItems.length > 1 ? navItems : undefined,
                });
            }
        }
    }

    return { nav, sidebar };
}
