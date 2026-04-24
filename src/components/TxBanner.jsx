import { useEffect } from 'react';
import { CheckIcon } from './Icons';
import { Spinner } from './Spinner';

export function TxBanner({ message, type, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: isSuccess ? 'oklch(0.13 0.01 145)' : 'oklch(0.13 0.01 46)',
      border: `1px solid ${isSuccess ? 'oklch(0.68 0.16 145 / 0.4)' : 'oklch(0.68 0.19 46 / 0.4)'}`,
      borderRadius: 10,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      fontWeight: 500,
      color: isSuccess ? 'var(--green)' : 'var(--orange)',
      zIndex: 100,
      animation: 'fadeUp 0.3s ease',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px oklch(0 0 0 / 0.4)',
    }}>
      {isSuccess
        ? <CheckIcon size={14} color="var(--green)" />
        : <Spinner size={14} color="var(--orange)" />}
      {message}
    </div>
  );
}
