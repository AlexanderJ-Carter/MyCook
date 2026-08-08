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
const COMMAND_TIMEOUT_MS = Number.parseInt(
    process.env.HOWTOCOOK_IMAGES_TIMEOUT_MS || `${8 * 60 * 1000}`,
    10,
);

const DEFAULT_REPO = 'https://github.com/king-jingxiang/HowToCook.git';
const UPSTREAM_DIR = path.join(ROOT, 'upstream', 'HowToCookImages');

function resolveCommand(cmd) {
    if (process.platform !== 'win32' || path.extname(cmd)) {
        return cmd;
    }
    if (cmd === 'npm' || cmd === 'npx' || cmd === 'corepack' || cmd === 'pnpm') {
        return `${cmd}.cmd`;
    }
    return cmd;
}

function run(cmd, args, opts = {}) {
    const r = spawnSync(resolveCommand(cmd), args, {
        stdio: 'inherit',
        cwd: opts.cwd || ROOT,
        shell: false,
        env: opts.env || process.env,
        timeout: opts.timeout ?? COMMAND_TIMEOUT_MS,
    });
    if (r.error) {
        if (r.error.code === 'ETIMEDOUT') {
            throw new Error(
                `${cmd} ${args.join(' ')} timed out after ${opts.timeout ?? COMMAND_TIMEOUT_MS}ms`,
            );
        }
        throw r.error;
    }
    if (r.signal) {
        throw new Error(`${cmd} ${args.join(' ')} terminated by signal ${r.signal}`);
    }
    if (r.status !== 0)
        throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`);
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** 写入占位页，避免 /howtocook-images/ 404 */
function writePlaceholder(reason) {
    ensureDir(OUT_PATH);
    const escaped = String(reason)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HowToCook 图片版 · MyCook</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: system-ui, "Noto Sans SC", sans-serif;
      max-width: 40em;
      margin: 12vh auto;
      padding: 0 1.25em;
      line-height: 1.65;
      color: #2c241c;
      background: #f7f3ec;
    }
    .kicker { letter-spacing: .14em; text-transform: uppercase; font-size: .75rem; color: #b83a28; margin: 0 0 .6rem; }
    h1 { font-family: "Noto Serif SC", serif; font-weight: 600; font-size: 1.7rem; margin: 0 0 .75rem; }
    .en { color: #6b6258; font-size: .95em; }
    .reason { margin: 1.2rem 0; padding: .9em 1em; background: #fff; border: 1px solid rgba(28,25,21,.1); border-radius: 12px; }
    a { color: #b83a28; }
  </style>
</head>
<body>
  <p class="kicker">MyCook</p>
  <h1>图片版这次没装上</h1>
  <p class="en" style="font-size:1.05em;margin-top:-.35rem">Photo cookbook isn’t in this build</p>
  <p>看图做菜是一个独立小站，体积比较大。当前这次构建跳过了它，所以还打不开。</p>
  <p class="en">The photo cookbook is a separate mini-app. This build skipped it to stay small, so it isn’t available here.</p>
  <p class="reason">${escaped}</p>
  <p><a href="../">← 返回首页 / Back home</a></p>
</body>
</html>`;
    fs.writeFileSync(path.join(OUT_PATH, 'index.html'), html, 'utf8');
    console.log(
        '[build-howtocook-images] Wrote placeholder public/' +
            OUT_SUBDIR +
            '/index.html',
    );
}

function main() {
    if (process.env.SKIP_IMAGES === '1') {
        console.log('[build-howtocook-images] SKIP_IMAGES=1, skip.');
        writePlaceholder(
            '本地若需要图片版，在项目根目录执行 npm run build:images 后再预览。 / To include it locally, run npm run build:images then preview again.',
        );
        return;
    }

    try {
        let srcDir = process.env.HOWTOCOOK_IMAGES_PATH
            ? path.resolve(process.env.HOWTOCOOK_IMAGES_PATH)
            : null;

        if (!srcDir || !fs.existsSync(srcDir)) {
            srcDir = UPSTREAM_DIR;
            if (!fs.existsSync(srcDir)) {
                console.log(
                    '[build-howtocook-images] Clone HowToCook (images)...',
                );
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
            writePlaceholder(
                '未找到图片版源码（无 package.json）。CI 请确认已克隆 king-jingxiang/HowToCook 到 upstream/HowToCookImages。',
            );
            return;
        }

        const buildEnv = { ...process.env, VITE_BASE_PATH: '/howtocook-images/' };
        const installEnv = {
            ...buildEnv,
            CI: process.env.CI || 'true',
            NPM_CONFIG_CACHE: path.join(ROOT, '.npm-cache'),
        };
        const hasPnpmLock = fs.existsSync(path.join(srcDir, 'pnpm-lock.yaml'));
        const hasNpmLock = fs.existsSync(path.join(srcDir, 'package-lock.json'));

        console.log(
            '[build-howtocook-images] Install & build (base /howtocook-images/)...',
        );

        let built = false;

        if (hasPnpmLock) {
            console.log(
                '[build-howtocook-images] pnpm-lock.yaml detected, using pnpm via corepack...',
            );
            try {
                run('corepack', ['pnpm', 'install', '--ignore-scripts'], {
                    cwd: srcDir,
                    env: installEnv,
                });
                run('corepack', ['pnpm', 'run', 'build'], {
                    cwd: srcDir,
                    env: buildEnv,
                });
                built = true;
            } catch (err) {
                console.warn(
                    '[build-howtocook-images] pnpm install/build failed, will fall back to npm:',
                    err.message,
                );
            }
        }

        if (!built) {
            const installArgs = hasNpmLock
                ? ['ci', '--prefer-offline', '--no-audit']
                : ['install', '--prefer-offline', '--no-audit'];
            console.log(
                '[build-howtocook-images] Using npm ' +
                    (hasNpmLock ? 'ci (package-lock found)' : 'install (no lockfile)') +
                    '...',
            );
            run('npm', installArgs, { cwd: srcDir, env: installEnv });
            run('npm', ['run', 'build'], { cwd: srcDir, env: buildEnv });
        }

        const distDir = path.join(srcDir, 'dist');
        if (!fs.existsSync(distDir)) {
            console.warn('[build-howtocook-images] No dist/ - skip copy.');
            writePlaceholder(
                '图片版构建未产出 dist/，请检查上游仓库构建脚本。',
            );
            return;
        }

        if (fs.existsSync(OUT_PATH)) {
            fs.rmSync(OUT_PATH, { recursive: true });
        }
        ensureDir(PUBLIC_DIR);
        copyRecurse(distDir, OUT_PATH);
        console.log('[build-howtocook-images] Copied to public/' + OUT_SUBDIR);
    } catch (err) {
        console.error('[build-howtocook-images] Error:', err.message);
        writePlaceholder(
            '图片版构建失败（' +
                err.message +
                '）。请查看 CI 日志或本地执行 npm run build:images 排查。',
        );
    }
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
