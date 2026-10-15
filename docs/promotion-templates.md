# 推广文案模板

> 发各种平台时直接复制改两笔即可。都写好了钩子和链接，别改动「一句是什么」那行。

## 简短版（评论区 / 群聊 / 即刻）

```
做了个「打开就能做饭」的站：709 道家常菜，问一句「今天吃什么」直接出菜谱；
开冰箱勾手头食材能反查出菜；做菜时还有多计时器和打印模式。
PWA 能装手机，AI 党还可以接 MCP 让 Cursor/Claude 帮你选菜。
https://cook.alexander.xin
```

## 掘金 / V2EX 版（技术向，建议配三张截图）

标题选项：
- 《把两个 10 万 star 的菜谱项目合并成一个 AI 就绪的厨房站》
- 《给 Cursor 装了个菜谱 MCP：今天吃什么让 AI 替我想》

正文骨架：

```
背景：HowToCook（10w+ star）按食材组织，CookLikeHOC（老乡鸡溯源）按做法组织，
两边都好，但查一道菜要开两个站。于是合并成一个静态站，再补上现代 Web 该有的东西。

做了什么：
1. 双源合一：按做法逛 / 按食材逛 / 4K 图片版三条入口，每日 CI 自动同步上游
2. 厨助手：检索优先的厨房 AI——问「冰箱里有鸡蛋番茄能做什么」直接出可点的菜谱链接
3. MCP Server：任何 MCP 客户端（Cursor/Claude Desktop/Copilot）可查菜、读正文、按食材反查
4. 工程细节：VitePress + PWA + Service Worker 缓存治理、每日构建、Docker 一行自托管

踩的坑（可展开小节）：
- 索引里 192 个链接是坏的：目录菜「文件夹名=菜名」被折叠成 4 段路径，实际 301→404
- /ask 免鉴权端点的限流被伪造 X-Forwarded-For 绕过（直通付费 LLM）
- 744MB dist 的 IO 削减：763 个 markdown 镜像按 mtime 跳过，generate 全量 → 1.1s

开源：https://github.com/AlexanderJ-Carter/MyCook
在线：https://cook.alexander.xin
```

## 小红书 / 朋友圈版（终端用户向，配截图）

```
今晚吃什么？打开这个网站问一句就行 🍳

709 道家常菜，手贱党福音：
✅ 开冰箱模式：勾选你有的食材，告诉你可以做什么菜
✅ 做菜模式：计时器、打印模式（贴冰箱上照着做）
✅ 手机能装成 App（PWA），做饭时不弹广告

搜索：MyCook 老乡鸡菜谱
```

## MCP 相关社区版（MCP 官方 Discussions / Reddit r/mcp 等）

```
I built an MCP server that gives AI agents a Chinese home-cooking knowledge
base: 709 recipes searchable by keyword, full Markdown bodies, fridge
matching ("what can I make with eggs and tomatoes"), and kitchen tips.

Remote: https://cook-mcp.alexander.xin/mcp (Bearer)
Local: git clone + npm run mcp (stdio, no auth)

It's the backend of MyCook, an open-source recipe site that merges HowToCook
(100k+ stars) and CookLikeHOC. Try asking Cursor "what should I eat today".
```

## 提交到聚合目录时的一句话

```
MyCook — kitchen toolbox for AI agents: 709 Chinese home recipes with search,
full Markdown bodies, and fridge matching.
```
