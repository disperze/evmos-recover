import { lazy, Suspense, useState } from 'react';
import { getAddress, isAddress, zeroAddress } from 'viem';
import { useWallet } from './hooks/useWallet';
import { useCosmosWallet } from './hooks/useCosmosWallet';
import { useAllocation } from './hooks/useAllocation';
import { TokenLogo } from './components/TokenLogo';
import { TxBanner } from './components/TxBanner';
import { Spinner } from './components/Spinner';
import { CheckIcon, WalletIcon, ChevronDown } from './components/Icons';
import { formatUsdc } from './lib/claim';
import { EVM_CHAIN } from './wagmi';

const ClaimModal = lazy(() =>
  import('./components/ClaimModal').then(m => ({ default: m.ClaimModal }))
);

function Section({ step, title, children }) {
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--bg-3)',
          border: '1px solid var(--border-hi)',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>{step}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Notice({ children, tone = 'orange' }) {
  return (
    <div style={{
      margin: '16px 24px 0',
      background: `var(--${tone}-dim)`,
      border: `1px solid var(--${tone})`,
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12.5,
      color: `var(--${tone})`,
      lineHeight: 1.55,
    }}>
      {children}
    </div>
  );
}

function App() {
  const evm = useWallet();
  const cosmos = useCosmosWallet();
  const allocation = useAllocation(cosmos.key?.address);
  const [recipientInput, setRecipientInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [banner, setBanner] = useState({ message: '', type: '', txHash: '' });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { walletState, address } = evm;

  const handleConnect = () => cosmos.connect();
  const disconnectWallet = () => {
    cosmos.disconnect();
    setDropdownOpen(false);
  };

  const recipientRaw = recipientInput.trim() || address;
  const recipientValid = isAddress(recipientRaw) && recipientRaw.toLowerCase() !== zeroAddress;
  const recipient = recipientValid ? getAddress(recipientRaw) : '';

  const { entry, claimed } = allocation;
  const blocked = allocation.error || allocation.rootMismatch || allocation.closed || allocation.paused;
  const canClaim = !!entry && !claimed && !allocation.claimedLoading && !blocked;

  const handleClaimed = (txHash) => {
    allocation.refetchClaimed();
    setBanner({ message: 'Claim confirmed!', type: 'success', txHash });
  };

  const truncate = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
  const truncateCosmos = (addr) => addr ? `${addr.slice(0, 10)}…${addr.slice(-6)}` : '';
  const deadlineLabel = allocation.deadline !== undefined
    ? new Date(Number(allocation.deadline) * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 48px)',
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
          <span className="hide-sm" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>Evmos Recover</span>
          <span className="hide-sm" style={{
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
          {cosmos.status === 'disconnected' && (
            <button
              onClick={handleConnect}
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
                animation: 'pulseGlow 2.5s ease infinite',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'oklch(0.68 0.19 46 / 0.22)'; e.currentTarget.style.animation = 'none'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange-dim)'; e.currentTarget.style.animation = 'pulseGlow 2.5s ease infinite'; }}
            >
              <WalletIcon size={15} />
              Connect Keplr Wallet
            </button>
          )}

          {cosmos.status === 'connecting' && (
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

          {cosmos.status === 'connected' && (
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
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  boxShadow: '0 0 8px var(--green)',
                }} />
                {truncateCosmos(cosmos.key.bech32Address)}
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
                  maxWidth: 'calc(100vw - 32px)',
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
                    wordBreak: 'break-all',
                  }}>
                    {cosmos.key.bech32Address}
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
        padding: '64px 16px 120px',
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
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.65, margin: '0 auto' }}>
            Sign with your Keplr wallet to claim your snapshot USDC to an Ethereum address.
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
            gap: 12,
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>USDC Claim</span>
            {deadlineLabel && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {allocation.closed ? 'Closed' : 'Closes'} {deadlineLabel}
              </span>
            )}
          </div>

          {allocation.error && <Notice tone="red">{allocation.error}</Notice>}
          {allocation.rootMismatch && <Notice tone="red">The snapshot does not match the claim contract. Do not claim; contact the operators.</Notice>}
          {allocation.closed && <Notice>Claims closed. The claim deadline has passed.</Notice>}
          {allocation.paused && <Notice>Claims are temporarily paused.</Notice>}

          {cosmos.status !== 'connected' && (
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
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Connect your Keplr wallet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300, lineHeight: 1.65 }}>
                Connect the Cosmos account from the snapshot to see your claimable USDC.
              </div>
              <button
                onClick={handleConnect}
                disabled={cosmos.status === 'connecting'}
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
                  cursor: cosmos.status === 'connecting' ? 'not-allowed' : 'pointer',
                }}
              >
                {cosmos.status === 'connecting' ? <Spinner size={15} /> : <WalletIcon size={15} />}
                {cosmos.status === 'connecting' ? 'Connecting…' : 'Connect Keplr Wallet'}
              </button>
              {cosmos.error && (
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--red)', textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
                  {cosmos.error}
                </div>
              )}
            </div>
          )}

          {cosmos.status === 'connected' && (
            <Section step={1} title="Allocation">
              {allocation.loading || allocation.claimedLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div className="skeleton" style={{ width: 120, height: 14 }} />
                </div>
              ) : !entry ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {allocation.error
                    ? 'The snapshot could not be checked.'
                    : 'This address is not in the snapshot. Try another account in your wallet.'}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: claimed ? 0.6 : 1 }}>
                  <TokenLogo symbol="USDC" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>USDC</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>USD Coin on {EVM_CHAIN.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Space Mono, monospace', letterSpacing: '-0.3px' }}>
                      {formatUsdc(entry.amount)}
                    </div>
                    {claimed && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontSize: 12, color: 'var(--green)', marginTop: 3 }}>
                        <CheckIcon size={11} color="var(--green)" /> Claimed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Section>
          )}

          {cosmos.status === 'connected' && entry && !claimed && (
            <Section step={2} title="Ethereum recipient">
              <input
                value={recipientInput}
                onChange={e => setRecipientInput(e.target.value)}
                placeholder={address || '0x…'}
                spellCheck={false}
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 12px',
                  borderRadius: 9,
                  background: 'var(--bg-3)',
                  border: `1px solid ${recipientRaw && !recipientValid ? 'var(--red)' : 'var(--border-hi)'}`,
                  color: 'var(--text)',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 12.5,
                  outline: 'none',
                }}
              />
              <div style={{ marginTop: 8, fontSize: 11.5, color: recipientRaw && !recipientValid ? 'var(--red)' : 'var(--text-dim)', lineHeight: 1.55 }}>
                {recipientRaw && !recipientValid
                  ? 'Enter a valid, non-zero Ethereum address.'
                  : address
                    ? 'Leave empty to receive the USDC in your connected Ethereum wallet.'
                    : 'The address that receives the USDC. Your signature locks the claim to it.'}
              </div>
            </Section>
          )}

          {cosmos.status === 'connected' && entry && !claimed && (
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              background: 'oklch(0.14 0.008 255 / 0.6)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, flex: '1 1 200px' }}>
                {walletState === 'connected'
                  ? <>
                      Gas is paid by {truncate(address)} on {EVM_CHAIN.name}.{' '}
                      <button
                        onClick={evm.disconnectWallet}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', textDecoration: 'underline', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer' }}
                      >
                        Disconnect
                      </button>
                    </>
                  : <>Connect an Ethereum wallet to pay the gas for the claim.</>}
              </div>
              <button
                onClick={walletState === 'connected' ? () => setModalOpen(true) : evm.connectWallet}
                disabled={!canClaim || (walletState === 'connected' && !recipientValid)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 44,
                  padding: '0 28px',
                  borderRadius: 9,
                  border: 'none',
                  background: canClaim && (walletState !== 'connected' || recipientValid) ? 'var(--orange)' : 'oklch(0.68 0.19 46 / 0.25)',
                  color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: canClaim && (walletState !== 'connected' || recipientValid) ? 'pointer' : 'not-allowed',
                  letterSpacing: '0.01em',
                }}
              >
                {walletState === 'connected' ? 'Review claim' : 'Connect Ethereum wallet'}
              </button>
            </div>
          )}
        </div>

        <p style={{
          marginTop: 24,
          fontSize: 11.5,
          color: 'var(--text-dim)',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.65,
        }}>
          Always check the recipient before signing. Evmos Recover never holds your funds,
          and claims are final and irreversible.
        </p>
      </main>

      <TxBanner message={banner.message} type={banner.type} txHash={banner.txHash} onDismiss={() => setBanner({ message: '', type: '', txHash: '' })} />

      {modalOpen && (
        <Suspense fallback={null}>
          <ClaimModal
            entry={entry}
            recipient={recipient}
            payer={address}
            cosmos={cosmos}
            onClose={() => setModalOpen(false)}
            onClaimed={handleClaimed}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
