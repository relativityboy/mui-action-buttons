import { appendFile, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const registry = 'https://registry.npmjs.org/';

// No installed dependencies or credentials are needed for this public lookup.
export async function checkNpmVersion({ name, version, private: isPrivate }, fetchImpl = fetch) {
  if (typeof name !== 'string' || !name || typeof version !== 'string' || !version || isPrivate) {
    throw new Error('Expected a public package with a name and version.');
  }

  const response = await fetchImpl(`${registry}${encodeURIComponent(name)}`, {
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(30_000),
  });

  if (response.status === 404) {
    return { shouldPublish: true, latest: null };
  }
  if (!response.ok) {
    throw new Error(`npm registry lookup failed (HTTP ${response.status}); publishing is stopped.`);
  }

  const metadata = await response.json();
  const versions = metadata?.versions;
  const latest = metadata?.['dist-tags']?.latest ?? null;
  if (metadata?.name !== name || !versions || typeof versions !== 'object' || Array.isArray(versions)
    || (latest !== null && (typeof latest !== 'string' || !Object.hasOwn(versions, latest)))) {
    throw new Error('Invalid npm registry metadata; publishing is stopped.');
  }

  // Checking all versions also catches repeats of releases that are no longer latest.
  return { shouldPublish: !Object.hasOwn(versions, version), latest };
}

export async function main() {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const { shouldPublish, latest } = await checkNpmVersion(manifest);
  console.log(`Repository: ${manifest.name}@${manifest.version}; npm latest: ${latest ?? '(not published)'}.`);
  console.log(shouldPublish ? 'Version is unpublished; run all checks before publishing.' : 'Version already exists on npm; skip publishing.');
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `should_publish=${shouldPublish}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
