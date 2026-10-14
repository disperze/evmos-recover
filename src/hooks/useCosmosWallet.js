import { useState, useEffect } from 'react';

export const COSMOS_WALLETS = [
  { id: 'keplr', name: 'Keplr', get: () => window.keplr, event: 'keplr_keystorechange' },
  { id: 'leap', name: 'Leap', get: () => window.leap, event: 'leap_keystorechange' },
  { id: 'cosmostation', name: 'Cosmostation', get: () => window.cosmostation?.providers?.keplr },
];

export function useCosmosWallet() {
  const [state, setState] = useState({ status: 'disconnected', error: null });

  const connect = async (walletId, chainId) => {
    const wallet = COSMOS_WALLETS.find(w => w.id === walletId);
    const provider = wallet.get();
    if (!provider) {
      setState({ status: 'disconnected', error: `${wallet.name} is not installed.` });
      return;
    }

    setState({ status: 'connecting', error: null });
    try {
      await provider.enable(chainId);
      const key = await provider.getKey(chainId);
      if (key.algo === 'ethsecp256k1') {
        throw new Error('This account uses an Ethermint (eth_secp256k1) key, which the claim contract cannot verify.');
      }
      setState({ status: 'connected', error: null, wallet, provider, chainId, key });
    } catch (err) {
      const msg = err?.message ?? '';
      setState({
        status: 'disconnected',
        error: /reject/i.test(msg) ? `${wallet.name} connection rejected.` : msg || `Could not connect to ${wallet.name}.`,
      });
    }
  };

  const disconnect = () => setState({ status: 'disconnected', error: null });

  // The signer must stay the key that was looked up in the snapshot.
  useEffect(() => {
    const event = state.wallet?.event;
    if (state.status !== 'connected' || !event) return;
    const onChange = () => setState({ status: 'disconnected', error: 'Wallet account changed. Connect again.' });
    window.addEventListener(event, onChange);
    return () => window.removeEventListener(event, onChange);
  }, [state.status, state.wallet]);

  // ADR-036: pass the claim text as a string, signed by the connected bech32 address.
  const signArbitrary = (text) =>
    state.provider.signArbitrary(state.chainId, state.key.bech32Address, text);

  return { ...state, connect, disconnect, signArbitrary };
}
