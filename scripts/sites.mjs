/** 与主题 `sites.js` 对齐的站点入口常量 */
export const SITES = {
    pages: 'https://cook.alexander.xin',
    full: 'https://mycook.alexander.xin',
    mcp: 'https://cook-mcp.alexander.xin',
    identity: 'https://id.alexander.xin',
};

export const SITE_URL = (process.env.SITE_URL || SITES.pages).replace(/\/$/, '');
export const FULL_SITE_URL = (process.env.FULL_SITE_URL || SITES.full).replace(/\/$/, '');
export const MCP_PUBLIC_URL = (process.env.MCP_PUBLIC_URL || SITES.mcp).replace(/\/$/, '');
