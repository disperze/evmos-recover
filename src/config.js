// CosmosMerkleClaim deployment (see merkle-cosmos-evm docs/FRONTEND.md §2).
export const CLAIM_CONTRACT = import.meta.env.VITE_CLAIM_CONTRACT;
export const CLAIMS_URL = import.meta.env.VITE_CLAIMS_URL || '/claims.json';
export const EVM_CHAIN_ID = Number(import.meta.env.VITE_EVM_CHAIN_ID || 1);
export const EVM_RPC_URL = import.meta.env.VITE_EVM_RPC_URL || undefined;

// Cosmos chain Keplr signs with. Any chain with the snapshot's coin type gives the same key.
export const COSMOS_CHAIN_ID = import.meta.env.VITE_COSMOS_CHAIN_ID || 'cosmoshub-4';
