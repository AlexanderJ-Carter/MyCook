<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vitepress';

const ASK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASK_URL) ||
  'https://cook-mcp.alexander.xin/ask';

const router = useRouter();
const open = ref(false);
const input = ref('');
const busy = ref(false);
const error = ref('');
const panelEl = ref(null);
const listEl = ref(null);
const messages = ref([
  {
    role: 'assistant',
    text: '我是厨助手。可以说菜名、手头食材，或问「今天吃什么」。',
    suggestions: [
      { label: '今天吃什么', question: '今天吃什么' },
      { label: '番茄鸡蛋', question: '冰箱里有鸡蛋和番茄能做什么' },
      { label: '随机一道', question: '随机推荐一道菜' },
    ],
    actions: [],
  },
]);

function onOpenEvent() {
  open.value = true;
  nextTick(() => panelEl.value?.querySelector('textarea')?.focus());
}

function openFromHash() {
  if (typeof location !== 'undefined' && location.hash === '#kitchen-assist') {
    open.value = true;
  }
}

onMounted(() => {
  window.addEventListener('mycook:open-assist', onOpenEvent);
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
});
onUnmounted(() => {
  window.removeEventListener('mycook:open-assist', onOpenEvent);
  window.removeEventListener('hashchange', openFromHash);
});

watch(open, (v) => {
  document.documentElement.classList.toggle('kitchen-assist-open', v);
});

function scrollBottom() {
  nextTick(() => {
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight;
  });
}

async function ask(question) {
  const q = String(question || '').trim();
  if (!q || busy.value) return;
  error.value = '';
  messages.value.push({ role: 'user', text: q, suggestions: [], actions: [] });
  input.value = '';
  busy.value = true;
  scrollBottom();

  const history = messages.value
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(0, -1)
    .slice(-8)
    .map((m) => ({ role: m.role, text: m.text }));

  try {
    const res = await fetch(ASK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, messages: history, llm: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `请求失败（${res.status}）`);
    }
    messages.value.push({
      role: 'assistant',
      text: data.answer || '没有整理出回答。',
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      actions: Array.isArray(data.actions) ? data.actions : [],
      mode: data.mode,
    });
  } catch (e) {
    error.value = e?.message || '网络异常';
    messages.value.push({
      role: 'assistant',
      text: '这会儿连不上厨助手。可以稍后再试，或用搜索找菜。',
      suggestions: [{ label: '随机一道', question: '随机推荐一道菜' }],
      actions: [],
    });
  } finally {
    busy.value = false;
    scrollBottom();
  }
}

function onSubmit(e) {
  e?.preventDefault?.();
  ask(input.value);
}

function go(path) {
  if (!path) return;
  open.value = false;
  router.go(path);
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    open.value = false;
  }
}
</script>

<template>
  <div class="kitchen-assist" @keydown="onKeydown">
    <button
      type="button"
      class="kitchen-assist__fab"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="kitchen-assist-panel"
      @click="open = !open"
    >
      <span class="kitchen-assist__fab-label">{{ open ? '收起' : '厨助手' }}</span>
    </button>

    <div
      v-show="open"
      id="kitchen-assist-panel"
      ref="panelEl"
      class="kitchen-assist__panel"
      role="dialog"
      aria-label="厨助手"
    >
      <header class="kitchen-assist__head">
        <div>
          <p class="kitchen-assist__kicker">MyCook</p>
          <h2 class="kitchen-assist__title">厨助手</h2>
        </div>
        <button type="button" class="kitchen-assist__close" @click="open = false">关闭</button>
      </header>

      <div ref="listEl" class="kitchen-assist__list" aria-live="polite">
        <article
          v-for="(m, i) in messages"
          :key="i"
          class="kitchen-assist__msg"
          :data-role="m.role"
        >
          <p class="kitchen-assist__text">{{ m.text }}</p>
          <div v-if="m.actions?.length" class="kitchen-assist__actions">
            <button
              v-for="(a, j) in m.actions"
              :key="j"
              type="button"
              class="kitchen-assist__action"
              @click="go(a.path)"
            >
              {{ a.label || a.path }}
            </button>
          </div>
          <div v-if="m.suggestions?.length" class="kitchen-assist__chips">
            <button
              v-for="(s, j) in m.suggestions"
              :key="j"
              type="button"
              class="kitchen-assist__chip"
              :disabled="busy"
              @click="ask(s.question)"
            >
              {{ s.label }}
            </button>
          </div>
        </article>
        <p v-if="busy" class="kitchen-assist__thinking">在翻菜谱…</p>
        <p v-if="error" class="kitchen-assist__error">{{ error }}</p>
      </div>

      <form class="kitchen-assist__form" @submit="onSubmit">
        <label class="sr-only" for="kitchen-assist-input">提问</label>
        <textarea
          id="kitchen-assist-input"
          v-model="input"
          rows="2"
          maxlength="400"
          placeholder="菜名、食材，或「今天吃什么」"
          :disabled="busy"
          @keydown.enter.exact.prevent="onSubmit"
        />
        <button type="submit" class="kitchen-assist__send" :disabled="busy || !input.trim()">
          发送
        </button>
      </form>
    </div>
  </div>
</template>
