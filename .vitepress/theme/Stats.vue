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

