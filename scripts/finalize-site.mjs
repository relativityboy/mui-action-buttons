import { copyFile, mkdir, writeFile } from 'node:fs/promises';

const output = new URL('../site-dist/', import.meta.url);
await mkdir(new URL('docs/', output), { recursive: true });
await copyFile(new URL('../docs/agents.md', import.meta.url), new URL('docs/agents.md', output));
await copyFile(new URL('../llms.txt', import.meta.url), new URL('llms.txt', output));
await writeFile(new URL('.nojekyll', output), '');
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://relativityboy.github.io/mui-action-buttons/</loc></url>
  <url><loc>https://relativityboy.github.io/mui-action-buttons/storybook/</loc></url>
</urlset>
`);
