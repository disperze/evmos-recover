// CosmosMerkleClaim deployment (see merkle-cosmos-evm docs/FRONTEND.md §2).
export const CLAIM_CONTRACT = import.meta.env.VITE_CLAIM_CONTRACT;
export const CLAIMS_URL = import.meta.env.VITE_CLAIMS_URL || '/claims.json';
export const EVM_CHAIN_ID = Number(import.meta.env.VITE_EVM_CHAIN_ID || 1);
export const EVM_RPC_URL = import.meta.env.VITE_EVM_RPC_URL || undefined;

// Cosmos chains the user can sign with. Any chain with the snapshot's coin type gives the same key.
export const COSMOS_CHAIN_IDS = (import.meta.env.VITE_COSMOS_CHAIN_IDS || 'cosmoshub-4,osmosis-1,juno-1')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);
