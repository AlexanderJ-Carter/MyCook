<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";

const { loadRecipesIndex } = useSiteData();
const picked = ref(null);

const todayLabel = computed(() => {
  const now = new Date();
  return `${now.getMonth() + 1}月${now.getDate()}日`;
});

function daySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function pickBySeed(items, seed) {
  if (!items.length) return null;
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  x = (x * 48271) % 2147483647;
  return items[x % items.length];
}

function reshuffle() {
  if (!recipes.value.length) return;
  picked.value = pickBySeed(
    recipes.value,
    daySeed() + Math.floor(Math.random() * 100000),
  );
}

const recipes = ref([]);

onMounted(async () => {
  const data = await loadRecipesIndex();
  recipes.value = data?.items || [];
  picked.value = pickBySeed(recipes.value, daySeed());
});
</script>

<template>
  <section v-if="picked" class="daily-pick" aria-label="今日推荐">
    <div class="daily-pick-seal" aria-hidden="true">荐</div>
    <div class="daily-pick-body">
      <p class="daily-pick-kicker">今日开灶 · {{ todayLabel }}</p>
      <h2>{{ picked.title }}</h2>
      <p class="daily-pick-desc">
        {{
          picked.source === "cooklikehoc"
            ? "从做法库抽到的一道菜，今天就按这个做。"
            : "从食材指南抽到的一道菜，今天就按这个做。"
        }}
      </p>
      <div class="daily-pick-actions">
        <a class="daily-pick-go" :href="withBase(picked.link)">去做这道</a>
        <button type="button" class="daily-pick-shuffle" @click="reshuffle">
          换一道
        </button>
      </div>
    </div>
  </section>
</template>
