<script setup>
import { onMounted } from 'vue';
import { useSiteData } from './composables/useSiteData';

const { loadStats, loadRecipesIndex, loadRecent } = useSiteData();

onMounted(() => {
  loadStats();
  loadRecipesIndex();
  loadRecent();
});
</script>

<template><span aria-hidden="true" class="home-bootstrap" /></template>
