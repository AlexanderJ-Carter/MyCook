/**
 * 从 CookLikeHOC 和 HowToCook 两个上游仓库同步内容到 cooklikehoc/ 与 howtocook/
 * 使用方式：node scripts/sync-upstream.js
 * 可选环境变量：COOKLIKEHOC_PATH, HOWTOCOOK_PATH（默认为 ../CookLikeHOC 与 ../HowToCook）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const COOKLIKEHOC_DEST = path.join(ROOT, 'cooklikehoc');
const HOWTOCOOK_DEST = path.join(ROOT, 'howtocook');
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

function main() {
  syncCookLikeHOC();
  syncHowToCook();
  console.log('[sync] 完成。可执行 npm run docs:build 构建站点。');
}

main();
