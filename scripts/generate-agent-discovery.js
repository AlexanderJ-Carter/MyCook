import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FULL_SITE_URL, MCP_PUBLIC_URL, SITE_URL, SITES } from './sites.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const WELL_KNOWN = path.join(PUBLIC_DIR, '.well-known');
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

/**
 * Rewrite relative image links so VitePress/Rollup never resolves
 * agent mirrors under public/ as local modules (missing images break CI).
 */
function rewriteRelativeImages(markdown, urlPrefix) {
    return markdown.replace(
        /(!?\[[^\]]*\])\((?:\.\.\/)+images\/([^)]+)\)/g,
        `$1(/${urlPrefix}/images/$2)`,
    );
}

function mirrorMarkdown(srcPath, destPath, urlPrefix) {
    if (!fs.existsSync(srcPath)) return;
    const body = rewriteRelativeImages(
        stripFrontmatter(fs.readFileSync(srcPath, 'utf8')),
        urlPrefix,
    );
    writeText(destPath, body);
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    ensureDir(dest);
    for (const name of fs.readdirSync(src)) {
        if (name.startsWith('.')) continue;
        const from = path.join(src, name);
        const to = path.join(dest, name);
        if (fs.statSync(from).isDirectory()) copyDir(from, to);
        else fs.copyFileSync(from, to);
    }
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
            mirrorMarkdown(full, dest, urlPrefix);
            count += 1;
        }
    }

    walk(srcDir, urlPrefix);
    const imagesSrc = path.join(srcDir, 'images');
    if (fs.existsSync(imagesSrc)) {
        copyDir(imagesSrc, path.join(destPrefix, urlPrefix, 'images'));
    }
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
            skill: `${SITE_URL}/.well-known/agent-skills/mycook-kitchen/SKILL.md`,
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
    const mcpUrl = (process.env.MCP_URL || `${MCP_PUBLIC_URL}/mcp`).replace(/\/$/, '');
    return {
        serverInfo: {
            name: 'mycook',
            version: VERSION,
            title: 'MyCook Recipe Discovery',
            description: '577+ 道菜谱搜索、Markdown 读取、食材反查与随机推荐',
        },
        endpoint: mcpUrl.endsWith('/mcp') ? mcpUrl : `${mcpUrl}/mcp`,
        transport: 'streamable-http',
        authentication: {
            required: true,
            schemes: ['bearer'],
            issuer: SITES.identity,
            audience: mcpUrl.endsWith('/mcp') ? mcpUrl : `${mcpUrl}/mcp`,
            documentation: `${SITE_URL}/ai-agents`,
        },
        stdio: {
            command: 'node',
            args: ['mcp/server.mjs'],
            env: { MYCOOK_DATA: './public' },
        },
        capabilities: {
            tools: true,
            resources: true,
            prompts: true,
        },
        tools: [
            { name: 'search_recipes', description: '按关键词搜索站内菜谱' },
            { name: 'get_recipe', description: '按路径获取菜谱元数据' },
            { name: 'get_recipe_markdown', description: '读取菜谱 Markdown 正文' },
            { name: 'get_site_stats', description: '站点分类统计' },
            { name: 'get_recent_updates', description: '最近更新列表' },
            { name: 'search_by_ingredients', description: '按食材反查（食用手册）' },
            { name: 'list_pantry_ingredients', description: '可选食材 chip 列表' },
            { name: 'random_recipe', description: '随机一道站内菜谱' },
            { name: 'search_tips', description: '搜索厨房技巧文章' },
        ],
        prompts: [
            { name: 'what_to_cook', description: '今天吃什么选菜提示' },
            { name: 'recipe_assistant', description: '单篇菜谱问答上下文' },
        ],
    };
}

function cursorInstallDeeplink() {
    const config = {
        url: `${MCP_PUBLIC_URL}/mcp`,
        headers: {
            Authorization: 'Bearer YOUR_TOKEN',
        },
    };
    const b64 = Buffer.from(JSON.stringify(config), 'utf8').toString('base64url');
    return `cursor://anysphere.cursor-deeplink/mcp/install?name=mycook&config=${b64}`;
}

function buildAgentSkillsIndex(skills) {
    return {
        $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
        skills: skills.map((s) => ({
            name: s.name,
            type: 'skill-md',
            description: s.description,
            url: s.url,
            digest: sha256(s.content),
        })),
    };
}

