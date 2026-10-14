import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReadContract, useReadContracts } from 'wagmi';
import { toHex } from 'viem';
import abi from '../abi/CosmosMerkleClaim.json';
import { CLAIM_CONTRACT, CLAIMS_URL } from '../config';
import { EVM_CHAIN } from '../wagmi';

const contract = { address: CLAIM_CONTRACT, abi, chainId: EVM_CHAIN.id };

async function fetchClaims() {
  const res = await fetch(CLAIMS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Contract state, claims.json and the snapshot entry of a Cosmos key (FRONTEND.md §5.1, §5.3).
export function useAllocation(cosmosAddress) {
  const [now] = useState(() => Date.now() / 1000);
  const claims = useQuery({ queryKey: ['claims', CLAIMS_URL], queryFn: fetchClaims, staleTime: Infinity });

  const state = useReadContracts({
    allowFailure: false,
    contracts: ['merkleRoot', 'deadline', 'paused'].map(functionName => ({ ...contract, functionName })),
  });
  const [root, deadline, paused] = state.data ?? [];

  const addr20 = cosmosAddress ? toHex(cosmosAddress) : undefined;
  const entry = addr20 ? claims.data?.claims?.[addr20] : undefined;

  const claimed = useReadContract({
    ...contract,
    functionName: 'isClaimed',
    args: [BigInt(entry?.index ?? 0)],
    query: { enabled: !!entry },
  });

  return {
    loading: claims.isPending || state.isPending,
    error: claims.error ? 'Could not load the snapshot (claims.json).' :
      state.error ? 'Could not read the claim contract.' : null,
    rootMismatch: !!root && !!claims.data && root.toLowerCase() !== claims.data.root?.toLowerCase(),
    closed: deadline !== undefined && now > Number(deadline),
    paused: !!paused,
    deadline,
    entry,
    claimedLoading: !!entry && claimed.isPending,
    claimed: !!claimed.data,
    refetchClaimed: claimed.refetch,
  };
}
