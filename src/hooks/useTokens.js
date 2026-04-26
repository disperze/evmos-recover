import { useState } from 'react';
import { fetchBalances as apiFetchBalances } from '../data/tokens';

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
      setTokens(normalized);
      const initialClaimStates = {};
      normalized.forEach(t => { if (t.claimed) initialClaimStates[t.id] = 'success'; });
      return { tokens: normalized, initialClaimStates };
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
