/**
 * 构建后冒烟校验 — 本地与 CI 可运行
 * 用法：npm run generate && node scripts/validate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    getRecipeMarkdown,
    listPantryIngredients,
    randomRecipe,
    searchRecipes,
    searchTips,
} from './mcp-tools.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');

const REQUIRED_JSON = [
    'recipes-index.json',
    'stats.json',
    'recent.json',
    'tips-index.json',
    'openapi.json',
    'agent-discovery.json',
];

let failed = 0;

function ok(label) {
    console.log(`  ✓ ${label}`);
}

function fail(label, detail) {
    failed += 1;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ''}`);
}

console.log('[validate] JSON artifacts');
for (const name of REQUIRED_JSON) {
    const filePath = path.join(PUBLIC, name);
    if (!fs.existsSync(filePath)) {
        fail(name, 'missing');
        continue;
    }
    try {
        JSON.parse(fs.readFileSync(filePath, 'utf8'));
        ok(name);
    } catch (err) {
        fail(name, err.message);
    }
}

console.log('[validate] MCP tools');
const search = searchRecipes({ query: '鸡蛋', limit: 3 });
if (search.items?.length) ok(`search_recipes (${search.items.length} hits)`);
else fail('search_recipes', 'no results');

const tips = searchTips({ query: '炒', limit: 3 });
if (tips.total > 0) ok(`search_tips (${tips.total} total)`);
else fail('search_tips', 'empty index');

const random = randomRecipe();
if (random.found) ok(`random_recipe → ${random.title}`);
else fail('random_recipe');

const pantry = listPantryIngredients();
if (pantry.enabled) ok(`pantry (${pantry.ingredients.length} ingredients)`);
else console.log('  · pantry disabled (offline ok)');

const md = getRecipeMarkdown('/howtocook/dishes/vegetable_dish/西红柿炒鸡蛋');
if (md.found && md.markdown) ok(`get_recipe_markdown (${md.tokens} tokens)`);
else fail('get_recipe_markdown');

console.log('[validate] Well-known');
for (const rel of [
    '.well-known/mcp/server-card.json',
    '.well-known/agent-skills/index.json',
]) {
    const filePath = path.join(PUBLIC, rel);
    if (fs.existsSync(filePath)) ok(rel);
    else fail(rel, 'missing');
}

if (failed) {
    console.error(`\n[validate] ${failed} check(s) failed`);
    process.exit(1);
}

console.log('\n[validate] all checks passed');
