#!/usr/bin/env node
/**
 * MyCook MCP Server — stdio（任意 MCP 客户端）或 Streamable HTTP
 *
 *   node mcp/server.mjs              # stdio（默认）
 *   node mcp/server.mjs http         # HTTP → http://127.0.0.1:3001/mcp
 */
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import * as z from 'zod/v4';
import {
    SITE_URL,
    getRecipe,
    getRecipeMarkdown,
    getRecentUpdates,
    getSiteStats,
    listPantryIngredients,
    randomRecipe,
    searchByIngredients,
    searchRecipes,
    searchTips,
} from '../scripts/mcp-tools.mjs';

import {
    authenticateRequest,
    authSummary,
    buildProtectedResourceMetadata,
    isAuthRequired,
} from './auth.mjs';

const VERSION = '1.6.1';
const MCP_PORT = Number(process.env.MCP_PORT || 3001);

function textResult(data) {
    return {
        content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
    };
}

function createServer() {
    const server = new McpServer(
        {
            name: 'mycook',
            version: VERSION,
            title: 'MyCook Recipe Discovery',
            description: '577+ 道菜谱搜索、Markdown 读取、食材反查与随机推荐',
            websiteUrl: SITE_URL,
        },
        { capabilities: { logging: {} } },
    );

    server.registerTool(
        'search_recipes',
        {
            title: '搜索菜谱',
            description: '按菜名或关键词搜索 MyCook 站内菜谱',
            inputSchema: {
                query: z.string().optional().describe('菜名或食材关键词'),
                limit: z.number().int().min(1).max(50).optional().describe('返回条数，默认 10'),
                source: z
                    .enum(['cooklikehoc', 'howtocook'])
                    .optional()
                    .describe('限定来源：做法库或食材指南'),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ query, limit, source }) => textResult(searchRecipes({ query, limit, source })),
    );

    server.registerTool(
        'get_recipe',
        {
            title: '获取菜谱元数据',
            description: '根据站内路径获取菜谱标题、链接与来源',
            inputSchema: {
                path: z.string().describe('菜谱路径，如 /cooklikehoc/炒菜/鱼香肉丝'),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ path }) => textResult(getRecipe(path)),
    );

    server.registerTool(
        'get_recipe_markdown',
        {
            title: '读取菜谱 Markdown',
            description: '获取菜谱完整 Markdown 正文，供 AI 分析步骤与食材',
            inputSchema: {
                path: z.string().describe('菜谱路径'),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ path }) => textResult(getRecipeMarkdown(path)),
    );

    server.registerTool(
        'get_site_stats',
        {
            title: '站点统计',
            description: '获取菜谱数量、分类与来源统计',
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        async () => textResult(getSiteStats()),
    );

    server.registerTool(
        'get_recent_updates',
        {
            title: '最近更新',
            description: '获取最近更新的菜谱列表',
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        async () => textResult(getRecentUpdates()),
    );

    server.registerTool(
        'search_by_ingredients',
        {
            title: '按食材反查',
            description: '根据手头食材从食用手册数据反查可做的菜',
            inputSchema: {
                ingredients: z.array(z.string()).min(1).describe('食材名称列表，如 ["番茄","鸡蛋"]'),
                limit: z.number().int().min(1).max(30).optional(),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ ingredients, limit }) => textResult(searchByIngredients({ ingredients, limit })),
    );

    server.registerTool(
        'list_pantry_ingredients',
        {
            title: '列出可选食材',
            description: '开冰箱功能支持的食材 chip 列表',
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        async () => textResult(listPantryIngredients()),
    );

    server.registerTool(
        'random_recipe',
        {
            title: '随机一道菜',
            description: '从站内菜谱随机抽取一道',
            inputSchema: {
                source: z.enum(['cooklikehoc', 'howtocook']).optional(),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ source }) => textResult(randomRecipe({ source })),
    );

    server.registerTool(
        'search_tips',
        {
            title: '搜索厨房技巧',
            description: '搜索 HowToCook 技巧与备忘文章',
            inputSchema: {
                query: z.string().optional().describe('关键词'),
                limit: z.number().int().min(1).max(30).optional(),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ query, limit }) => textResult(searchTips({ query, limit })),
    );

    server.registerPrompt(
        'what_to_cook',
        {
            title: '今天吃什么',
            description: '根据约束生成选菜建议的提示词',
            argsSchema: {
                mood: z.string().optional().describe('心情或场景，如「快手」「宴客」'),
                ingredients: z.string().optional().describe('手头食材，逗号分隔'),
            },
        },
        async ({ mood, ingredients }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `我在 MyCook（${SITE_URL}）找菜谱。${mood ? `场景：${mood}。` : ''}${ingredients ? `手头有：${ingredients}。` : ''}请先用 search_recipes 或 search_by_ingredients 工具检索，再推荐 2–3 道具体菜并说明理由。`,
                    },
                },
            ],
        }),
    );

    server.registerPrompt(
        'recipe_assistant',
        {
            title: '菜谱问答',
            description: '围绕单篇菜谱回答备菜、替换、计时问题',
            argsSchema: {
                path: z.string().describe('菜谱站内路径'),
                question: z.string().optional().describe('用户问题'),
            },
        },
        async ({ path, question }) => {
            const recipe = getRecipeMarkdown(path);
            const body =
                recipe.found && recipe.markdown
                    ? recipe.markdown
                    : `（请用 get_recipe_markdown 读取路径 ${path}）`;
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `${question || '请总结这道菜的要点与注意事项。'}\n\n---\n${body}`,
                        },
                    },
                ],
            };
        },
    );

    server.registerResource(
        'recipes-index',
        `${SITE_URL}/recipes-index.json`,
        {
            title: '菜谱全量索引',
            description: 'title / link / source 列表',
            mimeType: 'application/json',
        },
        async () => ({
            contents: [
                {
                    uri: `${SITE_URL}/recipes-index.json`,
                    mimeType: 'application/json',
                    text: JSON.stringify(searchRecipes({ limit: 50 }), null, 2),
                },
            ],
        }),
    );

    return server;
}

