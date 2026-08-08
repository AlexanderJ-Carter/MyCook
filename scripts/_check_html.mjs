#!/usr/bin/env node
/** Fetch a URL and report script types / #app content (Rocket Loader diagnostics). */

const url = process.argv[2];
if (!url) {
  console.error('usage: node _check_html.mjs <url>');
  process.exit(2);
}

const res = await fetch(url, {
  headers: { 'User-Agent': 'MyCook-html-check/1.0' },
  redirect: 'follow',
});
const html = await res.text();
const types = [...html.matchAll(/type="([^"]*javascript[^"]*)"/g)].map((m) => m[1]);
const app = (html.match(/id="app">([\s\S]*?)<\/div>/) || [])[1] || '';
const title = (html.match(/<title>([^<]+)/) || [])[1];

console.log('status', res.status);
console.log('len', html.length);
console.log('title', title);
console.log('app_len', app.trim().length);
console.log('app_snip', app.trim().slice(0, 160).replace(/\n/g, ' '));
console.log('types', [...new Set(types)].slice(0, 8));
console.log('rocket', html.includes('rocket-loader'));
console.log(
  'rocket_rewritten',
  types.some((t) => /^[0-9a-f]{20,}-/.test(t)),
);
console.log('cfasync_false', html.includes('data-cfasync="false"'));
console.log('friendly_404', html.includes('找不到') || html.includes('not-found'));
