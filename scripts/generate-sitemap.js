/**
 * 生成 sitemap.xml 用于 SEO
 * 扫描所有菜谱页面，生成标准的 sitemap 格式
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(ROOT, '.vitepress/dist', 'sitemap.xml');

const BASE_URL = 'https://cook.alexander.xin';

function encodeUrlPath(pathname) {
  return pathname
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
    .replace(/%2F/g, '/');
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function dateFromFile(filePath) {
  return fs.statSync(filePath).mtime.toISOString().split('T')[0];
}

function collectMdFiles(dir, basePath, list) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name !== 'images') {
        collectMdFiles(full, basePath, list);
      }
    } else if (name.endsWith('.md') && name !== 'README.md') {
      const rel = path
        .relative(path.join(ROOT, basePath), full)
        .replace(/\\/g, '/')
        .replace(/\.md$/i, '');
      const link = encodeUrlPath('/' + basePath + '/' + rel);
      list.push({
        loc: BASE_URL + link,
        lastmod: stat.mtime.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      });
    }
  }
}

function collectHowToCookDishes(dishesDir, list) {
  if (!fs.existsSync(dishesDir)) return;
  const cats = fs.readdirSync(dishesDir);
  for (const cat of cats) {
    const catPath = path.join(dishesDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const entries = fs.readdirSync(catPath);
    for (const e of entries) {
      const full = path.join(catPath, e);
      if (fs.statSync(full).isDirectory()) {
        const subMd = fs.readdirSync(full).sort().find(f => f.endsWith('.md'));
        if (subMd) {
          const link = BASE_URL + encodeUrlPath('/howtocook/dishes/' + cat + '/' + e + '/' + subMd.replace(/\.md$/i, ''));
          list.push({
            loc: link,
            lastmod: fs.statSync(path.join(full, subMd)).mtime.toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.8
          });
        }
      } else if (e.endsWith('.md') && e !== 'README.md') {
        const link = BASE_URL + encodeUrlPath('/howtocook/dishes/' + cat + '/' + e.replace(/\.md$/i, ''));
        list.push({
          loc: link,
          lastmod: fs.statSync(full).mtime.toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.8
        });
      }
    }
  }
}

function generateSitemap() {
  const urls = [];

  // 首页
  urls.push({
    loc: BASE_URL + '/',
    lastmod: dateFromFile(path.join(ROOT, 'index.md')),
    changefreq: 'daily',
    priority: 1.0
  });

  // 帮助和关于页
  urls.push({
    loc: BASE_URL + '/help',
    lastmod: dateFromFile(path.join(ROOT, 'help.md')),
    changefreq: 'monthly',
    priority: 0.5
  });
  urls.push({
    loc: BASE_URL + '/about',
    lastmod: dateFromFile(path.join(ROOT, 'about.md')),
    changefreq: 'monthly',
    priority: 0.5
  });

  // CookLikeHOC
  const cooklikehocDir = path.join(ROOT, 'cooklikehoc');
  if (fs.existsSync(cooklikehocDir)) {
    collectMdFiles(cooklikehocDir, 'cooklikehoc', urls);
  }

  // HowToCook
  const howtocookDir = path.join(ROOT, 'howtocook');
  if (fs.existsSync(howtocookDir)) {
    const dishes = path.join(howtocookDir, 'dishes');
    if (fs.existsSync(dishes)) {
      collectHowToCookDishes(dishes, urls);
    }
    // tips 和 starsystem
    for (const sub of ['tips', 'starsystem']) {
      const p = path.join(howtocookDir, sub);
      if (fs.existsSync(p)) {
        collectMdFiles(p, 'howtocook/' + sub, urls);
      }
    }
  }

  // 生成 XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <lastmod>${xmlEscape(url.lastmod)}</lastmod>
    <changefreq>${xmlEscape(url.changefreq)}</changefreq>
    <priority>${xmlEscape(url.priority)}</priority>
  </url>`).join('\n')}
</urlset>`;

  // 确保输出目录存在
  const distDir = path.join(ROOT, '.vitepress/dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, xml, 'utf8');
  console.log('[generate-sitemap] generated sitemap.xml with', urls.length, 'URLs');
}

generateSitemap();
