import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

// Ethereum wallet that pays the gas for the claim transaction.
export function useWallet() {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  return {
    walletState: status === 'connected' ? 'connected' : 'disconnected',
    address: address ?? '',
    connectWallet: () => openConnectModal?.(),
    disconnectWallet: () => disconnect(),
  };
}
