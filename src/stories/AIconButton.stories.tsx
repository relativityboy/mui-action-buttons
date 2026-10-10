import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Box, Button, Stack, ThemeProvider, Typography, createTheme, useTheme } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { AIconButton, type AIconButtonProps } from '../AIconButton';

type DemoArgs = AIconButtonProps & {
  delayMs: number;
  outcome: 'success' | 'error';
  failureMessage: string;
};

const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function demoProps({ delayMs, outcome, failureMessage, onClick, ...props }: DemoArgs): AIconButtonProps {
  return {
    ...props,
    onClick: async () => {
      await onClick();
      await pause(delayMs);
      if (outcome === 'error') throw new Error(failureMessage);
    },
  };
}

const icons = { None: undefined, Save: <SaveIcon />, Upload: <UploadIcon />, Delete: <DeleteIcon /> };
const basicExample = `import { AIconButton } from '@relativity/mui-action-buttons';
import '@relativity/mui-action-buttons/styles.css';
import SaveIcon from '@mui/icons-material/Save';

<AIconButton endIcon={<SaveIcon />} onClick={async () => {
  await saveChanges();
}}>
  Save changes
</AIconButton>`;

const meta = {
  title: 'Components/AIconButton',
  component: AIconButton,
  tags: ['autodocs'],
  render: args => <AIconButton {...demoProps(args)} />,
  parameters: {
    docs: {
      description: {
        component: 'A MUI Button that awaits an async action, ignores extra clicks while pending, flashes green for two seconds on success, and keeps errors visible until dismissed. The delay, outcome, and failure message controls simulate a request; they are not component props.',
      },
      source: { code: basicExample, language: 'tsx' },
    },
    controls: {
      include: ['children', 'onClick', 'startIcon', 'endIcon', 'variant', 'color', 'size', 'disabled', 'fullWidth', 'disableElevation', 'disableRipple', 'className', 'sx', 'title', 'aria-label', 'delayMs', 'outcome', 'failureMessage'],
    },
  },
  argTypes: {
    onClick: {
      control: false,
      description: 'Required async callback: () => Promise<void>. Resolve for success; throw or reject for an error. Receives no mouse event. Calls appear in the Actions panel.',
      table: { category: 'Async action', type: { summary: '() => Promise<void>' } },
    },
    children: { control: 'text', description: 'Visible label or React content.', table: { category: 'Content' } },
    startIcon: { options: Object.keys(icons), mapping: icons, control: 'select', description: 'Icon before the label. Replaced while pending or in error.', table: { category: 'Content' } },
    endIcon: { options: Object.keys(icons), mapping: icons, control: 'select', description: 'Icon after the label. Replaced while pending or in error.', table: { category: 'Content' } },
    variant: { options: ['contained', 'outlined', 'text'], control: 'inline-radio', table: { category: 'MUI appearance', defaultValue: { summary: 'contained' } } },
    color: { options: ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'inherit'], control: 'select', table: { category: 'MUI appearance', defaultValue: { summary: 'primary' } } },
    size: { options: ['small', 'medium', 'large'], control: 'inline-radio', table: { category: 'MUI appearance', defaultValue: { summary: 'medium' } } },
    disabled: { control: 'boolean', description: 'Disable the button independently of its pending state.', table: { category: 'MUI behavior' } },
    fullWidth: { control: 'boolean', description: 'Fill the available width.', table: { category: 'MUI appearance' } },
    disableElevation: { control: 'boolean', table: { category: 'MUI appearance' } },
    disableRipple: { control: 'boolean', table: { category: 'MUI behavior' } },
    className: { control: 'text', description: 'Additional CSS classes; state classes are preserved.', table: { category: 'Styling' } },
    sx: { control: 'object', description: 'MUI system styles. Use this for layout and appearance customization.', table: { category: 'Styling' } },
    title: { control: 'text', description: 'Native tooltip. Temporarily replaced by the failure message during an error.', table: { category: 'Accessibility' } },
    'aria-label': { control: 'text', description: 'Accessible name; use an explicit label with rich children or icon-only content.', table: { category: 'Accessibility' } },
    delayMs: { control: { type: 'range', min: 0, max: 5000, step: 100 }, description: 'Demo only: simulated request duration in milliseconds.', table: { category: 'Demo behavior' } },
    outcome: { options: ['success', 'error'], control: 'inline-radio', description: 'Demo only: how the simulated request completes.', table: { category: 'Demo behavior' } },
    failureMessage: { control: 'text', description: 'Demo only: message to throw on failure.', table: { category: 'Demo behavior' } },
  },
  args: {
    children: 'Save changes',
    endIcon: 'Save',
    startIcon: 'None',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    disabled: false,
    fullWidth: false,
    disableElevation: false,
    disableRipple: false,
    delayMs: 1000,
    outcome: 'success',
    failureMessage: 'Unable to save changes. Please try again.',
    onClick: fn(async () => {}),
  },
} satisfies Meta<DemoArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function PendingDemo(args: DemoArgs) {
  const { delayMs: _delay, outcome: _outcome, failureMessage, onClick, ...props } = args;
  const [pending, setPending] = React.useState(false);
  const request = React.useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null);
  React.useEffect(() => () => { request.current?.resolve(); }, []);

  const finish = (fail: boolean) => {
    if (!request.current) return;
    if (fail) request.current.reject(new Error(failureMessage));
    else request.current.resolve();
    request.current = null;
    setPending(false);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="body2">Start the action, then choose how to finish it.</Typography>
      <AIconButton {...props} onClick={async () => {
        await onClick();
        return new Promise<void>((resolve, reject) => {
          request.current = { resolve, reject };
          setPending(true);
        });
      }} />
      <Stack direction="row" spacing={1}>
        <Button disabled={!pending} onClick={() => finish(false)}>Resolve request</Button>
        <Button disabled={!pending} onClick={() => finish(true)}>Reject request</Button>
      </Stack>
    </Stack>
  );
}

