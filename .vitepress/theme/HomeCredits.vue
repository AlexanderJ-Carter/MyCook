<script setup>
import { withBase } from 'vitepress';
import { useI18n } from './composables/useI18n.js';

const { t } = useI18n();
</script>

<template>
  <section class="home-credits" id="credits" :aria-label="t('home.credits.aria')">
    <h2 class="home-credits-title">{{ t('home.credits.title') }}</h2>
    <p class="home-credits-desc">{{ t('home.credits.intro') }}</p>
    <ul class="home-credits-list">
      <li>
        <a href="https://github.com/Gar-b-age/CookLikeHOC" target="_blank" rel="noopener"
          >CookLikeHOC</a
        >
        — {{ t('home.credits.cooklikehocItem') }}
      </li>
      <li>
        <a href="https://github.com/Anduin2017/HowToCook" target="_blank" rel="noopener"
          >HowToCook</a
        >
        — {{ t('home.credits.howtocookItem') }}
      </li>
    </ul>
    <p class="home-credits-desc">{{ t('home.credits.derived') }}</p>
    <ul class="home-credits-list">
      <li>
        <a :href="withBase('/howtocook-images/')">{{ t('home.credits.imagesName') }}</a>
        —
        {{ t('home.credits.cookImages') }}
      </li>
    </ul>
    <ul class="home-credits-list">
      <li>
        <a href="https://github.com/YunYouJun/cook" target="_blank" rel="noopener">{{
          t('home.credits.pantryName')
        }}</a>
        — {{ t('home.credits.cookPantry') }}
      </li>
    </ul>
    <p class="home-credits-note">
      {{ t('home.credits.note') }}
      <a href="https://github.com/AlexanderJ-Carter/MyCook" target="_blank" rel="noopener"
        >AlexanderJ-Carter/MyCook</a
      >
    </p>
  </section>
</template>
