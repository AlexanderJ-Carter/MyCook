<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";
import { useI18n } from "./composables/useI18n";

const { loadRecipesIndex } = useSiteData();
const { t, dateLocale } = useI18n();
const picked = ref(null);
const recipes = ref([]);

const todayLabel = computed(() => {
  const now = new Date();
  return now.toLocaleDateString(dateLocale(), {
    month: "short",
    day: "numeric",
  });
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

onMounted(async () => {
  const data = await loadRecipesIndex();
  recipes.value = data?.items || [];
  picked.value = pickBySeed(recipes.value, daySeed());
});
</script>

<template>
  <section v-if="picked" class="daily-pick" :aria-label="t('home.dailyPick.aria')">
    <div class="daily-pick-seal" aria-hidden="true">{{ t('home.dailyPick.seal') }}</div>
    <div class="daily-pick-body">
      <p class="daily-pick-kicker">{{ t('home.dailyPick.kicker') }} · {{ todayLabel }}</p>
      <h2>{{ picked.title }}</h2>
      <p class="daily-pick-desc">
        {{
          picked.source === "cooklikehoc"
            ? t('home.dailyPick.descCooklikehoc')
            : t('home.dailyPick.descHowtocook')
        }}
      </p>
      <div class="daily-pick-actions">
        <a class="daily-pick-go" :href="withBase(picked.link)">{{ t('home.dailyPick.go') }}</a>
        <button type="button" class="daily-pick-shuffle" @click="reshuffle">
          {{ t('home.dailyPick.shuffle') }}
        </button>
      </div>
    </div>
  </section>
</template>
