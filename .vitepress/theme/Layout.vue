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
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const targets = document.querySelectorAll(
    ".home-explore, .difficulty-shelf, .home-play-zone, .stats-section, .recent-updates, .home-credits",
  );
  if (!targets.length) return;
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  targets.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
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
