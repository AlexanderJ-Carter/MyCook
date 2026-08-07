<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

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
    <div v-if="show" class="install-banner" role="region" aria-label="安装应用">
      <p>把 MyCook 装到主屏幕，做饭时更快打开</p>
      <div class="install-actions">
        <button type="button" class="install-go" @click="install">安装</button>
        <button type="button" class="install-dismiss" @click="dismiss">稍后</button>
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
  padding: 0.85rem 1.1rem;
  border-radius: 14px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--mycook-line);
  box-shadow: var(--shadow-lg);
}

.install-banner p {
  margin: 0;
  flex: 1;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.install-actions {
  display: flex;
  gap: 0.45rem;
}

.install-go,
.install-dismiss {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  cursor: pointer;
}

.install-go {
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
}

.install-dismiss {
  border: 1px solid var(--mycook-line);
  background: transparent;
  color: var(--vp-c-text-2);
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

@media (max-width: 768px) {
  .install-banner {
    bottom: 5.5rem;
  }
}
</style>
