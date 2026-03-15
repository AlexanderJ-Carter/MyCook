/**
 * 从 CookLikeHOC 和 HowToCook 同步内容到 cooklikehoc/ 与 howtocook/
 *
 * 使用：node scripts/sync-upstream.js
 *
 * 环境变量：
 *   COOKLIKEHOC_PATH   - CookLikeHOC 源目录（默认 ../CookLikeHOC）
 *   HOWTOCOOK_PATH    - HowToCook 源目录（默认 ../HowToCook）
 *   COOKLIKEHOC_BRANCH - 仅记录用，实际分支由 clone 时指定
 *   HOWTOCOOK_BRANCH  - 仅记录用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const COOKLIKEHOC_DEST = path.join(ROOT, 'cooklikehoc');
const HOWTOCOOK_DEST = path.join(ROOT, 'howtocook');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SYNC_INFO_FILE = path.join(PUBLIC_DIR, 'sync-info.json');

const COOKLIKEHOC_SRC = process.env.COOKLIKEHOC_PATH
  ? path.resolve(process.env.COOKLIKEHOC_PATH)
  : path.join(ROOT, '..', 'CookLikeHOC');
const HOWTOCOOK_SRC = process.env.HOWTOCOOK_PATH
  ? path.resolve(process.env.HOWTOCOOK_PATH)
  : path.join(ROOT, '..', 'HowToCook');

const COOKLIKEHOC_EXCLUDE = new Set([
  '.git', '.vitepress', 'node_modules', 'docker_support', 'docs', 'public',
  'package.json', 'package-lock.json', 'banner.png', 'tg.png', '.gitignore',
]);
const HOWTOCOOK_COPY_DIRS = ['dishes', 'tips', 'starsystem'];
const HOWTOCOOK_COPY_FILES = ['README.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'LICENSE'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecurse(src, dest, excludeSet) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isFile()) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    return;
  }
  const entries = fs.readdirSync(src);
  for (const name of entries) {
    if (excludeSet && excludeSet.has(name)) continue;
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) {
      ensureDir(d);
      copyRecurse(s, d, excludeSet);
    } else {
      ensureDir(path.dirname(d));
      fs.copyFileSync(s, d);
    }
  }
}

function syncCookLikeHOC() {
  if (!fs.existsSync(COOKLIKEHOC_SRC)) {
    console.warn('[sync] CookLikeHOC 路径不存在，跳过:', COOKLIKEHOC_SRC);
    return;
  }
  ensureDir(COOKLIKEHOC_DEST);
  copyRecurse(COOKLIKEHOC_SRC, COOKLIKEHOC_DEST, COOKLIKEHOC_EXCLUDE);
  // README 中引用 /banner.png，复制到 public 以便构建时解析
  const bannerSrc = path.join(COOKLIKEHOC_SRC, 'banner.png');
  if (fs.existsSync(bannerSrc)) {
    ensureDir(PUBLIC_DIR);
    fs.copyFileSync(bannerSrc, path.join(PUBLIC_DIR, 'banner.png'));
    console.log('[sync] 已复制 banner.png 到 public/');
  }
  console.log('[sync] CookLikeHOC 已同步到 cooklikehoc/');
}

function syncHowToCook() {
  if (!fs.existsSync(HOWTOCOOK_SRC)) {
    console.warn('[sync] HowToCook 路径不存在，跳过:', HOWTOCOOK_SRC);
    return;
  }
  ensureDir(HOWTOCOOK_DEST);
  for (const dir of HOWTOCOOK_COPY_DIRS) {
    const s = path.join(HOWTOCOOK_SRC, dir);
    const d = path.join(HOWTOCOOK_DEST, dir);
    if (fs.existsSync(s)) {
      copyRecurse(s, d, null);
      console.log('[sync] HowToCook 已复制:', dir);
    }
  }
  for (const file of HOWTOCOOK_COPY_FILES) {
    const s = path.join(HOWTOCOOK_SRC, file);
    const d = path.join(HOWTOCOOK_DEST, file);
    if (fs.existsSync(s)) fs.copyFileSync(s, d);
  }
  console.log('[sync] HowToCook 已同步到 howtocook/');
}

function writeSyncInfo() {
  const info = {
    lastSync: new Date().toISOString(),
    sources: {
      cooklikehoc: { path: COOKLIKEHOC_SRC, present: fs.existsSync(COOKLIKEHOC_SRC) },
      howtocook: { path: HOWTOCOOK_SRC, present: fs.existsSync(HOWTOCOOK_SRC) },
    },
    branches: {
      cooklikehoc: process.env.COOKLIKEHOC_BRANCH || 'main',
      howtocook: process.env.HOWTOCOOK_BRANCH || 'master',
    },
  };
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(SYNC_INFO_FILE, JSON.stringify(info, null, 2), 'utf8');
  console.log('[sync] 已写入 public/sync-info.json');
}

function main() {
  syncCookLikeHOC();
  syncHowToCook();
  writeSyncInfo();
  console.log('[sync] 完成。可执行 npm run docs:build 构建站点。');
}

main();
