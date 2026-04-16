<script setup>
import { onMounted, onUnmounted } from 'vue';

const handleKeyDown = (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    if (isInputFocused()) return;

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
    } else if (
        e.key === '/' &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
    ) {
        e.preventDefault();
        openSearch();
    }
};

const openSearch = () => {
    const searchButton = document.querySelector('.VPNavBarSearch button');
    if (searchButton instanceof HTMLButtonElement) {
        searchButton.click();
    }
};

const isInputFocused = () => {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) return false;

    return (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
    );
};

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
});
</script>
