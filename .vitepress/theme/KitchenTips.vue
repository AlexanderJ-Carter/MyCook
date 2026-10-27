<script setup>
import { computed, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";
import { useI18n } from "./composables/useI18n";

const { tipsIndex, loadTipsIndex } = useSiteData();
const { t } = useI18n();
const ready = ref(false);

const tips = computed(() => tipsIndex.value?.items ?? []);

const tipCount = computed(() => {
  const total = tipsIndex.value?.total;
  if (typeof total === "number" && total > 0) return total;
  return tips.value.length;
});

const leadText = computed(() => {
  if (!ready.value) return t("home.tips.leadPending");
  if (!tipCount.value) return t("home.tips.empty");
  return t("home.tips.lead", { n: tipCount.value });
});

const groups = computed(() => {
  const cats = t("home.tips.categories");
  const map = new Map();
  for (const item of tips.value) {
    const key = item.category || "general";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return [...map.entries()].map(([id, items]) => ({
    id,
    label: cats[id] || id,
    items: items.map((item) => ({
      ...item,
      href: withBase(item.link),
    })),
  }));
});

onMounted(async () => {
  await loadTipsIndex();
  ready.value = true;
});
</script>

<template>
  <section id="kitchen-tips" class="kitchen-tips" :aria-label="t('home.tips.aria')">
    <div class="kitchen-tips-head">
      <p class="kitchen-tips-kicker">{{ t('home.tips.kicker') }}</p>
      <h2>{{ t('home.tips.title') }}</h2>
      <p class="kitchen-tips-lead" :aria-busy="!ready ? 'true' : 'false'">
        {{ leadText }}
      </p>
    </div>

    <p v-if="!ready" class="kitchen-tips-status">{{ t('home.tips.loading') }}</p>

    <div v-for="group in groups" :key="group.id" class="tips-group">
      <h3>{{ group.label }}</h3>
      <ul>
        <li v-for="item in group.items" :key="item.link">
          <a :href="item.href">{{ item.title }}</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.kitchen-tips {
  max-width: 920px;
  margin: 0 auto 2.5rem;
  padding: 1.5rem 1.35rem;
  border-radius: calc(var(--mycook-radius, 14px) + 4px);
  border: 1px solid rgba(42, 122, 98, 0.18);
  background:
    linear-gradient(135deg, rgba(42, 122, 98, 0.06), transparent 45%),
    var(--mycook-paper, #faf8f4);
  box-shadow: var(--shadow-md);
}
.kitchen-tips-kicker {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--mycook-jade, #2a7a62);
  font-weight: 600;
}
.kitchen-tips-head h2 {
  margin: 0.25rem 0 0.4rem;
  font-family: var(--mycook-display, serif);
  font-size: 1.35rem;
}
.kitchen-tips-lead {
  margin: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}
.tips-group {
  margin-top: 1.15rem;
}
.tips-group h3 {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--mycook-jade, #2a7a62);
}
.tips-group ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
}
.tips-group a {
  display: block;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 0.88rem;
  transition: background var(--transition-fast);
}
.tips-group a:hover {
  background: rgba(42, 122, 98, 0.1);
  color: var(--mycook-jade, #2a7a62);
}
.kitchen-tips-status {
  margin: 1rem 0 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
}
@media (min-width: 640px) {
  .tips-group ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
