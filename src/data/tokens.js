import { API_URL } from '../config';

const DECIMALS = 6;

async function fetchUsdPrices(coingeckoIds) {
  const ids = coingeckoIds.filter(Boolean).join(',');
  if (!ids) return {};
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
  );
  if (!res.ok) return {};
  return res.json();
}

export async function fetchBalances(hexAddress) {
  const res = await fetch(`${API_URL}/balances/${hexAddress}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const prices = await fetchUsdPrices(data.map(t => t.coingeckoId));

  return data.map(t => {
    const humanAmount = parseInt(t.amount, 10) / Math.pow(10, DECIMALS);
    const price = prices[t.coingeckoId]?.usd ?? 0;
    const usdValue = (humanAmount * price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return {
      id: t.denom,
      denom: t.denom,
      amount: t.amount,
      symbol: t.symbol,
      name: t.name,
      coingeckoId: t.coingeckoId,
      usd: usdValue,
      stage: t.stage,
      claimed: t.claimed,
    };
  });
}

export async function fetchProofs(hexAddress, tokens, signature) {
  const results = await Promise.all(
    tokens.map(t =>
      fetch(`${API_URL}/proof/${hexAddress}/${t.denom}?signature=${encodeURIComponent(signature)}`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => ({ denom: t.denom, proof: data.proof }))
    )
  );
  return Object.fromEntries(results.map(r => [r.denom, r.proof]));
}
