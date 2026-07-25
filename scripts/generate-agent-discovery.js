import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const WELL_KNOWN = path.join(PUBLIC_DIR, '.well-known');
const SITE_URL = (process.env.SITE_URL || 'https://cook.alexander.xin').replace(/\/$/, '');
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeText(filePath, content) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
}

function sha256(content) {
    return `sha256:${crypto.createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function stripFrontmatter(markdown) {
    if (markdown.startsWith('---')) {
        const end = markdown.indexOf('---', 3);
        if (end !== -1) return markdown.slice(end + 3).trimStart();
    }
    return markdown;
}

function mirrorMarkdown(srcPath, destPath) {
    if (!fs.existsSync(srcPath)) return;
    writeText(destPath, stripFrontmatter(fs.readFileSync(srcPath, 'utf8')));
}

function mirrorRecipeMarkdown(srcDir, urlPrefix, destPrefix) {
    if (!fs.existsSync(srcDir)) return 0;
    let count = 0;

    function walk(absDir, relDir) {
        for (const name of fs.readdirSync(absDir)) {
            if (name.startsWith('.')) continue;
            const full = path.join(absDir, name);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                if (name !== 'images') walk(full, path.join(relDir, name));
                continue;
            }
            if (!name.endsWith('.md')) continue;
            const slug = name.slice(0, -3);
            const rel = path.posix.join(relDir, slug).replace(/\\/g, '/');
            const dest = path.join(destPrefix, `${rel}.md`);
            mirrorMarkdown(full, dest);
            count += 1;
        }
    }

    walk(srcDir, urlPrefix);
    return count;
}

function buildOpenApi() {
    return {
        openapi: '3.1.0',
        info: {
            title: 'MyCook Public API',
            version: VERSION,
            description: '只读菜谱发现与统计接口，无需认证。',
        },
        servers: [{ url: SITE_URL }],
        paths: {
            '/recipes-index.json': {
                get: {
                    summary: '菜谱全量索引',
                    operationId: 'listRecipes',
                    responses: {
                        '200': {
                            description: '菜谱索引',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            total: { type: 'integer' },
                                            items: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        title: { type: 'string' },
                                                        link: { type: 'string' },
                                                        source: { type: 'string' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/stats.json': {
                get: {
                    summary: '站点统计',
                    operationId: 'getStats',
                    responses: {
                        '200': {
                            description: '统计数据',
                            content: { 'application/json': { schema: { type: 'object' } } },
                        },
                    },
                },
            },
            '/recent.json': {
                get: {
                    summary: '最近更新',
                    operationId: 'getRecent',
                    responses: {
                        '200': {
                            description: '最近更新列表',
                            content: { 'application/json': { schema: { type: 'object' } } },
                        },
                    },
                },
            },
        },
    };
}

function buildApiCatalog() {
    const apiBase = `${SITE_URL}/api/v1`;
    return {
        linkset: [
            {
                anchor: apiBase,
                'service-desc': [
                    {
                        href: `${SITE_URL}/openapi.json`,
                        type: 'application/json',
                    },
                ],
                'service-doc': [
                    {
                        href: `${SITE_URL}/help`,
                        type: 'text/html',
                    },
                ],
                status: [
                    {
                        href: `${SITE_URL}/stats.json`,
                        type: 'application/json',
                    },
                ],
            },
        ],
    };
}

function buildOAuthAuthorizationServer() {
    return {
        issuer: SITE_URL,
        authorization_endpoint: `${SITE_URL}/auth/authorize`,
        token_endpoint: `${SITE_URL}/auth/token`,
        registration_endpoint: `${SITE_URL}/auth/register`,
        jwks_uri: `${SITE_URL}/.well-known/jwks.json`,
        grant_types_supported: ['client_credentials', 'authorization_code'],
        response_types_supported: ['code'],
        token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
        scopes_supported: ['recipes:read', 'stats:read'],
        agent_auth: {
            skill: `${SITE_URL}/.well-known/agent-skills/mycook-recipes/SKILL.md`,
            register_uri: `${SITE_URL}/auth/register`,
            identity_types_supported: ['anonymous'],
            anonymous: {
                credential_types_supported: ['none'],
                claim_uri: `${SITE_URL}/auth.md`,
            },
        },
    };
}

function buildOAuthProtectedResource() {
    return {
        resource: SITE_URL,
        authorization_servers: [SITE_URL],
        scopes_supported: ['recipes:read', 'stats:read'],
        bearer_methods_supported: ['header'],
    };
}

function buildJwks() {
    return { keys: [] };
}

function buildMcpServerCard() {
    return {
        serverInfo: {
            name: 'mycook',
            version: VERSION,
            title: 'MyCook Recipe Discovery',
            description: '菜谱索引与搜索的只读发现端点',
        },
        endpoint: `${SITE_URL}/mcp`,
        transport: 'streamable-http',
        capabilities: {
            tools: true,
            resources: true,
            prompts: false,
        },
        tools: [
            {
                name: 'search_recipes',
                description: '按关键词搜索菜谱',
            },
            {
                name: 'get_recipe',
                description: '按路径获取菜谱链接',
            },
            {
                name: 'get_site_stats',
                description: '获取站点菜谱统计',
            },
        ],
    };
}

function buildAgentSkillsIndex(skillPath, skillContent) {
    return {
        $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
        skills: [
            {
                name: 'mycook-recipes',
                type: 'skill-md',
                description: '搜索与浏览 MyCook 菜谱索引、统计与 Markdown 内容',
                url: `${SITE_URL}/.well-known/agent-skills/mycook-recipes/SKILL.md`,
                digest: sha256(skillContent),
            },
            {
                name: 'mycook-agents',
                type: 'skill-md',
                description: 'MyCook 项目维护与内容结构说明',
                url: `${SITE_URL}/AGENTS.md`,
                digest: sha256(fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8')),
            },
        ],
    };
}

function buildSkillMd() {
    return `# MyCook Recipes

帮助 AI 代理发现与检索 MyCook 菜谱。

## 站点

- 首页: ${SITE_URL}/
- API 目录: ${SITE_URL}/.well-known/api-catalog
- OpenAPI: ${SITE_URL}/openapi.json

## 公开 JSON 端点

| 端点 | 说明 |
|------|------|
| \`/recipes-index.json\` | 全量菜谱索引（title, link, source） |
| \`/stats.json\` | 分类与数量统计 |
| \`/recent.json\` | 最近更新菜谱 |

## Markdown 内容协商

请求任意页面时携带 \`Accept: text/markdown\` 可获取 Markdown 版本（首页、帮助、关于及菜谱页）。

## 认证

本站 API 为只读公开资源，无需 OAuth 令牌。详见 \`/auth.md\`。
`;
}

