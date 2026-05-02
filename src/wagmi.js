import { connectorsForWallets , getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  phantomWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';
import { createConfig } from 'wagmi';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, phantomWallet, injectedWallet],
    },
  ],
  {
    appName: 'Evmos Recover',
  }
);

export const config = createConfig({
  connectors,
  chains: [mainnet],
  ssr: false,
});

export const queryClient = new QueryClient();
