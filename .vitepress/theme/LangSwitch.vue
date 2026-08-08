<script setup>
import { computed } from 'vue';
import { useRoute, useRouter, withBase } from 'vitepress';
import { counterpartPath } from './i18n/messages.js';
import { useI18n } from './composables/useI18n.js';

const route = useRoute();
const router = useRouter();
const { t, isEn } = useI18n();

const label = computed(() => (isEn.value ? t('langSwitch.toZh') : t('langSwitch.toEn')));

function switchLocale() {
  router.go(withBase(counterpartPath(route.path)));
}
</script>

<template>
  <button
    type="button"
    class="lang-switch"
    :aria-label="t('langSwitch.label')"
    :title="t('langSwitch.label')"
    @click="switchLocale"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.lang-switch {
  margin-left: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--mycook-line);
  background: color-mix(in srgb, var(--mycook-paper) 90%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.lang-switch:hover {
  color: var(--vp-c-brand-1);
  border-color: rgba(184, 58, 40, 0.28);
  background: var(--vp-c-brand-soft);
}
</style>
