<script setup>
import { withBase } from 'vitepress';

const tiers = [
  {
    stars: '0–2 星',
    note: '上手最快',
    href: '/howtocook/starsystem/2Star',
    accent: 'jade',
  },
  {
    stars: '3–5 星',
    note: '日常硬菜',
    href: '/howtocook/starsystem/4Star',
    accent: 'chili',
  },
  {
    stars: '6 星+',
    note: '挑战厨房',
    href: '/howtocook/starsystem/7Star',
    accent: 'ink',
  },
];
</script>

<template>
  <section class="difficulty-shelf" aria-label="按难度找菜">
    <div class="difficulty-head">
      <p class="difficulty-kicker">Difficulty</p>
      <h2>今晚想做多难？</h2>
      <p>HowToCook 难度星级索引，从快手到硬菜一键进。</p>
    </div>
    <div class="difficulty-grid">
      <a
        v-for="item in tiers"
        :key="item.stars"
        class="difficulty-card"
        :class="`is-${item.accent}`"
        :href="withBase(item.href)"
      >
        <strong>{{ item.stars }}</strong>
        <span>{{ item.note }}</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.difficulty-shelf {
  max-width: 920px;
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
