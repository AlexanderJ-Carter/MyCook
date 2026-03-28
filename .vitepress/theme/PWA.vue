<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope)
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
      })
  }
})
</script>

<template>
  <div></div>
</template>
