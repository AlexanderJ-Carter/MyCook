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
    srcExclude: ['README.md'],  // 只排除仓库根目录 README，保留各分类下的 README 作为目录页
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            ...nav,
            {
                text: '致谢',
                items: [
                    {
                        text: 'CookLikeHOC（官方）',
                        link: 'https://github.com/Gar-b-age/CookLikeHOC',
                    },
                    {
                        text: 'HowToCook（官方）',
                        link: 'https://github.com/Anduin2017/HowToCook',
                    },
                ],
            },
        ],
        sidebar,
        search: { provider: 'local' },
        outline: [2, 3],
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdatedText: '上次更新',
        footer: {
            message: '内容来源于开源项目 CookLikeHOC 与 HowToCook，在此致谢。',
            copyright: 'MyCook 合并站 · 非官方',
        },
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
