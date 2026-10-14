# Evmos Recover

Claim UI for the [`CosmosMerkleClaim`](https://github.com/disperze/merkle-cosmos-evm) contract. Users sign an ADR-036
message with their Cosmos wallet (Keplr, Leap or Cosmostation) and claim their snapshot USDC to an Ethereum address.

The flow follows `docs/FRONTEND.md` in merkle-cosmos-evm:

1. Connect a Cosmos wallet on any chain with the snapshot's coin type (`cosmoshub-4`, `osmosis-1`, …).
2. Look up the 20-byte account address in `claims.json` and check `isClaimed(index)`.
3. Choose the Ethereum recipient (defaults to the connected Ethereum wallet).
4. Fetch the text from `claimMessage(recipient, amount)` and sign it with `signArbitrary`.
5. Decompress the public key, split the signature, simulate `claim(...)`, then send it from the Ethereum wallet, which pays the gas.

The page also checks that the `claims.json` root equals `merkleRoot()`, and shows when claims are paused or the deadline has passed.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_CLAIM_CONTRACT, VITE_EVM_CHAIN_ID, …
cp <merkle-out>/claims.json public/claims.json   # or point VITE_CLAIMS_URL elsewhere
npm run dev
```

| Variable | Meaning |
|---|---|
| `VITE_CLAIM_CONTRACT` | `CosmosMerkleClaim` address |
| `VITE_CLAIMS_URL` | `claims.json` from `pnpm --filter merkle start` (default `/claims.json`) |
| `VITE_EVM_CHAIN_ID` | `1` (mainnet), `11155111` (Sepolia) or `31337` (anvil) |
| `VITE_EVM_RPC_URL` | Optional RPC URL; defaults to the chain's public RPC |
| `VITE_COSMOS_CHAIN_IDS` | Comma-separated Cosmos chains the user can sign with |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID for RainbowKit |

For local development, deploy the contract on anvil as described in merkle-cosmos-evm `docs/FRONTEND.md` §8, then
set `VITE_EVM_CHAIN_ID=31337` and `VITE_EVM_RPC_URL=http://127.0.0.1:8545`.
