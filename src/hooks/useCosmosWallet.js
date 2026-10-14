import { useState, useEffect } from 'react';
import { COSMOS_CHAIN_ID } from '../config';

export function useCosmosWallet() {
  const [state, setState] = useState({ status: 'disconnected', error: null });

  const connect = async () => {
    if (!window.keplr) {
      setState({ status: 'disconnected', error: 'Keplr is not installed. Install the Keplr extension and try again.' });
      return;
    }

    setState({ status: 'connecting', error: null });
    try {
      await window.keplr.enable(COSMOS_CHAIN_ID);
      const key = await window.keplr.getKey(COSMOS_CHAIN_ID);
      if (key.algo === 'ethsecp256k1') {
        throw new Error('This account uses an Ethermint (eth_secp256k1) key, which the claim contract cannot verify.');
      }
      setState({ status: 'connected', error: null, key });
    } catch (err) {
      const msg = err?.message ?? '';
      setState({
        status: 'disconnected',
        error: /reject/i.test(msg) ? 'Keplr connection rejected.' : msg || 'Could not connect to Keplr.',
      });
    }
  };

  const disconnect = () => setState({ status: 'disconnected', error: null });

  // The signer must stay the key that was looked up in the snapshot.
  useEffect(() => {
    if (state.status !== 'connected') return;
    const onChange = () => setState({ status: 'disconnected', error: 'Keplr account changed. Connect again.' });
    window.addEventListener('keplr_keystorechange', onChange);
    return () => window.removeEventListener('keplr_keystorechange', onChange);
  }, [state.status]);

  // ADR-036: pass the claim text as a string, signed by the connected bech32 address.
  const signArbitrary = (text) =>
    window.keplr.signArbitrary(COSMOS_CHAIN_ID, state.key.bech32Address, text);

  return { ...state, connect, disconnect, signArbitrary };
}
