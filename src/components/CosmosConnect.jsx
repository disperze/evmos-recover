import { useState } from 'react';
import { Spinner } from './Spinner';
import { COSMOS_WALLETS } from '../hooks/useCosmosWallet';
import { COSMOS_CHAIN_IDS } from '../config';

export function CosmosConnect({ connecting, onConnect }) {
  const [chainId, setChainId] = useState(COSMOS_CHAIN_IDS[0]);
  const [walletId, setWalletId] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
        Sign with chain
        <select
          value={chainId}
          onChange={e => setChainId(e.target.value)}
          disabled={connecting}
          style={{
            height: 34,
            padding: '0 10px',
            borderRadius: 8,
            background: 'var(--bg-3)',
            border: '1px solid var(--border-hi)',
            color: 'var(--text)',
            fontFamily: 'Space Mono, monospace',
            fontSize: 12,
          }}
        >
          {COSMOS_CHAIN_IDS.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
        {COSMOS_WALLETS.map(w => (
          <button
            key={w.id}
            onClick={() => { setWalletId(w.id); onConnect(w.id, chainId); }}
            disabled={connecting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 42,
              borderRadius: 9,
              border: '1.5px solid var(--orange)',
              background: 'var(--orange-dim)',
              color: 'var(--orange)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: connecting ? 'not-allowed' : 'pointer',
              opacity: connecting && walletId !== w.id ? 0.5 : 1,
            }}
          >
            {connecting && walletId === w.id && <Spinner size={13} />}
            {w.name}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
        Any chain that uses the same key gives the same account, so pick one your wallet supports.
      </div>
    </div>
  );
}