function buildAuthMd() {
    return `# auth.md

MyCook 面向 AI 代理的注册与访问说明。

## 受众

- 自动化代理
- MCP / WebMCP 客户端
- 只读菜谱检索工具

## 资源标识

\`${SITE_URL}\`

## 认证方式

本站公开 JSON 与 Markdown 资源**无需认证**。代理可直接访问：

- \`GET /recipes-index.json\`
- \`GET /stats.json\`
- \`GET /recent.json\`
- 任意 HTML 页面 + \`Accept: text/markdown\`

## 匿名代理

支持匿名身份（\`identity_types_supported: ["anonymous"]\`）。无需注册即可读取公开内容。

如需登记代理身份（可选），可向 \`POST ${SITE_URL}/auth/register\` 提交 JSON：

\`\`\`json
{
  "client_name": "your-agent",
  "identity_type": "anonymous"
}
\`\`\`

## 相关发现文档

- OAuth 授权服务器: \`/.well-known/oauth-authorization-server\`
- 受保护资源元数据: \`/.well-known/oauth-protected-resource\`
- API 目录: \`/.well-known/api-catalog\`
- Agent Skills: \`/.well-known/agent-skills/index.json\`
- MCP Server Card: \`/.well-known/mcp/server-card.json\`
`;
}

