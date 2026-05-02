import { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function useWallet({ onDisconnected, onAccountConnected } = {}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();

  const onDisconnectedRef = useRef(onDisconnected);
  const onAccountConnectedRef = useRef(onAccountConnected);
  useEffect(() => { onDisconnectedRef.current = onDisconnected; });
  useEffect(() => { onAccountConnectedRef.current = onAccountConnected; });

  const prevAddressRef = useRef(undefined);
  const prevStatusRef = useRef(undefined);

  useEffect(() => {
    const prevAddress = prevAddressRef.current;
    const prevStatus = prevStatusRef.current;
    if (status === 'connected' && address && address !== prevAddress) {
      onAccountConnectedRef.current?.(address);
    }
    if (status === 'disconnected' && prevStatus === 'connected') {
      onDisconnectedRef.current?.();
    }
    prevAddressRef.current = address;
    prevStatusRef.current = status;
  }, [address, status]);

  const walletState =
    status === 'connected' ? 'connected' :
    (status === 'connecting' || status === 'reconnecting') ? 'connecting' :
    'disconnected';

  const connectWallet = () => openConnectModal?.();

  const disconnectWallet = () => {
    disconnect();
    setDropdownOpen(false);
  };

  const signMessage = (message) => signMessageAsync({ message });

  return {
    walletState,
    address: address ?? '',
    dropdownOpen,
    setDropdownOpen,
    connectWallet,
    disconnectWallet,
    signMessage,
  };
}
