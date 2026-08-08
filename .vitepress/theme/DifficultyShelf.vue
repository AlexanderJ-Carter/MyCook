<script setup>
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from './composables/useI18n';

const { t } = useI18n();

const hrefs = [
  '/howtocook/starsystem/2Star',
  '/howtocook/starsystem/4Star',
  '/howtocook/starsystem/7Star',
];
const accents = ['jade', 'chili', 'ink'];

const tiers = computed(() => {
  const items = t('home.difficulty.tiers');
  return items.map((item, i) => ({
    ...item,
    href: withBase(hrefs[i]),
    accent: accents[i],
  }));
});
</script>

<template>
  <section class="difficulty-shelf" :aria-label="t('home.difficulty.aria')">
    <div class="difficulty-head">
      <p class="difficulty-kicker">{{ t('home.difficulty.kicker') }}</p>
      <h2>{{ t('home.difficulty.title') }}</h2>
      <p>{{ t('home.difficulty.lead') }}</p>
    </div>
    <div class="difficulty-grid">
      <a
        v-for="item in tiers"
        :key="item.stars"
        class="difficulty-card"
        :class="`is-${item.accent}`"
        :href="item.href"
      >
        <strong>{{ item.stars }}</strong>
        <span>{{ item.note }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.difficulty-shelf {
  max-width: 1080px;
  margin: 0 auto 2.5rem;
  padding: 0 1.25rem;
}

.difficulty-head h2 {
  margin: 0.2rem 0 0.4rem;
  font-family: var(--mycook-display, serif);
  font-size: 1.35rem;
  font-weight: 700;
}

.difficulty-head p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
}

.difficulty-kicker {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.1rem;
}

.difficulty-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.05rem;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  background: var(--mycook-paper);
  border: 1px solid var(--mycook-line);
  box-shadow: var(--shadow-sm);
  transition: transform 0.16s ease, border-color 0.16s ease;
}

.difficulty-card::after {
  content: '★';
  position: absolute;
  right: 0.6rem;
  bottom: -0.7rem;
  font-size: 3.2rem;
  line-height: 1;
  font-family: var(--mycook-display, serif);
  color: var(--vp-c-brand-1);
  opacity: 0.08;
  pointer-events: none;
}

.difficulty-card.is-jade::after {
  color: var(--mycook-jade);
}

.difficulty-card.is-ink::after {
  color: var(--mycook-steel);
}

.difficulty-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
}

.difficulty-card.is-jade:hover {
  border-color: var(--mycook-jade);
}

.difficulty-card strong {
  font-family: var(--mycook-display, serif);
  font-size: 1.05rem;
}

.difficulty-card span {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .difficulty-grid {
    grid-template-columns: 1fr;
  }
}
</style>
