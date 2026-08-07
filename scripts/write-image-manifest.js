/**
 * 构建完成后写入 dist/image-manifest.json，便于了解镜像/部署包内容构成。
 * 用法：node scripts/write-image-manifest.js [distDir]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const distDir = path.resolve(process.argv[2] || path.join(ROOT, '.vitepress/dist'));

function walkSize(dir) {
    if (!fs.existsSync(dir)) return { bytes: 0, files: 0 };
    let bytes = 0;
    let files = 0;
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            const sub = walkSize(full);
            bytes += sub.bytes;
            files += sub.files;
        } else {
            bytes += stat.size;
            files += 1;
        }
    }
    return { bytes, files };
}

function topLevelBreakdown(base) {
    if (!fs.existsSync(base)) return [];
    return fs.readdirSync(base).map((name) => {
        const full = path.join(base, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            const { bytes, files } = walkSize(full);
            return { name, type: 'dir', bytes, files };
        }
        return { name, type: 'file', bytes: stat.size, files: 1 };
    }).sort((a, b) => b.bytes - a.bytes);
}

const total = walkSize(distDir);
const breakdown = topLevelBreakdown(distDir);
const variant = breakdown.some((e) => e.name === 'howtocook-images' && e.bytes > 1_000_000)
    ? 'full'
    : 'lite';

const manifest = {
    variant,
    generatedAt: new Date().toISOString(),
    totalBytes: total.bytes,
    totalFiles: total.files,
    totalHuman: `${(total.bytes / 1024 / 1024).toFixed(1)} MB`,
    runtimeBase: 'nginx:alpine (~25 MB) + 下方静态文件',
    breakdown: breakdown.map((e) => ({
        ...e,
        human: `${(e.bytes / 1024 / 1024).toFixed(1)} MB`,
    })),
    notes: {
        lite: '不含 /howtocook-images/ 图片版子应用，适合日常查阅与 Docker 部署',
        full: '含图片版子应用，体积显著增大，适合需要 4K 菜谱图的场景',
    },
};

fs.writeFileSync(path.join(distDir, 'image-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`[image-manifest] ${variant} · ${manifest.totalHuman} · ${total.files} files`);
