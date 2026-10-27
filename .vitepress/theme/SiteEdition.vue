<script setup>
import { computed, onMounted, ref } from 'vue';
import { SITES } from './sites.js';
import { useI18n } from './composables/useI18n';

const { locale } = useI18n();
const host = ref('');

onMounted(() => {
    host.value = typeof location !== 'undefined' ? location.hostname : '';
});

const edition = computed(() => {
    if (host.value === 'mycook.alexander.xin') return 'full';
    if (host.value === 'cook.alexander.xin') return 'pages';
    return 'dev';
});

const folioLabel = computed(() => (locale.value === 'en-US' ? 'Folio' : 'Folio 主站'));
</script>

<template>
  <aside
    v-if="edition !== 'dev'"
    class="site-edition"
    :data-edition="edition"
    role="note"
  >
    <p class="site-edition-ecosystem">
      <a :href="SITES.folio" rel="noopener">{{ folioLabel }}</a>
      <span aria-hidden="true"> · </span>
      <span>{{ locale === 'en-US' ? 'alexander.xin network' : 'alexander.xin 站群' }}</span>
    </p>
    <template v-if="edition === 'pages'">
      <p>
        <strong>{{ locale === 'en-US' ? 'CDN site' : 'CDN 主站' }}</strong>
        ·
        {{
          locale === 'en-US'
            ? 'Lightweight access; step photos live on'
            : '轻量访问；带步骤图的完整站在'
        }}
        <a :href="SITES.full">mycook.alexander.xin</a>
      </p>
    </template>
    <template v-else>
      <p>
        <strong>{{ locale === 'en-US' ? 'Full site' : '完整站' }}</strong>
        ·
        {{
          locale === 'en-US'
            ? 'Includes HowToCook images; lightweight CDN at'
            : '含 HowToCook 图片版；轻量 CDN 主站在'
        }}
        <a :href="SITES.pages">cook.alexander.xin</a>
      </p>
    </template>
  </aside>
</template>
