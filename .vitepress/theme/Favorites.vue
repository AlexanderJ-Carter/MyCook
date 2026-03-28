<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const favorites = ref([])
const showFavorites = ref(false)

// 从 localStorage 加载收藏
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem('mycook-favorites')
    if (stored) {
      favorites.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load favorites:', e)
  }
}

// 保存到 localStorage
const saveFavorites = () => {
  try {
    localStorage.setItem('mycook-favorites', JSON.stringify(favorites.value))
  } catch (e) {
    console.error('Failed to save favorites:', e)
  }
}

// 检查当前页面是否已收藏
const isCurrentPageFavorite = computed(() => {
  return favorites.value.some(f => f.path === route.path)
})

// 添加/移除收藏
const toggleFavorite = () => {
  if (isCurrentPageFavorite.value) {
    favorites.value = favorites.value.filter(f => f.path !== route.path)
  } else {
    // 获取页面标题
    const title = document.querySelector('h1')?.textContent || route.path
    favorites.value.push({
      path: route.path,
      title,
      addedAt: new Date().toISOString()
    })
  }
  saveFavorites()
}

// 删除收藏
const removeFavorite = (path) => {
  favorites.value = favorites.value.filter(f => f.path !== path)
  saveFavorites()
}

// 格式化日期
const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  loadFavorites()
})
</script>

<template>
  <div class="favorites-widget">
    <!-- 收藏按钮（在文档页面显示） -->
    <button
      v-if="route.path !== '/'"
      @click="toggleFavorite"
      class="favorite-button"
      :class="{ 'is-favorite': isCurrentPageFavorite }"
      :title="isCurrentPageFavorite ? '取消收藏' : '收藏此菜谱'"
      aria-label="收藏"
    >
      <svg viewBox="0 0 24 24" :fill="isCurrentPageFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span>{{ isCurrentPageFavorite ? '已收藏' : '收藏' }}</span>
    </button>

    <!-- 收藏列表（点击展开） -->
    <div v-if="favorites.length > 0" class="favorites-section">
      <button @click="showFavorites = !showFavorites" class="show-favorites-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>我的收藏 ({{ favorites.length }})</span>
      </button>

      <Transition name="slide">
        <div v-show="showFavorites" class="favorites-list">
          <div v-for="fav in favorites" :key="fav.path" class="favorite-item">
            <a :href="fav.path" class="favorite-link">{{ fav.title }}</a>
            <span class="favorite-date">{{ formatDate(fav.addedAt) }}</span>
            <button @click.prevent="removeFavorite(fav.path)" class="remove-button" title="移除">×</button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.favorites-widget {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  z-index: 98;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.favorite-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-button:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.favorite-button.is-favorite {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.favorite-button svg {
  width: 18px;
  height: 18px;
}

.favorites-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.show-favorites-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.show-favorites-button:hover {
  background: var(--vp-c-bg-soft);
}

.show-favorites-button svg {
  width: 16px;
  height: 16px;
  color: #ff6b6b;
}

.favorites-list {
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  min-width: 280px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.favorite-item:last-child {
  border-bottom: none;
}

.favorite-link {
  flex: 1;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.favorite-link:hover {
  color: var(--vp-c-brand-1);
}

.favorite-date {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.remove-button {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.remove-button:hover {
  color: #ff6b6b;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .favorites-widget {
    bottom: 5rem;
    right: 1rem;
  }

  .favorite-button span {
    display: none;
  }

  .show-favorites-button span {
    font-size: 0.8rem;
  }

  .favorites-list {
    min-width: 250px;
    max-width: calc(100vw - 2rem);
  }
}

/* 打印时隐藏 */
@media print {
  .favorites-widget {
    display: none !important;
  }
}
</style>
