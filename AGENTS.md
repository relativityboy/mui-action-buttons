# Working on mui-action-buttons

For integration into another application, read [docs/agents.md](docs/agents.md).
These instructions concern maintaining this repository.

## Find the implementation

- `src/AIconButton.tsx`: callback handling, state, accessible labels, and MUI props.
- `src/styles.css`: pending animation and success/error feedback.
- `src/index.ts`: public exports.
- `package.json` and `rollup.config.js`: package exports, peers, and shared dependencies.
- `src/stories/AIconButton.stories.tsx`: interactive examples and browser checks.
- `docs/agents.md`: plain Markdown usage contract, also rendered in Storybook.
- `website/`: small static landing page with a real React button demo.
- `scripts/finalize-site.mjs`: assembles public agent docs with the site build.

## Preserve the contract

Keep React, React DOM, MUI, and Emotion shared with the consuming application.
Keep the public stylesheet export, ESM/CommonJS loading, and client directives
working. Preserve dismiss-before-retry behavior and per-success timers unless
the requested change deliberately revises them. Keep MUI's flex alignment.

When changing public behavior, update the usage guide, relevant stories, and
examples together. Distinguish current limitations from supported features.
Keep `llms.txt` links and the guide's packaged paths accurate. The guide is a
single source for the Storybook agent page; edit the Markdown directly.

## Verify relevant changes

Use Node 24 (`nvm use`) and `npm ci`. Available commands:

- `npm test -- --runInBand`: component tests.
- `npm run test:package`: library build and Node ESM/CommonJS package checks.
- `npm run test:publish`: npm version gate tests (mocked registry; never publishes).
- `npm run typecheck:storybook`: story/configuration type checks.
- `npm run build-storybook`: static documentation build.
- `npm run storybook:install-browser`: install Chromium before browser tests.
- `npm run test:storybook`: rendered stories and async interactions in Chromium.
- `npm run storybook`: local server; use `-- --port 6007` if port 6006 is occupied.
- `npm run typecheck:site` and `npm run build:site`: check and build the landing page plus Storybook.
- `npm run test:site`: check the static site in Chromium at the GitHub Pages project path.
- `npm run preview:site`: preview the complete build on port 4173.

Pages deployment follows successful checks on `main`. Keep site assets and
documentation links working under `/mui-action-buttons/`, and keep website
source and generated `site-dist/` out of the npm package.

The separate `publish.yml` workflow checks npm before installing dependencies,
skips existing versions, and requires all tests and type checks before publishing
the verified tarball. Keep npm OIDC permissions confined to its publish job.
See README.md for the npm trusted publisher configuration and release procedure.

Run checks relevant to the change. For packaging changes, inspect
`npm pack --dry-run` to confirm that the published package contains its docs
and library assets and excludes development tooling.

## Room for a little delight

Small, clear interactions can have personality. Feel free to make examples
warm and playful when appropriate: **Spin. Settle. Celebrate. Retry with care.**
Keep behavior accurate, action labels clear, and the user's requested tone in view.
