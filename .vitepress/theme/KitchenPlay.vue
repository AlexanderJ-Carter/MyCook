<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";

const tab = ref("pantry");
const selected = ref([]);
const spinning = ref(false);
const spinResult = ref(null);
const pantry = ref(null);
const siteRecipes = ref([]);

const { loadPantry, loadRecipesIndex } = useSiteData();

const hasPantry = computed(
  () => pantry.value?.enabled && pantry.value.recipes?.length,
);

const pantryMatches = computed(() => {
  if (!hasPantry.value || !selected.value.length) return [];
  const need = new Set(selected.value);
  return pantry.value.recipes
    .filter((r) => [...need].every((s) => r.stuff.includes(s)))
    .slice(0, 12);
});

const siteMatches = computed(() => {
  if (!selected.value.length || !siteRecipes.value.length) return [];
  const keys = selected.value.map((s) => s.toLowerCase());
  return siteRecipes.value
    .filter((r) => keys.some((k) => r.title.toLowerCase().includes(k)))
    .slice(0, 8);
});

const cookExternalUrl = computed(() => {
  if (!selected.value.length) return "";
  return `https://cook.yunyoujun.cn/?stuff=${encodeURIComponent(selected.value.join(","))}`;
});

const spinCategories = [
  { id: "all", label: "随便" },
  { id: "cooklikehoc", label: "做法库" },
  { id: "howtocook", label: "食材指南" },
];

const spinCategory = ref("all");

function toggleIngredient(name) {
  selected.value = selected.value.includes(name)
    ? selected.value.filter((n) => n !== name)
    : [...selected.value, name];
}

function clearSelected() {
  selected.value = [];
}

function bvUrl(bv) {
  if (!bv) return "";
  const id = bv.startsWith("BV") ? bv : `BV${bv}`;
  return `https://www.bilibili.com/video/${id}`;
}

function spin() {
  let pool = siteRecipes.value;
  if (spinCategory.value !== "all") {
    pool = pool.filter((r) => r.source === spinCategory.value);
  }
  if (!pool.length) return;
  spinning.value = true;
  spinResult.value = null;
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 900;
  setTimeout(() => {
    spinResult.value = pool[Math.floor(Math.random() * pool.length)];
    spinning.value = false;
  }, delay);
}

onMounted(async () => {
  pantry.value = await loadPantry();
  const data = await loadRecipesIndex();
  siteRecipes.value = data?.items || [];
});
</script>

