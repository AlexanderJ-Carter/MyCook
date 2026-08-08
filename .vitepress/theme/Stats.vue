<script setup>

import { computed, onMounted } from "vue";

import { useSiteData } from "./composables/useSiteData";

import { useI18n } from "./composables/useI18n";



const { stats, syncInfo, loadStats, loadSyncInfo } = useSiteData();

const { t, dateLocale } = useI18n();



const syncLabel = computed(() => {

  const raw = syncInfo.value?.lastSync;

  if (!raw) return null;

  const d = new Date(raw);

  return d.toLocaleDateString(dateLocale(), {

    year: "numeric",

    month: "short",

    day: "numeric",

  });

});



onMounted(async () => {

  await Promise.all([loadStats(), loadSyncInfo()]);

});

</script>



<template>

  <section id="stats" class="stats-section" :aria-label="t('home.stats.aria')">

    <div class="stats-head">

      <div>

        <p class="home-section-kicker">{{ t('home.stats.kicker') }}</p>

        <h2 class="stats-title">{{ t('home.stats.title') }}</h2>

      </div>

      <p v-if="syncLabel" class="stats-sync">

        {{ t('home.stats.sync', { date: syncLabel }) }}

      </p>

    </div>

    <div class="stats-grid">

      <div class="stat-card">

        <span class="stat-number">{{ stats?.total ?? "—" }}</span>

        <span class="stat-label">{{ t('home.stats.total') }}</span>

      </div>

      <div class="stat-card">

        <span class="stat-number">{{

          stats?.totalCategories ||

          (stats?.cooklikehoc?.categories ?? 0) + (stats?.howtocook?.categories ?? 0) ||

          "—"

        }}</span>

        <span class="stat-label">{{ t('home.stats.categories') }}</span>

      </div>

      <div class="stat-card cooklikehoc">

        <span class="stat-number">{{ stats?.cooklikehoc?.dishes ?? "—" }}</span>

        <span class="stat-label">{{ t('home.stats.cooklikehoc') }}</span>

      </div>

      <div class="stat-card howtocook">

        <span class="stat-number">{{ stats?.howtocook?.dishes ?? "—" }}</span>

        <span class="stat-label">{{ t('home.stats.howtocook') }}</span>

      </div>

    </div>

  </section>

</template>

