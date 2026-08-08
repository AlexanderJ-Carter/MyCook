<script setup>
import DefaultTheme from "vitepress/theme";
import { useRoute } from "vitepress";
import { computed, onMounted, watch } from "vue";
import ReadingProgress from "./ReadingProgress.vue";
import BackToTop from "./BackToTop.vue";
import RecipeSchema from "./RecipeSchema.vue";
import PWA from "./PWA.vue";
import SearchShortcut from "./SearchShortcut.vue";
import KeyboardHelp from "./KeyboardHelp.vue";
import RecipeToolbar from "./RecipeToolbar.vue";
import SourceChip from "./SourceChip.vue";
import WebMcp from "./WebMcp.vue";
import SkipLink from "./SkipLink.vue";
import InstallPrompt from "./InstallPrompt.vue";
import LangSwitch from "./LangSwitch.vue";

const route = useRoute();

let revealObserver = null;

function setupReveal() {
  const targets = document.querySelectorAll(
    ".home-explore, .difficulty-shelf, .home-play-zone, .stats-section, .recent-updates, .home-credits",
  );
  if (!targets.length) return;
  revealObserver?.disconnect();

  // 无动效或观察失败时保持可见，避免「打开一片空白」
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((el) => {
      el.classList.remove("reveal");
      el.classList.add("is-in");
    });
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -4% 0px", threshold: 0.01 },
  );
  targets.forEach((el) => {
    el.classList.add("reveal");
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
      el.classList.add("is-in");
    } else {
      revealObserver.observe(el);
    }
  });
  // 兜底：2s 后仍未显现的区块强制显示
  window.setTimeout(() => {
    targets.forEach((el) => el.classList.add("is-in"));
  }, 2000);
}

onMounted(() => {
  setupReveal();
});

watch(
  () => route.path,
  () => setTimeout(setupReveal, 150),
);

const layoutClass = computed(() => {
  const path = route.path;
  if (path.startsWith("/cooklikehoc")) return "layout-cooklikehoc";
  if (path.startsWith("/howtocook")) return "layout-howtocook";
  return "";
});

const showProgress = computed(() => {
  const path = route.path.replace(/\/$/, "") || "/";
  return path !== "/" && path !== "/en";
});

const showSourceChip = computed(() => {
  const path = route.path;
  return path.startsWith("/cooklikehoc") || path.startsWith("/howtocook");
});
</script>

<template>
  <div class="mycook-layout" :class="layoutClass">
    <SkipLink />
    <PWA />
    <InstallPrompt />
    <WebMcp />
    <SearchShortcut />
    <KeyboardHelp />
    <ReadingProgress v-if="showProgress" />
    <DefaultTheme.Layout>
      <template #nav-bar-content-after>
        <LangSwitch />
      </template>
      <template v-if="showSourceChip" #doc-before>
        <SourceChip />
      </template>
    </DefaultTheme.Layout>
    <BackToTop />
    <RecipeSchema />
    <RecipeToolbar />
  </div>
</template>
