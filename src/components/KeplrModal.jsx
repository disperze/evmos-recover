import { useState } from 'react';
import { Spinner } from './Spinner';
import { CheckIcon, KeplrLogo } from './Icons';
import { fetchProofs } from '../data/tokens';
import { GasPrice } from '@cosmjs/stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { COSMOS_CHAIN_ID, CONTRACT_ADDRESS, RPC_URL, GAS_PRICE } from '../config';

function TxRow({ label, value, highlight, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: 12,
        fontWeight: highlight ? 700 : 500,
        fontFamily: mono ? 'Space Mono, monospace' : 'inherit',
        color: highlight ? 'var(--orange)' : 'var(--text)',
        letterSpacing: mono ? '-0.2px' : 'normal',
        textAlign: 'right',
      }}>{value}</span>
    </div>
  );
}

export function KeplrModal({ claimTarget, hexAddress, onClose, onConfirmed }) {
  const [step, setStep] = useState('connect');
  const [cosmosAddress, setCosmosAddress] = useState('');
  const [proofs, setProofs] = useState({});
  const [keplrError, setKeplrError] = useState(null);
  const [claimError, setClaimError] = useState(null);
  const [txHash, setTxHash] = useState('');

  const isBatch = Array.isArray(claimTarget);
  const label = isBatch
    ? `${claimTarget.length} assets`
    : `${claimTarget.amount} ${claimTarget.symbol}`;

  const usdLabel = isBatch
    ? `$${claimTarget.reduce((s, t) => s + parseFloat(t.usd.replace(/,/g, '')), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${claimTarget.usd}`;

  const connectKeplr = async () => {
    setStep('connecting');
    setKeplrError(null);

    if (!window.keplr) {
      setKeplrError('Keplr is not installed. Install the Keplr browser extension and try again.');
      setStep('connect');
      return;
    }

    try {
      await window.keplr.enable(COSMOS_CHAIN_ID);
      const key = await window.keplr.getKey(COSMOS_CHAIN_ID);
      setCosmosAddress(key.bech32Address);

      const tokens = isBatch ? claimTarget : [claimTarget];
      const proofMap = await fetchProofs(hexAddress, tokens);
      setProofs(proofMap);
      setStep('confirm');
    } catch (err) {
      const msg = err?.message ?? '';
      setKeplrError(
        msg.includes('rejected') || msg.includes('Request rejected')
          ? 'Keplr connection rejected. Please approve the request.'
          : 'Could not connect to Keplr or fetch Merkle proof. Please try again.'
      );
      setStep('connect');
    }
  };

  const confirmClaim = async () => {
    setStep('submitting');
    setClaimError(null);

    let signature, claimMsgB64;
    try {
      const msgStr = JSON.stringify({ address: cosmosAddress });
      claimMsgB64 = btoa(msgStr);
      const msgHex = '0x' + Array.from(new TextEncoder().encode(msgStr)).map(b => b.toString(16).padStart(2, '0')).join('');
      const sigHex = await window.ethereum.request({
        method: 'personal_sign',
        params: [msgHex, hexAddress],
      });
      const sigBytes = sigHex.slice(2).match(/.{2}/g).map(b => parseInt(b, 16));
      signature = btoa(String.fromCharCode(...sigBytes));
    } catch (err) {
      setClaimError(err?.code === 4001 ? 'MetaMask signature rejected.' : 'MetaMask signing failed. Please try again.');
      setStep('confirm');
      return;
    }

    let client;
    try {
      const offlineSigner = window.keplr.getOfflineSigner(COSMOS_CHAIN_ID);
      client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner, {
        gasPrice: GasPrice.fromString(GAS_PRICE),
      });
    } catch {
      setClaimError('Could not connect to the Cosmos RPC. Please try again.');
      setStep('confirm');
      return;
    }

    const tokens = isBatch ? claimTarget : [claimTarget];
    let lastTxHash = '';

    for (const token of tokens) {
      try {
        const result = await client.execute(
          cosmosAddress,
          CONTRACT_ADDRESS,
          { claim: {
              stage: 1,
              amount: token.amount,
              proof: proofs[token.denom],
              sig_info: {
              claim_msg: claimMsgB64,
              signature,
              }
            }
          },
          'auto',
          'evmos-recover claim',
        );
        lastTxHash = result.transactionHash;
      } catch (err) {
        const errMsg = err?.message ?? '';
        if (errMsg.includes('rejected') || errMsg.includes('Request rejected')) {
          setClaimError('Keplr transaction rejected.');
        } else if (errMsg.includes('already claimed')) {
          setClaimError('This token has already been claimed.');
        } else {
          setClaimError(`Transaction failed: ${errMsg.slice(0, 80)}`);
        }
        setStep('confirm');
        return;
      }
    }

    setTxHash(lastTxHash);
    setStep('success');
    setTimeout(() => { onConfirmed(claimTarget, lastTxHash); onClose(); }, 1800);
  };

  const truncateCosmos = a => a ? `${a.slice(0, 12)}…${a.slice(-6)}` : '';
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(0 0 0 / 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        animation: 'overlayIn 0.2s ease',
      }}
    >
      <div style={{
        width: 420,
        background: 'var(--bg-2)',
        border: '1px solid var(--border-hi)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 40px 100px oklch(0 0 0 / 0.55)',
        animation: 'modalIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {step === 'success' ? 'Confirmed' : 'Claim Asset'}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Step: connect / connecting */}
        {(step === 'connect' || step === 'connecting') && (
          <div style={{
            padding: '28px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}>
            <div style={{
              width: '100%',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>You are claiming</div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'Space Mono, monospace',
                  letterSpacing: '-0.3px',
                }}>{label}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Estimated value</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)' }}>{usdLabel}</div>
              </div>
            </div>

            <div style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              background: '#2B2F4E',
              border: '1.5px solid #3d4270',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: step === 'connecting' ? '0 0 0 4px rgba(100,120,255,0.15)' : 'none',
              transition: 'box-shadow 0.3s',
            }}>
              {step === 'connecting'
                ? <Spinner size={24} color="#8b9cf4" />
                : <KeplrLogo size={42} />}
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              {step === 'connecting' ? 'Connecting to Keplr…' : 'Connect Keplr Wallet'}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: 300,
              marginBottom: 28,
            }}>
              {step === 'connecting'
                ? 'Approve the connection request in your Keplr extension.'
                : 'Link your Cosmos address to authorize and receive the claimed funds.'}
            </div>

            <button
              onClick={connectKeplr}
              disabled={step === 'connecting'}
              style={{
                width: '100%',
                height: 46,
                borderRadius: 11,
                border: 'none',
                background: step === 'connecting' ? 'rgba(139,156,244,0.15)' : '#5b6ef5',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                cursor: step === 'connecting' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                transition: 'all 0.18s',
                boxShadow: step !== 'connecting' ? '0 4px 20px rgba(91,110,245,0.35)' : 'none',
              }}
              onMouseEnter={e => { if (step !== 'connecting') e.currentTarget.style.background = '#6c7ef6'; }}
              onMouseLeave={e => { if (step !== 'connecting') e.currentTarget.style.background = '#5b6ef5'; }}
            >
              {step === 'connecting' ? <Spinner size={15} color="#8b9cf4" /> : <KeplrLogo size={18} />}
              {step === 'connecting' ? 'Fetching proof…' : 'Connect with Keplr'}
            </button>

            {keplrError && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'oklch(0.65 0.2 25)', textAlign: 'center' }}>
                {keplrError}
              </div>
            )}
          </div>
        )}

        {/* Step: confirm / submitting */}
        {(step === 'confirm' || step === 'submitting') && (
          <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: '#2B2F4E',
                border: '1px solid #3d4270',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <KeplrLogo size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Keplr — Cosmos Hub</div>
                <div style={{
                  fontSize: 12,
                  fontFamily: 'Space Mono, monospace',
                  color: 'var(--text)',
                  letterSpacing: '-0.2px',
                }}>
                  {truncateCosmos(cosmosAddress)}
                </div>
              </div>
              <div style={{
                marginLeft: 'auto',
                flexShrink: 0,
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
                background: 'var(--green-dim)',
                color: 'var(--green)',
                border: '1px solid oklch(0.68 0.16 145 / 0.25)',
                letterSpacing: '0.04em',
              }}>LINKED</div>
            </div>

            <div style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Transaction Summary
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <TxRow label="Action" value="Claim recovery" />
                <TxRow label="Assets" value={label} highlight />
                <TxRow label="Est. value" value={usdLabel} />
                <TxRow label="Recipient" value={truncateCosmos(cosmosAddress)} mono />
                <TxRow label="Network fee" value="~$0.02" />
              </div>
            </div>

            <div style={{
              background: 'oklch(0.68 0.19 46 / 0.06)',
              border: '1px solid oklch(0.68 0.19 46 / 0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                This transaction is irreversible. Funds will be sent to the linked Cosmos address.
              </span>
            </div>

            <button
              onClick={confirmClaim}
              disabled={step === 'submitting'}
              style={{
                width: '100%',
                height: 46,
                borderRadius: 11,
                border: 'none',
                background: step === 'submitting' ? 'oklch(0.68 0.19 46 / 0.3)' : 'var(--orange)',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                cursor: step === 'submitting' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                transition: 'all 0.18s',
                boxShadow: step !== 'submitting' ? '0 4px 20px oklch(0.68 0.19 46 / 0.35)' : 'none',
              }}
              onMouseEnter={e => { if (step !== 'submitting') e.currentTarget.style.background = 'oklch(0.73 0.19 46)'; }}
              onMouseLeave={e => { if (step !== 'submitting') e.currentTarget.style.background = 'var(--orange)'; }}
            >
              {step === 'submitting' ? <Spinner size={15} color="white" /> : null}
              {step === 'submitting' ? 'Submitting…' : 'Confirm Claim'}
            </button>

            {claimError && (
              <div style={{ marginTop: -8, fontSize: 12, color: 'oklch(0.65 0.2 25)', textAlign: 'center' }}>
                {claimError}
              </div>
            )}
          </div>
        )}

        {/* Step: success */}
        {step === 'success' && (
          <div style={{
            padding: '32px 24px 36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--green-dim)',
              border: '1.5px solid oklch(0.68 0.16 145 / 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
              animation: 'successPop 0.4s ease',
            }}>
              <CheckIcon size={28} color="var(--green)" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Claim Submitted!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
              Your transaction has been broadcast. Funds will appear in your Cosmos wallet shortly.
            </div>
            {txHash && (
              <a
                href={`https://www.mintscan.io/cosmos/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  fontFamily: 'Space Mono, monospace',
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  letterSpacing: '-0.2px',
                  wordBreak: 'break-all',
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                {txHash.slice(0, 16)}…{txHash.slice(-8)} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
