import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '../src/styles.css';

const themes = {
  light: createTheme({ palette: { mode: 'light' } }),
  dark: createTheme({ palette: { mode: 'dark' } }),
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'MUI color scheme',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light theme', icon: 'sun' },
          { value: 'dark', title: 'Dark theme', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => (
      <ThemeProvider theme={themes[context.globals.theme === 'dark' ? 'dark' : 'light']}>
        <CssBaseline />
        <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    controls: { expanded: true, sort: 'requiredFirst' },
    options: { storySort: { order: ['Guide', 'Components'] } },
    docs: { codePanel: true },
    // Report existing component accessibility limitations without hiding them.
    a11y: { test: 'todo' },
  },
};

export default preview;
