<script setup>
import { onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { useSiteData } from "./composables/useSiteData";
import { useI18n } from "./composables/useI18n";

const { loadRecent } = useSiteData();
const { t } = useI18n();
const items = ref([]);

onMounted(async () => {
  const data = await loadRecent();
  items.value = data?.items || [];
});
</script>

<template>
  <section v-if="items.length" class="recent-updates" :aria-label="t('home.recent.aria')">
    <div class="recent-updates-head">
      <h2 class="recent-updates-title">{{ t('home.recent.title') }}</h2>
      <p class="recent-updates-hint">{{ t('home.recent.hint') }}</p>
    </div>
    <ul class="recent-updates-list">
      <li v-for="(item, i) in items" :key="i" class="recent-item">
        <a :href="withBase(item.link)">
          <span class="recent-title">{{ item.title }}</span>
          <span
            class="recent-source"
            :class="item.source === 'howtocook' ? 'is-jade' : 'is-chili'"
          >
            {{
              item.source === "howtocook"
                ? t('home.recent.sourceHowtocook')
                : t('home.recent.sourceCooklikehoc')
            }}
          </span>
        </a>
      </li>
    </ul>
  </section>
</template>
