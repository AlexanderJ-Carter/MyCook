import { defineConfig } from 'vitepress';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateNavAndSidebar } from './navSidebar.mjs';
import { agentReadyPlugin } from './agentReady.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.resolve(__dirname, '../public');

const { nav, sidebar } = generateNavAndSidebar(process.cwd());

export default defineConfig({
    lang: 'zh-CN',
    title: 'MyCook',
    description: '老乡鸡风格菜谱 + 程序员做饭指南，在家做饭一站搞定',
    lastUpdated: true,
    cleanUrls: true,
    base: process.env.VITEPRESS_BASE || '/',
    ignoreDeadLinks: true,
    srcExclude: [
        'README.md',
        'AGENTS.md',
        'CLAUDE.md',
        'cooklikehoc/README.md',
        'howtocook/*.md',
        'upstream/**',
        // Agent markdown mirrors live under public/ for Accept: text/markdown.
        // They must not be treated as VitePress pages.
        '**/public/**',
        'public/**/*.md',
    ],

    head: [
        // DNS 预连接优化
        ['link', { rel: 'dns-prefetch', href: 'https://fonts.loli.net' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.loli.net', crossorigin: '' }],
        ['link', { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' }],
        ['link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' }],
        // LCP 预加载优化
        ['link', { rel: 'preload', href: '/logo.svg', as: 'image' }],
        // 主题色
        ['meta', { name: 'theme-color', content: '#b83a28', media: '(prefers-color-scheme: light)' }],
        ['meta', { name: 'theme-color', content: '#1e1c19', media: '(prefers-color-scheme: dark)' }],
        // 移动端优化
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
        [
            'meta',
            {
                name: 'description',
                content:
                    'MyCook - 老乡鸡风格菜谱与程序员做饭指南合并整理，双源一站查阅',
            },
        ],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:locale', content: 'zh-CN' }],
        ['meta', { name: 'og:title', content: 'MyCook - 在家做饭一站搞定' }],
        ['meta', { name: 'og:description', content: '老乡鸡风格菜谱与程序员做饭指南合并整理，双源一站查阅' }],
        ['meta', { name: 'og:site_name', content: 'MyCook' }],
        ['meta', { name: 'og:image', content: '/banner.png' }],
        ['meta', { name: 'og:image:width', content: '1200' }],
        ['meta', { name: 'og:image:height', content: '630' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'MyCook - 在家做饭一站搞定' }],
        ['meta', { name: 'twitter:description', content: '老乡鸡风格菜谱与程序员做饭指南合并整理，双源一站查阅' }],
        ['meta', { name: 'twitter:image', content: '/banner.png' }],
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
        // PWA manifest
        ['link', { rel: 'manifest', href: '/manifest.json' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
        ['meta', { name: 'apple-mobile-web-app-title', content: 'MyCook' }],
        ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],
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
                        link: '/howtocook-images/',
                    },
                    {
                        text: '本站仓库',
                        link: 'https://github.com/AlexanderJ-Carter/MyCook',
                    },
                ],
            },
            { text: '帮助', link: '/help' },
            { text: '关于', link: '/about' },
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
        server: {
            host: true,
        },
        plugins: [
            agentReadyPlugin(publicRoot),
            {
                name: 'serve-spa-subpath',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        const url = req.url?.split('?')[0] || '';
                        // 处理 /howtocook-images/ 目录请求和 SPA 子路由
                        if (url === '/howtocook-images/' || url === '/howtocook-images') {
                            req.url = '/howtocook-images/index.html';
                        } else if (url.startsWith('/howtocook-images/') && !url.includes('.')) {
                            // SPA 子路由（无文件扩展名）
                            req.url = '/howtocook-images/index.html';
                        }
                        next();
                    });
                }
            }
        ],
        assetsInclude: [
            '**/*.jpg',
            '**/*.jpeg',
            '**/*.JPG',
            '**/*.png',
            '**/*.gif',
            '**/*.webp',
            '**/*.svg',
        ],
        build: {
            // 性能优化：代码分割
            chunkSizeWarningLimit: 1000,
            cssMinify: true,
            minify: 'esbuild',
            // 启用 CSS 代码分割
            cssCodeSplit: true,
        },
    },
});
