<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vitepress';
import { useI18n } from './composables/useI18n';

const ASK_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASK_URL) ||
  'https://cook-mcp.alexander.xin/ask';

const SESSION_KEY = 'mycook:assist-session';

const router = useRouter();
const { t } = useI18n();
const open = ref(false);
const input = ref('');
const busy = ref(false);
const error = ref('');
const panelEl = ref(null);
const listEl = ref(null);
const fabEl = ref(null);
const messages = ref([welcomeMessage()]);

// 建议问题的 label 按语言展示；question 固定中文——后端关键词匹配只认中文写法
function welcomeMessage() {
  return {
    role: 'assistant',
    text: t('kitchenAssist.welcome'),
    suggestions: [
      { label: t('kitchenAssist.chipWhatToEat'), question: '今天吃什么' },
      { label: t('kitchenAssist.chipPantry'), question: '冰箱里有鸡蛋和番茄能做什么' },
      { label: t('kitchenAssist.chipLucky'), question: '随机推荐一道菜' },
    ],
    actions: [],
  };
}

function onOpenEvent() {
  open.value = true;
  nextTick(() => panelEl.value?.querySelector('textarea')?.focus());
}

function openFromHash() {
  if (typeof location !== 'undefined' && location.hash === '#kitchen-assist') {
    open.value = true;
  }
}

// 会话存 sessionStorage：点击菜品跳走（整页导航）后回来不丢上下文
function saveSession() {
  try {
    if (messages.value.length > 1) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(messages.value.filter((m) => m.text).slice(-20)),
      );
    }
  } catch {
    /* 隐私模式等场景静默失败 */
  }
}

function restoreSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved) && saved.length) messages.value = saved;
  } catch {
    /* 损坏的存储直接丢弃 */
  }
}

onMounted(() => {
  window.addEventListener('mycook:open-assist', onOpenEvent);
  window.addEventListener('hashchange', openFromHash);
  // window 级监听：从 hash 打开时焦点在正文，容器内 keydown 捕获不到 Esc
  window.addEventListener('keydown', onKeydown);
  openFromHash();
  restoreSession();
});
onUnmounted(() => {
  window.removeEventListener('mycook:open-assist', onOpenEvent);
  window.removeEventListener('hashchange', openFromHash);
  window.removeEventListener('keydown', onKeydown);
});

watch(open, (v) => {
  document.documentElement.classList.toggle('kitchen-assist-open', v);
  if (v) {
    nextTick(() => panelEl.value?.querySelector('textarea')?.focus());
  } else {
    // 关闭后焦点回到 FAB，读屏用户不会「掉」进正文
    fabEl.value?.focus?.();
    saveSession();
  }
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
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    messages.value.push({
      role: 'assistant',
      text: data.answer || t('kitchenAssist.noAnswer'),
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      actions: Array.isArray(data.actions) ? data.actions : [],
      mode: data.mode,
      model: data.model || '',
    });
  } catch (e) {
    // 失败只反馈一次：要么是可操作的 HTTP 错误（error 区），要么是断网（助手消息 + 重试 chip）
    if (e instanceof TypeError) {
      messages.value.push({
        role: 'assistant',
        text: t('kitchenAssist.offline'),
        suggestions: [{ label: t('kitchenAssist.retryChip'), question: '随机推荐一道菜' }],
        actions: [],
      });
    } else {
      error.value = e?.message || 'network error';
    }
  } finally {
    busy.value = false;
    scrollBottom();
    saveSession();
  }
}

function onSubmit(e) {
  e?.preventDefault?.();
  ask(input.value);
}

function go(path) {
  if (!path) return;
  open.value = false;
  saveSession();
  const target = path.startsWith('/') ? path : `/${path}`;
  // Client router often fails to resolve CJK dish paths; hard-navigate instead.
  if (typeof window !== 'undefined') {
    window.location.assign(target);
    return;
  }
  router.go(target);
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    open.value = false;
  }
}

function modeLabel(mode) {
  if (mode === 'llm') return t('kitchenAssist.modeLlm');
  if (mode === 'tool') return t('kitchenAssist.modeTool');
  if (mode === 'none') return t('kitchenAssist.modeNone');
  return '';
}
</script>

<template>
  <div class="kitchen-assist">
    <button
      ref="fabEl"
      type="button"
      class="kitchen-assist__fab"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="kitchen-assist-panel"
      @click="open = !open"
    >
      <span class="kitchen-assist__fab-label">{{ open ? t('kitchenAssist.fabClose') : t('kitchenAssist.fabOpen') }}</span>
    </button>

    <div
      v-show="open"
      id="kitchen-assist-panel"
      ref="panelEl"
      class="kitchen-assist__panel"
      role="dialog"
      aria-modal="false"
      :aria-label="t('kitchenAssist.panelLabel')"
    >
      <header class="kitchen-assist__head">
        <div>
          <p class="kitchen-assist__kicker">{{ t('kitchenAssist.kicker') }}</p>
          <h2 class="kitchen-assist__title">{{ t('kitchenAssist.title') }}</h2>
        </div>
        <button type="button" class="kitchen-assist__close" @click="open = false">
          {{ t('kitchenAssist.close') }}
        </button>
      </header>

      <div ref="listEl" class="kitchen-assist__list" aria-live="polite">
        <article
          v-for="(m, i) in messages"
          :key="i"
          class="kitchen-assist__msg"
          :data-role="m.role"
        >
          <p
            v-if="m.role === 'assistant' && modeLabel(m.mode)"
            class="kitchen-assist__mode"
            :data-mode="m.mode"
          >
            {{ modeLabel(m.mode) }}
          </p>
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
        <p v-if="busy" class="kitchen-assist__thinking">{{ t('kitchenAssist.thinking') }}</p>
        <p v-if="error" class="kitchen-assist__error" role="alert">{{ error }}</p>
      </div>

      <form class="kitchen-assist__form" @submit="onSubmit">
        <label class="sr-only" for="kitchen-assist-input">{{ t('kitchenAssist.inputLabel') }}</label>
        <textarea
          id="kitchen-assist-input"
          v-model="input"
          rows="2"
          maxlength="400"
          :placeholder="t('kitchenAssist.placeholder')"
          :disabled="busy"
          @keydown.enter.exact.prevent="onSubmit"
        />
        <button type="submit" class="kitchen-assist__send" :disabled="busy || !input.trim()">
          {{ t('kitchenAssist.send') }}
        </button>
      </form>
    </div>
  </div>
</template>
