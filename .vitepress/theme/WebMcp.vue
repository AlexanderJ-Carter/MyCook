<script setup>
import { onMounted, onUnmounted } from 'vue';
import { withBase } from 'vitepress';
import { useSiteData } from './composables/useSiteData';

const { loadPantry, loadRecipesIndex } = useSiteData();
const controllers = [];

function getModelContext() {
    return typeof document !== 'undefined' ? document.modelContext : undefined;
}

async function searchRecipes(query, limit = 10) {
    const response = await fetch(withBase('/recipes-index.json'));
    const data = await response.json();
    const keyword = String(query || '').trim().toLowerCase();
    const items = keyword
        ? data.items.filter((item) => item.title.toLowerCase().includes(keyword))
        : data.items;
    return {
        total: data.total,
        matched: items.length,
        items: items.slice(0, limit).map((item) => ({
            title: item.title,
            link: `${window.location.origin}${withBase(item.link)}`,
            source: item.source,
        })),
    };
}

async function getSiteStats() {
    const response = await fetch(withBase('/stats.json'));
    return response.json();
}

async function getRecipe(pathname) {
    const response = await fetch(withBase('/recipes-index.json'));
    const data = await response.json();
    const normalized = String(pathname || '').replace(/\/$/, '');
    const item = data.items.find((entry) => entry.link === normalized || entry.link === `${normalized}/`);
    if (!item) {
        return { found: false, path: normalized };
    }
    return {
        found: true,
        title: item.title,
        link: `${window.location.origin}${withBase(item.link)}`,
        source: item.source,
        markdownUrl: `${window.location.origin}${withBase(item.link)}`,
    };
}

onMounted(() => {
    const modelContext = getModelContext();
    if (!modelContext?.registerTool) return;

    const tools = [
        {
            name: 'search_recipes',
            description: '按菜名关键词搜索 MyCook 菜谱，返回标题、链接与来源',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: '菜名或食材关键词' },
                    limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
                },
            },
            async execute(input) {
                return searchRecipes(input?.query, input?.limit ?? 10);
            },
        },
        {
            name: 'get_site_stats',
            description: '获取 MyCook 站点菜谱数量与分类统计',
            inputSchema: { type: 'object', properties: {} },
            async execute() {
                return getSiteStats();
            },
        },
        {
            name: 'get_recipe',
            description: '根据站内路径获取菜谱元数据',
            inputSchema: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: {
                        type: 'string',
                        description: '菜谱路径，例如 /cooklikehoc/炒菜/鱼香肉丝',
                    },
                },
            },
            async execute(input) {
                return getRecipe(input?.path);
            },
        },
        {
            name: 'get_recent_updates',
            description: '获取最近更新的菜谱列表',
            inputSchema: { type: 'object', properties: {} },
            async execute() {
                const response = await fetch(withBase('/recent.json'));
                return response.json();
            },
        },
        {
            name: 'search_by_ingredients',
            description: '根据手头食材反查可做的菜（食用手册数据）',
            inputSchema: {
                type: 'object',
                required: ['ingredients'],
                properties: {
                    ingredients: {
                        type: 'array',
                        items: { type: 'string' },
                        description: '食材名称列表',
                    },
                    limit: { type: 'integer', minimum: 1, maximum: 30, default: 12 },
                },
            },
            async execute(input) {
                const pantry = await loadPantry();
                if (!pantry?.enabled) return { enabled: false, items: [] };
                const need = new Set((input?.ingredients || []).map(String));
                const items = pantry.recipes
                    .filter((r) => [...need].every((s) => r.stuff.includes(s)))
                    .slice(0, input?.limit ?? 12)
                    .map((r) => ({ name: r.name, ingredients: r.stuff, bv: r.bv }));
                return { enabled: true, matched: items.length, items };
            },
        },
        {
            name: 'random_recipe',
            description: '随机一道站内菜谱',
            async execute(input) {
                const data = await loadRecipesIndex();
                let pool = data?.items || [];
                if (input?.source) pool = pool.filter((r) => r.source === input.source);
                if (!pool.length) return { found: false };
                const item = pool[Math.floor(Math.random() * pool.length)];
                return {
                    found: true,
                    title: item.title,
                    link: `${window.location.origin}${withBase(item.link)}`,
                    source: item.source,
                };
            },
        },
        {
            name: 'search_tips',
            description: '搜索 HowToCook 厨房技巧文章',
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string' },
                    limit: { type: 'integer', minimum: 1, maximum: 30, default: 10 },
                },
            },
            async execute(input) {
                const response = await fetch(withBase('/tips-index.json'));
                const data = await response.json();
                const keyword = String(input?.query || '').trim().toLowerCase();
                let items = data?.items || [];
                if (keyword) {
                    items = items.filter(
                        (item) =>
                            item.title.toLowerCase().includes(keyword) ||
                            item.category.toLowerCase().includes(keyword),
                    );
                }
                return {
                    total: data?.total ?? 0,
                    matched: items.length,
                    items: items.slice(0, input?.limit ?? 10).map((item) => ({
                        title: item.title,
                        link: `${window.location.origin}${withBase(item.link)}`,
                        category: item.category,
                    })),
                };
            },
        },
    ];

    for (const tool of tools) {
        const controller = new AbortController();
        controllers.push(controller);
        modelContext.registerTool(tool, { signal: controller.signal }).catch(() => {});
    }
});

onUnmounted(() => {
    for (const controller of controllers) controllers.abort();
});
</script>

<template><span class="webmcp-host" aria-hidden="true" /></template>
