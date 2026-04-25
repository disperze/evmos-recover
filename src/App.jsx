import { useState, useEffect } from 'react';
import { TokenRow } from './components/TokenRow';
import { SkeletonRow } from './components/SkeletonRow';
import { EmptyState } from './components/EmptyState';
import { TxBanner } from './components/TxBanner';
import { KeplrModal } from './components/KeplrModal';
import { Spinner } from './components/Spinner';
import { WalletIcon, ChevronDown, RefreshIcon, MetaMaskIcon } from './components/Icons';

function App() {
  const [walletState, setWalletState] = useState('disconnected');
  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [claimStates, setClaimStates] = useState({});
  const [claimAllState, setClaimAllState] = useState('idle');
  const [banner, setBanner] = useState({ message: '', type: '' });
  const [modal, setModal] = useState(null);

  const showBanner = (message, type = 'success') => setBanner({ message, type });
  const dismissBanner = () => setBanner({ message: '', type: '' });
  const truncate = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setWalletState('connected');
        fetchBalances(accounts[0]);
      }
    });

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWalletState('disconnected');
        setAddress('');
        setTokens([]);
        setClaimStates({});
        setClaimAllState('idle');
        setDropdownOpen(false);
      } else {
        setAddress(accounts[0]);
        fetchBalances(accounts[0]);
      }
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWalletState('no_metamask');
      return;
    }
    setWalletState('connecting');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setWalletState('connected');
      fetchBalances(accounts[0]);
    } catch (err) {
      setWalletState('disconnected');
      if (err.code !== 4001) showBanner('Connection failed. Try again.', 'pending');
    }
  };

  const disconnectWallet = () => {
    setWalletState('disconnected');
    setAddress('');
    setTokens([]);
    setClaimStates({});
    setClaimAllState('idle');
    setDropdownOpen(false);
  };

  const fetchBalances = async (hexAddress) => {
    setLoading(true);
    setTokens([]);
    setClaimStates({});
    setClaimAllState('idle');
    setLoading(false);
  };

  const claimToken = async (id) => {
    setClaimStates(s => ({ ...s, [id]: 'pending' }));
  };

  const openClaimModal = (token) => setModal({ target: token });
  const openClaimAllModal = () => {
    const unclaimed = tokens.filter(t => !claimStates[t.id] || claimStates[t.id] === 'idle');
    setModal({ target: unclaimed });
  };

  const handleModalConfirmed = (target) => {
    const ids = Array.isArray(target) ? target.map(t => t.id) : [target.id];
    ids.forEach(id => claimToken(id));
  };

  const allClaimed = tokens.length > 0 && tokens.every(t => claimStates[t.id] === 'success');
  const pendingCount = tokens.filter(t => claimStates[t.id] === 'pending').length;
  const unclaimedCount = tokens.filter(t => !claimStates[t.id] || claimStates[t.id] === 'idle').length;
  const totalUsd = tokens
    .filter(t => !claimStates[t.id] || claimStates[t.id] !== 'success')
    .reduce((acc, t) => acc + parseFloat(t.usd.replace(/,/g, '')), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: 68,
        borderBottom: '1px solid var(--border)',
        background: 'oklch(0.11 0.008 260 / 0.92)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--orange)',
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L8 3l5 10H3z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5.5 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>Evmos Recover</span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--orange)',
            background: 'var(--orange-dim)',
            border: '1px solid oklch(0.68 0.19 46 / 0.25)',
            padding: '2px 7px',
            borderRadius: 4,
            textTransform: 'uppercase',
          }}>Beta</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {walletState === 'connected' && (
            <button
              onClick={() => fetchBalances(address)}
              title="Refresh balances"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <RefreshIcon size={14} />
            </button>
          )}

          {(walletState === 'disconnected' || walletState === 'no_metamask') && (
            <button
              onClick={connectWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 38,
                padding: '0 18px',
                borderRadius: 9,
                border: '1.5px solid var(--orange)',
                background: 'var(--orange-dim)',
                color: 'var(--orange)',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s',
                animation: walletState === 'disconnected' ? 'pulseGlow 2.5s ease infinite' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'oklch(0.68 0.19 46 / 0.22)'; e.currentTarget.style.animation = 'none'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange-dim)'; e.currentTarget.style.animation = walletState === 'disconnected' ? 'pulseGlow 2.5s ease infinite' : 'none'; }}
            >
              <WalletIcon size={15} />
              {walletState === 'no_metamask' ? 'MetaMask not found' : 'Connect Wallet'}
            </button>
          )}

          {walletState === 'connecting' && (
            <button disabled style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 38,
              padding: '0 18px',
              borderRadius: 9,
              border: '1.5px solid oklch(0.68 0.19 46 / 0.3)',
              background: 'oklch(0.68 0.19 46 / 0.08)',
              color: 'var(--orange)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'not-allowed',
            }}>
              <Spinner size={14} />
              Connecting…
            </button>
          )}

          {walletState === 'connected' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 38,
                  padding: '0 14px',
                  borderRadius: 9,
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-hi)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'Space Mono, monospace',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  letterSpacing: '-0.2px',
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  boxShadow: '0 0 8px var(--green)',
                }} />
                {truncate(address)}
                <span style={{
                  display: 'flex',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}>
                  <ChevronDown size={13} />
                </span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-hi)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px oklch(0 0 0 / 0.4)',
                  minWidth: 160,
                  zIndex: 50,
                  animation: 'fadeUp 0.15s ease',
                }}>
                  <div style={{
                    padding: '10px 14px',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontFamily: 'Space Mono, monospace',
                    borderBottom: '1px solid var(--border)',
                    letterSpacing: '-0.2px',
                  }}>
                    {truncate(address)}
                  </div>
                  <button
                    onClick={disconnectWallet}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      color: 'oklch(0.65 0.2 25)',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'Space Grotesk, sans-serif',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'oklch(0.60 0.18 25 / 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '64px 24px 120px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeUp 0.5s ease both' }}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: '-0.8px',
            lineHeight: 1.15,
            marginBottom: 12,
            background: 'linear-gradient(135deg, var(--text) 0%, oklch(0.72 0.005 255) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Recover your assets
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.65, margin: '0 auto' }}>
            Claim your token balances stuck on EVMOS network directly to your wallet.
          </p>
        </div>

        {/* Panel */}
        <div style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 32px 80px oklch(0 0 0 / 0.35), 0 1px 0 oklch(1 1 1 / 0.04) inset',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Claimable Balances</span>
              {walletState === 'connected' && !loading && tokens.length > 0 && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: unclaimedCount > 0 ? 'var(--orange-dim)' : 'var(--green-dim)',
                  color: unclaimedCount > 0 ? 'var(--orange)' : 'var(--green)',
                  border: `1px solid ${unclaimedCount > 0 ? 'oklch(0.68 0.19 46 / 0.25)' : 'oklch(0.68 0.16 145 / 0.25)'}`,
                }}>
                  {unclaimedCount > 0 ? `${unclaimedCount} available` : 'All claimed'}
                </span>
              )}
            </div>
            {walletState === 'connected' && !loading && tokens.length > 0 && unclaimedCount > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ≈ <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                  ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span> total
              </div>
            )}
          </div>

          {walletState === 'no_metamask' && !loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '56px 24px',
              animation: 'fadeUp 0.4s ease both',
            }}>
              <div style={{ marginBottom: 18 }}>
                <MetaMaskIcon size={52} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>MetaMask not detected</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280, lineHeight: 1.65, marginBottom: 24 }}>
                Install the MetaMask browser extension to connect your wallet and claim your assets.
              </div>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 42,
                  padding: '0 22px',
                  borderRadius: 9,
                  border: '1.5px solid var(--orange)',
                  background: 'var(--orange-dim)',
                  color: 'var(--orange)',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <MetaMaskIcon size={16} />
                Install MetaMask
              </a>
            </div>
          )}

          {walletState !== 'connected' && walletState !== 'no_metamask' && !loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '56px 24px',
              animation: 'fadeUp 0.4s ease both',
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--bg-3)',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                color: 'var(--text-dim)',
              }}>
                <WalletIcon size={22} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Connect your wallet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280, lineHeight: 1.65 }}>
                Connect your wallet to see any claimable balances associated with your address.
              </div>
              <button
                onClick={connectWallet}
                style={{
                  marginTop: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 42,
                  padding: '0 22px',
                  borderRadius: 9,
                  border: '1.5px solid var(--orange)',
                  background: 'var(--orange-dim)',
                  color: 'var(--orange)',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'oklch(0.68 0.19 46 / 0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--orange-dim)'}
              >
                <WalletIcon size={15} />
                Connect Wallet
              </button>
            </div>
          )}

          {loading && [0, 1, 2, 3].map(i => <SkeletonRow key={i} delay={i * 0.07} />)}

          {!loading && walletState === 'connected' && tokens.length > 0 && tokens.map((token, i) => (
            <TokenRow
              key={token.id}
              token={token}
              index={i}
              claimState={claimStates[token.id]}
              onClaim={() => openClaimModal(token)}
            />
          ))}

          {!loading && walletState === 'connected' && tokens.length === 0 && (
            <EmptyState allClaimed={false} />
          )}

          {!loading && walletState === 'connected' && tokens.length > 0 && allClaimed && (
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <EmptyState allClaimed={true} />
            </div>
          )}

          {!loading && walletState === 'connected' && tokens.length > 0 && !allClaimed && (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'oklch(0.14 0.008 255 / 0.6)',
              animation: 'fadeUp 0.5s ease 0.3s both',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {pendingCount > 0
                  ? <span style={{ color: 'var(--orange)' }}>{pendingCount} transaction{pendingCount > 1 ? 's' : ''} pending…</span>
                  : `${unclaimedCount} asset${unclaimedCount !== 1 ? 's' : ''} available to claim`}
              </div>
              <button
                onClick={openClaimAllModal}
                disabled={claimAllState === 'pending' || pendingCount > 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 9,
                  height: 44,
                  padding: '0 28px',
                  borderRadius: 9,
                  border: 'none',
                  background: claimAllState === 'pending' || pendingCount > 0
                    ? 'oklch(0.68 0.19 46 / 0.25)'
                    : 'var(--orange)',
                  color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: claimAllState === 'pending' || pendingCount > 0 ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'all 0.18s',
                  boxShadow: claimAllState !== 'pending' && pendingCount === 0
                    ? '0 4px 20px oklch(0.68 0.19 46 / 0.35)'
                    : 'none',
                }}
                onMouseEnter={e => {
                  if (claimAllState !== 'pending' && pendingCount === 0) {
                    e.currentTarget.style.background = 'oklch(0.73 0.19 46)';
                    e.currentTarget.style.boxShadow = '0 6px 28px oklch(0.68 0.19 46 / 0.45)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = claimAllState === 'pending' || pendingCount > 0
                    ? 'oklch(0.68 0.19 46 / 0.25)'
                    : 'var(--orange)';
                  e.currentTarget.style.boxShadow = claimAllState !== 'pending' && pendingCount === 0
                    ? '0 4px 20px oklch(0.68 0.19 46 / 0.35)'
                    : 'none';
                }}
              >
                {(claimAllState === 'pending' || pendingCount > 0) ? <Spinner size={15} color="white" /> : null}
                {(claimAllState === 'pending' || pendingCount > 0) ? 'Claiming…' : 'Claim All'}
              </button>
            </div>
          )}
        </div>

        {walletState === 'connected' && !loading && (
          <p style={{
            marginTop: 24,
            fontSize: 11.5,
            color: 'var(--text-dim)',
            textAlign: 'center',
            maxWidth: 480,
            lineHeight: 1.65,
            animation: 'fadeUp 0.5s ease 0.4s both',
          }}>
            Always verify contract addresses before signing. RecoverFunds does not custody your assets.
            Transactions are final and irreversible.
          </p>
        )}
      </main>

      <TxBanner message={banner.message} type={banner.type} onDismiss={dismissBanner} />

      {modal && (
        <KeplrModal
          claimTarget={modal.target}
          onClose={() => setModal(null)}
          onConfirmed={() => { handleModalConfirmed(modal.target); setModal(null); }}
        />
      )}
    </div>
  );
}

export default App;
