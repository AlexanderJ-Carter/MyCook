import { computed, unref } from 'vue';
import { useData, useRoute } from 'vitepress';
import { messages } from '../i18n/messages.js';

function get(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function interpolate(str, vars = {}) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, (_, key) =>
        vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : `{${key}}`,
    );
}

export function resolveLocale(lang, path) {
    if (path === '/en' || path.startsWith('/en/')) return 'en-US';
    if (lang?.startsWith('en')) return 'en-US';
    return 'zh-CN';
}

export function useI18n() {
    const { lang } = useData();
    const route = useRoute();

    const locale = computed(() =>
        resolveLocale(unref(lang), unref(route.path) || '/'),
    );
    const isEn = computed(() => locale.value === 'en-US');

    function t(key, vars) {
        const value = get(messages[locale.value], key) ?? get(messages['zh-CN'], key) ?? key;
        return typeof value === 'string' ? interpolate(value, vars) : value;
    }

    function dateLocale() {
        return locale.value === 'en-US' ? 'en-US' : 'zh-CN';
    }

    return { locale, isEn, t, dateLocale };
}
