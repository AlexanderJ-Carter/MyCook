<script setup>
import { onMounted, onUnmounted } from 'vue'

const handleKeyDown = (e) => {
  // Ctrl/Cmd + K 或 / 键打开搜索
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  } else if (e.key === '/' && !isInputFocused()) {
    e.preventDefault()
    openSearch()
  }
}

const openSearch = () => {
  // 点击 VitePress 的搜索按钮
  const searchButton = document.querySelector('.VPNavBarSearch button')
  if (searchButton) {
    searchButton.click()
  }
}

const isInputFocused = () => {
  const activeElement = document.activeElement
  return activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.isContentEditable
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div></div>
</template>
