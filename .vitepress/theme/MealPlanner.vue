<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";
import { useI18n } from "./composables/useI18n";

const STORAGE_KEY = "mycook-meal-plan";
const { loadRecipesIndex } = useSiteData();
const { t } = useI18n();

const DAYS = computed(() => t("home.mealPlan.days"));
const plan = ref({});
const recipes = ref([]);
const pickerDay = ref(null);
const query = ref("");

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return recipes.value.slice(0, 12);
  return recipes.value.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 12);
});

const filledCount = computed(
  () => DAYS.value.filter((d) => plan.value[d.id]?.title).length,
);

const pickerDayLabel = computed(() => {
  if (!pickerDay.value) return "";
  return DAYS.value.find((d) => d.id === pickerDay.value)?.label ?? "";
});

const todayId = computed(() => {
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[new Date().getDay()];
});

function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) plan.value = JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    plan.value = {};
  }
}

function savePlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan.value));
}

function openPicker(dayId) {
  pickerDay.value = dayId;
  query.value = "";
}

function pickRecipe(item) {
  if (!pickerDay.value) return;
  plan.value = {
    ...plan.value,
    [pickerDay.value]: { title: item.title, link: item.link },
  };
  savePlan();
  pickerDay.value = null;
}

function clearDay(dayId) {
  const next = { ...plan.value };
  delete next[dayId];
  plan.value = next;
  savePlan();
}

function clearWeek() {
  plan.value = {};
  savePlan();
}

function autoFill() {
  if (!recipes.value.length) return;
  const next = { ...plan.value };
  for (const day of DAYS.value) {
    if (next[day.id]?.title) continue;
    const item = recipes.value[Math.floor(Math.random() * recipes.value.length)];
    next[day.id] = { title: item.title, link: item.link };
  }
  plan.value = next;
  savePlan();
}

function href(link) {
  return withBase(link);
}

function closePicker() {
  pickerDay.value = null;
}

function onKeydown(e) {
  if (e.key === "Escape" && pickerDay.value) {
    e.preventDefault();
    closePicker();
  }
}

onMounted(async () => {
  loadPlan();
  document.addEventListener("keydown", onKeydown);
  const data = await loadRecipesIndex();
  recipes.value = data?.items || [];
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <section id="meal-planner" class="meal-planner" :aria-label="t('home.mealPlan.aria')">
    <div class="meal-planner-head">
      <p class="meal-planner-kicker">{{ t('home.mealPlan.kicker') }}</p>
      <h2>{{ t('home.mealPlan.title') }}</h2>
      <p class="meal-planner-lead">
        {{ t('home.mealPlan.lead') }}
        {{ t('home.mealPlan.filled', { n: filledCount }) }}
      </p>
      <div class="meal-planner-actions">
        <button type="button" class="mp-btn" @click="autoFill">{{ t('home.mealPlan.autoFill') }}</button>
        <button type="button" class="mp-btn ghost" @click="clearWeek">{{ t('home.mealPlan.clearWeek') }}</button>
      </div>
    </div>

    <div class="meal-grid">
      <div
        v-for="day in DAYS"
        :key="day.id"
        class="meal-slot"
        :class="{ 'is-today': day.id === todayId }"
      >
        <div class="meal-slot-top">
          <strong>{{ day.label }}</strong>
          <button
            v-if="plan[day.id]?.title"
            type="button"
            class="mp-link-btn"
            @click="clearDay(day.id)"
          >
            {{ t('home.mealPlan.remove') }}
          </button>
        </div>
        <template v-if="plan[day.id]?.title">
          <a class="meal-recipe" :href="href(plan[day.id].link)">{{
            plan[day.id].title
          }}</a>
          <button type="button" class="mp-link-btn" @click="openPicker(day.id)">
            {{ t('home.mealPlan.change') }}
          </button>
        </template>
        <button v-else type="button" class="meal-add" @click="openPicker(day.id)">
          {{ t('home.mealPlan.add') }}
        </button>
      </div>
    </div>

    <div
      v-if="pickerDay"
      class="meal-picker"
      role="dialog"
      :aria-label="t('home.mealPlan.pickerClose')"
      @click.self="closePicker"
    >
      <div class="meal-picker-inner">
        <div class="meal-picker-head">
          <strong>{{ t('home.mealPlan.pickerFor', { day: pickerDayLabel }) }}</strong>
          <button type="button" class="mp-link-btn" @click="closePicker">{{ t('home.mealPlan.pickerClose') }}</button>
        </div>
        <input
          v-model="query"
          type="search"
          class="meal-search"
          :placeholder="t('home.mealPlan.pickerSearch')"
          autofocus
        />
        <ul class="meal-picker-list">
          <li v-for="item in filtered" :key="item.link">
            <button type="button" @click="pickRecipe(item)">{{ item.title }}</button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.meal-planner {
  max-width: 920px;
  margin: 0 auto 2.5rem;
  padding: 1.5rem 1.35rem;
  border-radius: calc(var(--mycook-radius, 14px) + 4px);
  border: 1px solid rgba(184, 58, 40, 0.16);
  background:
    linear-gradient(135deg, rgba(184, 58, 40, 0.05), transparent 45%),
    var(--mycook-paper, #faf8f4);
  box-shadow: var(--shadow-md);
}
.meal-planner-kicker {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.meal-planner-head h2 {
  margin: 0.25rem 0 0.4rem;
  font-family: var(--mycook-display, serif);
  font-size: 1.35rem;
}
.meal-planner-lead {
  margin: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}
.meal-planner-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}
.mp-btn {
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}
.mp-btn.ghost {
  background: transparent;
  border: 1px solid var(--mycook-line);
  color: var(--vp-c-text-2);
}
.meal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1.1rem;
}
@media (min-width: 720px) {
  .meal-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 960px) {
  .meal-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}
.meal-slot {
  padding: 0.65rem 0.7rem;
  border-radius: 10px;
  border: 1px dashed var(--mycook-line);
  background: var(--vp-c-bg-soft);
  min-height: 5.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.meal-slot.is-today {
  border-style: solid;
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, transparent);
  background: var(--vp-c-brand-soft);
}
.meal-slot.is-today .meal-slot-top strong {
  color: var(--vp-c-brand-1);
}
.meal-slot-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
.meal-recipe {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  line-height: 1.35;
}
.meal-add {
  margin-top: auto;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
}
.mp-link-btn {
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
}
.meal-picker {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.meal-picker-inner {
  width: min(420px, 100%);
  max-height: 70vh;
  overflow: auto;
  background: var(--vp-c-bg);
  border-radius: 14px;
  padding: 1rem;
  box-shadow: var(--shadow-lg);
}
.meal-picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.meal-search {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--mycook-line);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.meal-picker-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
}
.meal-picker-list button {
  width: 100%;
  text-align: left;
  padding: 0.45rem 0.65rem;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 0.88rem;
}
.meal-picker-list button:hover {
  background: rgba(184, 58, 40, 0.1);
  color: var(--vp-c-brand-1);
}
</style>
