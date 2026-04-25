# evmos-recover — Web3 Migration TODO

Replace all mock/simulated code with real blockchain calls.

## Real claim flow (reference)

1. User connects **MetaMask** → `0x` hex address sent to REST API
2. API returns claimable native Cosmos coins (denom + amount) for that address
3. User clicks "Claim" → app prompts **Keplr** on `cosmoshub-4` → get `cosmos1...` address
4. MetaMask `personal_sign` on `{"address": "<cosmos1...>"}` → ownership proof signature
5. API called with hex address + denom → returns Merkle proof
6. CosmWasm `ExecuteMsg { claim: { amount, proof, signature } }` sent via Keplr to Cosmos Hub contract
7. Config via env vars: `VITE_API_URL`, `VITE_CONTRACT_ADDRESS`

---

## Checklist

### 1. Environment & Config

- [ ] Create `.env.example` with:
  - `VITE_API_URL=https://api.example.com`
  - `VITE_CONTRACT_ADDRESS=cosmos1...`
  - `VITE_COSMOS_CHAIN_ID=cosmoshub-4`
- [ ] Read all config via `import.meta.env.VITE_*` (no hardcoded values)

### 2. Remove All Mock Data

- [ ] Delete `MOCK_TOKENS` array from `src/data/tokens.js`
- [ ] Remove `setTimeout` simulation for token fetching in `App.jsx` (~lines 116–124)
- [ ] Remove `setTimeout` simulation for claim in `App.jsx` (~lines 126–132)
- [ ] Remove the dev "Tweaks" panel in `App.jsx` (~lines 636–727)
- [ ] Remove `showEmpty` / `isEditMode` postMessage handler in `App.jsx` (~lines 30–37)
- [ ] Remove mock `cosmos1...` address generation in `KeplrModal.jsx` (~lines 34–42)

### 3. MetaMask Connection

- [ ] Call `window.ethereum.request({ method: 'eth_requestAccounts' })` to get `0x` hex address
- [ ] Listen to `accountsChanged` event and update stored address
- [ ] Show `no_metamask` UI state when `window.ethereum` is absent
- [ ] MetaMask connect is the only action needed on the home/connect screen

### 4. REST API — Fetch Claimable Tokens

- [ ] `GET {VITE_API_URL}/balances/{hexAddress}` → `[{ denom, amount, symbol, name, coingeckoId }]`
- [ ] Replace mock token load in `App.jsx` with real `fetch` call
- [ ] Handle `loading`, `empty`, and `error` states for the token list

### 5. REST API — Fetch Merkle Proof

- [ ] `GET {VITE_API_URL}/proof/{hexAddress}/{denom}` → `{ proof: string[] }`
- [ ] Call this endpoint per-token at claim time (not on page load)

### 6. Keplr Integration (claim-time only)

- [ ] `await window.keplr.enable('cosmoshub-4')` when user initiates a claim
- [ ] `window.keplr.getKey('cosmoshub-4')` → extract `bech32Address` (`cosmos1...`)
- [ ] Replace mock cosmos address in `KeplrModal.jsx` with real Keplr key
- [ ] Show a "Keplr not installed" error state if `window.keplr` is absent

### 7. MetaMask `personal_sign` — Ownership Proof

- [ ] After getting Keplr cosmos address, call:
  ```js
  window.ethereum.request({
    method: 'personal_sign',
    params: [JSON.stringify({ address: cosmosAddress }), hexAddress],
  })
  ```
- [ ] Pass returned signature into the CosmWasm execute message

### 8. CosmWasm Claim Transaction via Keplr

- [ ] Add dependency: `@cosmjs/cosmwasm-stargate`
- [ ] Add dependency: `@cosmjs/stargate`
- [ ] Get offline signer: `window.keplr.getOfflineSigner('cosmoshub-4')`
- [ ] Create `SigningCosmWasmClient` from signer + RPC endpoint
- [ ] Build execute message:
  ```js
  { claim: { amount, proof, signature } }
  ```
  (adjust field names to match deployed contract ABI)
- [ ] Call `client.execute(cosmosAddress, VITE_CONTRACT_ADDRESS, msg, fee, memo, funds)`

### 9. Transaction Tracking & UX

- [ ] Display real `txHash` returned from `client.execute(...)` in `TxBanner`
- [ ] Add Mintscan explorer link: `https://www.mintscan.io/cosmos/tx/{txHash}`
- [ ] On successful claim: remove token from list or mark it as claimed
- [ ] Optionally poll for tx confirmation before showing success state

### 10. Gas / Fee Handling

- [ ] Use `calculateFee` from `@cosmjs/stargate` or a fixed gas estimate for Cosmos Hub
- [ ] Display the estimated fee in ATOM in `KeplrModal` Step 2 summary

### 11. Error Handling

- [ ] MetaMask user rejection (`code 4001`) → silently cancel (no error banner)
- [ ] Keplr user rejection → silently cancel (no error banner)
- [ ] API non-200 responses → show error banner with retry button
- [ ] Contract revert / already-claimed → parse error message, surface in banner
- [ ] Network offline / fetch failure → catch and show error state

### 12. Token Display

- [ ] Drive token list entirely from API response (denom, amount, symbol, name)
- [ ] In `TokenLogo.jsx`: optionally fetch logo from Cosmos chain registry, fall back to letter badge

### 13. Dependencies to Add

| Package | Purpose |
|---|---|
| `@cosmjs/cosmwasm-stargate` | CosmWasm contract execution |
| `@cosmjs/stargate` | Cosmos signing / broadcasting |
| `@keplr-wallet/types` (dev) | TypeScript types for `window.keplr` |

### 14. State Management Cleanup (optional / future)

- [ ] Extract wallet logic → `src/hooks/useWallet.js`
- [ ] Extract token fetching → `src/hooks/useTokens.js`
- [ ] Extract claim logic → `src/hooks/useClaim.js`

---

## Key Files

| File | What changes |
|---|---|
| `src/data/tokens.js` | Remove `MOCK_TOKENS`; export API helper functions |
| `src/App.jsx` | Real MetaMask connect, API token fetch, remove dev panel & mocks |
| `src/components/KeplrModal.jsx` | Real Keplr connect, `personal_sign`, CosmWasm tx |
| `src/components/TxBanner.jsx` | Add real `txHash` + Mintscan link |
| `.env.example` | New file — document all `VITE_*` env vars |

---

## Verification Checklist

- [ ] `npm run dev` loads with no mock data; empty state shown for fresh wallet
- [ ] Connect MetaMask → API called → real token list displayed
- [ ] Click "Claim" → Keplr popup → real `cosmos1...` address shown in modal
- [ ] Confirm → MetaMask `personal_sign` popup → then Keplr tx approval popup
- [ ] Tx broadcasts → banner shows real `txHash` with Mintscan link
- [ ] Refresh page → claimed token no longer appears (on-chain state confirmed)
