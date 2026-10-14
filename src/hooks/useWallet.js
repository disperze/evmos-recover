import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function useWallet() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const walletState =
    status === 'connected' ? 'connected' :
    (status === 'connecting' || status === 'reconnecting') ? 'connecting' :
    'disconnected';

  const connectWallet = () => openConnectModal?.();

  const disconnectWallet = () => {
    disconnect();
    setDropdownOpen(false);
  };

  return {
    walletState,
    address: address ?? '',
    dropdownOpen,
    setDropdownOpen,
    connectWallet,
    disconnectWallet,
  };
}
