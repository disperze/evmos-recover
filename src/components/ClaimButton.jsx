import { Spinner } from './Spinner';
import { CheckIcon } from './Icons';

export function ClaimButton({ state, onClick, small = false }) {
  const base = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: small ? 36 : 44,
    padding: small ? '0 18px' : '0 24px',
    borderRadius: 8,
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: small ? 13 : 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.18s ease',
    flexShrink: 0,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  };

  if (state === 'idle') return (
    <button
      onClick={onClick}
      style={{
        ...base,
        background: 'var(--orange-dim)',
        color: 'var(--orange)',
        border: '1px solid oklch(0.68 0.19 46 / 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'oklch(0.68 0.19 46 / 0.22)';
        e.currentTarget.style.borderColor = 'oklch(0.68 0.19 46 / 0.55)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--orange-dim)';
        e.currentTarget.style.borderColor = 'oklch(0.68 0.19 46 / 0.3)';
      }}
    >
      Claim
    </button>
  );

  if (state === 'pending') return (
    <button disabled style={{
      ...base,
      background: 'oklch(0.68 0.19 46 / 0.08)',
      color: 'var(--orange)',
      border: '1px solid oklch(0.68 0.19 46 / 0.2)',
      cursor: 'not-allowed',
    }}>
      <Spinner size={13} />
      Pending…
    </button>
  );

  if (state === 'success') return (
    <button disabled style={{
      ...base,
      background: 'var(--green-dim)',
      color: 'var(--green)',
      border: '1px solid oklch(0.68 0.16 145 / 0.3)',
      cursor: 'default',
      animation: 'successPop 0.35s ease',
    }}>
      <CheckIcon size={13} color="var(--green)" />
      Claimed
    </button>
  );

  return null;
}