export const Pending: Story = {
  render: args => <PendingDemo {...args} />,
  parameters: {
    controls: { exclude: ['delayMs', 'outcome'] },
    docs: { description: { story: 'Hold a request open until you resolve or reject it. The action button remains enabled, reports aria-busy, and ignores additional clicks.' } },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save changes' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveClass('spin-icon');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('button', { name: 'Resolve request' })).toBeEnabled();
  },
};

export const Success: Story = {
  args: { delayMs: 100 },
  parameters: { docs: { description: { story: 'The play function runs one successful action. The original icon returns, the button flashes green for two seconds, then returns to idle.' } } },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveClass('success'));
    await expect(button).not.toHaveAttribute('aria-busy');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Failure: Story = {
  args: { delayMs: 100, outcome: 'error' },
  parameters: { docs: { description: { story: 'Errors persist. Hover for the failure message. The next click dismisses the error without invoking onClick; a subsequent click runs the action again.' } } },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveClass('error'));
    await expect(button).toHaveAttribute('title', args.failureMessage);
    await expect(button).toHaveAttribute('aria-label', `Save changes: ${args.failureMessage}`);
    await expect(button).not.toHaveClass('success');
  },
};

function RetryDemo(args: DemoArgs) {
  const attempts = React.useRef(0);
  const props = demoProps({ ...args, outcome: 'success' });
  return <AIconButton {...props} onClick={async () => {
    await props.onClick();
    if (++attempts.current === 1) throw new Error(args.failureMessage);
  }} />;
}

export const RetryAfterError: Story = {
  args: { delayMs: 100 },
  render: args => <RetryDemo {...args} />,
  parameters: {
    controls: { exclude: ['outcome'] },
    docs: { description: { story: 'This example fails its first request and succeeds on retry. Click once to dismiss the error, then again to retry.' } },
  },
  play: async ({ canvasElement, args, step }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await step('First request fails', async () => {
      await userEvent.click(button);
      await waitFor(() => expect(button).toHaveClass('error'));
    });
    await step('Dismiss without sending another request', async () => {
      await userEvent.click(button);
      await expect(button).not.toHaveClass('error');
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    await step('Retry succeeds', async () => {
      await userEvent.click(button);
      await waitFor(() => expect(button).toHaveClass('success'));
      await expect(args.onClick).toHaveBeenCalledTimes(2);
    });
  },
};

export const RepeatedSuccess: Story = {
  args: { delayMs: 0 },
  parameters: { docs: { description: { story: 'Run a second action during the green flash. Its own two-second success indication starts from the new completion, rather than ending on the previous request’s timer.' } } },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveClass('success'));
    await pause(1000);
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveClass('success'));
    await pause(1100);
    await expect(button).toHaveClass('success');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(button).not.toHaveClass('success'), { timeout: 1500 });
  },
};

export const IconPlacement: Story = {
  render: args => (
    <Stack direction="row" flexWrap="wrap" gap={2}>
      <AIconButton {...demoProps(args)} startIcon={<SaveIcon />} endIcon={undefined}>Start icon</AIconButton>
      <AIconButton {...demoProps(args)} startIcon={undefined} endIcon={<UploadIcon />}>End icon</AIconButton>
      <AIconButton {...demoProps(args)} startIcon={<SaveIcon />} endIcon={<UploadIcon />}>Both icons</AIconButton>
      <AIconButton {...demoProps(args)} startIcon={undefined} endIcon={undefined}>No icon</AIconButton>
    </Stack>
  ),
  parameters: { docs: {
    description: { story: 'Click any example. Existing icons spin during the request and become warning icons on error. Without icons, feedback comes from aria-busy and the success/error background.' },
    source: { code: `<AIconButton onClick={saveChanges} startIcon={<SaveIcon />}>Start icon</AIconButton>
<AIconButton onClick={saveChanges} endIcon={<UploadIcon />}>End icon</AIconButton>
<AIconButton onClick={saveChanges} startIcon={<SaveIcon />} endIcon={<UploadIcon />}>Both icons</AIconButton>
<AIconButton onClick={saveChanges}>No icon</AIconButton>` },
  } },
};

