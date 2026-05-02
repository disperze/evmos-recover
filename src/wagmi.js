import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';

export const config = getDefaultConfig({
  appName: 'Evmos Recover',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  chains: [mainnet],
  ssr: false,
});

export const queryClient = new QueryClient();
