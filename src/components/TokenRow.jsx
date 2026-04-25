import { TokenLogo } from './TokenLogo';
import { ClaimButton } from './ClaimButton';

export function TokenRow({ token, claimState, onClaim, index }) {
  const claimed = claimState === 'success';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 24px',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.15s ease',
        opacity: claimed ? 0.45 : 1,
        animation: `fadeUp 0.4s ease ${index * 0.06}s both`,
      }}
      onMouseEnter={(e) => !claimed && (e.currentTarget.style.background = 'var(--bg-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <TokenLogo symbol={token.symbol} color={token.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{token.symbol}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{token.name}</div>
      </div>
      <div style={{ textAlign: 'right', marginRight: 16 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'Space Mono, monospace',
          color: claimed ? 'var(--green)' : 'var(--text)',
          letterSpacing: '-0.3px',
        }}>
          {claimed ? '✓ ' : ''}{(token.amount / 1000000).toFixed(6)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>${token.usd}</div>
      </div>
      <ClaimButton state={claimState || 'idle'} onClick={onClaim} small />
    </div>
  );
}
