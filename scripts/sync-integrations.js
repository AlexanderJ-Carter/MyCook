/**
 * 同步可选集成数据（默认：YunYouJun/cook 的 recipe.csv → pantry.json）
 * 跳过：SKIP_INTEGRATIONS=1
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    INTEGRATIONS,
    INGREDIENT_EMOJI,
    INGREDIENT_ALIASES,
} from './integrations.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function normalizeIngredient(name) {
    const trimmed = String(name || '').trim();
    return INGREDIENT_ALIASES[trimmed] || trimmed;
}

function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = (cols[idx] || '').trim();
        });
        if (!row.name) continue;
        row.stuff = row.stuff
            ? row.stuff.split(/[、,，]/).map((s) => normalizeIngredient(s)).filter(Boolean)
            : [];
        row.tools = row.tools
            ? row.tools.split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
            : [];
        row.methods = row.methods
            ? row.methods.split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
            : [];
        rows.push({
            name: row.name,
            stuff: row.stuff,
            bv: row.bv || '',
            difficulty: row.difficulty || '',
            tags: row.tags || '',
            methods: row.methods,
            tools: row.tools,
        });
    }
    return rows;
}

function buildIngredientChips(recipes) {
    const freq = new Map();
    for (const recipe of recipes) {
        for (const item of recipe.stuff) {
            freq.set(item, (freq.get(item) || 0) + 1);
        }
    }
    return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 28)
        .map(([name, count]) => ({
            name,
            emoji: INGREDIENT_EMOJI[name] || '🥬',
            count,
        }));
}

async function syncIntegration(integration) {
    const outPath = path.join(ROOT, integration.output);
    const empty = {
        id: integration.id,
        source: integration.repo,
        sourceUrl: integration.url,
        enabled: false,
        recipes: [],
        ingredients: [],
        total: 0,
        generatedAt: new Date().toISOString(),
    };

    try {
        const res = await fetch(integration.dataUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const csv = await res.text();
        const recipes = parseCsv(csv);
        const payload = {
            id: integration.id,
            source: integration.repo,
            sourceUrl: integration.url,
            license: integration.license,
            description: integration.description,
            enabled: true,
            total: recipes.length,
            ingredients: buildIngredientChips(recipes),
            recipes,
            generatedAt: new Date().toISOString(),
        };
        if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');
        console.log(
            `[sync-integrations] ${integration.id}: ${recipes.length} recipes, ${payload.ingredients.length} ingredients`,
        );
        return payload;
    } catch (err) {
        console.warn(`[sync-integrations] ${integration.id} failed:`, err.message);
        if (fs.existsSync(outPath)) {
            try {
                const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
                if (existing.enabled && existing.recipes?.length) {
                    console.log(
                        `[sync-integrations] ${integration.id}: keep existing ${existing.recipes.length} recipes`,
                    );
                    return existing;
                }
            } catch {
                /* fall through */
            }
        }
        if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
        fs.writeFileSync(
            outPath,
            JSON.stringify({ ...empty, error: err.message }),
            'utf8',
        );
        return empty;
    }
}

async function main() {
    if (process.env.SKIP_INTEGRATIONS === '1') {
        console.log('[sync-integrations] SKIP_INTEGRATIONS=1, skip.');
        return;
    }
    for (const integration of INTEGRATIONS) {
        await syncIntegration(integration);
    }
}

main();
