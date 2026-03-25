<script setup>
import DefaultTheme from 'vitepress/theme';
import { useRoute } from 'vitepress';
import { computed } from 'vue';
import ReadingProgress from './ReadingProgress.vue';
import BackToTop from './BackToTop.vue';
import RecipeSchema from './RecipeSchema.vue';

const route = useRoute();
const layoutClass = computed(() => {
    const path = route.path;
    if (path.startsWith('/cooklikehoc')) return 'layout-cooklikehoc';
    if (path.startsWith('/howtocook')) return 'layout-howtocook';
    return '';
});

// 首页不显示阅读进度条
const showProgress = computed(() => route.path !== '/');
</script>

<template>
    <div class="mycook-layout" :class="layoutClass">
        <ReadingProgress v-if="showProgress" />
        <DefaultTheme.Layout />
        <BackToTop />
        <RecipeSchema />
    </div>
</template>
