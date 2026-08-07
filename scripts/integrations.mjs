/**
 * 可选第三方集成清单 — 仅拉取小型数据文件，不嵌入完整应用。
 */
export const INTEGRATIONS = [
    {
        id: 'cook-pantry',
        name: '食用手册',
        repo: 'YunYouJun/cook',
        url: 'https://cook.yunyoujun.cn',
        license: 'MIT',
        description: '按手头食材反查菜谱，含 B 站视频链接',
        dataUrl:
            'https://raw.githubusercontent.com/YunYouJun/cook/main/app/data/recipe.csv',
        output: 'public/pantry.json',
    },
];

export const INGREDIENT_EMOJI = {
    土豆: '🥔',
    胡萝卜: '🥕',
    花菜: '🥦',
    番茄: '🍅',
    西红柿: '🍅',
    黄瓜: '🥒',
    洋葱: '🧅',
    菌菇: '🍄',
    茄子: '🍆',
    豆腐: '🍲',
    包菜: '🥬',
    白菜: '🥬',
    午餐肉: '🥓',
    香肠: '🌭',
    腊肠: '🌭',
    鸡肉: '🐤',
    猪肉: '🐷',
    牛肉: '🐮',
    鸡蛋: '🥚',
    虾: '🦐',
    鱼: '🐟',
    骨头: '🦴',
    米: '🍚',
    面食: '🍝',
    面包: '🍞',
    方便面: '🍜',
};

export const INGREDIENT_ALIASES = {
    西红柿: '番茄',
    泡面: '方便面',
    马铃薯: '土豆',
};
