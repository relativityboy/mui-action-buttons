import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkNpmVersion } from '../scripts/check-npm-version.mjs';

const name = '@relativity/mui-action-buttons';
const manifest = { name, version: '1.0.0' };
const published = {
  name,
  versions: { '0.3.2': {}, '1.0.0': {} },
  'dist-tags': { latest: '1.0.0' },
};
const registryResponse = (metadata = published) => async () => new Response(JSON.stringify(metadata));

test('skips when the repository version matches npm latest', async () => {
  assert.deepEqual(await checkNpmVersion(manifest, registryResponse()), { shouldPublish: false, latest: '1.0.0' });
});

test('skips an existing version even when npm latest differs', async () => {
  assert.deepEqual(await checkNpmVersion({ name, version: '0.3.2' }, registryResponse()), { shouldPublish: false, latest: '1.0.0' });
});

test('allows an unpublished version and checks the public scoped registry URL', async () => {
  const result = await checkNpmVersion({ name, version: '1.1.0' }, async (url, options) => {
    assert.equal(url, 'https://registry.npmjs.org/%40relativity%2Fmui-action-buttons');
    assert.equal(options.headers['Cache-Control'], 'no-cache');
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify(published));
  });
  assert.deepEqual(result, { shouldPublish: true, latest: '1.0.0' });
});

test('allows the first release only when the package lookup returns 404', async () => {
  assert.deepEqual(await checkNpmVersion(manifest, async () => new Response(null, { status: 404 })), {
    shouldPublish: true, latest: null,
  });
});

test('allows a new stable version when the registry has only prereleases', async () => {
  assert.deepEqual(await checkNpmVersion(manifest, registryResponse({ name, versions: { '1.0.0-beta.1': {} }, 'dist-tags': { beta: '1.0.0-beta.1' } })), {
    shouldPublish: true, latest: null,
  });
});

for (const status of [401, 403, 429, 500, 503]) {
  test(`stops publishing on registry HTTP ${status}`, async () => {
    await assert.rejects(checkNpmVersion(manifest, async () => new Response(null, { status })), /lookup failed/);
  });
}

test('stops publishing on network failures', async () => {
  await assert.rejects(checkNpmVersion(manifest, async () => { throw new Error('Network unavailable'); }), /Network unavailable/);
});

test('stops publishing on invalid JSON', async () => {
  await assert.rejects(checkNpmVersion(manifest, async () => new Response('not JSON')), SyntaxError);
});

test('stops publishing on malformed registry metadata', async () => {
  for (const metadata of [null, {}, { name, versions: [] }, { name: 'another-package', versions: {} },
    { name, versions: {}, 'dist-tags': { latest: '1.0.0' } }]) {
    await assert.rejects(checkNpmVersion(manifest, registryResponse(metadata)), /Invalid npm registry metadata/);
  }
});

test('refuses private or incomplete package manifests before looking up npm', async () => {
  for (const invalid of [{ ...manifest, private: true }, { name }, { version: '1.0.0' }]) {
    await assert.rejects(checkNpmVersion(invalid, async () => { assert.fail('must not query npm'); }), /public package/);
  }
});
