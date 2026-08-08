<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";
import { useI18n } from "./composables/useI18n";

const route = useRoute();
const { loadRecipesIndex } = useSiteData();
const { t, dateLocale } = useI18n();
const favorites = ref([]);
const panel = ref(null); // 'favorites' | 'timer' | null
const toast = ref("");
const timers = ref([]);
const timerName = ref("");
const timerMinutes = ref(5);
let intervalId = null;

const isDocPage = computed(() => {
  const path = route.path.replace(/\/$/, "") || "/";
  const skip = ["/", "/en", "/help", "/en/help", "/about", "/en/about", "/ai-agents", "/en/ai-agents"];
  return !skip.includes(path);
});

const isFavorite = computed(() =>
  favorites.value.some((f) => f.path === route.path),
);

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem("mycook-favorites");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) favorites.value = parsed;
  } catch {
    localStorage.removeItem("mycook-favorites");
  }
};

const saveFavorites = () => {
  localStorage.setItem("mycook-favorites", JSON.stringify(favorites.value));
};

const toggleFavorite = () => {
  if (isFavorite.value) {
    favorites.value = favorites.value.filter((f) => f.path !== route.path);
  } else {
    const title =
      document.querySelector("h1")?.textContent?.trim() || route.path;
    favorites.value.push({
      path: route.path,
      title,
      addedAt: new Date().toISOString(),
    });
  }
  saveFavorites();
};

