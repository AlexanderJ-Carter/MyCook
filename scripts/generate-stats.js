/**
 * 扫描 cooklikehoc/ 与 howtocook/ 下的文件，生成统计数据
 * 输出到 public/stats.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_FILE = path.join(PUBLIC_DIR, 'stats.json');

function getLatestMtime(dir, excludeDirs = new Set()) {
  if (!fs.existsSync(dir)) return 0;
  let latest = 0;
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    if (name.startsWith('.') || excludeDirs.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      latest = Math.max(latest, getLatestMtime(full, excludeDirs));
    } else if (name.endsWith('.md')) {
      latest = Math.max(latest, stat.mtimeMs);
    }
  }
  return latest;
}

function countMdFiles(dir, excludeDirs = new Set()) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    if (name.startsWith('.') || excludeDirs.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      count += countMdFiles(full, excludeDirs);
    } else if (name.endsWith('.md') && name !== 'README.md') {
      count++;
    }
  }
  return count;
}

function countHowToCookDishes(dishesDir) {
  if (!fs.existsSync(dishesDir)) return { categories: 0, dishes: 0 };
  let categories = 0;
  let dishes = 0;
  const cats = fs.readdirSync(dishesDir);
  for (const cat of cats) {
    const catPath = path.join(dishesDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    categories++;
    const entries = fs.readdirSync(catPath);
    for (const e of entries) {
      const full = path.join(catPath, e);
      if (fs.statSync(full).isDirectory()) {
        // 子目录形式：菜名/菜名.md
        const subMd = fs.readdirSync(full).find(f => f.endsWith('.md'));
        if (subMd) dishes++;
      } else if (e.endsWith('.md') && e !== 'README.md') {
        dishes++;
      }
    }
  }
  return { categories, dishes };
}

function countCookLikeHOC(baseDir) {
  if (!fs.existsSync(baseDir)) return { categories: 0, dishes: 0 };
  const excludeDirs = new Set(['images', '.git', '.vitepress', 'node_modules', 'docker_support', 'docs']);
  let categories = 0;
  let dishes = 0;
  const entries = fs.readdirSync(baseDir);
  for (const name of entries) {
    if (name.startsWith('.') || excludeDirs.has(name)) continue;
    const full = path.join(baseDir, name);
    if (fs.statSync(full).isDirectory()) {
      categories++;
      dishes += countMdFiles(full);
    }
  }
  return { categories, dishes };
}

function main() {
  const cooklikehocDir = path.join(ROOT, 'cooklikehoc');
  const howtocookDir = path.join(ROOT, 'howtocook');

  const cooklikehoc = countCookLikeHOC(cooklikehocDir);
  const howtocookDishes = countHowToCookDishes(path.join(howtocookDir, 'dishes'));

  // HowToCook 还有 tips 目录
  const tipsPath = path.join(howtocookDir, 'tips');
  const tipsCount = countMdFiles(tipsPath);

  const howtocook = {
    categories: howtocookDishes.categories + (fs.existsSync(tipsPath) ? 1 : 0),
    dishes: howtocookDishes.dishes + tipsCount
  };

  const contentLatestMtime = Math.max(
    getLatestMtime(cooklikehocDir, new Set(['images', '.git', '.vitepress', 'node_modules', 'docker_support', 'docs'])),
    getLatestMtime(howtocookDir)
  );

  const stats = {
    cooklikehoc,
    howtocook,
    total: cooklikehoc.dishes + howtocook.dishes,
    lastUpdated: new Date(contentLatestMtime || Date.now()).toISOString().split('T')[0]
  };

  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(stats, null, 2), 'utf8');
  console.log('[generate-stats] wrote stats.json:', stats);
}

main();
