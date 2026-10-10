import type { StorybookConfig } from '@storybook/react-vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mergeConfig, type UserConfig } from 'vite';

const agentGuidePath = fileURLToPath(new URL('../docs/agents.md', import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/stories/Usage.mdx', '../src/stories/Agents.mdx', '../src/stories/AIconButton.stories.tsx'],
  staticDirs: [
    { from: '../docs', to: '/docs' },
    { from: '../llms.txt', to: '/llms.txt' },
  ],
  managerHead: head => `${head}<link rel="describedby" href="./llms.txt" type="text/plain" />`,
  previewHead: head => `${head}<link rel="describedby" href="./llms.txt" type="text/plain" />`,
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: { include: ['**/src/AIconButton.tsx'] },
  },
  core: { disableTelemetry: true },
  viteFinal: config => mergeConfig(config, {
    plugins: [{
      // A virtual module avoids the Markdown download route intercepting a Vite raw import.
      name: 'agent-usage-guide',
      resolveId(id) {
        if (id === 'virtual:agent-usage-guide') return '\0virtual:agent-usage-guide';
      },
      load(id) {
        if (id !== '\0virtual:agent-usage-guide') return;
        this.addWatchFile(agentGuidePath);
        return `export default ${JSON.stringify(readFileSync(agentGuidePath, 'utf8'))};`;
      },
    }],
    build: {
      rolldownOptions: {
        onwarn(warning, defaultHandler) {
          // Storybook is a browser app; React server/client boundaries do not apply here.
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
          defaultHandler(warning);
        },
      },
    },
  } satisfies UserConfig),
};
export default config;
