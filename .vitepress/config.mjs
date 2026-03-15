import { defineConfig } from 'vitepress';
import { generateNavAndSidebar } from './navSidebar.mjs';

const { nav, sidebar } = generateNavAndSidebar(process.cwd());

export default defineConfig({
    lang: 'zh-CN',
    title: 'MyCook',
    description: '合并菜谱：CookLikeHOC + HowToCook',
    lastUpdated: true,
    cleanUrls: true,
    base: process.env.VITEPRESS_BASE || '/',
    ignoreDeadLinks: true,
    srcExclude: ['**/README.md'],
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            ...nav,
            {
                text: '关于',
                items: [
                    {
                        text: 'CookLikeHOC',
                        link: 'https://github.com/AlexanderJ-Carter/CookLikeHOC',
                    },
                    {
                        text: 'HowToCook',
                        link: 'https://github.com/AlexanderJ-Carter/HowToCook',
                    },
                ],
            },
        ],
        sidebar,
        search: { provider: 'local' },
        outline: [2, 3],
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdatedText: '上次更新',
    },
    vite: {
        server: { host: true },
        assetsInclude: [
            '**/*.jpg',
            '**/*.jpeg',
            '**/*.JPG',
            '**/*.png',
            '**/*.gif',
            '**/*.webp',
            '**/*.svg',
        ],
    },
});
