import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, relative } from 'node:path';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../site-dist/', import.meta.url));
const prefix = '/mui-action-buttons/';
const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/markdown', '.txt': 'text/plain', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) throw new Error('Unknown site path');
    let filename = resolve(root, pathname.slice(prefix.length));
    if (relative(root, filename).startsWith('..')) throw new Error('Outside site');
    if ((await stat(filename)).isDirectory()) filename = resolve(filename, 'index.html');
    response.setHeader('Content-Type', contentTypes[extname(filename)] ?? 'application/octet-stream');
    response.end(await readFile(filename));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
let browser;
let base;

before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}${prefix}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
});

test('landing page works at the project path, on mobile, and copies the install command', async () => {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  try {
    const page = await context.newPage();
    const errors = [];
    const failedAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedAssets.push(response.url()); });
    await page.goto(base);
    await page.getByRole('button', { name: 'Save my masterpiece', exact: true }).waitFor();
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /Good buttons.*follow through/s);
    await page.getByRole('button', { name: 'Copy install command' }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'npm install @relativity/mui-action-buttons');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'No horizontal overflow on mobile');
    await page.getByRole('link', { name: 'Explore Storybook' }).click();
    await page.waitForURL(`${base}storybook/`);
    assert.deepEqual(errors, []);
    assert.deepEqual(failedAssets, []);
  } finally { await context.close(); }
});

test('live button reports pending and success while ignoring extra clicks', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(base);
    const button = page.getByRole('button', { name: 'Save my masterpiece', exact: true });
    await button.click();
    assert.equal(await button.getAttribute('aria-busy'), 'true');
    await button.click();
    await page.waitForFunction(() => document.querySelector('button.actn-button')?.classList.contains('success'));
    assert.equal(await button.getAttribute('aria-busy'), null);
    assert.match(await page.locator('.demo-status').innerText(), /^Saved\./);
  } finally { await page.close(); }
});

test('error path dismisses first, then retries successfully', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(base);
    await page.getByRole('button', { name: 'Try a hiccup' }).click();
    const button = page.locator('button.actn-button');
    await button.click();
    await page.waitForFunction(() => document.querySelector('button.actn-button')?.classList.contains('error'));
    assert.match(await button.getAttribute('aria-label'), /Save my masterpiece: A simulated hiccup/);
    await button.click();
    assert.equal(await button.getAttribute('aria-busy'), null);
    assert.match(await page.locator('.demo-status').innerText(), /^Error cleared\./);
    await button.click();
    await page.waitForFunction(() => document.querySelector('button.actn-button')?.classList.contains('success'));
    assert.match(await page.locator('.demo-status').innerText(), /^Saved\./);
  } finally { await page.close(); }
});

test('Storybook and the agent text routes work inside the project subdirectory', async () => {
  for (const [path, source] of [
    ['llms.txt', '../llms.txt'],
    ['docs/agents.md', '../docs/agents.md'],
    ['storybook/llms.txt', '../llms.txt'],
    ['storybook/docs/agents.md', '../docs/agents.md'],
  ]) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200, path);
    assert.equal(await response.text(), await readFile(new URL(source, import.meta.url), 'utf8'));
  }
  const page = await browser.newPage();
  try {
    const errors = [];
    const failedAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedAssets.push(response.url()); });
    await page.goto(new URL('storybook/?path=/docs/guide-agents--docs', base).href);
    const frame = page.frameLocator('#storybook-preview-iframe');
    await frame.locator('h1').filter({ hasText: 'Using @relativity/mui-action-buttons' }).waitFor();
    const href = await frame.getByRole('link', { name: 'Read the plain Markdown guide' }).getAttribute('href');
    const download = await fetch(new URL(href, `${base}storybook/iframe.html`));
    assert.equal(await download.text(), await readFile(new URL('../docs/agents.md', import.meta.url), 'utf8'));
    assert.deepEqual(errors, []);
    assert.deepEqual(failedAssets, []);
  } finally { await page.close(); }
});
