<script setup>
import DefaultTheme from 'vitepress/theme';
import { useRoute } from 'vitepress';
import { computed } from 'vue';

const route = useRoute();
const layoutClass = computed(() => {
    const path = route.path;
    if (path.startsWith('/cooklikehoc')) return 'layout-cooklikehoc';
    if (path.startsWith('/howtocook')) return 'layout-howtocook';
    return '';
});
</script>

<template>
    <div class="mycook-layout" :class="layoutClass">
        <DefaultTheme.Layout />
    </div>
</template>
