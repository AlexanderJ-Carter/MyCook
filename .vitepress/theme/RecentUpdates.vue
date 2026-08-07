<script setup>
import { onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";

const { loadRecent } = useSiteData();
const items = ref([]);

onMounted(async () => {
  const data = await loadRecent();
  items.value = data?.items || [];
});
</script>

<template>
  <section v-if="items.length" class="recent-updates" aria-label="最近更新">
    <div class="recent-updates-head">
      <h2 class="recent-updates-title">最近更新</h2>
      <p class="recent-updates-hint">上游同步后的最新菜谱</p>
    </div>
    <ul class="recent-updates-list">
      <li v-for="(item, i) in items" :key="i" class="recent-item">
        <a :href="withBase(item.link)">
          <span class="recent-title">{{ item.title }}</span>
          <span
            class="recent-source"
            :class="item.source === 'howtocook' ? 'is-jade' : 'is-chili'"
          >
            {{ item.source === "howtocook" ? "食材" : "做法" }}
          </span>
        </a>
      </li>
    </ul>
  </section>
</template>
