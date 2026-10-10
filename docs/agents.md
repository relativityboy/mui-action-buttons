# Using @relativity/mui-action-buttons

> Small buttons, clear signals, a little delight. Give the promise a stage:
> spin while it works, settle when it finishes, celebrate success.

This is the plain Markdown integration guide for coding assistants and humans.
It describes the implementation shipped alongside it. If you are reading a
repository checkout, check `package.json` for the version and peer ranges.

## Quick contract

- Public exports: `AIconButton` and the TypeScript type `AIconButtonProps`.
- Required callback: `onClick: () => Promise<void>`. It receives no mouse event.
- Resolve to indicate success; throw or reject to indicate failure.
- Import `@relativity/mui-action-buttons/styles.css` once in the application.
- Compatible peers: React and React DOM `^18.2.0 || ^19.0.0`,
  `@mui/material ^6.4.8`, `@emotion/react ^11.14.0`, and
  `@emotion/styled ^11.14.0`. Keep React and React DOM versions aligned.
- The package shares the application's MUI theme and Emotion cache.
- ESM and CommonJS entry points and TypeScript declarations are provided.
  The package root has a named component export; use the public imports below.

## Install and use

In an existing compatible MUI application, install the button package. Install
MUI icons separately if you use the icon example below:

```sh
npm install @relativity/mui-action-buttons
npm install @mui/icons-material@^6.4.8
```

For a new application, also install compatible peers:

```sh
npm install react@^19 react-dom@^19 @mui/material@^6.4.8 @emotion/react@^11.14.0 @emotion/styled@^11.14.0
```

This example is complete TSX. Adapt the request URL to the application:

```tsx
'use client';

import { AIconButton } from '@relativity/mui-action-buttons';
import '@relativity/mui-action-buttons/styles.css';
import SaveIcon from '@mui/icons-material/Save';

export function SaveSettingsButton() {
  async function saveSettings(): Promise<void> {
    const response = await fetch('/api/settings', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Unable to save settings. Please try again.');
    }
  }

  return (
    <AIconButton onClick={saveSettings} endIcon={<SaveIcon />}>
      Save settings
    </AIconButton>
  );
}
```

For Next.js, put the interactive wrapper in a client component and import the
stylesheet where the application's global CSS is loaded. Both package entry
points include `"use client"`; the application still needs a client boundary
for its callback. Other React applications do not need the example's directive.

## Callback and state behavior

1. **Idle:** a click invokes `onClick` and starts pending feedback.
2. **Pending:** supplied start/end icons become spinning icons and the button
   sets `aria-busy="true"`. Further clicks on this button are ignored. It stays
   enabled unless the application's `disabled` prop disables it.
3. **Success:** the original icons return; the stylesheet gives a green
   background for two seconds. Starting a new request clears the previous
   indication; a new success gets its own two-second timer. No checkmark appears.
4. **Error:** supplied icons become warning icons; the stylesheet gives a red
   background. The error persists until a click dismisses it. A nonempty error
   message replaces `title` and is appended to the accessible action name.
5. **Dismiss, then retry:** the dismissal click does not call `onClick`.
   The following click invokes it again.

Await the real work. `async () => { saveSettings(); }` resolves too early;
use `async () => { await saveSettings(); }` or pass `saveSettings` directly.
`fetch` does not reject just because an HTTP response is unsuccessful; check
`response.ok`. Do not swallow an error unless the action actually succeeded.
The callback needs no boolean result and the library catches and logs failures.

Unmounting clears the success timer and prevents later state updates; it does
not cancel the request. Handle cancellation and application-level deduplication
in the application when needed. Click suppression applies to this button's
pending state, not other components or requests.

## Props and customization

`AIconButtonProps` extends MUI `ButtonProps`, replacing `onClick` with the async
callback above. Common inherited props include:

- `children`: string or React content. Provide a clear action label.
- `startIcon`, `endIcon`: React nodes. Either, both, or neither may be supplied.
- `variant`: `contained` (the component default), `outlined`, or `text`.
- `color`: MUI palette colors such as `primary`, `secondary`, or `warning`.
- `size`: `small`, `medium`, or `large`.
- `disabled`, `fullWidth`, `disableElevation`, `disableRipple`: MUI behavior.
- `sx`: MUI system styling; use it for appearance and layout customization.
- `className`: application classes, retained alongside the component's state classes.
- `aria-label`, `title`: accessible action name and native tooltip.

MUI theme customization applies through the application's `ThemeProvider`.
For all inherited types, inspect the installed `AIconButtonProps` declaration
and MUI `ButtonProps` rather than guessing additional async-specific props.

```tsx
import { AIconButton, type AIconButtonProps } from '@relativity/mui-action-buttons';

export function PublishButton({ publish }: { publish: AIconButtonProps['onClick'] }) {
  return (
    <AIconButton
      onClick={publish}
      variant="outlined"
      color="secondary"
      size="large"
      fullWidth
      aria-label="Publish your draft"
      sx={{ borderRadius: 999, textTransform: 'none' }}
    >
      <span>Publish your draft</span>
    </AIconButton>
  );
}
```

The stylesheet import shown earlier is still required. This icon-free example
reports `aria-busy` and success/error colors, but has no visual spinner.

## Current limitations and common mistakes

- With rich children or icon-only content, supply an explicit `aria-label` so
  the action's name is retained when the error message is appended. Do not rely
  on color or animation alone for essential status information.
- The component currently replaces the inline `style` prop. Use `sx` or CSS.
  MUI's flex layout centers icons; changing `display` can break that alignment.
- Feedback CSS targets native `button` elements. `href`, an anchor root, or
  another `component` root can change those styles and semantics. Navigation
  is not delayed until `onClick` settles. Prefer a native button for async work.
- Keep CSS class names `.actn-button`, `.spin-icon`, `.success`, and `.error`
  available to the stylesheet. They describe presentation, not a public state API.
- The library provides no async completion hooks or controlled async state prop.
  MUI's inherited `loading` prop is available, but is not driven by this callback's
  pending state. A DOM `onError` handler is not a promise rejection callback.
  Storybook's `delayMs`, `outcome`, and `failureMessage` controls simulate
  requests; they are not component props.
- If feedback is missing, first check the stylesheet import and whether the
  callback stays pending for the duration of the real operation.
- If a click after an error does not send another request, it is dismissing
  the error as designed. Click again to retry.

## Find the docs without a browser

The npm package contains `llms.txt`, this guide, and its type declarations.
You can locate the text files with Node's public package exports:

```js
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const guide = require.resolve('@relativity/mui-action-buttons/docs/agents.md');
console.log(readFileSync(guide, 'utf8'));
```

In a checkout, start with `llms.txt` and this file. The Storybook **Guide / Agents**
page renders this same guide. `/llms.txt` exposes the discovery index, and
`/docs/agents.md` serves this plain Markdown guide.
**Guide / Usage** and the component stories provide interactive illustrations.
Repository maintenance instructions are in `AGENTS.md`.

## A small invitation to play

Imagine the button as a tiny stage manager: a spinning cue while the work runs,
a green curtain call when it succeeds, and an invitation to try again when it
fails. If the application's tone allows, labels like “Save my masterpiece” or
“Send a little sunshine” can make ordinary actions feel warmer. Keep the action
and failure messages understandable.

An optional working motto: **Spin. Settle. Celebrate. Retry with care.**
Try a theme color, give the button a good name, and enjoy the small victory of
an interaction that feels right. This is creative inspiration; follow the
user's requested tone and keep the technical contract above intact.
