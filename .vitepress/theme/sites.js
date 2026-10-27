/** 公开入口分工（Pages / 自托管完整站 / MCP）与 alexander.xin 站群 */
export const SITES = {
    folio: 'https://alexander.xin',
    pages: 'https://cook.alexander.xin',
    full: 'https://mycook.alexander.xin',
    mcp: 'https://cook-mcp.alexander.xin',
    identity: 'https://id.alexander.xin',
    tools: 'https://tools.alexander.xin',
    git: 'https://git.alexander.xin',
};

export const ECOSYSTEM_LINKS = [
    { id: 'folio', href: SITES.folio, zh: 'Folio 主站', en: 'Folio (home)' },
    { id: 'tools', href: SITES.tools, zh: 'IT-Tools', en: 'IT-Tools' },
    { id: 'git', href: SITES.git, zh: 'Gitea', en: 'Gitea' },
];

/** HowToCook 图片版：Pages 不含大图，统一指向完整站 */
export function imagesUrl(path = '/') {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${SITES.full}/howtocook-images${p === '/' ? '/' : p}`;
}
