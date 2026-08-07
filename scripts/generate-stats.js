/**
 * 扫描 cooklikehoc/ 与 howtocook/ 下的文件，生成统计数据
 * 输出到 public/stats.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ROOT, scanAllRecipes, computeStats } from './scan-recipes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_FILE = path.join(PUBLIC_DIR, 'stats.json');

const stats = computeStats(scanAllRecipes());

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(stats, null, 2), 'utf8');
console.log('[generate-stats] wrote stats.json:', stats);
