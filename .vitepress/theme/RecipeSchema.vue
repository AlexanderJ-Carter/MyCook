<script setup>
import { useData, useRoute, withBase } from 'vitepress';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  SITE,
  buildRecipeSchema,
  isMetaSlug,
  isUsableImage,
  minutesToIso,
  normalizePath,
  recipeCategoryFromSegments,
  toAbsoluteUrl,
} from '../recipeJsonLd.mjs';

const route = useRoute();
const { page } = useData();
const extras = ref({});

function isRecipePath(path) {
  const segments = normalizePath(path).split('/').filter(Boolean);
  if (!segments.length || isMetaSlug(segments[segments.length - 1])) return false;
  if (segments[0] === 'cooklikehoc') return segments.length >= 3;
  if (segments[0] === 'howtocook' && segments[1] === 'dishes') return segments.length >= 4;
  return false;
}

const isRecipePage = computed(() => isRecipePath(route.path));

const recipeSource = computed(() => {
  const path = normalizePath(route.path);
  if (path.startsWith('/cooklikehoc')) return 'CookLikeHOC';
  if (path.startsWith('/howtocook')) return 'HowToCook';
  return null;
});

const recipeName = computed(() => {
  const fromPage = String(page.value?.title || '').trim();
  if (fromPage && fromPage !== 'MyCook') {
    return fromPage.replace(/的做法$/, '');
  }
  const segments = normalizePath(route.path).split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] || '菜谱').replace(/-/g, ' ');
});

const recipeCategory = computed(() => {
  const segments = normalizePath(route.path).split('/').filter(Boolean);
  const isCooklike = segments[0] === 'cooklikehoc';
  return recipeCategoryFromSegments(segments, isCooklike);
});

const pageUrl = computed(() => {
  const path = withBase(normalizePath(route.path));
  return path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
});

function listAfterHeading(root, headings) {
  const nodes = [...root.querySelectorAll('h2, h3')];
  const heading = nodes.find((el) => {
    const t = el.textContent.replace(/\s+/g, '');
    return headings.some((h) => t.includes(h));
  });
  if (!heading) return [];
  const items = [];
  let el = heading.nextElementSibling;
  while (el && !/^H[23]$/.test(el.tagName)) {
    if (el.tagName === 'UL' || el.tagName === 'OL') {
      for (const li of el.querySelectorAll(':scope > li')) {
        const text = li.textContent.replace(/\s+/g, ' ').trim();
        if (text) items.push(text);
      }
    }
    el = el.nextElementSibling;
  }
  return items;
}

function enhanceFromDom() {
  if (typeof document === 'undefined' || !isRecipePage.value) {
    extras.value = {};
    return;
  }

  const root = document.querySelector('.vp-doc');
  if (!root) {
    extras.value = {};
    return;
  }

  const text = root.textContent.replace(/\s+/g, ' ');
  const images = [...root.querySelectorAll('img')]
    .map((img) => toAbsoluteUrl(img.currentSrc || img.src, pageUrl.value))
    .filter(isUsableImage);

  const uniqueImages = [...new Set(images)];
  const calories = text.match(/预估卡路里[：:]\s*(\d+)\s*大卡/);
  const aboutMinutes =
    text.match(/(?:约需|大约需要|大约|预计|预估)[^。；]{0,12}?(\d+)\s*分钟/) ||
    text.match(/从备料到出锅约需\s*(\d+)\s*分钟/);

  let prepTime = null;
  let cookTime = null;
  let totalTime = aboutMinutes ? minutesToIso(Number(aboutMinutes[1])) : null;

  const soak = text.match(/浸泡\s*(\d+(?:\.\d+)?)\s*(小时|分钟)/);
  if (soak) {
    const n = soak[2] === '小时' ? Number(soak[1]) * 60 : Number(soak[1]);
    prepTime = minutesToIso(n);
  }

  const steam = text.match(/蒸\s*(\d+(?:\.\d+)?)\s*分钟/);
  const braise = text.match(/焖\s*(\d+(?:\.\d+)?)\s*分钟/);
  const cookMinutes =
    (steam ? Number(steam[1]) : 0) + (braise ? Number(braise[1]) : 0);
  if (cookMinutes > 0) cookTime = minutesToIso(cookMinutes);

  if (!totalTime && prepTime && cookTime) {
    const prepM = soak
      ? soak[2] === '小时'
        ? Number(soak[1]) * 60
        : Number(soak[1])
      : 0;
    totalTime = minutesToIso(prepM + cookMinutes);
  }

  // Google 要求 prepTime 与 cookTime 成对出现；只有总时长时只填 totalTime
  if (!prepTime || !cookTime) {
    prepTime = null;
    cookTime = null;
  }

  const ingredients = listAfterHeading(root, ['配料', '必备原料和工具', '原料', '食材']);
  const instructions = listAfterHeading(root, ['步骤', '操作', '做法']);

  const h1 = document.querySelector('.vp-doc h1')?.textContent?.trim();

  extras.value = {
    name: h1 ? h1.replace(/的做法$/, '') : null,
    images: uniqueImages,
    prepTime,
    cookTime,
    totalTime,
    calories: calories ? Number(calories[1]) : null,
    ingredients,
    instructions,
  };
}

const schemaData = computed(() => {
  if (!isRecipePage.value || !recipeSource.value) return null;

  const name = extras.value.name || recipeName.value;
  return buildRecipeSchema({
    name,
    source: recipeSource.value,
    category: recipeCategory.value,
    pageUrl: pageUrl.value,
    images: extras.value.images,
    extras: extras.value,
  });
});

const schemaJson = computed(() =>
  schemaData.value ? JSON.stringify(schemaData.value) : '',
);

let headScript = null;

function syncHeadScript() {
  if (typeof document === 'undefined') return;
  const existing = document.querySelector(
    'script[data-mycook-recipe-schema="1"]',
  );
  if (!schemaJson.value) {
    existing?.remove();
    headScript = null;
    return;
  }
  headScript = existing;
  if (!headScript) {
    headScript = document.createElement('script');
    headScript.type = 'application/ld+json';
    headScript.setAttribute('data-mycook-recipe-schema', '1');
    document.head.appendChild(headScript);
  }
  headScript.textContent = schemaJson.value;
}

function refresh() {
  enhanceFromDom();
  syncHeadScript();
}

onMounted(() => {
  refresh();
  requestAnimationFrame(refresh);
});

watch(
  () => route.path,
  () => {
    extras.value = {};
    // VitePress 换页后正文稍晚才挂上
    requestAnimationFrame(() => {
      refresh();
      setTimeout(refresh, 120);
    });
  },
);

onBeforeUnmount(() => {
  // 构建期 transformHead 写入的节点留给下一路由复用；仅清客户端新建引用
  headScript = null;
});
</script>

<template>
  <!-- JSON-LD 由 transformHead（SSR）与 head 脚本同步（客户端增强）注入 -->
</template>