function buildKitchenSkillMd() {
    return `---
name: mycook-kitchen
description: >-
  Use MyCook to search recipes, read full Markdown steps, reverse-lookup by
  pantry ingredients, pick a random dish, or fetch kitchen tips. Prefer MCP
  tools when available; fall back to public JSON. Trigger for cooking,
  recipes, 菜谱, 今天吃什么, 开冰箱, 番茄鸡蛋, MyCook.
---

# MyCook Kitchen

帮用户查菜、选菜、按手头食材推荐。优先用 **MCP tools**；没有 MCP 时再拉公开 JSON。

## 域名

| 用途 | URL |
|------|-----|
| 公开站 / Skills | ${SITE_URL} |
| 完整站 + 图片 | ${FULL_SITE_URL} |
| 远程 MCP | ${MCP_PUBLIC_URL}/mcp |
| 一句话接入 | ${SITE_URL}/mcp-setup |

## 优先：MCP 工具编排

已连接 \`mycook\` MCP 时按场景调用（只读，无副作用）：

| 用户意图 | 调用顺序 |
|----------|----------|
| 搜菜名 / 关键词 | \`search_recipes\` → 选一道 → \`get_recipe_markdown\` |
| 开冰箱 / 手头有什么 | \`list_pantry_ingredients\`（可选）→ \`search_by_ingredients\` → \`get_recipe_markdown\` |
| 今天吃什么 / 随便做 | \`random_recipe\` 或 prompt \`what_to_cook\` → \`get_recipe_markdown\` |
| 问技巧 / 备忘 | \`search_tips\` |
| 站有多大 / 最近更新 | \`get_site_stats\` / \`get_recent_updates\` |

规则：
1. 先搜索再读全文，不要猜步骤。
2. 路径用站内 path（如 \`/cooklikehoc/炒菜/鱼香肉丝\`），不要编造。
3. 回答里给可点开的完整链接：\`${SITE_URL}<path>\`；要步骤大图用 \`${FULL_SITE_URL}/howtocook-images/\`。
4. \`source\`：\`cooklikehoc\` = 做法库，\`howtocook\` = 食材指南。
5. 远程 MCP 需 Bearer；401 时提示用户打开 ${SITE_URL}/mcp-setup。

## 回落：公开 HTTP（无需登录）

\`\`\`
GET ${SITE_URL}/recipes-index.json
GET ${SITE_URL}/stats.json
GET ${SITE_URL}/recent.json
GET ${SITE_URL}/pantry.json
GET ${SITE_URL}/openapi.json
\`\`\`

完整站可用 \`Accept: text/markdown\` 拉菜谱 Markdown。

## 鉴权边界

- 公开 JSON / Skills / 本页：匿名
- \`${MCP_PUBLIC_URL}/mcp\`：\`Authorization: Bearer …\`（Pocket ID JWT 或 API Key）
- 策略：${SITE_URL}/auth.md
`;
}

function buildMcpConnectSkillMd() {
    return `---
name: mycook-mcp
description: >-
  Connect Cursor/Claude/VS Code to the MyCook remote MCP server, including
  Bearer token placement, Pocket ID resource scope, and a smoke-test search.
  Trigger when the user asks to install MyCook MCP, configure mcp.json, or
  fix 401 on cook-mcp.alexander.xin.
---

# MyCook MCP 接入

把远程 MCP 配进客户端，让 Agent 能调厨房工具。

## 一句话（给用户复制）

\`\`\`
请按 ${SITE_URL}/mcp-setup 帮我接入 MyCook MCP；配好后用 search_recipes 搜「番茄」自检。
\`\`\`

## 远程配置模板

合并进客户端 MCP 配置（把 \`YOUR_TOKEN\` 换成真实令牌）：

\`\`\`json
{
  "mcpServers": {
    "mycook": {
      "url": "${MCP_PUBLIC_URL}/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
\`\`\`

| 客户端 | 配置位置 |
|--------|----------|
| Cursor | Settings → MCP，或用户目录 \`mcp.json\` |
| Claude Desktop | macOS \`~/Library/Application Support/Claude/claude_desktop_config.json\`；Windows \`%APPDATA%\\\\Claude\\\\claude_desktop_config.json\` |
| VS Code | 工作区 \`.vscode/mcp.json\` |

Cursor 一键安装（仍需把 \`YOUR_TOKEN\` 改成真令牌后再批准）：  
\`${cursorInstallDeeplink()}\`

## 令牌

1. **API Key（最简单）**：运维下发的静态 Bearer，直接填。
2. **Pocket ID JWT**：resource=\`${MCP_PUBLIC_URL}/mcp\`，scope=\`mycook:read\`。换票必须带 \`resource\`（≥2.13）：

\`\`\`bash
curl -sS -u 'mycook-mcp:$CLIENT_SECRET' \\
  -d 'grant_type=client_credentials' \\
  -d 'scope=mycook:read' \\
  -d 'resource=${MCP_PUBLIC_URL}/mcp' \\
  ${SITES.identity}/api/oidc/token
\`\`\`

探测（无需 token）：\`GET ${MCP_PUBLIC_URL}/health\` → \`ok: true\`。

## 自检

配置生效后调用 \`search_recipes\`，query=\`番茄\`，应返回多条结果。失败见 ${SITE_URL}/mcp-guide。

## 本地免鉴权（开发）

\`\`\`bash
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook && npm install && npm run generate
AUTH_REQUIRED=0 npm run mcp:http   # http://127.0.0.1:3001/mcp
# 或：npm run mcp  # stdio
\`\`\`
`;
}

