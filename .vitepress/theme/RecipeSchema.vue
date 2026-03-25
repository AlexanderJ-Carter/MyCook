<script setup>
import { useRoute } from 'vitepress';
import { computed } from 'vue';

const route = useRoute();

// 从页面路径提取菜谱名称
const recipeName = computed(() => {
  const path = route.path;
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';
  // 移除 .html 后缀（如果有的话）
  return lastSegment.replace(/\.html$/, '').replace(/-/g, ' ');
});

// 根据路径判断菜谱来源
const recipeSource = computed(() => {
  const path = route.path;
  if (path.startsWith('/cooklikehoc')) return 'CookLikeHOC';
  if (path.startsWith('/howtocook')) return 'HowToCook';
  return null;
});

// 判断是否是菜谱页面（非分类首页）
const isRecipePage = computed(() => {
  const path = route.path;
  // 排除首页、分类页面等
  if (path === '/' || path.endsWith('/README')) return false;
  if (!recipeSource.value) return false;
  // 检查是否是具体的菜谱页面
  return !path.endsWith('/');
});

// Schema.org Recipe 结构化数据
const schemaData = computed(() => {
  if (!isRecipePage.value) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipeName.value,
    description: `${recipeName.value}的做法 - 来自${recipeSource.value}菜谱`,
    author: {
      '@type': 'Organization',
      name: recipeSource.value
    },
    recipeCategory: recipeSource.value === 'CookLikeHOC' ? '中式家常菜' : '家常菜',
    recipeCuisine: 'Chinese',
    keywords: ['菜谱', '做饭', '家常菜', recipeName.value]
  };
});
</script>

<template>
  <component :is="'script'" v-if="schemaData" type="application/ld+json" v-html="JSON.stringify(schemaData)" />
</template>
