<script setup>
import DefaultTheme from "vitepress/theme";
import { useRoute } from "vitepress";
import { computed } from "vue";
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

const route = useRoute();
const layoutClass = computed(() => {
  const path = route.path;
  if (path.startsWith("/cooklikehoc")) return "layout-cooklikehoc";
  if (path.startsWith("/howtocook")) return "layout-howtocook";
  return "";
});

const showProgress = computed(() => route.path !== "/");
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
      <template v-if="showSourceChip" #doc-before>
        <SourceChip />
      </template>
    </DefaultTheme.Layout>
    <BackToTop />
    <RecipeSchema />
    <RecipeToolbar />
  </div>
</template>
