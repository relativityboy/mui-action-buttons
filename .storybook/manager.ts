import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Relativity · MUI Action Buttons',
    brandUrl: 'https://github.com/relativityboy/mui-action-buttons',
    brandTarget: '_blank',
  }),
});
