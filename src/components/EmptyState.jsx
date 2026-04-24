import { CheckIcon } from './Icons';

export function EmptyState({ allClaimed }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '64px 24px',
      animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: allClaimed ? 'var(--green-dim)' : 'var(--bg-3)',
        border: `1.5px solid ${allClaimed ? 'oklch(0.68 0.16 145 / 0.3)' : 'var(--border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        fontSize: 28,
      }}>
        {allClaimed ? <CheckIcon size={28} color="var(--green)" /> : '⟁'}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
        {allClaimed ? 'All assets claimed' : 'Nothing to claim'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        {allClaimed
          ? 'Your recoverable funds have been successfully claimed to your wallet.'
          : 'There are no claimable balances associated with this address. Check back later or try another wallet.'}
      </div>
    </div>
  );
}
