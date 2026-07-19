<script setup>
import { onMounted, ref } from "vue";
import { withBase } from "vitepress";

const stats = ref({
  cooklikehoc: { categories: 0, dishes: 0 },
  howtocook: { categories: 0, dishes: 0 },
  total: 0,
  totalCategories: 0,
});

onMounted(async () => {
  const res = await fetch(withBase("/stats.json"));
  if (!res.ok) return;
  stats.value = await res.json();
});
</script>

<template>
  <section class="stats-section" aria-label="菜谱统计">
    <h2 class="stats-title">此刻可查</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">道菜谱</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{
          stats.totalCategories ||
          stats.cooklikehoc.categories + stats.howtocook.categories
        }}</span>
        <span class="stat-label">个分类</span>
      </div>
      <div class="stat-card cooklikehoc">
        <span class="stat-number">{{ stats.cooklikehoc.dishes }}</span>
        <span class="stat-label">老乡鸡风格</span>
      </div>
      <div class="stat-card howtocook">
        <span class="stat-number">{{ stats.howtocook.dishes }}</span>
        <span class="stat-label">程序员做饭</span>
      </div>
    </div>
  </section>
</template>
