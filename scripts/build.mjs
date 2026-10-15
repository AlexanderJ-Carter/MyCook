#!/usr/bin/env node
/**
 * docs:build 编排：图片构建与索引生成并行（输出目录互不相干），
 * 全部完成后跑 VitePress 构建 + sitemap。--fast 跳过图片构建并写镜像清单。
 *
 * 用法：node scripts/build.mjs [--fast]
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FAST = process.argv.includes('--fast');

if (FAST) process.env.SKIP_IMAGES = '1';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, cmd, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit' });
        child.on('error', (err) => reject(new Error(`${label}: ${err.message}`)));
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${label} exited with code ${code}`));
        });
    });
}

function runNode(label, script) {
    return run(label, process.execPath, [script]);
}

try {
    // 图片构建（public/howtocook-images/）与 generate（public/*.json + .well-known）
    // 输出互不相干，并行跑省一轮串行等待；CI 上图片构建是分钟级大头
    await Promise.all([
        run('build:images', npm, ['run', 'build:images']),
        run('generate', npm, ['run', 'generate']),
    ]);
    await run('vitepress', npm, ['exec', 'vitepress', '--', 'build', '.']);
    await runNode('generate:sitemap', 'scripts/generate-sitemap.js');
    if (FAST) await runNode('write-image-manifest', 'scripts/write-image-manifest.js');
} catch (err) {
    console.error(`[build] ${err.message}`);
    process.exit(1);
}
