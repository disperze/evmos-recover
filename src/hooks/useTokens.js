import { useState } from 'react';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { fetchBalances as apiFetchBalances } from '../data/tokens';
import { RPC_URL, CONTRACT_ADDRESS } from '../config';

export function useTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalances = async (hexAddress) => {
    setLoading(true);
    setTokens([]);
    setError(null);
    try {
      const normalized = await apiFetchBalances(hexAddress);

      // Short-circuit if there are no tokens to query
      if (normalized.length === 0) {
        setTokens(normalized);
        return { tokens: normalized, initialClaimStates: {} };
      }

      let cwClient;
      try {
        cwClient = await CosmWasmClient.connect(RPC_URL);
      } catch {
        cwClient = null;
      }

      const updated = await Promise.all(
        normalized.map(async (token) => {
          if (!cwClient) {
            return token;
          }
          try {
            const result = await cwClient.queryContractSmart(CONTRACT_ADDRESS, {
              is_claimed: { stage: token.stage, address: hexAddress },
            });
            return { ...token, claimed: result.is_claimed };
          } catch {
            return token;
          }
        })
      );

      setTokens(updated);
      const initialClaimStates = {};
      updated.forEach((t) => {
        if (t.claimed) initialClaimStates[t.id] = 'success';
      });
      return { tokens: updated, initialClaimStates };
    } catch {
      setError('Failed to load tokens. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetTokens = () => {
    setTokens([]);
    setError(null);
  };

  return { tokens, loading, error, fetchBalances, resetTokens };
}
