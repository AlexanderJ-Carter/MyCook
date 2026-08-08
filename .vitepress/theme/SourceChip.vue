<script setup>
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";
import { useI18n } from "./composables/useI18n.js";

const route = useRoute();
const { t } = useI18n();

const source = computed(() => {
  const path = route.path;
  if (path.startsWith("/cooklikehoc")) {
    return {
      key: "cooklikehoc",
      ...t("sourceChip.cooklikehoc"),
      href: "/cooklikehoc/炒菜/README",
    };
  }
  if (path.startsWith("/howtocook-images")) {
    return {
      key: "images",
      ...t("sourceChip.images"),
      href: "/howtocook-images/",
    };
  }
  if (path.startsWith("/howtocook")) {
    return {
      key: "howtocook",
      ...t("sourceChip.howtocook"),
      href: "/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋",
    };
  }
  return null;
});
</script>

<template>
  <div v-if="source" class="source-chip" :class="`is-${source.key}`">
    <span>{{ source.label }}</span>
    <a :href="withBase(source.href)">{{ source.name }}</a>
  </div>
</template>

<style scoped>
.source-chip {
  position: sticky;
  top: calc(var(--vp-nav-height, 64px) + 0.5rem);
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 1rem;
  padding: 0.4rem 0.85rem;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 88%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--mycook-line, rgba(28, 25, 21, 0.1));
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 999px;
  box-shadow: var(--shadow-sm, 0 2px 10px rgba(28, 25, 21, 0.05));
}

.source-chip.is-howtocook,
.source-chip.is-images {
  border-left-color: var(--mycook-jade, #2a7a62);
}

.source-chip span {
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.68rem;
}

.source-chip a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-weight: 500;
}

.source-chip a:hover {
  color: var(--vp-c-brand-1);
}

.source-chip.is-howtocook a:hover,
.source-chip.is-images a:hover {
  color: var(--mycook-jade, #2a7a62);
}

@media print {
  .source-chip {
    display: none !important;
  }
}
</style>