async function runStdio() {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

function mcpAllowedHosts() {
    const hosts = new Set(['127.0.0.1', 'localhost', '::1']);
    const publicUrl = process.env.MCP_PUBLIC_URL || '';
    try {
        if (publicUrl) hosts.add(new URL(publicUrl).hostname);
    } catch {
        /* ignore */
    }
    for (const h of String(process.env.MCP_ALLOWED_HOSTS || '').split(',')) {
        const t = h.trim();
        if (t) hosts.add(t);
    }
    return [...hosts];
}

async function runHttp() {
    const app = createMcpExpressApp({
        host: '0.0.0.0',
        allowedHosts: mcpAllowedHosts(),
    });
    const transports = {};

    app.get('/health', (_req, res) => {
        res.json({
            ok: true,
            service: 'mycook-mcp',
            version: VERSION,
            site: SITE_URL,
            auth: authSummary(),
        });
    });

    app.get('/.well-known/oauth-protected-resource', (_req, res) => {
        res.type('application/json').json(buildProtectedResourceMetadata());
    });

    app.get('/.well-known/oauth-authorization-server', async (_req, res) => {
        try {
            const issuer = authSummary().issuer;
            const upstream = await fetch(`${issuer}/.well-known/openid-configuration`);
            const body = await upstream.json();
            res.type('application/json').status(upstream.status).json(body);
        } catch (err) {
            res.status(502).json({ error: 'Failed to fetch authorization server metadata', detail: String(err) });
        }
    });

    async function guard(req, res) {
        return authenticateRequest(req, res);
    }

    app.post('/mcp', async (req, res) => {
        if (!(await guard(req, res))) return;
        const sessionId = req.headers['mcp-session-id'];
        try {
            let transport;
            if (sessionId && transports[sessionId]) {
                transport = transports[sessionId];
            } else if (!sessionId && isInitializeRequest(req.body)) {
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (id) => {
                        transports[id] = transport;
                    },
                });
                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid) delete transports[sid];
                };
                const server = createServer();
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
                return;
            } else {
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: { code: -32000, message: 'Bad Request: No valid session ID' },
                    id: null,
                });
                return;
            }
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error('[mycook-mcp]', error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: { code: -32603, message: 'Internal server error' },
                    id: null,
                });
            }
        }
    });

    app.get('/mcp', async (req, res) => {
        if (!(await guard(req, res))) return;
        const sessionId = req.headers['mcp-session-id'];
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }
        await transports[sessionId].handleRequest(req, res);
    });

    app.listen(MCP_PORT, '0.0.0.0', () => {
        console.log(`MyCook MCP HTTP → http://0.0.0.0:${MCP_PORT}/mcp`);
        console.log(`Data root: ${process.env.MYCOOK_DATA || '(default public/)'}`);
        console.log(`Auth:`, authSummary());
        if (isAuthRequired() && !authSummary().audience) {
            console.warn('[mycook-mcp] AUTH_REQUIRED but MCP_PUBLIC_URL/OIDC_AUDIENCE unset');
        }
    });
}

const mode = process.argv[2] || 'stdio';

if (mode === 'http') {
    runHttp().catch((error) => {
        console.error(error);
        process.exit(1);
    });
} else {
    runStdio().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
