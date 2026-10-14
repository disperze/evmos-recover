import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { anvil, mainnet, sepolia } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';
import { EVM_CHAIN_ID, EVM_RPC_URL } from './config';

export const EVM_CHAIN = [mainnet, sepolia, anvil].find(c => c.id === EVM_CHAIN_ID);
if (!EVM_CHAIN) throw new Error(`Unsupported VITE_EVM_CHAIN_ID: ${EVM_CHAIN_ID}`);

export const EXPLORER_URL = EVM_CHAIN.blockExplorers?.default.url;

export const config = getDefaultConfig({
  appName: 'Evmos Recover',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [EVM_CHAIN],
  transports: { [EVM_CHAIN.id]: http(EVM_RPC_URL) },
  ssr: false,
});

export const queryClient = new QueryClient();
