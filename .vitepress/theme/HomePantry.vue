<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";

const paths = [
  {
    eyebrow: "01 · 做法库",
    title: "按做法找菜",
    description:
      "炒、炖、卤、凉拌、砂锅、主食。先决定今天想怎么做，再挑具体菜。",
    accent: "chili",
    href: "/cooklikehoc/炒菜/README",
    cta: "进入做法库",
  },
  {
    eyebrow: "02 · 食材指南",
    title: "按食材找菜",
    description: "素菜、荤菜、水产、早餐、甜品。手头有什么，就从食材索引进去。",
    accent: "jade",
    href: "/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋",
    cta: "进入食材指南",
  },
  {
    eyebrow: "03 · 图片版",
    title: "按图索菜",
    description: "更偏图文浏览的 HowToCook 图片版，适合随手翻、看着图找灵感。",
    accent: "ink",
    href: "/howtocook-images/",
    cta: "打开图片版",
  },
];

const shelf = [
  { label: "炒菜", note: "快手热菜", href: "/cooklikehoc/炒菜/README" },
  { label: "炖菜", note: "慢炖主菜", href: "/cooklikehoc/炖菜/README" },
  { label: "汤", note: "暖胃清汤", href: "/cooklikehoc/汤/README" },
  { label: "卤菜", note: "下饭浓味", href: "/cooklikehoc/卤菜/README" },
  {
    label: "素菜",
    note: "轻负担",
    href: "/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋",
  },
  {
    label: "荤菜",
    note: "大菜硬菜",
    href: "/howtocook/dishes/meat_dish/红烧鸡翅",
  },
  {
    label: "汤粥",
    note: "基础友好",
    href: "/howtocook/dishes/soup/西红柿鸡蛋汤/西红柿鸡蛋汤",
  },
  {
    label: "早餐",
    note: "上手最快",
    href: "/howtocook/dishes/breakfast/茶叶蛋",
  },
  {
    label: "饮料",
    note: "冷暖皆可",
    href: "/howtocook/dishes/drink/柠檬汁/柠檬汁",
  },
  {
    label: "甜品",
    note: "收尾专区",
    href: "/howtocook/dishes/dessert/烤蛋挞/烤蛋挞",
  },
];

const workflow = [
  { title: "选入口", text: "按做法，还是按食材？先定找法。" },
  { title: "缩小范围", text: "搜索菜名，或点下面货架快捷入口。" },
  { title: "直接开做", text: "落到单篇菜谱，不用管仓库结构。" },
];

const stats = ref({
  total: 569,
  cooklikehoc: { dishes: 198 },
  howtocook: { dishes: 371 },
});

const pathItems = computed(() =>
  paths.map((item) => ({
    ...item,
    href: withBase(item.href),
    meta:
      item.accent === "chili"
        ? `${stats.value.cooklikehoc.dishes} 道菜`
        : item.accent === "jade"
          ? `${stats.value.howtocook.dishes} 道菜`
          : "站内浏览",
  })),
);

const shelfItems = computed(() =>
  shelf.map((item) => ({
    ...item,
    href: withBase(item.href),
  })),
);

onMounted(async () => {
  const response = await fetch(withBase("/stats.json"));
  if (!response.ok) return;
  stats.value = await response.json();
});
</script>

<template>
  <section class="home-explore" aria-label="厨房入口">
    <div class="home-explore-intro">
      <p class="home-explore-kicker">Kitchen Map</p>
      <h2>两套菜谱，一张桌面</h2>
      <p>把「像菜单」和「像索引」放在一起，找菜比做菜更省脑子。</p>
    </div>

    <div class="home-paths">
      <a
        v-for="item in pathItems"
        :key="item.title"
        class="home-path"
        :class="`is-${item.accent}`"
        :href="item.href"
      >
        <div class="home-path-top">
          <p class="home-path-eyebrow">{{ item.eyebrow }}</p>
          <span class="home-path-meta">{{ item.meta }}</span>
        </div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <span class="home-path-go">{{ item.cta }} →</span>
      </a>
    </div>

    <div class="home-shelf">
      <div class="home-shelf-head">
        <h3>快捷货架</h3>
        <span>十个最快入口</span>
      </div>
      <div class="home-shelf-grid">
        <a
          v-for="item in shelfItems"
          :key="item.label"
          class="home-shelf-link"
          :href="item.href"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.note }}</span>
        </a>
      </div>
    </div>

    <div class="home-flow">
      <h3>第一次来</h3>
      <ol>
        <li v-for="(step, i) in workflow" :key="step.title">
          <strong>{{ step.title }}</strong>
          <span>{{ step.text }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>
