import React from 'react';
import { useGame } from "..\\..\\hooks\\use-game";
import { importFromFile, deserializeState } from '../../game/save';

export default function LoadModal({
  open,
  onClose,
  autoFocusText




}: {open: boolean;onClose: () => void;autoFocusText?: boolean;}) {
  const { dispatch } = useGame();
  const [text, setText] = React.useState('');
  const [error, setError] = React.useState<string | undefined>();
  const textReference = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (open && autoFocusText && textReference.current) {
      textReference.current.focus();
    }
  }, [open, autoFocusText]);

  const onPasteLoad = () => {
    try {
      const state = deserializeState(text);
      dispatch({ type: 'LOAD_STATE', payload: state } as any);
      onClose();
    } catch (error_: any) {
      setError(error_?.message || 'Failed to parse/validate save');
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const state = await importFromFile(file);
      dispatch({ type: 'LOAD_STATE', payload: state } as any);
      onClose();
    } catch (error_: any) {
      setError(error_?.message || 'Failed to load file');
    } finally {
      e.currentTarget.value = '';
    }
  };

  if (!open) return;
  return (
    <div role="dialog" aria-modal="true" aria-label="Load Game" style={styles.backdrop}>
      <div style={styles.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Load Game</h2>
          <button onClick={onClose} aria-label="close load">
            ✕
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Paste JSON</label>
          <textarea
            ref={textReference}
            aria-label="save json"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            style={{ width: '100%' }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={onPasteLoad}>Load from Text</button>
            <button onClick={() => {
              const input = document.querySelector('#load-file-input');
              if (input instanceof HTMLInputElement) {
                input.click();
              }
            }}>
              Choose File…
            </button>
            <input
              id="load-file-input"
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={onFileChange} />

          </div>
          {error &&
          <div role="alert" style={{ color: 'salmon', marginTop: 8 }}>
              {error}
            </div>
          }
        </div>
      </div>
    </div>);

}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  panel: {
    width: 520,
    background: 'var(--color-bg, #1e1e1e)',
    color: 'var(--color-fg, #f0f0f0)',
    padding: 16,
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
  }
};