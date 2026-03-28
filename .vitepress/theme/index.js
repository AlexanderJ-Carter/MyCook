import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import RecentUpdates from './RecentUpdates.vue';
import Stats from './Stats.vue';
import LazyImage from './LazyImage.vue';
import PWA from './PWA.vue';
import SearchShortcut from './SearchShortcut.vue';
import PrintButton from './PrintButton.vue';
import CookingTimer from './CookingTimer.vue';
import Favorites from './Favorites.vue';
import './style.css';

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('RecentUpdates', RecentUpdates);
        app.component('Stats', Stats);
        app.component('LazyImage', LazyImage);
        app.component('PWA', PWA);
        app.component('SearchShortcut', SearchShortcut);
        app.component('PrintButton', PrintButton);
        app.component('CookingTimer', CookingTimer);
        app.component('Favorites', Favorites);
    },
};
