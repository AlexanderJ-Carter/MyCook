<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from './composables/useI18n';

const { t } = useI18n();
const visible = ref(false);

onMounted(() => {
  visible.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});

function focusMain() {
  const main =
    document.querySelector('#VPContent') ||
    document.querySelector('.VPContent') ||
    document.querySelector('main');
  if (main instanceof HTMLElement) {
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: false });
  }
}
</script>

<template>
  <a v-if="visible" class="skip-link" href="#VPContent" @click.prevent="focusMain">
    {{ t('skipLink') }}
  </a>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1000;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  background: var(--mycook-ink, #1c1915);
  color: var(--mycook-paper, #faf8f4);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transform: translateY(-200%);
  transition: transform 0.2s ease;
}

.skip-link:focus {
  transform: translateY(0);
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
</style>
