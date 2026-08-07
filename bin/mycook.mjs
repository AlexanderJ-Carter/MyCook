#!/usr/bin/env node
/**
 * MyCook 统一 CLI：本地开发、构建、Docker 一键启动
 *
 * 用法：node bin/mycook.mjs <command>
 *       npm run mycook -- docker:lite
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const HELP = `
MyCook CLI — 老乡鸡 × 程序员做饭指南

用法: mycook <command>

本地开发:
  sync              同步上游 CookLikeHOC / HowToCook
  dev               生成数据并启动开发服务器
  build             快速构建（不含图片版）
  build:full        完整构建（含图片版，耗时长）
  preview           预览构建结果

Docker:
  docker:lite       构建并启动轻量镜像（默认，~600MB 站点内容）
  docker:full       构建并启动完整镜像（含图片版，~800MB+）
  docker:pull       拉取 GHCR 轻量镜像并启动
  docker:stop       停止容器

Agent / MCP:
  mcp               启动 MCP stdio 服务（Cursor 本地）
  mcp:http          启动 MCP HTTP 服务 → :3001/mcp

其它:
  help              显示此帮助
`.trim();

function run(cmd, args, opts = {}) {
    const r = spawnSync(cmd, args, {
        stdio: 'inherit',
        cwd: ROOT,
        shell: process.platform === 'win32',
        env: { ...process.env, ...opts.env },
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
}

function npm(args, env) {
    run('npm', args, { env });
}

function docker(args, env) {
    run('docker', args, { env });
}

function compose(args, env) {
    run('docker', ['compose', ...args], { env });
}

const command = process.argv[2] || 'help';

switch (command) {
    case 'sync':
        npm(['run', 'sync']);
        break;
    case 'dev':
        npm(['run', 'docs:dev']);
        break;
    case 'build':
        npm(['run', 'docs:build:fast']);
        break;
    case 'build:full':
        npm(['run', 'docs:build']);
        break;
    case 'preview':
        npm(['run', 'docs:preview']);
        break;
    case 'docker:lite':
        compose(['up', '-d', '--build', 'mycook'], { SKIP_IMAGES: '1' });
        console.log('\n✓ MyCook 轻量版 → http://localhost:8080\n');
        break;
    case 'docker:full':
        compose(['--profile', 'full', 'up', '-d', '--build', 'mycook-full'], {
            SKIP_IMAGES: '0',
        });
        console.log('\n✓ MyCook 完整版（含图片版）→ http://localhost:8080\n');
        break;
    case 'docker:pull':
        docker(['pull', 'ghcr.io/alexanderj-carter/mycook:latest']);
        docker(['rm', '-f', 'mycook'], {});
        docker(
            [
                'run',
                '-d',
                '--name',
                'mycook',
                '-p',
                '8080:80',
                '--restart',
                'unless-stopped',
                'ghcr.io/alexanderj-carter/mycook:latest',
            ],
            {},
        );
        console.log('\n✓ 已拉取并启动 → http://localhost:8080\n');
        break;
    case 'docker:stop':
        docker(['rm', '-f', 'mycook'], {});
        compose(['--profile', 'full', 'down'], {});
        compose(['down'], {});
        break;
    case 'mcp':
        run(process.execPath, ['mcp/server.mjs']);
        break;
    case 'mcp:http':
        run(process.execPath, ['mcp/server.mjs', 'http']);
        break;
    case 'help':
    case '-h':
    case '--help':
        console.log(HELP);
        break;
    default:
        console.error(`未知命令: ${command}\n`);
        console.log(HELP);
        process.exit(1);
}
