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
import HomeCredits from './HomeCredits.vue';
import './style.css';

const KitchenPlay = defineAsyncComponent(() => import('./KitchenPlay.vue'));
const KitchenTips = defineAsyncComponent(() => import('./KitchenTips.vue'));
const MealPlanner = defineAsyncComponent(() => import('./MealPlanner.vue'));
const HomePlayNav = defineAsyncComponent(() => import('./HomePlayNav.vue'));

function isHowToCookImages(href) {
    return typeof href === 'string' && href.includes('/howtocook-images');
}

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app, router }) {
        app.component('RecentUpdates', RecentUpdates);
        app.component('Stats', Stats);
        app.component('LazyImage', LazyImage);
        app.component('PrintButton', PrintButton);
        app.component('CookingTimer', CookingTimer);
        app.component('HomePantry', HomePantry);
        app.component('DailyPick', DailyPick);
        app.component('DifficultyShelf', DifficultyShelf);
        app.component('HomeBootstrap', HomeBootstrap);
        app.component('HomeCredits', HomeCredits);
        app.component('KitchenPlay', KitchenPlay);
        app.component('KitchenTips', KitchenTips);
        app.component('MealPlanner', MealPlanner);
        app.component('HomePlayNav', HomePlayNav);

        // 图片版是独立 SPA，不是 VitePress 页面；客户端路由会误判成 404
        if (typeof window !== 'undefined') {
            const previous = router.onBeforeRouteChange;
            router.onBeforeRouteChange = (href) => {
                if (isHowToCookImages(href)) {
                    window.location.assign(href);
                    return false;
                }
                return previous?.(href);
            };
        }
    },
};
