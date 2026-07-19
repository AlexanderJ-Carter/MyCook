import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import RecentUpdates from './RecentUpdates.vue';
import Stats from './Stats.vue';
import LazyImage from './LazyImage.vue';
import PrintButton from './PrintButton.vue';
import CookingTimer from './CookingTimer.vue';
import HomePantry from './HomePantry.vue';
import DailyPick from './DailyPick.vue';
import './style.css';

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('RecentUpdates', RecentUpdates);
        app.component('Stats', Stats);
        app.component('LazyImage', LazyImage);
        app.component('PrintButton', PrintButton);
        app.component('CookingTimer', CookingTimer);
        app.component('HomePantry', HomePantry);
        app.component('DailyPick', DailyPick);
    },
};
