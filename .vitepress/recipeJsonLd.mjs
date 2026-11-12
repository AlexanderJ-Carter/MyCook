/**
 * Recipe JSON-LD 共享逻辑：构建期 transformHead 与客户端 RecipeSchema 共用。
 */

export const SITE = 'https://cook.alexander.xin';
export const FALLBACK_IMAGE = `${SITE}/banner.png`;

export const RECIPE_META_SLUGS = new Set([
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

export const HOWTOCOOK_CATEGORY = {
    aquatic: '水产',
    breakfast: '早餐',
    condiment: '佐料',
    dessert: '甜品',
    drink: '饮品',
    meat_dish: '荤菜',
    semi_finished: '半成品',
    soup: '汤',
    staple: '主食',
    vegetable_dish: '素菜',
};

const INGREDIENT_HEADINGS = ['配料', '必备原料和工具', '原料', '食材'];
const INSTRUCTION_HEADINGS = ['步骤', '操作', '做法'];

export function normalizePath(path) {
    return String(path || '')
        .replace(/\.html$/i, '')
        .replace(/\/$/, '') || '/';
}

export function isMetaSlug(slug) {
    return RECIPE_META_SLUGS.has(
        String(slug || '')
            .toLowerCase()
            .replace(/\s+/g, '_'),
    );
}

/** @param {string} relativePath VitePress pageData.relativePath */
export function recipePageMeta(relativePath) {
    const file = String(relativePath || '').replace(/\\/g, '/');
    if (!file || file.startsWith('en/')) return null;

    const segments = file.replace(/\.md$/i, '').split('/').filter(Boolean);
    if (!segments.length || isMetaSlug(segments[segments.length - 1])) return null;

    const isCooklike = segments[0] === 'cooklikehoc' && segments.length >= 3;
    const isHowtocook =
        segments[0] === 'howtocook' &&
        segments[1] === 'dishes' &&
        segments.length >= 4;
    if (!isCooklike && !isHowtocook) return null;

    return { segments, isCooklike, isHowtocook, source: isCooklike ? 'CookLikeHOC' : 'HowToCook' };
}

export function recipeCategoryFromSegments(segments, isCooklike) {
    if (isCooklike && segments[1]) return decodeURIComponent(segments[1]);
    if (segments[0] === 'howtocook' && segments[1] === 'dishes' && segments[2]) {
        return HOWTOCOOK_CATEGORY[segments[2]] || decodeURIComponent(segments[2]);
    }
    return isCooklike ? '中式家常菜' : '家常菜';
}

export function pageUrlFromRelativePath(relativePath) {
    const file = String(relativePath || '').replace(/\\/g, '/');
    let path = `/${file.replace(/\.md$/i, '')}`;
    path = path.replace(/\/index$/i, '/');
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return `${SITE}${path}`;
}

export function toAbsoluteUrl(src, pageUrl = SITE) {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src.split('?')[0];
    if (src.startsWith('//')) return `https:${src.split('?')[0]}`;
    if (src.startsWith('/')) return `${SITE}${src.split('?')[0]}`;
    try {
        return new URL(src, pageUrl).href.split('?')[0];
    } catch {
        return null;
    }
}

export function isUsableImage(src) {
    if (!src) return false;
    const lower = src.toLowerCase();
    if (lower.includes('logo.svg') || lower.includes('favicon')) return false;
    if (lower.endsWith('.svg')) return false;
    return (
        /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(lower) ||
        lower.includes('/assets/')
    );
}

export function minutesToIso(totalMinutes) {
    const n = Math.round(Number(totalMinutes));
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n < 60) return `PT${n}M`;
    const h = Math.floor(n / 60);
    const m = n % 60;
    return m ? `PT${h}H${m}M` : `PT${h}H`;
}

function stripTags(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function listItemsAfterHeading(html, headings) {
    const headingRe = /<(h[23])\b[^>]*>([\s\S]*?)<\/\1>/gi;
    const matches = [...String(html || '').matchAll(headingRe)];
    const hit = matches.find((m) => {
        const t = stripTags(m[2]).replace(/\s+/g, '');
        return headings.some((h) => t.includes(h));
    });
    if (!hit) return [];

    const start = hit.index + hit[0].length;
    const rest = String(html).slice(start);
    const next = rest.search(/<h[23]\b/i);
    const section = next === -1 ? rest : rest.slice(0, next);

    const items = [];
    for (const m of section.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
        const text = stripTags(m[1]);
        if (text) items.push(text);
    }
    return items;
}

function extractImagesFromHtml(html, pageUrl) {
    const urls = [];
    for (const m of String(html || '').matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
        const abs = toAbsoluteUrl(m[1], pageUrl);
        if (isUsableImage(abs)) urls.push(abs);
    }
    return [...new Set(urls)];
}

function extractTimesAndCalories(text) {
    const calories = text.match(/预估卡路里[：:]\s*(\d+)\s*大卡/);
    const aboutMinutes =
        text.match(/(?:约需|大约需要|大约|预计|预估)[^。；]{0,12}?(\d+)\s*分钟/) ||
        text.match(/从备料到出锅约需\s*(\d+)\s*分钟/);

    let prepTime = null;
    let cookTime = null;
    let totalTime = aboutMinutes ? minutesToIso(Number(aboutMinutes[1])) : null;

    const soak = text.match(/浸泡\s*(\d+(?:\.\d+)?)\s*(小时|分钟)/);
    if (soak) {
        const n = soak[2] === '小时' ? Number(soak[1]) * 60 : Number(soak[1]);
        prepTime = minutesToIso(n);
    }

    const steam = text.match(/蒸\s*(\d+(?:\.\d+)?)\s*分钟/);
    const braise = text.match(/焖\s*(\d+(?:\.\d+)?)\s*分钟/);
    const cookMinutes = (steam ? Number(steam[1]) : 0) + (braise ? Number(braise[1]) : 0);
    if (cookMinutes > 0) cookTime = minutesToIso(cookMinutes);

    if (!totalTime && prepTime && cookTime) {
        const prepM = soak
            ? soak[2] === '小时'
                ? Number(soak[1]) * 60
                : Number(soak[1])
            : 0;
        totalTime = minutesToIso(prepM + cookMinutes);
    }

    // Google：prepTime 与 cookTime 须成对；仅有总时长时只填 totalTime
    if (!prepTime || !cookTime) {
        prepTime = null;
        cookTime = null;
    }

    return {
        prepTime,
        cookTime,
        totalTime,
        calories: calories ? Number(calories[1]) : null,
    };
}

/** 从渲染后的正文 HTML 抽取食材、步骤、时长、配图。 */
export function extractRecipeExtras(html, pageUrl = SITE) {
    const text = stripTags(html);
    const times = extractTimesAndCalories(text);
    return {
        images: extractImagesFromHtml(html, pageUrl),
        ingredients: listItemsAfterHeading(html, INGREDIENT_HEADINGS),
        instructions: listItemsAfterHeading(html, INSTRUCTION_HEADINGS),
        ...times,
    };
}

export function stepNameFromText(text, index) {
    const cleaned = String(text || '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) return `步骤 ${index}`;
    const short = cleaned.slice(0, 24);
    return short.length < cleaned.length ? `${short}…` : short;
}

/** @returns {object[]} HowToStep 列表（含 Google 推荐的 name / url / image） */
export function buildHowToSteps(texts, pageUrl, image) {
    const stepImage = image || FALLBACK_IMAGE;
    return texts.map((text, i) => {
        const position = i + 1;
        return {
            '@type': 'HowToStep',
            position,
            name: stepNameFromText(text, position),
            text,
            url: `${pageUrl}#step-${position}`,
            image: stepImage,
        };
    });
}

/**
 * 组装完整 Recipe JSON-LD。
 * @param {{ name: string, source: string, category: string, pageUrl: string, images?: string[], extras?: object }} opts
 */
export function buildRecipeSchema(opts) {
    const {
        name,
        source,
        category,
        pageUrl,
        images = [],
        extras = {},
    } = opts;

    const imageList = (images?.length ? images : extras.images?.length ? extras.images : null) || [
        FALLBACK_IMAGE,
    ];
    const primaryImage = imageList[0];

    const data = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name,
        image: imageList,
        description: `${name}的做法 - 来自${source}菜谱`,
        author: {
            '@type': 'Organization',
            name: source,
        },
        recipeCategory: category,
        recipeCuisine: 'Chinese',
        keywords: `菜谱, 做饭, 家常菜, ${name}`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': pageUrl,
        },
    };

    if (extras.prepTime) data.prepTime = extras.prepTime;
    if (extras.cookTime) data.cookTime = extras.cookTime;
    if (extras.totalTime) data.totalTime = extras.totalTime;

    if (extras.calories) {
        data.recipeYield = '1 份';
        data.nutrition = {
            '@type': 'NutritionInformation',
            calories: `${extras.calories} 大卡`,
        };
    }

    if (extras.ingredients?.length) {
        data.recipeIngredient = extras.ingredients;
    }

    if (extras.instructions?.length) {
        data.recipeInstructions = buildHowToSteps(
            extras.instructions,
            pageUrl,
            primaryImage,
        );
    }

    return data;
}
