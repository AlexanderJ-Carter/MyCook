<script setup>
import { computed, onMounted, ref } from 'vue';
import { SITES } from './sites.js';

const host = ref('');

onMounted(() => {
  host.value = typeof location !== 'undefined' ? location.hostname : '';
});

const edition = computed(() => {
  if (host.value === 'mycook.alexander.xin') return 'full';
  if (host.value === 'cook.alexander.xin') return 'pages';
  return 'dev';
});
</script>

<template>
  <aside v-if="edition !== 'dev'" class="site-edition" :data-edition="edition">
    <template v-if="edition === 'pages'">
      <p>
        <strong>CDN 主站</strong>
        · 轻量访问；带步骤图的完整站在
        <a :href="SITES.full">mycook.alexander.xin</a>
      </p>
    </template>
    <template v-else>
      <p>
        <strong>完整站</strong>
        · 含 HowToCook 图片版；轻量 CDN 主站在
        <a :href="SITES.pages">cook.alexander.xin</a>
      </p>
    </template>
  </aside>
</template>
