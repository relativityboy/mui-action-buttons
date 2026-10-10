# @Relativity - Action Buttons for MUI

![Tests](https://github.com/relativityboy/mui-action-buttons/actions/workflows/ci.yml/badge.svg)

If you want low-key responsiveness to api calls or user actions that should give the user "just a little" feedback
these buttons should be perfect for you.

`npm install @relativity/mui-action-buttons`

For coding assistants, start with the [agent usage guide](docs/agents.md) or
[llms.txt](llms.txt). They include complete examples, the async callback contract,
accessibility notes, common mistakes, and a little playful inspiration. Both
files ship in the npm package. Storybook **Guide / Agents** renders the same guide.

The package supports React 18.2 and React 19 with MUI 6 and Emotion 11.
React, React DOM, MUI, and Emotion are peer dependencies so the button shares
the application's React instance, theme, and styling cache. Both CommonJS and
ES module entry points include the `"use client"` directive for Next.js.

The first button I've implemented is the `AIconButton`. It takes a string, and an `endIcon` or `startIcon` prop.

Example save button: 
```tsx
import { AIconButton } from "@relativity/mui-action-buttons"
import "@relativity/mui-action-buttons/styles.css"
import SaveIcon from "@mui/icons-material/Save"

async function handleSave() {
    //your fancy long-running code goes here
    await new Promise(r => setTimeout(r, 3000))
}

//...

<AIconButton 
    endIcon={<SaveIcon/>} 
    onClick={handleSave}
    >SAVE
</AIconButton>
```

![save.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/save.png)

For async calls, a spinner replaces the icon you passed in until it completes. 

![spinning.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/spinning.png)

If you click a button and the handler completes without error, the original icon returns and the button changes color for 2 seconds.

![success.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/success.png)

If the handler throws an error, the button turns red, and displays a warning icon until clicked again.

![error.png](https://raw.githubusercontent.com/relativityboy/mui-action-buttons/main/docs/img/error.png)

## Local Storybook

Use Node 22.12 or newer (`nvm use` selects Node 24), then run:

```sh
npm ci
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006). **Guide / Usage** covers
installation, the promise lifecycle, API examples, and current limitations.
**Components / AIconButton** includes editable controls, callback actions,
light/dark themes, pending/success/error states, dismissal and retry, repeated
successes, icon placement, variants, sizes, colors, disabled/full-width buttons,
styling, and theme integration. Demo requests run locally without a backend.
If port 6006 is occupied, choose another with `npm run storybook -- --port 6007`.

```sh
npm run build-storybook       # Static site in storybook-static/
npm run typecheck:storybook   # Check configuration and stories
npm run storybook:install-browser # Install Chromium once
npm run test:storybook        # Browser rendering and interaction tests
npm run test:storybook:watch  # Watch stories during development
```

The Accessibility panel reports findings, including existing component
limitations; these are warnings in story tests. Storybook dependencies are
development-only. The published package contains library assets, the plain
Markdown agent guide, and its discovery index.

The dependency override for `@istanbuljs/load-nyc-config` selects `js-yaml` 4,
which removes the legacy `argparse` / `sprintf-js` dependency chain affected by
[GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c).
The config loader uses the supported `load()` API. Remove the override when the
upstream loader updates its dependency to an unaffected version.

