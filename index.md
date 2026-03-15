---
layout: home
hero:
  name: MyCook
  text: 在家做饭，一站搞定
  tagline: 老乡鸡风格菜谱 + 程序员做饭指南，合并整理，随用随查
features:
  - title: 📖 双源内容
    details: 整合 CookLikeHOC 与 HowToCook 两大菜谱项目，内容丰富全面
  - title: 🔍 站内搜索
    details: 顶部搜索框可快速查找菜谱与技巧，支持模糊匹配
  - title: 🌙 深色模式
    details: 自动跟随系统设置，也可手动切换，保护眼睛
  - title: 📱 响应式设计
    details: 完美适配桌面与移动设备，随时随地查阅
  - title: ⏰ 每日自动同步
    details: 内容每天从上游仓库自动拉取并发布
  - title: 🐳 Docker 支持
    details: 支持容器化部署，一键启动本地菜谱站
---

<p class="home-tip">点击下方卡片进入对应分类，或使用顶部导航、搜索查找菜谱。</p>

<Stats />

<div class="home-entries">

<a class="home-entry-card" href="/cooklikehoc/炒菜/README">
  <span class="home-entry-label">老乡鸡风格</span>
  <h3>炒菜 · 卤味 · 汤</h3>
  <p>《老乡鸡菜品溯源报告》整理，炒菜、卤味、凉菜、砂锅、主食等，按烹饪方式分类。</p>
</a>

<a class="home-entry-card" href="/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋">
  <span class="home-entry-label">程序员做饭</span>
  <h3>素菜 · 荤菜 · 主食</h3>
  <p>按食材分类浏览，素菜、荤菜、水产、主食、饮料、甜品，每道菜独立成篇。</p>
</a>

</div>

<RecentUpdates />

<section class="home-quick-links">
  <h2>快速入口</h2>
  <div class="quick-links-grid">
    <a href="/cooklikehoc/炒菜/README">🔥 炒菜</a>
    <a href="/cooklikehoc/炖菜/README">🍲 炖菜</a>
    <a href="/cooklikehoc/卤菜/README">🥘 卤菜</a>
    <a href="/cooklikehoc/凉拌/README">🥗 凉拌</a>
    <a href="/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋">🥬 素菜</a>
    <a href="/howtocook/dishes/meat_dish/红烧鸡翅">🍖 荤菜</a>
    <a href="/howtocook/dishes/breakfast/茶叶蛋">🍳 早餐</a>
    <a href="/howtocook/dishes/dessert/烤蛋挞/烤蛋挞">🍰 甜品</a>
  </div>
</section>

<section class="home-credits" id="credits">
  <h2 class="home-credits-title">致谢</h2>
  <p class="home-credits-desc">本站内容来源于以下开源项目，在此向原作者致谢：</p>
  <ul class="home-credits-list">
    <li><a href="https://github.com/Gar-b-age/CookLikeHOC" target="_blank" rel="noopener">CookLikeHOC</a> — 像老乡鸡那样做饭（Gar-b-age）</li>
    <li><a href="https://github.com/Anduin2017/HowToCook" target="_blank" rel="noopener">HowToCook</a> — 程序员在家做饭方法指南（Anduin2017）</li>
  </ul>
  <p class="home-credits-note">本站为合并整理项目，基于本人 fork 同步发布，非上述项目官方站点。本仓库：<a href="https://github.com/AlexanderJ-Carter/MyCook" target="_blank" rel="noopener">AlexanderJ-Carter/MyCook</a></p>
</section>
