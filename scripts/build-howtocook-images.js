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
    const full = 'https://mycook.alexander.xin/howtocook-images/';
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${full}" />
  <link rel="canonical" href="${full}" />
  <title>HowToCook 图片版 · 转到完整站</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: "Noto Sans SC", ui-sans-serif, system-ui, sans-serif;
      max-width: 28rem;
      margin: 18vh auto;
      padding: 0 1.25em;
      line-height: 1.65;
      color: #1c1915;
      background:
        radial-gradient(ellipse 70% 50% at 10% 0%, rgba(184,58,40,.12), transparent 55%),
        #f3f1ec;
    }
    .kicker { letter-spacing: .16em; text-transform: uppercase; font-size: .72rem; color: #b83a28; margin: 0 0 .6rem; }
    h1 { font-family: "Noto Serif SC", serif; font-weight: 700; font-size: 1.65rem; margin: 0 0 .75rem; }
    p { color: #5f584e; margin: 0 0 1rem; }
    a.btn {
      display: inline-block;
      margin: .35rem .5rem .35rem 0;
      padding: .65rem 1.2rem;
      border-radius: 999px;
      background: #b83a28;
      color: #fff;
      text-decoration: none;
      font-weight: 600;
    }
    a.secondary { color: #b83a28; }
    .reason { margin: 1.2rem 0 0; padding: .85em 1em; background: #faf8f4; border: 1px solid rgba(28,25,21,.1); border-radius: 12px; font-size: .9rem; }
  </style>
</head>
<body>
  <p class="kicker">MyCook</p>
  <h1>图片版在完整站</h1>
  <p>本站（Pages）为减轻体积未内嵌步骤大图。正在带你去 <strong>mycook</strong> 完整站看图做菜。</p>
  <p>
    <a class="btn" href="${full}">打开图片版</a>
    <a class="secondary" href="/">回首页</a>
  </p>
  <p class="reason">${escaped}</p>
  <script>location.replace(${JSON.stringify(full)});</script>
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
