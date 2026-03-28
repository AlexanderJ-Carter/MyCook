<script setup>
import { ref } from 'vue'

const printing = ref(false)

const printRecipe = () => {
  printing.value = true
  setTimeout(() => {
    window.print()
    setTimeout(() => {
      printing.value = false
    }, 100)
  }, 100)
}
</script>

<template>
  <button
    class="print-button"
    @click="printRecipe"
    :disabled="printing"
    title="打印菜谱"
    aria-label="打印菜谱"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
    <span class="print-text">打印</span>
  </button>
</template>

<style scoped>
.print-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.print-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.print-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.print-button svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .print-text {
    display: none;
  }
}

/* 打印时隐藏按钮 */
@media print {
  .print-button {
    display: none !important;
  }
}
</style>
