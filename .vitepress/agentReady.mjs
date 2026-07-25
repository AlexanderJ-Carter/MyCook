import fs from 'node:fs';
import path from 'node:path';

const LINK_HEADERS = [
    '</.well-known/api-catalog>; rel="api-catalog"',
    '</openapi.json>; rel="service-desc"; type="application/json"',
    '</help>; rel="service-doc"; type="text/html"',
    '</.well-known/agent-skills/index.json>; rel="describedby"',
    '</.well-known/mcp/server-card.json>; rel="describedby"',
].join(', ');

const WELL_KNOWN_TYPES = {
    '/.well-known/api-catalog': 'application/linkset+json',
    '/.well-known/oauth-authorization-server': 'application/json',
    '/.well-known/oauth-protected-resource': 'application/json',
    '/.well-known/jwks.json': 'application/json',
    '/.well-known/agent-skills/index.json': 'application/json',
    '/.well-known/mcp/server-card.json': 'application/json',
};

function wantsMarkdown(req) {
    const accept = req.headers.accept || '';
    return accept.includes('text/markdown');
}

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function resolveMarkdownPath(urlPath, publicRoot) {
    const clean = urlPath.split('?')[0].replace(/\/$/, '') || '/';
    const candidates =
        clean === '/'
            ? [path.join(publicRoot, 'index.md')]
            : [path.join(publicRoot, `${clean.slice(1)}.md`), path.join(publicRoot, clean.slice(1), 'index.md')];
    return candidates.find((candidate) => fs.existsSync(candidate));
}

export function agentReadyPlugin(publicRoot) {
    return {
        name: 'mycook-agent-ready',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const urlPath = req.url?.split('?')[0] || '/';

                if (urlPath === '/' || urlPath === '/index.html') {
                    res.setHeader('Link', LINK_HEADERS);
                }

                const contentType = WELL_KNOWN_TYPES[urlPath];
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }

                if (!wantsMarkdown(req)) {
                    next();
                    return;
                }

                const markdownPath = resolveMarkdownPath(urlPath, publicRoot);
                if (!markdownPath) {
                    next();
                    return;
                }

                const body = fs.readFileSync(markdownPath, 'utf8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
                res.setHeader('x-markdown-tokens', String(estimateTokens(body)));
                res.end(body);
            });
        },
        configurePreviewServer(server) {
            this.configureServer(server);
        },
    };
}