function buildHomeMarkdown() {
    const indexPath = path.join(ROOT, 'index.md');
    const body = stripFrontmatter(fs.readFileSync(indexPath, 'utf8'));
    return `# MyCook

在家做饭，一站搞定。

老乡鸡风格做法库 × 程序员食材指南，合并成一个顺手的厨房入口。

## 入口

- [按做法开始](${SITE_URL}/cooklikehoc/炒菜/README)
- [按食材开始](${SITE_URL}/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋)
- [HowToCook 图片版](${SITE_URL}/howtocook-images/)

## 代理发现

- API 目录: ${SITE_URL}/.well-known/api-catalog
- OpenAPI: ${SITE_URL}/openapi.json
- Agent Skills: ${SITE_URL}/.well-known/agent-skills/index.json

---

${body}
`;
}

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function main() {
    ensureDir(WELL_KNOWN);

    const skillContent = buildSkillMd();
    const skillPath = path.join(WELL_KNOWN, 'agent-skills', 'mycook-recipes', 'SKILL.md');
    writeText(skillPath, skillContent);

    writeJson(path.join(PUBLIC_DIR, 'openapi.json'), buildOpenApi());
    writeText(path.join(WELL_KNOWN, 'api-catalog'), JSON.stringify(buildApiCatalog(), null, 2));
    writeJson(path.join(WELL_KNOWN, 'oauth-authorization-server'), buildOAuthAuthorizationServer());
    writeJson(path.join(WELL_KNOWN, 'openid-configuration'), buildOAuthAuthorizationServer());
    writeJson(path.join(WELL_KNOWN, 'oauth-protected-resource'), buildOAuthProtectedResource());
    writeJson(path.join(WELL_KNOWN, 'jwks.json'), buildJwks());
    writeJson(path.join(WELL_KNOWN, 'mcp', 'server-card.json'), buildMcpServerCard());
    writeJson(path.join(WELL_KNOWN, 'agent-skills', 'index.json'), buildAgentSkillsIndex(skillPath, skillContent));
    writeText(path.join(PUBLIC_DIR, 'auth.md'), buildAuthMd());
    writeText(path.join(PUBLIC_DIR, 'AGENTS.md'), fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8'));
    writeText(path.join(PUBLIC_DIR, 'index.md'), buildHomeMarkdown());
    writeText(path.join(PUBLIC_DIR, 'about.md'), stripFrontmatter(fs.readFileSync(path.join(ROOT, 'about.md'), 'utf8')));
    writeText(path.join(PUBLIC_DIR, 'help.md'), stripFrontmatter(fs.readFileSync(path.join(ROOT, 'help.md'), 'utf8')));

    const hocCount = mirrorRecipeMarkdown(path.join(ROOT, 'cooklikehoc'), 'cooklikehoc', PUBLIC_DIR);
    const htcCount = mirrorRecipeMarkdown(path.join(ROOT, 'howtocook'), 'howtocook', PUBLIC_DIR);

  writeText(
        path.join(PUBLIC_DIR, 'agent-discovery.json'),
        JSON.stringify(
            {
                site: SITE_URL,
                version: VERSION,
                generatedAt: new Date().toISOString(),
                markdownMirrors: hocCount + htcCount + 3,
                linkHeaders: [
                    '</.well-known/api-catalog>; rel="api-catalog"',
                    '</openapi.json>; rel="service-desc"; type="application/json"',
                    '</help>; rel="service-doc"; type="text/html"',
                    '</.well-known/agent-skills/index.json>; rel="describedby"',
                    '</.well-known/mcp/server-card.json>; rel="describedby"',
                ],
            },
            null,
            2,
        ),
    );

    console.log(`Agent discovery generated for ${SITE_URL}`);
    console.log(`  markdown mirrors: ${hocCount + htcCount + 3}`);
}

main();
