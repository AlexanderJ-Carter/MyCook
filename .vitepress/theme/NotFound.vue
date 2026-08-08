<script setup>
import { useData } from 'vitepress';
import { computed } from 'vue';

const { lang } = useData();
const en = computed(() => String(lang.value || '').startsWith('en'));
</script>

<template>
  <div class="not-found">
    <p class="not-found-kicker">MyCook</p>
    <h1 class="not-found-title">
      {{ en ? 'Page not found' : '找不到这个页面' }}
    </h1>
    <p class="not-found-desc">
      {{
        en
          ? 'This link may be wrong, or the recipe is not synced yet. Pick an entry below to continue.'
          : '地址可能写错了，或这道菜还没同步上来。不用慌——从下面挑一个入口继续就好。'
      }}
    </p>
    <div class="not-found-suggestions">
      <a :href="en ? '/en/' : '/'">{{ en ? 'Home' : '首页' }}</a>
      <a href="/cooklikehoc/炒菜/README">{{ en ? 'By method' : '按做法找' }}</a>
      <a href="/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋">{{
        en ? 'Tomato eggs' : '西红柿炒鸡蛋'
      }}</a>
      <a href="https://mycook.alexander.xin/howtocook-images/">{{
        en ? 'Images' : '图片版'
      }}</a>
      <a :href="en ? '/en/mcp-guide' : '/mcp-guide'">MCP</a>
      <a :href="en ? '/en/help' : '/help'">{{ en ? 'Help' : '帮助' }}</a>
    </div>
    <div class="not-found-actions">
      <a class="primary" :href="en ? '/en/' : '/'">{{
        en ? 'Back home' : '回首页'
      }}</a>
      <a :href="en ? '/en/ai-agents' : '/ai-agents'">{{
        en ? 'For AI agents' : '给 AI 用'
      }}</a>
    </div>
  </div>
</template>