<template>
  <section id="kitchen-play" class="kitchen-play" aria-label="厨房玩法">
    <div class="kitchen-play-head">
      <p class="kitchen-play-kicker">Play Kitchen</p>
      <h2>开冰箱 · 转一转</h2>
      <p class="kitchen-play-lead">
        轻量集成
        <a href="https://github.com/YunYouJun/cook" target="_blank" rel="noopener"
          >食用手册</a
        >
        食材数据 + 站内菜谱，不嵌入第二个应用。
      </p>
      <div class="kitchen-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'pantry'"
          :class="{ active: tab === 'pantry' }"
          @click="tab = 'pantry'"
        >
          开冰箱
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="tab === 'spin'"
          :class="{ active: tab === 'spin' }"
          @click="tab = 'spin'"
        >
          转一转
        </button>
      </div>
    </div>

    <div v-show="tab === 'pantry'" role="tabpanel" class="kitchen-panel">
      <p v-if="!hasPantry" class="kitchen-empty">食用手册数据未就绪。</p>
      <template v-else>
        <div class="chip-bar">
          <button
            v-for="item in pantry.ingredients"
            :key="item.name"
            type="button"
            class="chip"
            :class="{ on: selected.includes(item.name) }"
            :aria-pressed="selected.includes(item.name)"
            @click="toggleIngredient(item.name)"
          >
            <span aria-hidden="true">{{ item.emoji }}</span>
            {{ item.name }}
          </button>
          <button
            v-if="selected.length"
            type="button"
            class="chip clear"
            @click="clearSelected"
          >
            清空
          </button>
        </div>
        <p v-if="!selected.length" class="kitchen-hint">先选手头有的食材</p>
        <p v-else-if="cookExternalUrl" class="kitchen-hint">
          也可在
          <a :href="cookExternalUrl" target="_blank" rel="noopener">Cook 食用手册</a>
          继续探索
        </p>
        <div v-if="pantryMatches.length" class="match-block">
          <h3>食用手册 · 全匹配</h3>
          <ul>
            <li v-for="r in pantryMatches" :key="r.name">
              <span>{{ r.name }}</span>
              <a
                v-if="r.bv"
                :href="bvUrl(r.bv)"
                target="_blank"
                rel="noopener"
                class="bv-link"
                >视频</a
              >
            </li>
          </ul>
        </div>
        <div v-if="siteMatches.length" class="match-block is-site">
          <h3>MyCook 站内</h3>
          <ul>
            <li v-for="r in siteMatches" :key="r.link">
              <a :href="withBase(r.link)">{{ r.title }}</a>
            </li>
          </ul>
        </div>
      </template>
    </div>

    <div v-show="tab === 'spin'" role="tabpanel" class="kitchen-panel spin-panel">
      <div class="spin-filters">
        <button
          v-for="c in spinCategories"
          :key="c.id"
          type="button"
          class="spin-filter"
          :class="{ active: spinCategory === c.id }"
          @click="spinCategory = c.id"
        >
          {{ c.label }}
        </button>
      </div>
      <div class="spin-wheel" :class="{ spinning }" aria-hidden="true">
        <span>吃</span>
      </div>
      <button type="button" class="spin-go" :disabled="spinning" @click="spin">
        {{ spinning ? "转盘中…" : "转一下" }}
      </button>
      <p v-if="spinResult" class="spin-result">
        就它：<a :href="withBase(spinResult.link)">{{ spinResult.title }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.kitchen-play {
  max-width: 920px;
  margin: 0 auto 2.5rem;
  padding: 1.5rem 1.35rem;
  border-radius: calc(var(--mycook-radius, 14px) + 4px);
  border: 1px solid rgba(196, 134, 10, 0.18);
  background:
    linear-gradient(135deg, rgba(196, 134, 10, 0.07), transparent 45%),
    var(--mycook-paper, #faf8f4);
  box-shadow: var(--shadow-md);
}
.kitchen-play-kicker {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--mycook-pantry, #c4860a);
  font-weight: 600;
}
.kitchen-play-head h2 {
  margin: 0.25rem 0 0.4rem;
  font-family: var(--mycook-display, serif);
  font-size: 1.35rem;
}
.kitchen-play-lead {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}
.kitchen-play-lead a {
  color: var(--mycook-pantry, #c4860a);
}
.kitchen-tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--mycook-line);
}
.kitchen-tabs button {
  border: none;
  background: transparent;
  padding: 0.4rem 0.95rem;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}
.kitchen-tabs button.active {
  background: var(--mycook-pantry, #c4860a);
  color: #fff;
  font-weight: 600;
}
.chip-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--mycook-line);
  background: var(--vp-c-bg-elv);
  font-size: 0.82rem;
  cursor: pointer;
}
.chip.on {
  border-color: var(--mycook-pantry, #c4860a);
  background: rgba(196, 134, 10, 0.12);
}
.match-block {
  margin-top: 1.1rem;
}
.match-block h3 {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
.match-block ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
}
.match-block li {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 0.88rem;
}
.match-block.is-site a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.bv-link {
  color: var(--mycook-pantry, #c4860a);
  text-decoration: none;
  font-size: 0.78rem;
}
.kitchen-hint,
.kitchen-empty {
  margin: 1rem 0 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
}
.spin-panel {
  text-align: center;
}
.spin-filters {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.5rem 0 1rem;
}
.spin-filter {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--mycook-line);
  background: transparent;
  font-size: 0.8rem;
  cursor: pointer;
}
.spin-filter.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.spin-wheel {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--mycook-display, serif);
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  background: radial-gradient(circle at 30% 30%, #e2553d, var(--vp-c-brand-1));
}
.spin-wheel.spinning {
  animation: spin-turn 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes spin-turn {
  to {
    transform: rotate(720deg);
  }
}
.spin-go {
  padding: 0.55rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.spin-result a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
@media (prefers-reduced-motion: reduce) {
  .spin-wheel.spinning {
    animation: none;
  }
}
</style>
