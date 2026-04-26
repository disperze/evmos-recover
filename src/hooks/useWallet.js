import { useState, useEffect, useRef } from 'react';

export function useWallet({ onDisconnected, onAccountConnected } = {}) {
  const [walletState, setWalletState] = useState('disconnected');
  const [address, setAddress] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onDisconnectedRef = useRef(onDisconnected);
  const onAccountConnectedRef = useRef(onAccountConnected);
  useEffect(() => { onDisconnectedRef.current = onDisconnected; });
  useEffect(() => { onAccountConnectedRef.current = onAccountConnected; });

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setWalletState('connected');
        onAccountConnectedRef.current?.(accounts[0]);
      }
    });

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWalletState('disconnected');
        setAddress('');
        setDropdownOpen(false);
        onDisconnectedRef.current?.();
      } else {
        setAddress(accounts[0]);
        onAccountConnectedRef.current?.(accounts[0]);
      }
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = async (onConnected) => {
    if (!window.ethereum) {
      setWalletState('no_metamask');
      return;
    }
    setWalletState('connecting');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setWalletState('connected');
      await onConnected?.(accounts[0]);
    } catch (err) {
      setWalletState('disconnected');
      if (err.code !== 4001) throw err;
    }
  };

  const disconnectWallet = () => {
    setWalletState('disconnected');
    setAddress('');
    setDropdownOpen(false);
    onDisconnectedRef.current?.();
  };

  return {
    walletState,
    address,
    dropdownOpen,
    setDropdownOpen,
    connectWallet,
    disconnectWallet,
  };
}
