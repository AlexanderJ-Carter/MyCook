import { ref } from 'vue';
import { withBase } from 'vitepress';

const cache = new Map();

async function fetchJson(path) {
    if (!cache.has(path)) {
        cache.set(
            path,
            fetch(withBase(path)).then((res) => (res.ok ? res.json() : null)),
        );
    }
    return cache.get(path);
}

const stats = ref(null);
const recipesIndex = ref(null);
const recent = ref(null);
const syncInfo = ref(null);
const pantry = ref(null);
const tipsIndex = ref(null);

export function useSiteData() {
    async function loadStats() {
        if (stats.value) return stats.value;
        stats.value = await fetchJson('/stats.json');
        return stats.value;
    }

    async function loadRecipesIndex() {
        if (recipesIndex.value) return recipesIndex.value;
        recipesIndex.value = await fetchJson('/recipes-index.json');
        return recipesIndex.value;
    }

    async function loadRecent() {
        if (recent.value) return recent.value;
        recent.value = await fetchJson('/recent.json');
        return recent.value;
    }

    async function loadSyncInfo() {
        if (syncInfo.value) return syncInfo.value;
        syncInfo.value = await fetchJson('/sync-info.json');
        return syncInfo.value;
    }

    async function loadPantry() {
        if (pantry.value) return pantry.value;
        pantry.value = await fetchJson('/pantry.json');
        return pantry.value;
    }

    async function loadTipsIndex() {
        if (tipsIndex.value) return tipsIndex.value;
        tipsIndex.value = await fetchJson('/tips-index.json');
        return tipsIndex.value;
    }

    return {
        stats,
        recipesIndex,
        recent,
        syncInfo,
        pantry,
        tipsIndex,
        loadStats,
        loadRecipesIndex,
        loadRecent,
        loadSyncInfo,
        loadPantry,
        loadTipsIndex,
    };
}
