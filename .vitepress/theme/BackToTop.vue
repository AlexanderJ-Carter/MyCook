<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)
const scrollProgress = ref(0)

const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
  showButton.value = scrollTop > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="fade">
    <button
      v-show="showButton"
      class="back-to-top"
      @click="scrollToTop"
      :title="'返回顶部'"
      aria-label="返回顶部"
    >
      <svg class="progress-ring" viewBox="0 0 36 36">
        <circle
          class="progress-ring-bg"
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke-width="2"
        />
        <circle
          class="progress-ring-progress"
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke-width="2"
          :stroke-dasharray="100"
          :stroke-dashoffset="100 - scrollProgress"
        />
      </svg>
      <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.progress-ring {
  position: absolute;
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: var(--vp-c-divider);
}

.progress-ring-progress {
  stroke: var(--vp-c-brand-1);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.1s;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: var(--vp-c-text-1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 42px;
    height: 42px;
  }
}

/* 深色模式 */
.dark .back-to-top {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
</style>