function buildSetupMd() {
    const deeplink = cursorInstallDeeplink();
    return `# MyCook MCP 一句话接入

把下面整段复制发给 Cursor / Claude / 其他 AI 助手即可（把令牌换成你的）。

---

请帮我接入 **MyCook** 远程 MCP，并完成自检。

## 目标

1. 在当前环境写好 MCP 配置，使 Agent 能调用 \`mycook\` 工具。
2. 用 \`search_recipes\`（query=\`番茄\`）自检；成功则简短确认，失败则对照 401/网络排查。

## 远程配置（优先）

合并进 MCP 配置文件（Cursor：用户 \`mcp.json\` 或 Settings → MCP；Claude Desktop：\`claude_desktop_config.json\`；VS Code：\`.vscode/mcp.json\`）：

\`\`\`json
{
  "mcpServers": {
    "mycook": {
      "url": "${MCP_PUBLIC_URL}/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
\`\`\`

- 把 \`YOUR_TOKEN\` 换成用户提供的 Bearer（Pocket ID JWT 或静态 API Key）。
- 若用户还没有令牌：说明需向站点管理员索取，或打开 ${SITE_URL}/mcp-guide；**不要编造 token**。
- Cursor 可先打开一键安装链接（批准前务必改掉占位 token）：  
  ${deeplink}

## Pocket ID 换票（仅当用户有 client_secret 时）

\`\`\`bash
curl -sS -u 'mycook-mcp:$CLIENT_SECRET' \\
  -d 'grant_type=client_credentials' \\
  -d 'scope=mycook:read' \\
  -d 'resource=${MCP_PUBLIC_URL}/mcp' \\
  ${SITES.identity}/api/oidc/token
\`\`\`

取出 \`access_token\` 填入 Bearer。\`aud\` 必须是 \`${MCP_PUBLIC_URL}/mcp\`。

## 自检

1. \`GET ${MCP_PUBLIC_URL}/health\` → \`ok: true\`
2. 调用 MCP \`search_recipes\`，\`query=番茄\`
3. 成功后再提示：可说「开冰箱：番茄鸡蛋」或「随机一道菜」

## 技能与文档

- 厨房编排 Skill：${SITE_URL}/.well-known/agent-skills/mycook-kitchen/SKILL.md
- 接入 Skill：${SITE_URL}/.well-known/agent-skills/mycook-mcp/SKILL.md
- 人类说明：${SITE_URL}/mcp-guide
- 无 MCP 时仍可用公开 JSON：${SITE_URL}/recipes-index.json

---

## 给人类的超短口令

\`\`\`
请按 ${SITE_URL}/mcp-setup 帮我接入 MyCook MCP，配好后用 search_recipes 搜「番茄」自检。
\`\`\`
`;
}

function buildSkillMd() {
    return buildKitchenSkillMd();
}

