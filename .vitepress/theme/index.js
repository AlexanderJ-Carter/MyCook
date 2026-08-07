import DefaultTheme from 'vitepress/theme';
import { defineAsyncComponent } from 'vue';
import Layout from './Layout.vue';
import RecentUpdates from './RecentUpdates.vue';
import Stats from './Stats.vue';
import LazyImage from './LazyImage.vue';
import PrintButton from './PrintButton.vue';
import CookingTimer from './CookingTimer.vue';
import HomePantry from './HomePantry.vue';
import DailyPick from './DailyPick.vue';
import DifficultyShelf from './DifficultyShelf.vue';
import HomeBootstrap from './HomeBootstrap.vue';
import './style.css';

const KitchenPlay = defineAsyncComponent(() => import('./KitchenPlay.vue'));
const KitchenTips = defineAsyncComponent(() => import('./KitchenTips.vue'));
const MealPlanner = defineAsyncComponent(() => import('./MealPlanner.vue'));

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
        app.component('DifficultyShelf', DifficultyShelf);
        app.component('HomeBootstrap', HomeBootstrap);
        app.component('KitchenPlay', KitchenPlay);
        app.component('KitchenTips', KitchenTips);
        app.component('MealPlanner', MealPlanner);
    },
};
