import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { AIconButton } from '../src/AIconButton';
import '../src/styles.css';

const theme = createTheme({
  palette: { primary: { main: '#2d4160' } },
  typography: { fontFamily: 'ui-sans-serif, system-ui, sans-serif' },
});

function Demo() {
  const [path, setPath] = React.useState<'success' | 'retry'>('success');
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error' | 'dismissed'>('idle');
  const failedOnce = React.useRef(false);
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  function choosePath(next: 'success' | 'retry') {
    if (next === path) return;
    setPath(next);
    setStatus('idle');
    failedOnce.current = false;
  }

  async function save(): Promise<void> {
    setStatus('pending');
    await new Promise<void>(resolve => setTimeout(resolve, 1200));
    if (!mounted.current) return;
    if (path === 'retry' && !failedOnce.current) {
      failedOnce.current = true;
      setStatus('error');
      throw new Error('A simulated hiccup. Clear the error, then retry.');
    }
    setStatus('success');
  }

  const messages = {
    idle: 'Ready when you are. A small save, a little feedback.',
    pending: 'Saving… extra clicks won’t start another request.',
    success: 'Saved. A tiny green celebration, then back to ready.',
    error: 'A little hiccup. Click once to clear it, then again to retry.',
    dismissed: 'Error cleared. Click Save my masterpiece again to retry.',
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="demo-modes" role="group" aria-label="Choose the demo path">
        <button type="button" aria-pressed={path === 'success'} disabled={status === 'pending'} onClick={() => choosePath('success')}>Smooth sailing</button>
        <button type="button" aria-pressed={path === 'retry'} disabled={status === 'pending'} onClick={() => choosePath('retry')}>Try a hiccup</button>
      </div>
      <div className="button-stage" onClickCapture={event => {
        if ((event.target as Element).closest('button.actn-button.error')) setStatus('dismissed');
      }}>
        <AIconButton key={path} onClick={save} endIcon={<SaveIcon />} sx={{ borderRadius: '7px', px: 2.5, py: 1.25, textTransform: 'none', fontWeight: 500, fontSize: 13 }}>
          Save my masterpiece
        </AIconButton>
      </div>
      <p className="demo-status" role="status" aria-live="polite">{messages[status]}</p>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('demo-root')!).render(<Demo />);

const copyButton = document.getElementById('copy-install') as HTMLButtonElement;
const copyStatus = document.getElementById('copy-status')!;
let copyTimer: ReturnType<typeof setTimeout> | undefined;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('npm install @relativity/mui-action-buttons');
    copyButton.textContent = 'Copied!';
    copyStatus.textContent = 'Install command copied.';
  } catch {
    copyStatus.textContent = 'Copy unavailable. Select the install command to copy it manually.';
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
});
