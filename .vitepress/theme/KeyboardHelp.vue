<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const visible = ref(false);

const shortcuts = [
    { keys: ['Ctrl', 'K'], mac: ['⌘', 'K'], action: '打开搜索' },
    { keys: ['/'], mac: ['/'], action: '快速搜索（非输入框时）' },
    { keys: ['?'], mac: ['?'], action: '显示/隐藏快捷键' },
    { keys: ['Esc'], mac: ['Esc'], action: '关闭弹层' },
];

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function formatKeys(item) {
    return (isMac ? item.mac : item.keys).join(' + ');
}

function toggle() {
    visible.value = !visible.value;
}

function close() {
    visible.value = false;
}

function onKeyDown(e) {
    if (e.defaultPrevented || e.isComposing) return;
    if (isInputFocused()) return;

    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggle();
    } else if (e.key === 'Escape' && visible.value) {
        e.preventDefault();
        close();
    }
}

function isInputFocused() {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement)) return false;
    return (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.isContentEditable
    );
}

onMounted(() => document.addEventListener('keydown', onKeyDown));
onUnmounted(() => document.removeEventListener('keydown', onKeyDown));
</script>

<template>
  <Teleport to="body">
    <Transition name="kbd-fade">
      <div v-if="visible" class="kbd-overlay" @click.self="close">
        <div class="kbd-panel" role="dialog" aria-label="键盘快捷键">
          <header class="kbd-head">
            <h2>快捷键</h2>
            <button type="button" class="kbd-close" aria-label="关闭" @click="close">×</button>
          </header>
          <ul class="kbd-list">
            <li v-for="item in shortcuts" :key="item.action">
              <span class="kbd-action">{{ item.action }}</span>
              <kbd class="kbd-keys">{{ formatKeys(item) }}</kbd>
            </li>
          </ul>
          <p class="kbd-hint">按 <kbd>?</kbd> 随时打开此面板</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.kbd-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(28, 25, 21, 0.45);
  backdrop-filter: blur(4px);
}

.kbd-panel {
  width: min(420px, 100%);
  padding: 1.25rem 1.35rem 1.1rem;
  border-radius: 16px;
  background: var(--vp-c-bg-elv, #faf8f4);
  border: 1px solid var(--mycook-line, rgba(28, 25, 21, 0.1));
  box-shadow: var(--shadow-lg, 0 24px 56px rgba(28, 25, 21, 0.12));
}

.kbd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.kbd-head h2 {
  margin: 0;
  font-family: var(--mycook-display, serif);
  font-size: 1.15rem;
  font-weight: 700;
}

.kbd-close {
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.kbd-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.kbd-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--mycook-line, rgba(28, 25, 21, 0.08));
  font-size: 0.88rem;
}

.kbd-list li:last-child {
  border-bottom: none;
}

.kbd-action {
  color: var(--vp-c-text-2);
}

.kbd-keys,
.kbd-hint kbd {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--mycook-line, rgba(28, 25, 21, 0.12));
  color: var(--vp-c-text-1);
}

.kbd-hint {
  margin: 0.85rem 0 0;
  text-align: center;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.kbd-fade-enter-active,
.kbd-fade-leave-active {
  transition: opacity 0.2s ease;
}

.kbd-fade-enter-active .kbd-panel,
.kbd-fade-leave-active .kbd-panel {
  transition: transform 0.2s ease;
}

.kbd-fade-enter-from,
.kbd-fade-leave-to {
  opacity: 0;
}

.kbd-fade-enter-from .kbd-panel,
.kbd-fade-leave-to .kbd-panel {
  transform: translateY(12px) scale(0.98);
}
</style>
