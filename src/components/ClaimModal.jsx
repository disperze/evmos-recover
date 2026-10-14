import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { getAccount, simulateContract, switchChain, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { Spinner } from './Spinner';
import { CheckIcon } from './Icons';
import abi from '../abi/CosmosMerkleClaim.json';
import { CLAIM_CONTRACT } from '../config';
import { config, EVM_CHAIN, EXPLORER_URL } from '../wagmi';
import { buildClaimArgs, claimErrorMessage, formatUsdc } from '../lib/claim';

const BUSY_LABELS = {
  signing: 'Sign the message in your wallet…',
  simulating: 'Checking claim…',
  sending: 'Confirm in your Ethereum wallet…',
  confirming: 'Waiting for confirmation…',
};

function Row({ label, children, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 12,
        fontWeight: 500,
        fontFamily: mono ? 'Space Mono, monospace' : 'inherit',
        letterSpacing: mono ? '-0.2px' : 'normal',
        textAlign: 'right',
        wordBreak: 'break-all',
      }}>{children}</span>
    </div>
  );
}

export function ClaimModal({ entry, recipient, payer, cosmos, onClose, onClaimed }) {
  const [step, setStep] = useState('review');
  const [error, setError] = useState(null);
  const [args, setArgs] = useState(null);
  const [txHash, setTxHash] = useState('');

  const amount = BigInt(entry.amount);
  const signer = cosmos.key.bech32Address;

  // Golden rule: never rebuild the claim text, always take it from the contract.
  const claimText = useReadContract({
    address: CLAIM_CONTRACT,
    abi,
    chainId: EVM_CHAIN.id,
    functionName: 'claimMessage',
    args: [recipient, amount],
  });

  const busy = step in BUSY_LABELS;

  const submit = async () => {
    setError(null);
    try {
      // A signature that already passed simulation is reused if only the transaction failed.
      let claimArgs = args;
      if (!claimArgs) {
        setStep('signing');
        const signed = await cosmos.signArbitrary(claimText.data);
        claimArgs = buildClaimArgs({ entry, recipient, signer, signed });
      }

      setStep('simulating');
      const { request } = await simulateContract(config, {
        address: CLAIM_CONTRACT,
        abi,
        chainId: EVM_CHAIN.id,
        functionName: 'claim',
        args: claimArgs,
        account: payer,
      });
      setArgs(claimArgs);

      setStep('sending');
      if (getAccount(config).chainId !== EVM_CHAIN.id) {
        await switchChain(config, { chainId: EVM_CHAIN.id });
      }
      const hash = await writeContract(config, request);
      setTxHash(hash);

      setStep('confirming');
      const receipt = await waitForTransactionReceipt(config, { hash, chainId: EVM_CHAIN.id });
      if (receipt.status !== 'success') throw new Error('The claim transaction reverted.');

      setStep('success');
      onClaimed(hash);
    } catch (err) {
      setError(claimErrorMessage(err));
      setStep('review');
    }
  };

  const handleBackdrop = e => { if (e.target === e.currentTarget && !busy) onClose(); };

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
        padding: 16,
        zIndex: 300,
        animation: 'overlayIn 0.2s ease',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: 460,
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
            {step === 'success' ? 'Claimed' : 'Claim USDC'}
          </span>
          <button
            onClick={onClose}
            disabled={busy}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              lineHeight: 1,
            }}
          >×</button>
        </div>

        {step !== 'success' && (
          <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <Row label="Amount"><b style={{ color: 'var(--orange)' }}>{formatUsdc(entry.amount)} USDC</b></Row>
              <Row label="Recipient" mono>{recipient}</Row>
              <Row label="Signer" mono>{signer}</Row>
              <Row label="Gas paid by" mono>{payer}</Row>
            </div>

            <div>
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Message to sign
              </div>
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 11.5,
                fontFamily: 'Space Mono, monospace',
                lineHeight: 1.6,
                wordBreak: 'break-all',
                minHeight: 44,
              }}>
                {claimText.data ?? (claimText.error ? 'Could not load the claim message.' : <Spinner size={14} />)}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.55, marginTop: 8 }}>
                Your Keplr popup shows the amount in base units:
                {' '}{entry.amount} = {formatUsdc(entry.amount)} USDC. Signing is free; the signature only
                authorizes payment to the recipient above.
              </div>
            </div>

            <button
              onClick={submit}
              disabled={busy || !claimText.data}
              style={{
                width: '100%',
                height: 46,
                borderRadius: 11,
                border: 'none',
                background: busy || !claimText.data ? 'oklch(0.68 0.19 46 / 0.3)' : 'var(--orange)',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                cursor: busy || !claimText.data ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                transition: 'all 0.18s',
                boxShadow: busy ? 'none' : '0 4px 20px oklch(0.68 0.19 46 / 0.35)',
              }}
            >
              {busy && <Spinner size={15} color="white" />}
              {busy ? BUSY_LABELS[step] : args ? 'Retry transaction' : 'Sign with Keplr & claim'}
            </button>

            {error && (
              <div style={{ marginTop: -8, fontSize: 12, color: 'var(--red)', textAlign: 'center', lineHeight: 1.5 }}>
                {error}
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div style={{
            padding: '32px 24px 36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Claim complete</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>
              {formatUsdc(entry.amount)} USDC was sent to {recipient.slice(0, 6)}…{recipient.slice(-4)}.
            </div>
            {txHash && (
              EXPLORER_URL ? (
                <a
                  href={`${EXPLORER_URL}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 16,
                    fontSize: 11,
                    fontFamily: 'Space Mono, monospace',
                    color: 'var(--text-muted)',
                    textDecoration: 'underline',
                  }}
                >
                  {txHash.slice(0, 16)}…{txHash.slice(-8)} ↗
                </a>
              ) : (
                <span style={{ marginTop: 16, fontSize: 11, fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>
                  {txHash.slice(0, 16)}…{txHash.slice(-8)}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
