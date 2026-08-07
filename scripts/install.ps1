# MyCook 一键安装 / 部署（Windows PowerShell）
param(
    [ValidateSet('docker-lite', 'docker-full', 'docker-build', 'npm-dev', 'help')]
    [string]$Mode = 'docker-lite',
    [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

function Write-Title($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Step($msg) { Write-Host "  → $msg" -ForegroundColor Gray }

function Show-Help {
    Write-Title "MyCook 一键部署"
    Write-Host @"

用法: .\scripts\install.ps1 [-Mode docker-lite] [-Port 8080]

模式:
  docker-lite    拉取 GHCR 轻量镜像并启动（推荐）
  docker-full    本地构建完整镜像（含图片版）
  docker-build   本地构建轻量镜像并启动
  npm-dev        Node 本地开发
  help           显示帮助

"@
}

function Require-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "缺少命令: $name"
    }
}

function Start-DockerLite {
    Require-Command docker
    Write-Title "拉取轻量镜像并启动 MyCook..."
    Write-Step "ghcr.io/alexanderj-carter/mycook:latest"
    docker pull ghcr.io/alexanderj-carter/mycook:latest
    docker rm -f mycook 2>$null
    docker run -d --name mycook -p "${Port}:80" --restart unless-stopped `
        ghcr.io/alexanderj-carter/mycook:latest
    Write-Title "✓ 已启动 → http://localhost:$Port"
    Write-Step "内容清单: http://localhost:$Port/image-manifest.json"
}

function Start-DockerBuildLite {
    Require-Command docker
    Write-Title "本地构建轻量镜像..."
    docker build --build-arg SKIP_IMAGES=1 -t mycook:lite .
    docker rm -f mycook 2>$null
    docker run -d --name mycook -p "${Port}:80" --restart unless-stopped mycook:lite
    Write-Title "✓ 已启动 → http://localhost:$Port"
}

function Start-DockerBuildFull {
    Require-Command docker
    Write-Title "本地构建完整镜像（耗时长）..."
    docker build --build-arg SKIP_IMAGES=0 -t mycook:full .
    docker rm -f mycook 2>$null
    docker run -d --name mycook -p "${Port}:80" --restart unless-stopped mycook:full
    Write-Title "✓ 已启动 → http://localhost:$Port"
}

function Start-NpmDev {
    Require-Command node
    Require-Command npm
    Write-Title "Node 本地开发"
    npm install
    if (-not (Test-Path cooklikehoc) -or -not (Test-Path howtocook)) {
        Write-Step "尝试 sync 上游..."
        npm run sync
    }
    npm run docs:dev
}

switch ($Mode) {
    'help' { Show-Help }
    'docker-lite' { Start-DockerLite }
    'docker-full' { Start-DockerBuildFull }
    'docker-build' { Start-DockerBuildLite }
    'npm-dev' { Start-NpmDev }
}