const removeFavorite = (path) => {
  favorites.value = favorites.value.filter((f) => f.path !== path);
  saveFavorites();
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(dateLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const printRecipe = () => {
  window.print();
};

const showToast = (msg) => {
  toast.value = msg;
  setTimeout(() => {
    toast.value = "";
  }, 2000);
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast(t("toolbar.copyLinkOk"));
  } catch {
    showToast(t("toolbar.copyFail"));
  }
};

const shareRecipe = async () => {
  const title = document.querySelector("h1")?.textContent?.trim() || "MyCook";
  if (navigator.share) {
    try {
      await navigator.share({ title, url: window.location.href });
      return;
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
  }
  await copyLink();
};

const goRandom = async () => {
  const data = await loadRecipesIndex();
  const items = data?.items || [];
  if (!items.length) return;
  const item = items[Math.floor(Math.random() * items.length)];
  window.location.href = withBase(item.link);
};

const openVideo = () => {
  const title = document.querySelector("h1")?.textContent?.trim() || t("toolbar.defaultTitle");
  const url = `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${title} ${t("toolbar.videoKeyword")}`)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const copyForAi = async () => {
  const title = document.querySelector("h1")?.textContent?.trim() || t("toolbar.defaultTitle");
  const body =
    document.querySelector(".vp-doc")?.innerText?.trim() ||
    document.querySelector(".content-container")?.innerText?.trim() ||
    "";
  const prompt = t("toolbar.aiPrompt", {
    title,
    body,
    url: window.location.href,
  });
  try {
    await navigator.clipboard.writeText(prompt);
    showToast(t("toolbar.copyAiOk"));
  } catch {
    showToast(t("toolbar.copyFail"));
  }
};

const togglePanel = (name) => {
  panel.value = panel.value === name ? null : name;
};

const addTimer = () => {
  const name = timerName.value.trim();
  if (!name) return;
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  const totalSeconds = Math.max(1, Number(timerMinutes.value) || 1) * 60;
  timers.value.push({
    id: Date.now(),
    name,
    totalSeconds,
    remainingSeconds: totalSeconds,
    isRunning: false,
    isPaused: false,
  });
  timerName.value = "";
  timerMinutes.value = 5;
};

const startTimer = (timer) => {
  timer.isRunning = true;
  timer.isPaused = false;
};

const pauseTimer = (timer) => {
  timer.isPaused = true;
};

const resumeTimer = (timer) => {
  timer.isPaused = false;
};

const resetTimer = (timer) => {
  timer.remainingSeconds = timer.totalSeconds;
  timer.isRunning = false;
  timer.isPaused = false;
};

const deleteTimer = (id) => {
  timers.value = timers.value.filter((t) => t.id !== id);
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const tick = () => {
  for (const timer of timers.value) {
    if (!timer.isRunning || timer.isPaused || timer.remainingSeconds <= 0)
      continue;
    timer.remainingSeconds -= 1;
    if (timer.remainingSeconds === 0) {
      timer.isRunning = false;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(t("toolbar.timerDone"), { body: timer.name });
      }
    }
  }
};

const hasActiveTimers = computed(() =>
  timers.value.some(
    (t) => t.isRunning && !t.isPaused && t.remainingSeconds > 0,
  ),
);

watch(hasActiveTimers, (active) => {
  if (active && !intervalId) {
    intervalId = setInterval(tick, 1000);
  } else if (!active && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});

watch(
  () => route.path,
  () => {
    panel.value = null;
  },
);

onMounted(() => {
  loadFavorites();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div v-if="isDocPage" class="recipe-toolbar" :aria-label="t('toolbar.aria')">
    <div class="recipe-toolbar-bar">
      <button
        type="button"
        class="rt-btn"
        :class="{ active: isFavorite }"
        :title="isFavorite ? t('toolbar.unfavorite') : t('toolbar.favorite')"
        :aria-pressed="isFavorite"
        @click="toggleFavorite"
      >
        <svg
          viewBox="0 0 24 24"
          :fill="isFavorite ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <span class="rt-label">{{ isFavorite ? t('toolbar.favorited') : t('toolbar.favorite') }}</span>
      </button>

      <button type="button" class="rt-btn" :title="t('toolbar.link')" @click="copyLink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span class="rt-label">{{ t('toolbar.link') }}</span>
      </button>

      <button type="button" class="rt-btn" :title="t('toolbar.share')" @click="shareRecipe">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
        <span class="rt-label">{{ t('toolbar.share') }}</span>
      </button>

      <button type="button" class="rt-btn" :title="t('toolbar.random')" @click="goRandom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
        <span class="rt-label">{{ t('toolbar.random') }}</span>
      </button>

      <button type="button" class="rt-btn" :title="t('toolbar.video')" @click="openVideo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span class="rt-label">{{ t('toolbar.video') }}</span>
      </button>

      <button type="button" class="rt-btn rt-btn-ai" :title="t('toolbar.ai')" @click="copyForAi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M7 7l-1.5-1.5M18.5 18.5L17 17M7 17l-1.5 1.5M18.5 5.5L17 7" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <span class="rt-label">{{ t('toolbar.ai') }}</span>
      </button>

      <button type="button" class="rt-btn" :title="t('toolbar.print')" @click="printRecipe">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
          />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        <span class="rt-label">{{ t('toolbar.print') }}</span>
      </button>

      <button
        type="button"
        class="rt-btn"
        :class="{ open: panel === 'timer' }"
        :title="t('toolbar.timer')"
        :aria-expanded="panel === 'timer'"
        @click="togglePanel('timer')"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2M9 2h6" />
        </svg>
        <span class="rt-label">{{ t('toolbar.timer') }}</span>
      </button>

      <button
        v-if="favorites.length"
        type="button"
        class="rt-btn"
        :class="{ open: panel === 'favorites' }"
        :title="t('toolbar.favorites')"
        :aria-expanded="panel === 'favorites'"
        @click="togglePanel('favorites')"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <span class="rt-label">{{ favorites.length }}</span>
      </button>
    </div>

    <Transition name="rt-panel">
      <div
        v-if="panel === 'favorites'"
        class="rt-panel"
        role="dialog"
        aria-label="收藏列表"
      >
        <div class="rt-panel-head">
          <strong>我的收藏</strong>
          <button type="button" class="rt-close" @click="panel = null">
            ×
          </button>
        </div>
        <div class="rt-fav-list">
          <div v-for="fav in favorites" :key="fav.path" class="rt-fav-item">
            <a :href="withBase(fav.path)">{{ fav.title }}</a>
            <span>{{ formatDate(fav.addedAt) }}</span>
            <button
              type="button"
              title="移除"
              @click="removeFavorite(fav.path)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="rt-panel">
      <div
        v-if="panel === 'timer'"
        class="rt-panel rt-timer"
        role="dialog"
        aria-label="烹饪计时器"
      >
        <div class="rt-panel-head">
          <strong>烹饪计时</strong>
          <button type="button" class="rt-close" @click="panel = null">
            ×
          </button>
        </div>
        <div class="rt-timer-add">
          <input
            v-model="timerName"
            type="text"
            placeholder="名称，如：煮面"
            @keyup.enter="addTimer"
          />
          <input
            v-model.number="timerMinutes"
            type="number"
            min="1"
            max="999"
          />
          <span>分</span>
          <button type="button" class="rt-add" @click="addTimer">添加</button>
        </div>
        <p v-if="!timers.length" class="rt-empty">还没有计时器</p>
        <div
          v-for="timer in timers"
          :key="timer.id"
          class="rt-timer-item"
          :class="{ done: timer.remainingSeconds === 0 }"
        >
          <div class="rt-timer-top">
            <span>{{ timer.name }}</span>
            <button type="button" @click="deleteTimer(timer.id)">×</button>
          </div>
          <div class="rt-timer-clock">
            {{ formatTime(timer.remainingSeconds) }}
          </div>
          <div class="rt-timer-actions">
            <button
              v-if="!timer.isRunning || timer.isPaused"
              type="button"
              class="primary"
              @click="timer.isPaused ? resumeTimer(timer) : startTimer(timer)"
            >
              {{ timer.isPaused ? "继续" : "开始" }}
            </button>
            <button
              v-if="timer.isRunning && !timer.isPaused"
              type="button"
              @click="pauseTimer(timer)"
            >
              暂停
            </button>
            <button type="button" @click="resetTimer(timer)">重置</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="rt-toast">
      <p v-if="toast" class="rt-toast" role="status">{{ toast }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.recipe-toolbar {
  position: fixed;
  right: 1.5rem;
  bottom: 5.5rem;
  z-index: 98;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
}

.recipe-toolbar-bar {
  display: flex;
  gap: 0.2rem;
  padding: 0.35rem;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--mycook-line);
  border-radius: 999px;
  box-shadow: var(--shadow-md);
}

.rt-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.rt-btn:hover,
.rt-btn.open {
  background: var(--vp-c-bg-soft);
}

.rt-btn.active {
  color: var(--vp-c-brand-1);
}

.rt-btn-ai:hover,
.rt-btn-ai.open {
  color: var(--mycook-jade);
  border-color: color-mix(in srgb, var(--mycook-jade) 35%, transparent);
}

.rt-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.rt-panel {
  width: min(320px, calc(100vw - 2rem));
  max-height: 360px;
  overflow: auto;
  padding: 0.9rem 1rem 1rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--mycook-line);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
}

.rt-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.rt-panel-head strong {
  font-family: var(--mycook-display);
  font-weight: 400;
  font-size: 1.05rem;
}

.rt-close {
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.rt-fav-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--mycook-line);
  font-size: 0.85rem;
}

.rt-fav-item:last-child {
  border-bottom: none;
}

.rt-fav-item a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rt-fav-item a:hover {
  color: var(--vp-c-brand-1);
}

.rt-fav-item span {
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
}

.rt-fav-item button,
.rt-timer-top button {
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}

.rt-timer-add {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rt-timer-add input[type="text"] {
  flex: 1;
  min-width: 110px;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--mycook-line);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
}

.rt-timer-add input[type="number"] {
  width: 56px;
  padding: 0.4rem 0.45rem;
  border: 1px solid var(--mycook-line);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
}

.rt-add {
  padding: 0.4rem 0.7rem;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
}

.rt-empty {
  margin: 0;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

.rt-timer-item {
  padding: 0.75rem 0;
  border-top: 1px solid var(--mycook-line);
}

.rt-timer-item.done {
  background: var(--vp-c-brand-soft);
  margin: 0 -0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.rt-timer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.rt-timer-clock {
  font-family: ui-monospace, monospace;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.04em;
  margin: 0.35rem 0;
}

.rt-timer-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.rt-timer-actions button {
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--mycook-line);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  cursor: pointer;
}

.rt-timer-actions button.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.rt-panel-enter-active,
.rt-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.rt-panel-enter-from,
.rt-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.rt-toast {
  position: fixed;
  bottom: 9rem;
  right: 1.5rem;
  margin: 0;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  background: var(--mycook-ink);
  color: var(--mycook-paper);
  font-size: 0.82rem;
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.rt-toast-enter-active,
.rt-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.rt-toast-enter-from,
.rt-toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 768px) {
  .recipe-toolbar {
    right: 1rem;
    bottom: 4.75rem;
    max-width: calc(100vw - 2rem);
  }

  .recipe-toolbar-bar {
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .recipe-toolbar-bar::-webkit-scrollbar {
    display: none;
  }

  .rt-label {
    display: none;
  }
}

@media print {
  .recipe-toolbar {
    display: none !important;
  }
}
</style>
