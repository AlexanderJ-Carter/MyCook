<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from './composables/useI18n';

const { t } = useI18n();
const show = ref(false);
let deferredPrompt = null;

function dismiss() {
  show.value = false;
  localStorage.setItem('mycook-install-dismissed', '1');
}

async function install() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  dismiss();
}

function onBeforeInstall(e) {
  e.preventDefault();
  if (localStorage.getItem('mycook-install-dismissed')) return;
  deferredPrompt = e;
  show.value = true;
}

onMounted(() => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('beforeinstallprompt', onBeforeInstall);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstall);
});
</script>

<template>
  <Transition name="install-fade">
    <div v-if="show" class="install-banner" role="region" :aria-label="t('install.aria')">
      <p>{{ t('install.body') }}</p>
      <div class="install-actions">
        <button type="button" class="install-go" @click="install">{{ t('install.install') }}</button>
        <button type="button" class="install-dismiss" @click="dismiss">{{ t('install.later') }}</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.install-banner {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 97;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  max-width: min(420px, calc(100vw - 2rem));
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: var(--mycook-paper);
  border: 1px solid var(--mycook-line);
  box-shadow: var(--shadow-lg);
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.install-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.install-go {
  padding: 0.4rem 0.85rem;
  border: none;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
}

.install-dismiss {
  padding: 0.4rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
  cursor: pointer;
}

.install-fade-enter-active,
.install-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.install-fade-enter-from,
.install-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
