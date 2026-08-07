# 可选集成（Integrations）

MyCook 的核心仍是 **CookLikeHOC + HowToCook** 双源 Markdown。其它项目以「小型上游数据 + 前端组件」方式接入，**不嵌入完整 SPA**，避免臃肿。

## 设计原则

| 原则 | 做法 |
|------|------|
| 数据最小化 | 只拉 CSV/JSON，不 clone 整站 |
| 构建可选 | `SKIP_INTEGRATIONS=1` 跳过 |
| 按需加载 | `KitchenPlay` 异步 chunk |
| 清单可查 | `scripts/integrations.mjs` 单一配置 |

## 当前集成

### Cook · 食用手册（YunYouJun/cook）

- **仓库**：https://github.com/YunYouJun/cook
- **数据**：`recipe.csv`（GitHub Raw，~600 条）
- **产出**：`public/pantry.json`（约 90KB，599 条）
- **UI**：首页「开冰箱 · 转一转」
- **许可**：MIT

构建时 `generate-all` 会自动运行 `sync-integrations.js`。

### 站内生成（无上游）

| 产出 | 说明 |
|------|------|
| `tips-index.json` | HowToCook 技巧索引（~18 篇） |
| `MealPlanner` | 一周菜单，纯前端 localStorage |

UI：首页「一周吃什么」「厨房技巧速查」。

## 添加新集成

1. 在 `scripts/integrations.mjs` 增加条目
2. 在 `sync-integrations.js` 实现解析（或扩展通用逻辑）
3. 新建小型 Vue 组件，用 `defineAsyncComponent` 懒加载
4. 在致谢区注明来源

## 跳过集成

```bash
SKIP_INTEGRATIONS=1 npm run generate
```

离线开发时若无网络，会写入空的 `pantry.json`，「开冰箱」Tab 会提示数据未就绪，「转一转」仍可用。