function buildAuthMd() {
    return `# auth.md

MyCook 面向 AI 代理的访问说明。

## 入口

| 用途 | URL |
|------|-----|
| Pages 主站（公开） | \`${SITE_URL}\` |
| 完整站（含图片） | \`${FULL_SITE_URL}\` |
| 远程 MCP（鉴权） | \`${MCP_PUBLIC_URL}/mcp\` |
| 身份提供方 | \`${SITES.identity}\` |

## 公开资源（无需认证）

代理可直接访问主站 / 完整站：

- \`GET /recipes-index.json\`
- \`GET /stats.json\`
- \`GET /recent.json\`
- \`GET /pantry.json\`
- 任意 HTML + \`Accept: text/markdown\`（完整站 / Docker）

支持匿名身份（\`identity_types_supported: ["anonymous"]\`）。

## 远程 MCP（需要认证）

\`POST/GET ${MCP_PUBLIC_URL}/mcp\` 必须携带：

\`\`\`http
Authorization: Bearer <token>
\`\`\`

| 令牌类型 | 说明 |
|----------|------|
| Pocket ID JWT | \`aud\` = \`${MCP_PUBLIC_URL}/mcp\`，建议 scope \`mycook:read\`；issuer \`${SITES.identity}\` |
| 静态 API Key | 运维在服务器 \`MCP_API_KEYS\` 中配置的备用 Bearer |

探测（无需 token）：\`GET ${MCP_PUBLIC_URL}/health\`  
资源元数据：\`${MCP_PUBLIC_URL}/.well-known/oauth-protected-resource\`

配置示例见仓库 \`mcp/mcp-http.example.json\`。  
一句话接入：\`${SITE_URL}/mcp-setup\` · 使用指南：\`${SITE_URL}/mcp-guide\`

## 相关发现文档

- API 目录: \`/.well-known/api-catalog\`
- Agent Skills: \`/.well-known/agent-skills/index.json\`
- MCP Server Card: \`/.well-known/mcp/server-card.json\`
- 站点 OAuth 元数据（公开 API 匿名策略）: \`/.well-known/oauth-protected-resource\`
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
- [HowToCook 图片版](${FULL_SITE_URL}/howtocook-images/)

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

    const kitchenSkill = buildKitchenSkillMd();
    const mcpSkill = buildMcpConnectSkillMd();
    const setupMd = buildSetupMd();
    // 兼容旧路径：mycook-recipes → 厨房编排
    const legacyRecipesPath = path.join(
        WELL_KNOWN,
        'agent-skills',
        'mycook-recipes',
        'SKILL.md',
    );
    const kitchenPath = path.join(
        WELL_KNOWN,
        'agent-skills',
        'mycook-kitchen',
        'SKILL.md',
    );
    const mcpSkillPath = path.join(
        WELL_KNOWN,
        'agent-skills',
        'mycook-mcp',
        'SKILL.md',
    );
    writeText(legacyRecipesPath, kitchenSkill);
    writeText(kitchenPath, kitchenSkill);
    writeText(mcpSkillPath, mcpSkill);
    writeText(path.join(PUBLIC_DIR, 'mcp-setup.md'), setupMd);

    // 仓库内 Cursor skill（开发/本机 Agent 用）
    writeText(path.join(ROOT, '.cursor', 'skills', 'mycook-kitchen', 'SKILL.md'), kitchenSkill);
    writeText(path.join(ROOT, '.cursor', 'skills', 'mycook-mcp', 'SKILL.md'), mcpSkill);

    writeJson(path.join(PUBLIC_DIR, 'openapi.json'), buildOpenApi());
    writeText(path.join(WELL_KNOWN, 'api-catalog'), JSON.stringify(buildApiCatalog(), null, 2));
    writeJson(path.join(WELL_KNOWN, 'oauth-authorization-server'), buildOAuthAuthorizationServer());
    writeJson(path.join(WELL_KNOWN, 'openid-configuration'), buildOAuthAuthorizationServer());
    writeJson(path.join(WELL_KNOWN, 'oauth-protected-resource'), buildOAuthProtectedResource());
    writeJson(path.join(WELL_KNOWN, 'jwks.json'), buildJwks());
    writeJson(path.join(WELL_KNOWN, 'mcp', 'server-card.json'), buildMcpServerCard());
    writeJson(
        path.join(WELL_KNOWN, 'agent-skills', 'index.json'),
        buildAgentSkillsIndex([
            {
                name: 'mycook-kitchen',
                description:
                    '搜菜、读步骤、按食材反查、随机推荐；优先 MCP tools',
                url: `${SITE_URL}/.well-known/agent-skills/mycook-kitchen/SKILL.md`,
                content: kitchenSkill,
            },
            {
                name: 'mycook-mcp',
                description:
                    '把 MyCook 远程 MCP 配进 Cursor/Claude/VS Code 并自检',
                url: `${SITE_URL}/.well-known/agent-skills/mycook-mcp/SKILL.md`,
                content: mcpSkill,
            },
            {
                name: 'mycook-recipes',
                description:
                    '（兼容旧名）同 mycook-kitchen：菜谱检索与编排',
                url: `${SITE_URL}/.well-known/agent-skills/mycook-recipes/SKILL.md`,
                content: kitchenSkill,
            },
            {
                name: 'mycook-agents',
                type: 'skill-md',
                description: 'MyCook 项目维护与内容结构说明（非厨房场景）',
                url: `${SITE_URL}/AGENTS.md`,
                content: fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8'),
            },
        ]),
    );
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
