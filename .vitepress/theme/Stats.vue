<script setup>
import { computed, onMounted } from "vue";
import { useSiteData } from "./composables/useSiteData";

const { stats, syncInfo, loadStats, loadSyncInfo } = useSiteData();

const syncLabel = computed(() => {
  const raw = syncInfo.value?.lastSync;
  if (!raw) return null;
  const d = new Date(raw);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

onMounted(async () => {
  await Promise.all([loadStats(), loadSyncInfo()]);
});
</script>

<template>
  <section class="stats-section" aria-label="菜谱统计">
    <div class="stats-head">
      <h2 class="stats-title">此刻可查</h2>
      <p v-if="syncLabel" class="stats-sync">内容同步于 {{ syncLabel }}</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-number">{{ stats?.total ?? "—" }}</span>
        <span class="stat-label">道菜谱</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{
          stats?.totalCategories ||
          (stats?.cooklikehoc?.categories ?? 0) + (stats?.howtocook?.categories ?? 0) ||
          "—"
        }}</span>
        <span class="stat-label">个分类</span>
      </div>
      <div class="stat-card cooklikehoc">
        <span class="stat-number">{{ stats?.cooklikehoc?.dishes ?? "—" }}</span>
        <span class="stat-label">老乡鸡风格</span>
      </div>
      <div class="stat-card howtocook">
        <span class="stat-number">{{ stats?.howtocook?.dishes ?? "—" }}</span>
        <span class="stat-label">程序员做饭</span>
      </div>
    </div>
  </section>
</template>
