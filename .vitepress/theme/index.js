import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import RecentUpdates from './RecentUpdates.vue';
import './style.css';

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('RecentUpdates', RecentUpdates);
    },
};
