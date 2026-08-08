<script setup>
import { computed, onMounted } from "vue";
import { withBase } from "vitepress";
import { shelfItems, shelfNotes } from "./i18n/messages.js";
import { useSiteData } from "./composables/useSiteData";
import { useI18n } from "./composables/useI18n";
import { imagesUrl } from "./sites.js";

const { stats, loadStats } = useSiteData();
const { t, locale } = useI18n();

const pathKeys = ["cooklikehoc", "howtocook", "images", "pantry"];

const pathItems = computed(() =>
  pathKeys.map((key) => {
    const p = t(`home.pantry.paths.${key}`);
    const hrefs = {
      cooklikehoc: "/cooklikehoc/炒菜/README",
      howtocook: "/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋",
      images: imagesUrl("/"),
      pantry: "#kitchen-play",
    };
    const accents = {
      cooklikehoc: "chili",
      howtocook: "jade",
      images: "ink",
      pantry: "pantry",
    };
    let meta = p.meta;
    if (key === "cooklikehoc") {
      meta = t("home.pantry.paths.cooklikehoc.meta", {
        n: stats.value?.cooklikehoc?.dishes ?? "—",
      });
    } else if (key === "howtocook") {
      meta = t("home.pantry.paths.howtocook.meta", {
        n: stats.value?.howtocook?.dishes ?? "—",
      });
    }
    const href = hrefs[key];
    const isAbsolute = /^https?:\/\//i.test(href);
    return {
      ...p,
      accent: accents[key],
      href: href.startsWith("#") || isAbsolute ? href : withBase(href),
      meta,
    };
  }),
);

const shelfList = computed(() =>
  shelfItems.map((item) => ({
    label: item.label,
    note: shelfNotes[locale.value]?.[item.noteKey] ?? shelfNotes["zh-CN"][item.noteKey],
    href: withBase(item.href),
  })),
);

const workflow = computed(() => t("home.pantry.flow.steps"));

onMounted(() => loadStats());
</script>

<template>
  <section class="home-explore" :aria-label="t('home.pantry.aria')">
    <div class="home-explore-intro">
      <p class="home-explore-kicker">{{ t('home.pantry.kicker') }}</p>
      <h2>{{ t('home.pantry.title') }}</h2>
      <p>{{ t('home.pantry.lead') }}</p>
    </div>

    <div class="home-paths">
      <a
        v-for="item in pathItems"
        :key="item.title"
        class="home-path"
        :class="`is-${item.accent}`"
        :href="item.href"
      >
        <div class="home-path-top">
          <p class="home-path-eyebrow">{{ item.eyebrow }}</p>
          <span class="home-path-meta">{{ item.meta }}</span>
        </div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <span class="home-path-go">{{ item.cta }} →</span>
      </a>
    </div>

    <div class="home-shelf">
      <div class="home-shelf-head">
        <h3>{{ t('home.pantry.shelf.title') }}</h3>
        <span>{{ t('home.pantry.shelf.hint') }}</span>
      </div>
      <div class="home-shelf-grid">
        <a
          v-for="item in shelfList"
          :key="item.label"
          class="home-shelf-link"
          :href="item.href"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.note }}</span>
        </a>
      </div>
    </div>

    <div class="home-flow">
      <h3>{{ t('home.pantry.flow.title') }}</h3>
      <ol>
        <li v-for="step in workflow" :key="step.title">
          <strong>{{ step.title }}</strong>
          <span>{{ step.text }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>
