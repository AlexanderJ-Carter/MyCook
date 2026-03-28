<script setup>
import { ref, onUnmounted } from 'vue'

const timers = ref([])
const newTimerName = ref('')
const newTimerMinutes = ref(5)
let intervalId = null

const addTimer = () => {
  if (!newTimerName.value.trim()) {
    alert('请输入计时器名称')
    return
  }

  const totalSeconds = newTimerMinutes.value * 60
  timers.value.push({
    id: Date.now(),
    name: newTimerName.value,
    totalSeconds,
    remainingSeconds: totalSeconds,
    isRunning: false,
    isPaused: false
  })

  newTimerName.value = ''
  newTimerMinutes.value = 5
}

const startTimer = (timer) => {
  timer.isRunning = true
  timer.isPaused = false
}

const pauseTimer = (timer) => {
  timer.isPaused = true
}

const resumeTimer = (timer) => {
  timer.isPaused = false
}

const resetTimer = (timer) => {
  timer.remainingSeconds = timer.totalSeconds
  timer.isRunning = false
  timer.isPaused = false
}

const deleteTimer = (id) => {
  timers.value = timers.value.filter(t => t.id !== id)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const updateTimers = () => {
  timers.value.forEach(timer => {
    if (timer.isRunning && !timer.isPaused && timer.remainingSeconds > 0) {
      timer.remainingSeconds--
      if (timer.remainingSeconds === 0) {
        timer.isRunning = false
        // 播放提示音（如果浏览器支持）
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('计时结束', { body: timer.name })
        }
        // 尝试播放系统提示音
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQoA')
          audio.play()
        } catch (e) {
          console.log('Audio play failed:', e)
        }
      }
    }
  })
}

// 每秒更新计时器
intervalId = setInterval(updateTimers, 1000)

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="cooking-timer">
    <h3>烹饪计时器</h3>

    <!-- 添加新计时器 -->
    <div class="add-timer">
      <input
        v-model="newTimerName"
        type="text"
        placeholder="计时器名称（如：煮面条）"
        class="timer-input"
      />
      <input
        v-model.number="newTimerMinutes"
        type="number"
        min="1"
        max="999"
        class="timer-minutes"
      />
      <span class="timer-unit">分钟</span>
      <button @click="addTimer" class="add-button">添加</button>
    </div>

    <!-- 计时器列表 -->
    <div class="timers-list">
      <div
        v-for="timer in timers"
        :key="timer.id"
        class="timer-item"
        :class="{ 'timer-finished': timer.remainingSeconds === 0 }"
      >
        <div class="timer-header">
          <span class="timer-name">{{ timer.name }}</span>
          <button @click="deleteTimer(timer.id)" class="delete-button" title="删除">×</button>
        </div>
        <div class="timer-display">{{ formatTime(timer.remainingSeconds) }}</div>
        <div class="timer-controls">
          <button
            v-if="!timer.isRunning || timer.isPaused"
            @click="timer.isPaused ? resumeTimer(timer) : startTimer(timer)"
            class="control-button start"
          >
            {{ timer.isPaused ? '继续' : '开始' }}
          </button>
          <button
            v-if="timer.isRunning && !timer.isPaused"
            @click="pauseTimer(timer)"
            class="control-button pause"
          >
            暂停
          </button>
          <button @click="resetTimer(timer)" class="control-button reset">重置</button>
        </div>
      </div>
    </div>

    <p v-if="timers.length === 0" class="no-timers">还没有计时器，添加一个吧！</p>
  </div>
</template>

<style scoped>
.cooking-timer {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  margin: 1rem 0;
}

h3 {
  margin: 0 0 1rem;
  font-family: 'Noto Serif SC', serif;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.add-timer {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.timer-input {
  flex: 1;
  min-width: 150px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.timer-minutes {
  width: 70px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.timer-unit {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.add-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover {
  background: var(--vp-c-brand-2);
}

.timers-list {
  display: grid;
  gap: 1rem;
}

.timer-item {
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.timer-item.timer-finished {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timer-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.delete-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.delete-button:hover {
  color: var(--vp-c-text-1);
}

.timer-display {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-align: center;
  margin: 0.75rem 0;
  font-family: 'Courier New', monospace;
}

.timer-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.control-button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.control-button.start {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.control-button.start:hover {
  background: var(--vp-c-brand-2);
}

.no-timers {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 640px) {
  .add-timer {
    flex-direction: column;
  }

  .timer-input {
    width: 100%;
  }

  .timer-minutes {
    width: 100%;
  }
}

/* 打印时隐藏 */
@media print {
  .cooking-timer {
    display: none !important;
  }
}
</style>
