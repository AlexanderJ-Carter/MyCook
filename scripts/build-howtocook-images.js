/**
 * 将 HowToCook 图片版（king-jingxiang/HowToCook）构建到 public/howtocook-images/
 * 作为本站子路径，无需跳转外站。
 *
 * 环境变量：
 *   HOWTOCOOK_IMAGES_PATH - 本地路径（默认从 upstream/HowToCookImages 或克隆）
 *   HOWTOCOOK_IMAGES_REPO - 克隆地址（默认 https://github.com/king-jingxiang/HowToCook.git）
 *   SKIP_IMAGES           - 设为 1 时跳过，不构建图片版
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_SUBDIR = 'howtocook-images';
const OUT_PATH = path.join(PUBLIC_DIR, OUT_SUBDIR);

const DEFAULT_REPO = 'https://github.com/king-jingxiang/HowToCook.git';
const UPSTREAM_DIR = path.join(ROOT, 'upstream', 'HowToCookImages');

function run(cmd, args, opts = {}) {
    const r = spawnSync(cmd, args, {
        stdio: 'inherit',
        cwd: opts.cwd || ROOT,
        shell: opts.shell ?? true,
    });
    if (r.status !== 0)
        throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`);
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
    if (process.env.SKIP_IMAGES === '1') {
        console.log('[build-howtocook-images] SKIP_IMAGES=1, skip.');
        return;
    }

    let srcDir = process.env.HOWTOCOOK_IMAGES_PATH
        ? path.resolve(process.env.HOWTOCOOK_IMAGES_PATH)
        : null;

    if (!srcDir || !fs.existsSync(srcDir)) {
        srcDir = UPSTREAM_DIR;
        if (!fs.existsSync(srcDir)) {
            console.log('[build-howtocook-images] Clone HowToCook (images)...');
            ensureDir(path.dirname(UPSTREAM_DIR));
            const repo = process.env.HOWTOCOOK_IMAGES_REPO || DEFAULT_REPO;
            run('git', ['clone', '--depth', '1', repo, UPSTREAM_DIR]);
        }
    }

    const packageJson = path.join(srcDir, 'package.json');
    if (!fs.existsSync(packageJson)) {
        console.warn(
            '[build-howtocook-images] No package.json in',
            srcDir,
            '- skip.',
        );
        return;
    }

    console.log(
        '[build-howtocook-images] Install & build (base /howtocook-images/)...',
    );
    run('npm', ['ci', '--prefer-offline', '--no-audit'], { cwd: srcDir });
    run('npm', ['run', 'build'], {
        cwd: srcDir,
        env: { ...process.env, VITE_BASE_PATH: '/howtocook-images/' },
    });

    const distDir = path.join(srcDir, 'dist');
    if (!fs.existsSync(distDir)) {
        console.warn('[build-howtocook-images] No dist/ - skip copy.');
        return;
    }

    if (fs.existsSync(OUT_PATH)) {
        fs.rmSync(OUT_PATH, { recursive: true });
    }
    ensureDir(PUBLIC_DIR);
    copyRecurse(distDir, OUT_PATH);
    console.log('[build-howtocook-images] Copied to public/' + OUT_SUBDIR);
}

function copyRecurse(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isFile()) {
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
        return;
    }
    const entries = fs.readdirSync(src);
    for (const name of entries) {
        const s = path.join(src, name);
        const d = path.join(dest, name);
        if (fs.statSync(s).isDirectory()) {
            ensureDir(d);
            copyRecurse(s, d);
        } else {
            ensureDir(path.dirname(d));
            fs.copyFileSync(s, d);
        }
    }
}

main();
