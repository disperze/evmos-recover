import { secp256k1 } from '@noble/curves/secp256k1.js';
import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  bytesToHex,
  formatUnits,
} from 'viem';

export const USDC_DECIMALS = 6;

export const formatUsdc = (amount) => formatUnits(BigInt(amount), USDC_DECIMALS);

const fromBase64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

// Turns a wallet's ADR-036 signArbitrary response into the arguments of
// CosmosMerkleClaim.claim (merkle-cosmos-evm docs/FRONTEND.md §5.6).
export function buildClaimArgs({ entry, recipient, signer, signed }) {
  const pub33 = fromBase64(signed.pub_key.value);
  const sig64 = fromBase64(signed.signature);
  if (pub33.length !== 33 || sig64.length !== 64) throw new Error('Unexpected wallet response.');

  // Decompress: 0x04 || X || Y
  const pub65 = secp256k1.Point.fromBytes(pub33).toBytes(false);
  const hrp = signer.slice(0, signer.lastIndexOf('1'));

  return [
    BigInt(entry.index),
    BigInt(entry.amount),
    recipient,
    hrp,
    bytesToHex(pub65.slice(1, 33)),
    bytesToHex(pub65.slice(33, 65)),
    bytesToHex(sig64.slice(0, 32)),
    bytesToHex(sig64.slice(32, 64)),
    entry.proof,
  ];
}

// Custom errors of CosmosMerkleClaim (FRONTEND.md §6).
const ERROR_MESSAGES = {
  AlreadyClaimed: 'This allocation has already been claimed.',
  ClaimPeriodEnded: 'The claim deadline has passed.',
  EnforcedPause: 'Claims are temporarily paused.',
  InvalidProof: 'This address is not in the snapshot, or the wallet signed with a different key.',
  InvalidSignature: 'Signature mismatch. Sign again without changing the recipient.',
  InvalidSignatureS: 'The wallet returned a non-canonical signature.',
  InvalidPublicKey: 'The wallet returned an invalid public key.',
  ZeroRecipient: 'The recipient cannot be the zero address.',
  InvalidHrp: 'The signer address prefix is not supported.',
  SafeERC20FailedOperation: 'Token transfer failed. The contract may be underfunded; contact the operators.',
};

export function claimErrorMessage(err) {
  if (err instanceof BaseError) {
    if (err.walk(e => e instanceof UserRejectedRequestError)) return 'Transaction rejected in your wallet.';
    const revert = err.walk(e => e instanceof ContractFunctionRevertedError);
    const name = revert?.data?.errorName;
    if (name && ERROR_MESSAGES[name]) return ERROR_MESSAGES[name];
    return err.shortMessage;
  }
  const msg = err?.message ?? '';
  if (/reject/i.test(msg)) return 'Request rejected in your wallet.';
  return msg || 'Something went wrong. Please try again.';
}
