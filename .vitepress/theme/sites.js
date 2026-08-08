/** 公开入口分工（Pages / 自托管完整站 / MCP） */
export const SITES = {
    pages: 'https://cook.alexander.xin',
    full: 'https://mycook.alexander.xin',
    mcp: 'https://cook-mcp.alexander.xin',
    identity: 'https://id.alexander.xin',
};

/** HowToCook 图片版：Pages 不含大图，统一指向完整站 */
export function imagesUrl(path = '/') {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${SITES.full}/howtocook-images${p === '/' ? '/' : p}`;
}
