<script setup>
import { computed, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';

const sourceCards = [
    {
        eyebrow: 'CookLikeHOC',
        title: '像菜单一样，按做法下厨',
        description:
            '炒菜、炖菜、卤菜、凉拌、砂锅、主食，适合“今天想做这一类”的找法。',
        accent: 'amber',
        href: '/cooklikehoc/炒菜/README',
        stats: ['15 个分类', '198 道整理菜谱'],
    },
    {
        eyebrow: 'HowToCook',
        title: '像索引一样，按食材进厨房',
        description:
            '素菜、荤菜、水产、主食、甜品、饮料，适合“手头有这个食材”的找法。',
        accent: 'jade',
        href: '/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋',
        stats: ['12 个分类', '371 道实用菜谱'],
    },
    {
        eyebrow: 'Image Edition',
        title: '图片版作为视觉补充入口',
        description:
            '需要图文感更强的浏览方式时，直接进入图片版，按图索菜更直觉。',
        accent: 'ink',
        href: '/howtocook-images/',
        stats: ['站内子路径', '失败时自动回退占位页'],
    },
];

const quickLinks = [
    { label: '炒菜', note: '快手热菜', href: '/cooklikehoc/炒菜/README' },
    { label: '炖菜', note: '慢炖主菜', href: '/cooklikehoc/炖菜/README' },
    { label: '汤', note: '暖胃清汤', href: '/cooklikehoc/汤/README' },
    { label: '卤菜', note: '下饭浓味', href: '/cooklikehoc/卤菜/README' },
    {
        label: '素菜',
        note: '轻负担',
        href: '/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋',
    },
    { label: '荤菜', note: '大菜硬菜', href: '/howtocook/dishes/meat_dish/红烧鸡翅' },
    {
        label: '汤粥',
        note: '基础友好',
        href: '/howtocook/dishes/soup/西红柿鸡蛋汤/西红柿鸡蛋汤',
    },
    { label: '早餐', note: '上手最快', href: '/howtocook/dishes/breakfast/茶叶蛋' },
    { label: '饮料', note: '冷暖皆可', href: '/howtocook/dishes/drink/柠檬汁/柠檬汁' },
    { label: '甜品', note: '收尾专区', href: '/howtocook/dishes/dessert/烤蛋挞/烤蛋挞' },
];

const workflow = [
    '先决定你是按“做法”还是按“食材”找菜。',
    '再用顶部搜索或快捷入口缩短路径。',
    '最终落到单篇菜谱，直接做饭，不需要理解仓库结构。',
];

const stats = ref({
    total: 569,
    cooklikehoc: { dishes: 198 },
    howtocook: { dishes: 371 },
});

const internalCards = computed(() =>
    sourceCards.map((item) => ({
        ...item,
        href: withBase(item.href),
    })),
);

const internalQuickLinks = computed(() =>
    quickLinks.map((item) => ({
        ...item,
        href: withBase(item.href),
    })),
);

onMounted(async () => {
    try {
        const response = await fetch(withBase('/stats.json'));
        if (!response.ok) return;
        const data = await response.json();
        stats.value = data;
    } catch {
        // Keep fallback values for SSR or local preview failures.
    }
});
</script>

<template>
    <section class="home-pantry">
        <div class="home-pantry-hero">
            <div class="home-pantry-copy">
                <p class="home-pantry-kicker">Kitchen Atlas</p>
                <h2>把两个气质完全不同的菜谱库，整理成一个顺手的厨房入口。</h2>
                <p class="home-pantry-summary">
                    这里不是简单聚合，而是把“做法导向”和“食材导向”放在同一张桌面上，
                    让找菜这一步比做菜本身更省脑子。
                </p>
            </div>
            <div class="home-pantry-metrics" aria-label="站点特点">
                <div class="home-metric">
                    <strong>{{ stats.total }}</strong>
                    <span>当前可浏览菜谱</span>
                </div>
                <div class="home-metric">
                    <strong>{{ stats.cooklikehoc.dishes }} / {{ stats.howtocook.dishes }}</strong>
                    <span>两套内容体系并行整理</span>
                </div>
                <div class="home-metric">
                    <strong>日同步</strong>
                    <span>上游更新后自动发布</span>
                </div>
            </div>
        </div>

        <div class="home-source-grid">
            <a
                v-for="card in internalCards"
                :key="card.title"
                class="home-source-card"
                :class="`is-${card.accent}`"
                :href="card.href"
            >
                <span class="home-source-eyebrow">{{ card.eyebrow }}</span>
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <ul class="home-source-stats">
                    <li v-for="stat in card.stats" :key="stat">{{ stat }}</li>
                </ul>
            </a>
        </div>

        <div class="home-rail-grid">
            <section class="home-panel home-panel-links">
                <div class="home-panel-head">
                    <p>Quick Shelf</p>
                    <h3>十个最快入口</h3>
                </div>
                <div class="home-link-grid">
                    <a
                        v-for="item in internalQuickLinks"
                        :key="item.label"
                        class="home-link-chip"
                        :href="item.href"
                    >
                        <strong>{{ item.label }}</strong>
                        <span>{{ item.note }}</span>
                    </a>
                </div>
            </section>

            <section class="home-panel home-panel-flow">
                <div class="home-panel-head">
                    <p>Usage Flow</p>
                    <h3>第一次来，建议这样用</h3>
                </div>
                <ol class="home-flow-list">
                    <li v-for="item in workflow" :key="item">{{ item }}</li>
                </ol>
            </section>
        </div>
    </section>
</template>
