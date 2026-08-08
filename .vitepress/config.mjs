import { defineConfig } from 'vitepress';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateNavAndSidebar } from './navSidebar.mjs';
import { agentReadyPlugin } from './agentReady.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.resolve(__dirname, '../public');

const { nav, sidebar } = generateNavAndSidebar(process.cwd());

function moreNav(lang) {
    const en = lang === 'en';
    return {
        text: en ? 'More' : '更多',
        items: [
            {
                text: en ? 'Upstream' : '源项目',
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
                text: en ? 'HowToCook Images' : 'HowToCook 图片版',
                link: 'https://mycook.alexander.xin/howtocook-images/',
            },
            {
                text: en ? 'Source repo' : '本站仓库',
                link: 'https://github.com/AlexanderJ-Carter/MyCook',
            },
            {
                text: en ? 'Author' : '作者主页',
                link: 'https://alexander.xin',
            },
        ],
    };
}

function rewriteHowToCookImages(req) {
    const url = req.url?.split('?')[0] || '';
    if (url === '/howtocook-images/' || url === '/howtocook-images') {
        req.url = '/howtocook-images/index.html';
    } else if (url.startsWith('/howtocook-images/') && !url.includes('.')) {
        req.url = '/howtocook-images/index.html';
    }
}

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
        'CHANGELOG.md',
        'CONTRIBUTING.md',
        'SECURITY.md',
        'demo.md',
        'cooklikehoc/README.md',
        'howtocook/*.md',
        'upstream/**',
        '**/public/**',
        'public/**/*.md',
    ],

    // 注意：不设 label，避免 VitePress 内置语言下拉把菜谱页映射到不存在的 /en/ 路径（404）。
    // 语言切换由主题内的 LangSwitch 组件按 localeRoutes 显式映射处理。
    locales: {
        root: { lang: 'zh-CN' },
        en: {
            lang: 'en-US',
            description:
                'CookLikeHOC-style recipes + HowToCook guide — home cooking in one place',
            themeConfig: {
                nav: [
                    { text: 'Home', link: '/en/' },
                    ...nav,
                    moreNav('en'),
                    { text: 'Help', link: '/en/help' },
                    { text: 'MCP', link: '/en/mcp-guide' },
                    { text: 'Setup', link: '/en/mcp-setup' },
                    { text: 'Agent', link: '/en/ai-agents' },
                    { text: 'About', link: '/en/about' },
                ],
                notFound: {
                    code: '404',
                    title: 'Page not found',
                    quote: 'This link may be wrong, or the recipe is not synced yet.',
                    linkLabel: 'Back home',
                    linkText: 'Back home',
                },
                returnToTopLabel: 'Return to top',
                sidebarMenuLabel: 'Menu',
                skipToContentLabel: 'Skip to content',
                darkModeSwitchLabel: 'Appearance',
                lightModeSwitchTitle: 'Switch to light theme',
                darkModeSwitchTitle: 'Switch to dark theme',
                outline: { level: [2, 3], label: 'On this page' },
                docFooter: { prev: 'Previous', next: 'Next' },
                lastUpdated: {
                    text: 'Last updated',
                    formatOptions: { dateStyle: 'short', timeStyle: 'short' },
                },
                editLink: {
                    pattern:
                        'https://github.com/AlexanderJ-Carter/MyCook/edit/main/:path',
                    text: 'Edit this page on GitHub',
                },
                footer: {
                    message:
                        'Recipes from the open-source projects CookLikeHOC and HowToCook · maintained by <a href="https://alexander.xin" target="_blank" rel="noopener">alexander.xin</a>',
                    copyright: `Copyright © ${new Date().getFullYear()} MyCook · Eat well, live well`,
                },
                search: {
                    provider: 'local',
                    options: {
                        translations: {
                            button: {
                                buttonText: 'Search recipes',
                                buttonAriaLabel: 'Search recipes',
                            },
                            modal: {
                                noResultsText: 'No results found',
                                resetButtonTitle: 'Clear search',
                                footer: {
                                    selectText: 'Select',
                                    navigateText: 'Navigate',
                                    closeText: 'Close',
                                },
                            },
                        },
                    },
                },
            },
        },
    },

    head: [
        // DNS 预连接优化
        ['link', { rel: 'dns-prefetch', href: 'https://fonts.loli.net' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.loli.net', crossorigin: '' }],
        [
            'link',
            {
                rel: 'stylesheet',
                href: 'https://fonts.loli.net/css2?family=Noto+Serif+SC:wght@500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
            },
        ],
        ['link', { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' }],
        ['link', { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' }],
        // LCP 预加载优化
        ['link', { rel: 'preload', href: '/logo.svg', as: 'image' }],
        // 主题色
        ['meta', { name: 'theme-color', content: '#b83a28', media: '(prefers-color-scheme: light)' }],
        ['meta', { name: 'theme-color', content: '#1e1c19', media: '(prefers-color-scheme: dark)' }],
        // 移动端优化
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh_CN' }],
        ['meta', { property: 'og:title', content: 'MyCook - 在家做饭一站搞定' }],
        ['meta', { property: 'og:description', content: '老乡鸡风格菜谱与程序员做饭指南合并整理，双源一站查阅' }],
        ['meta', { property: 'og:site_name', content: 'MyCook' }],
        ['meta', { property: 'og:url', content: 'https://cook.alexander.xin/' }],
        ['meta', { property: 'og:image', content: 'https://cook.alexander.xin/banner.png' }],
        ['meta', { property: 'og:image:width', content: '1200' }],
        ['meta', { property: 'og:image:height', content: '630' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'MyCook - 在家做饭一站搞定' }],
        ['meta', { name: 'twitter:description', content: '老乡鸡风格菜谱与程序员做饭指南合并整理，双源一站查阅' }],
        ['meta', { name: 'twitter:image', content: 'https://cook.alexander.xin/banner.png' }],
        ['link', { rel: 'alternate', hreflang: 'en', href: 'https://cook.alexander.xin/en/' }],
        ['link', { rel: 'alternate', hreflang: 'zh-CN', href: 'https://cook.alexander.xin/' }],
        ['link', { rel: 'canonical', href: 'https://cook.alexander.xin/' }],
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
            moreNav('zh'),
            { text: '帮助', link: '/help' },
            { text: 'MCP', link: '/mcp-guide' },
            { text: '一键接入', link: '/mcp-setup' },
            { text: 'Agent', link: '/ai-agents' },
            { text: '关于', link: '/about' },
        ],

        notFound: {
            code: '404',
            title: '找不到这个页面',
            quote: '地址可能写错了，或这道菜还没同步上来。回首页继续找菜就好。',
            linkLabel: '回首页',
            linkText: '回首页',
        },

        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        skipToContentLabel: '跳到正文',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',

        sidebar,

        search: {
            provider: 'local',
            options: {
                translations: {
                    button: {
                        buttonText: '搜索菜谱 Search…',
                        buttonAriaLabel: '搜索菜谱 Search recipes',
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
            message:
                '菜谱来自开源项目 CookLikeHOC 与 HowToCook · 由 <a href="https://alexander.xin" target="_blank" rel="noopener">alexander.xin</a> 整理维护',
            copyright: `Copyright © ${new Date().getFullYear()} MyCook · 好好吃饭，好好生活`,
        },

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/AlexanderJ-Carter/MyCook',
            },
        ],
    },

    // Cloudflare Rocket Loader 会把 type="module" 改写成哈希前缀，导致 VitePress 无法水合。
    // data-cfasync="false" 让 Rocket Loader 跳过这些脚本（橙色云域名必需）。
    // VitePress 的 404.html 默认 #app 为空，脚本失败时用户只见空白——注入静态兜底。
    transformHtml(code, _id, ctx) {
        let html = code.replace(
            /<script(?![^>]*\bdata-cfasync=)/gi,
            '<script data-cfasync="false"',
        );
        const is404 =
            ctx?.pageData?.relativePath === '404.md' ||
            ctx?.pageData?.relativePath === 'en/404.md';
        if (is404 && html.includes('<div id="app"></div>')) {
            const en = ctx.pageData.relativePath.startsWith('en/');
            const fallback = en
                ? `<div class="not-found" data-ssr-fallback="1"><p class="not-found-kicker">MyCook</p><h1 class="not-found-title">Page not found</h1><p class="not-found-desc">This link may be wrong or the recipe is not synced yet.</p><div class="not-found-actions"><a class="primary" href="/en/">Home</a><a href="/en/help">Help</a></div></div>`
                : `<div class="not-found" data-ssr-fallback="1"><p class="not-found-kicker">MyCook</p><h1 class="not-found-title">找不到这个页面</h1><p class="not-found-desc">地址可能写错了，或这道菜还没同步上来。从下面入口继续即可。</p><div class="not-found-suggestions"><a href="/">首页</a><a href="/cooklikehoc/炒菜/README">按做法找</a><a href="/mcp-guide">MCP 指南</a><a href="/help">帮助</a></div><div class="not-found-actions"><a class="primary" href="/">回首页</a></div></div>`;
            html = html.replace(
                '<div id="app"></div>',
                `<div id="app">${fallback}</div>`,
            );
        }
        return html;
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
                        rewriteHowToCookImages(req);
                        next();
                    });
                },
                configurePreviewServer(server) {
                    server.middlewares.use((req, res, next) => {
                        rewriteHowToCookImages(req);
                        next();
                    });
                },
            },
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
