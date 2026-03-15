---
layout: home
hero:
  name: MyCook
  text: 在家做饭，一站搞定
  tagline: 老乡鸡风格 + 程序员做饭指南，双源合并，随用随查
features:
  - title: 双源菜谱
    details: CookLikeHOC（按烹饪方式）+ HowToCook（按食材），一站浏览
  - title: 站内搜索
    details: 顶部搜索框支持模糊匹配，快速定位菜谱与技巧
  - title: 深色模式
    details: 跟随系统或手动切换，阅读更舒适
  - title: 响应式
    details: 桌面与移动端均可良好使用
  - title: 自动同步
    details: 每日从 fork 仓库拉取更新并发布
  - title: Docker
    details: 镜像内自动克隆并构建，无需本地预置内容
---

<p class="home-tip">点击下方卡片进入分类，或使用顶部导航、搜索查找菜谱。</p>

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

<a class="home-entry-card" href="https://king-jingxiang.github.io/HowToCook/" target="_blank" rel="noopener">
  <span class="home-entry-label">衍生 · 图片版</span>
  <h3>HowToCook 图片版</h3>
  <p>基于原版 Markdown 生成的 4K 菜谱图，分类浏览、收藏、导出 PDF/长图。由 king-jingxiang 维护，另站打开。</p>
</a>

</div>

<RecentUpdates />

<section class="home-quick-links">
  <h2>快速入口</h2>
  <div class="quick-links-grid">
    <a href="/cooklikehoc/炒菜/README">🔥 炒菜</a>
    <a href="/cooklikehoc/炖菜/README">🍲 炖菜</a>
    <a href="/cooklikehoc/汤/README">🍵 汤</a>
    <a href="/cooklikehoc/卤菜/README">🥘 卤菜</a>
    <a href="/cooklikehoc/凉拌/README">🥗 凉拌</a>
    <a href="/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋">🥬 素菜</a>
    <a href="/howtocook/dishes/meat_dish/红烧鸡翅">🍖 荤菜</a>
    <a href="/howtocook/dishes/soup/西红柿鸡蛋汤/西红柿鸡蛋汤">🥣 汤与粥</a>
    <a href="/howtocook/dishes/breakfast/茶叶蛋">🍳 早餐</a>
    <a href="/howtocook/dishes/drink/柠檬汁/柠檬汁">🍹 饮料</a>
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
  <p class="home-credits-desc">衍生推荐（同源不同形态，另站访问）：</p>
  <ul class="home-credits-list">
    <li><a href="https://king-jingxiang.github.io/HowToCook/" target="_blank" rel="noopener">HowToCook 图片版</a> — 原版 Markdown 转 4K 菜谱图，分类浏览、收藏、导出 PDF（<a href="https://github.com/king-jingxiang/HowToCook" target="_blank" rel="noopener">king-jingxiang/HowToCook</a>）</li>
  </ul>
  <p class="home-credits-note">本站为合并整理项目，基于本人 fork 同步发布，非上述项目官方站点。本仓库：<a href="https://github.com/AlexanderJ-Carter/MyCook" target="_blank" rel="noopener">AlexanderJ-Carter/MyCook</a></p>
</section>
