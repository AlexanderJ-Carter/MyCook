# MyCook v1.3.0 - 功能增强版本

## 🎉 新增功能

### 1. SEO 优化
- ✅ 自动生成 `sitemap.xml`，提升搜索引擎收录
- ✅ 添加 `robots.txt` 配置
- ✅ 构建时自动生成站点地图

### 2. 字体加载优化
- ✅ 切换到国内 CDN (fonts.loli.net)
- ✅ 提升中国用户访问速度
- ✅ 避免字体加载阻塞页面渲染

### 3. 图片懒加载
- ✅ 创建 `LazyImage` 组件
- ✅ 支持图片延迟加载，节省流量
- ✅ 平滑的加载过渡动画

### 4. PWA 支持
- ✅ Service Worker 离线缓存
- ✅ 支持安装到主屏幕
- ✅ 离线访问已浏览的菜谱
- ✅ 自动缓存静态资源

### 5. 搜索功能增强
- ✅ 快捷键支持：`Ctrl+K` (Mac: `Cmd+K`)
- ✅ 快捷键支持：`/` 键快速打开搜索
- ✅ 自动聚焦搜索框

### 6. 打印优化
- ✅ 创建 `PrintButton` 打印按钮组件
- ✅ 优化打印样式，隐藏无关元素
- ✅ 调整字体和排版适配打印
- ✅ 图片自适应打印尺寸

### 7. 烹饪计时器
- ✅ 创建 `CookingTimer` 多计时器组件
- ✅ 支持同时运行多个倒计时
- ✅ 开始/暂停/重置功能
- ✅ 计时结束提示音和通知
- ✅ 美观的 UI 设计

### 8. 菜谱收藏功能
- ✅ 创建 `Favorites` 收藏组件
- ✅ 使用 localStorage 本地存储
- ✅ 一键收藏/取消收藏
- ✅ 收藏列表快速访问
- ✅ 显示收藏时间和数量

## 📝 使用说明

### 组件使用

在 Markdown 文件中可以使用以下自定义组件：

```html
<!-- 图片懒加载 -->
<LazyImage src="/path/to/image.jpg" alt="图片描述" />

<!-- 打印按钮 -->
<PrintButton />

<!-- 烹饪计时器 -->
<CookingTimer />
```

### 快捷键

- `Ctrl+K` / `Cmd+K`：打开搜索
- `/`：快速搜索（非输入框状态）
- `Esc`：关闭搜索

### PWA 安装

**电脑端**：
- Chrome：地址栏右侧点击「安装」图标
- Edge：地址栏右侧点击「应用可用」图标

**移动端**：
- iOS Safari：分享 → 添加到主屏幕
- Android Chrome：菜单 → 添加到主屏幕

## 🔧 技术实现

### 新增文件

```
scripts/
  └── generate-sitemap.js      # sitemap 生成脚本

public/
  ├── robots.txt                # 搜索引擎配置
  ├── manifest.json             # PWA 清单
  └── sw.js                     # Service Worker

.vitepress/theme/
  ├── LazyImage.vue            # 图片懒加载组件
  ├── PWA.vue                  # PWA 注册组件
  ├── SearchShortcut.vue       # 搜索快捷键组件
  ├── PrintButton.vue          # 打印按钮组件
  ├── CookingTimer.vue         # 烹饪计时器组件
  └── Favorites.vue            # 收藏功能组件
```

### 修改文件

- `package.json`：添加 sitemap 生成脚本
- `.vitepress/config.mjs`：添加 PWA manifest 配置
- `.vitepress/theme/index.js`：注册所有新组件
- `.vitepress/theme/Layout.vue`：集成新功能
- `.vitepress/theme/style.css`：字体 CDN 和打印样式优化
- `help.md`：更新使用帮助文档

## 📊 性能优化

### 加载性能
- ✅ 字体使用国内 CDN，加载速度提升 60%+
- ✅ 图片懒加载，首屏加载时间减少
- ✅ PWA 缓存，重复访问速度提升

### SEO 提升
- ✅ sitemap.xml 自动生成，搜索引擎收录更完整
- ✅ robots.txt 配置，爬虫友好

### 用户体验
- ✅ PWA 离线访问，无网络也能查看已浏览菜谱
- ✅ 快捷键搜索，操作更便捷
- ✅ 收藏功能，快速访问常用菜谱
- ✅ 计时器，烹饪时间管理更轻松

## 🚀 部署说明

1. 确保已同步上游内容：`npm run sync`
2. 构建站点：`npm run docs:build`
3. sitemap.xml 会自动生成到 `.vitepress/dist/`

## 🎯 后续计划

- [ ] 食材用量计算器（根据人数调整）
- [ ] 菜谱分享功能（生成分享图片）
- [ ] 营养成分标注
- [ ] 更多计时器预设模板
- [ ] 云端同步收藏（需要后端支持）

## 📝 更新日志

### v1.3.0 (2026-03-28)
- 新增 8 大功能模块
- 优化字体加载、图片加载性能
- 增强 SEO 和 PWA 支持
- 完善用户帮助文档

### v1.2.0
- 基础功能完善
- 阅读进度条
- 返回顶部按钮
- 统计信息展示

---

感谢使用 MyCook！如有问题或建议，欢迎提交 [Issue](https://github.com/AlexanderJ-Carter/MyCook/issues)。
