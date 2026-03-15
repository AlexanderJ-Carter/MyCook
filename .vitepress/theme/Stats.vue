<script setup>
import { ref, onMounted } from 'vue';

const stats = ref({
  cooklikehoc: { categories: 0, dishes: 0 },
  howtocook: { categories: 0, dishes: 0 },
  total: 0
});

onMounted(async () => {
  try {
    // 从页面元数据获取统计信息
    const res = await fetch('/stats.json');
    if (res.ok) {
      stats.value = await res.json();
    }
  } catch (_) {
    // 使用默认值
  }
});
</script>

<template>
  <div class="stats-section">
    <h2 class="stats-title">菜谱统计</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">道菜谱</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ stats.cooklikehoc.categories + stats.howtocook.categories }}</span>
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
  </div>
</template>

<style scoped>
.stats-section {
  margin: 2rem auto;
  max-width: 800px;
  padding: 0 1rem;
}
.stats-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--vp-c-text-1);
  text-align: center;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.stat-card {
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}
.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  line-height: 1.2;
}
.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-top: 0.25rem;
}
.stat-card.cooklikehoc .stat-number {
  color: #c17f3a;
}
.stat-card.howtocook .stat-number {
  color: #2d7d5e;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
