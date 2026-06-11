<script setup>
import { ref, onMounted } from 'vue';
import { withBase } from 'vitepress';

const items = ref([]);
const isLoaded = ref(false);

onMounted(async () => {
    try {
        const res = await fetch(withBase('/recent.json'));
        const data = await res.json();
        items.value = data.items || [];
    } catch {
        items.value = [];
    } finally {
        isLoaded.value = true;
    }
});
</script>

<template>
    <div class="recent-updates" v-if="items.length">
        <h2 class="recent-updates-title">最近更新</h2>
        <ul class="recent-updates-list">
            <li v-for="(item, i) in items" :key="i" class="recent-item">
                <a :href="item.link">{{ item.title }}</a>
            </li>
        </ul>
    </div>
</template>
