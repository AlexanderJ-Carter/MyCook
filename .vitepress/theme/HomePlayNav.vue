<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "./composables/useI18n";

const { t } = useI18n();

const links = computed(() => [
  { id: "kitchen-play", label: t("home.playNav.pantry") },
  { id: "meal-planner", label: t("home.playNav.mealPlan") },
  { id: "kitchen-tips", label: t("home.playNav.tips") },
  { id: "stats", label: t("home.playNav.stats") },
]);

const active = ref("");

function updateActive() {
  const offset = 120;
  let current = links.value[0]?.id ?? "";
  for (const link of links.value) {
    const el = document.getElementById(link.id);
    if (el && el.getBoundingClientRect().top <= offset) current = link.id;
  }
  active.value = current;
}

onMounted(() => {
  updateActive();
  window.addEventListener("scroll", updateActive, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateActive);
});
</script>

<template>
  <nav class="home-play-nav" :aria-label="t('home.playNav.aria')">
    <a
      v-for="link in links"
      :key="link.id"
      :href="`#${link.id}`"
      class="home-play-nav-link"
      :class="{ active: active === link.id }"
    >
      {{ link.label }}
    </a>
  </nav>
</template>
