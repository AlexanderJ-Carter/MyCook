/**
 * HTTP MCP 鉴权：Pocket ID JWT（OIDC）或静态 API Key。
 *
 * 环境变量：
 *   MCP_PUBLIC_URL     对外根 URL，如 https://cook-mcp.alexander.xin
 *   OIDC_ISSUER        默认 https://id.alexander.xin
 *   OIDC_AUDIENCE      默认 ${MCP_PUBLIC_URL}/mcp
 *   MCP_API_KEYS       逗号分隔的静态 Bearer（个人脚本 / 备用）
 *   AUTH_REQUIRED      默认 1；设 0 关闭鉴（仅本地调试）
 */
import * as jose from 'jose';

const AUTH_REQUIRED = process.env.AUTH_REQUIRED !== '0';
const MCP_PUBLIC_URL = (process.env.MCP_PUBLIC_URL || '').replace(/\/$/, '');
const OIDC_ISSUER = (process.env.OIDC_ISSUER || 'https://id.alexander.xin').replace(/\/$/, '');
const OIDC_AUDIENCE =
    process.env.OIDC_AUDIENCE || (MCP_PUBLIC_URL ? `${MCP_PUBLIC_URL}/mcp` : '');
const API_KEYS = new Set(
    String(process.env.MCP_API_KEYS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
);

let jwks;

function getJwks() {
    if (!jwks) {
        jwks = jose.createRemoteJWKSet(new URL(`${OIDC_ISSUER}/.well-known/jwks.json`));
    }
    return jwks;
}

export function isAuthRequired() {
    return AUTH_REQUIRED;
}

export function resourceMetadataUrl() {
    if (!MCP_PUBLIC_URL) return null;
    return `${MCP_PUBLIC_URL}/.well-known/oauth-protected-resource`;
}

export function buildProtectedResourceMetadata() {
    const resource = OIDC_AUDIENCE || `${MCP_PUBLIC_URL}/mcp`;
    return {
        resource,
        authorization_servers: [OIDC_ISSUER],
        bearer_methods_supported: ['header'],
        scopes_supported: ['mycook:read'],
        resource_documentation: `${process.env.SITE_URL || 'https://cook.alexander.xin'}/ai-agents`,
    };
}

function unauthorized(res, message = 'Authentication required') {
    const meta = resourceMetadataUrl();
    const parts = ['Bearer realm="MyCook MCP"', 'error="invalid_token"', `error_description="${message}"`];
    if (meta) parts.push(`resource_metadata="${meta}"`);
    res.setHeader('WWW-Authenticate', parts.join(', '));
    res.status(401).json({
        jsonrpc: '2.0',
        error: { code: -32001, message },
        id: null,
    });
}

async function verifyJwt(token) {
    if (!OIDC_AUDIENCE) {
        throw new Error('OIDC_AUDIENCE / MCP_PUBLIC_URL not configured');
    }
    const { payload } = await jose.jwtVerify(token, getJwks(), {
        issuer: OIDC_ISSUER,
        audience: OIDC_AUDIENCE,
    });
    return payload;
}

export async function authenticateRequest(req, res) {
    if (!AUTH_REQUIRED) {
        req.auth = { type: 'disabled' };
        return true;
    }

    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        unauthorized(res, 'Missing Bearer token');
        return false;
    }

    const token = match[1].trim();
    if (API_KEYS.has(token)) {
        req.auth = { type: 'api_key', sub: 'api-key' };
        return true;
    }

    try {
        const payload = await verifyJwt(token);
        req.auth = {
            type: 'oidc',
            sub: payload.sub,
            email: payload.email,
            scope: payload.scope || payload.scp,
            payload,
        };
        return true;
    } catch (err) {
        unauthorized(res, err?.message || 'Invalid token');
        return false;
    }
}

export function authSummary() {
    return {
        required: AUTH_REQUIRED,
        issuer: OIDC_ISSUER,
        audience: OIDC_AUDIENCE || null,
        publicUrl: MCP_PUBLIC_URL || null,
        apiKeysConfigured: API_KEYS.size,
    };
}