export const Variants: Story = {
  render: args => (
    <Stack direction="row" flexWrap="wrap" gap={2}>
      {(['contained', 'outlined', 'text'] as const).map(variant => (
        <AIconButton key={variant} {...demoProps(args)} variant={variant}>{variant}</AIconButton>
      ))}
    </Stack>
  ),
  parameters: { docs: { source: { code: `(['contained', 'outlined', 'text'] as const).map(variant => (
  <AIconButton key={variant} variant={variant} endIcon={<SaveIcon />} onClick={saveChanges}>
    {variant}
  </AIconButton>
))` } } },
};

export const Sizes: Story = {
  render: args => (
    <Stack direction="row" flexWrap="wrap" alignItems="center" gap={2}>
      {(['small', 'medium', 'large'] as const).map(size => (
        <AIconButton key={size} {...demoProps(args)} size={size}>{size}</AIconButton>
      ))}
    </Stack>
  ),
  parameters: { docs: { source: { code: `(['small', 'medium', 'large'] as const).map(size => (
  <AIconButton key={size} size={size} endIcon={<SaveIcon />} onClick={saveChanges}>
    {size}
  </AIconButton>
))` } } },
};

export const Colors: Story = {
  render: args => (
    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ maxWidth: 720 }}>
      {(['primary', 'secondary', 'success', 'error', 'info', 'warning', 'inherit'] as const).map(color => (
        <AIconButton key={color} {...demoProps(args)} color={color}>{color}</AIconButton>
      ))}
    </Stack>
  ),
  parameters: { docs: {
    description: { story: 'MUI palette colors set the idle appearance. Async success and error feedback still use the package stylesheet. Use the toolbar to compare light and dark modes.' },
    source: { code: `(['primary', 'secondary', 'success', 'error', 'info', 'warning', 'inherit'] as const).map(color => (
  <AIconButton key={color} color={color} endIcon={<SaveIcon />} onClick={saveChanges}>
    {color}
  </AIconButton>
))` },
  } },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { docs: { source: { code: '<AIconButton disabled endIcon={<SaveIcon />} onClick={saveChanges}>Save changes</AIconButton>' } } },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: args => <Box sx={{ width: 360, maxWidth: '100%' }}><AIconButton {...demoProps(args)} /></Box>,
  parameters: { docs: { source: { code: `<Box sx={{ width: 360, maxWidth: '100%' }}>
  <AIconButton fullWidth endIcon={<SaveIcon />} onClick={saveChanges}>Save changes</AIconButton>
</Box>` } } },
};

export const CustomStyling: Story = {
  args: {
    className: 'custom-save-action',
    sx: { borderRadius: 999, px: 4, minWidth: 220, textTransform: 'none' },
  },
  parameters: {
    docs: {
      description: { story: 'Use sx for MUI system styling and className for app CSS. The component adds its own state classes alongside your className.' },
      source: { code: `<AIconButton
  className="custom-save-action"
  sx={{ borderRadius: 999, px: 4, minWidth: 220, textTransform: 'none' }}
  endIcon={<SaveIcon />}
  onClick={saveChanges}
>
  Save changes
</AIconButton>` },
    },
  },
};

function CustomThemeDemo(args: DemoArgs) {
  const outerTheme = useTheme();
  const theme = React.useMemo(() => createTheme(outerTheme, {
    palette: { primary: { main: '#7c3aed' } },
    components: { MuiButton: { styleOverrides: { root: { borderRadius: 12 } } } },
  }), [outerTheme]);
  return <ThemeProvider theme={theme}><AIconButton {...demoProps(args)} /></ThemeProvider>;
}

export const ThemeIntegration: Story = {
  render: args => <CustomThemeDemo {...args} />,
  parameters: {
    docs: {
      description: { story: 'A nested MUI theme changes the primary palette and button shape. AIconButton shares the application’s ThemeProvider and Emotion cache.' },
      source: { code: `const theme = createTheme({
  palette: { primary: { main: '#7c3aed' } },
  components: { MuiButton: { styleOverrides: { root: { borderRadius: 12 } } } },
});

<ThemeProvider theme={theme}>
  <AIconButton onClick={saveChanges} endIcon={<SaveIcon />}>Save changes</AIconButton>
</ThemeProvider>` },
    },
  },
};

export const AccessibleLabel: Story = {
  args: { children: <span>Save</span>, 'aria-label': 'Save account settings', outcome: 'error', delayMs: 100 },
  argTypes: { children: { control: false } },
  parameters: { docs: {
    description: { story: 'Provide aria-label when children are rich content. On failure, the component appends the failure message to that explicit accessible name.' },
    source: { code: `<AIconButton aria-label="Save account settings" endIcon={<SaveIcon />} onClick={saveChanges}>
  <span>Save</span>
</AIconButton>` },
  } },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save account settings' });
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveClass('error'));
    await expect(button).toHaveAccessibleName(`Save account settings: ${args.failureMessage}`);
  },
};
