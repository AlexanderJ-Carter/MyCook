<script setup>
import { onMounted } from 'vue';
import { withBase } from 'vitepress';

onMounted(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register(withBase('/sw.js')).catch((error) => {
        if (import.meta.env.DEV) {
            console.error('[PWA] Service Worker registration failed:', error);
        }
    });
});
</script>
