<script setup>
import { onMounted } from 'vue';
import { useSiteData } from './composables/useSiteData';

const {
    loadStats,
    loadRecipesIndex,
    loadRecent,
    loadTipsIndex,
    loadSyncInfo,
    loadPantry,
} = useSiteData();

onMounted(() => {
    loadStats();
    loadRecipesIndex();
    loadRecent();
    loadTipsIndex();
    loadSyncInfo();
    loadPantry();
});
</script>

<template><span aria-hidden="true" class="home-bootstrap" /></template>
