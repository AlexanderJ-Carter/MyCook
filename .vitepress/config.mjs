import { defineConfig } from 'vitepress';
import { generateNavAndSidebar } from './navSidebar.mjs';

const { nav, sidebar } = generateNavAndSidebar(process.cwd());

export default defineConfig({
    lang: 'zh-CN',
    title: 'MyCook',
    description: '老乡鸡风格菜谱 + 程序员做饭指南，在家做饭一站搞定',
    lastUpdated: true,
    cleanUrls: true,
    base: process.env.VITEPRESS_BASE || '/',
    ignoreDeadLinks: true,
    srcExclude: ['README.md', 'cooklikehoc/README.md', 'howtocook/*.md', 'upstream/**'],

    head: [
        ['meta', { name: 'theme-color', content: '#c17f3a' }],
        ['meta', { name: 'description', content: 'MyCook - 老乡鸡风格菜谱与程序员做饭指南合并整理，双源一站查阅' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:locale', content: 'zh-CN' }],
        ['meta', { name: 'og:title', content: 'MyCook - 在家做饭一站搞定' }],
        ['link', { rel: 'icon', href: '/favicon.ico' }],
    ],

    themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'MyCook',

        nav: [
            { text: '首页', link: '/' },
            ...nav,
            {
                text: '更多',
                items: [
                    {
                        text: '源项目',
                        items: [
                            {
                                text: 'CookLikeHOC',
                                link: 'https://github.com/Gar-b-age/CookLikeHOC',
                            },
                            {
                                text: 'HowToCook',
                                link: 'https://github.com/Anduin2017/HowToCook',
                            },
                        ],
                    },
                    {
                        text: 'HowToCook 图片版',
                        link: 'https://king-jingxiang.github.io/HowToCook/',
                    },
                    {
                        text: '本站仓库',
                        link: 'https://github.com/AlexanderJ-Carter/MyCook',
                    },
                ],
            },
        ],

        sidebar,

        search: {
            provider: 'local',
            options: {
                translations: {
                    button: {
                        buttonText: '搜索菜谱...',
                        buttonAriaLabel: '搜索菜谱',
                    },
                    modal: {
                        noResultsText: '没有找到结果',
                        resetButtonTitle: '清除搜索条件',
                        footer: {
                            selectText: '选择',
                            navigateText: '切换',
                            closeText: '关闭',
                        },
                    },
                },
            },
        },

        outline: {
            level: [2, 3],
            label: '目录',
        },

        docFooter: {
            prev: '上一道菜',
            next: '下一道菜',
        },

        lastUpdated: {
            text: '更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'short',
            },
        },

        editLink: {
            pattern:
                'https://github.com/AlexanderJ-Carter/MyCook/edit/main/:path',
            text: '在 GitHub 上编辑此页',
        },

        footer: {
            message: '内容来源于 CookLikeHOC 与 HowToCook，由本站合并整理',
            copyright: `Copyright © ${new Date().getFullYear()} MyCook · 非官方站点`,
        },

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/AlexanderJ-Carter/MyCook',
            },
        ],
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
