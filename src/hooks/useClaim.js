import { useState } from 'react';

export function useClaim(tokens) {
  const [claimStates, setClaimStates] = useState({});
  const [claimAllState, setClaimAllState] = useState('idle');
  const [modal, setModal] = useState(null);
  const [banner, setBanner] = useState({ message: '', type: '', txHash: '' });

  const resetClaim = () => {
    setClaimStates({});
    setClaimAllState('idle');
  };

  const initClaimStates = (initialClaimStates) => {
    setClaimStates(initialClaimStates);
  };

  const claimToken = (id) => setClaimStates(s => ({ ...s, [id]: 'pending' }));

  const openClaimModal = (token) => setModal({ target: token });

  const openClaimAllModal = () => {
    const unclaimed = tokens.filter(t => !claimStates[t.id] || claimStates[t.id] === 'idle');
    setModal({ target: unclaimed });
  };

  const handleModalConfirmed = (target, txHash) => {
    const ids = Array.isArray(target) ? target.map(t => t.id) : [target.id];
    setClaimStates(s => {
      const next = { ...s };
      ids.forEach(id => { next[id] = 'success'; });
      return next;
    });
    showBanner('Claim submitted!', 'success', txHash);
  };

  const showBanner = (message, type = 'success', txHash = '') =>
    setBanner({ message, type, txHash });

  const dismissBanner = () => setBanner({ message: '', type: '' });

  const allClaimed = tokens.length > 0 && tokens.every(t => claimStates[t.id] === 'success');
  const pendingCount = tokens.filter(t => claimStates[t.id] === 'pending').length;
  const unclaimedCount = tokens.filter(t => !claimStates[t.id] || claimStates[t.id] === 'idle').length;
  const totalUsd = tokens
    .filter(t => !claimStates[t.id] || claimStates[t.id] !== 'success')
    .reduce((acc, t) => acc + parseFloat(t.usd.replace(/,/g, '')), 0);

  return {
    claimStates,
    claimAllState,
    modal,
    setModal,
    banner,
    resetClaim,
    initClaimStates,
    claimToken,
    openClaimModal,
    openClaimAllModal,
    handleModalConfirmed,
    showBanner,
    dismissBanner,
    allClaimed,
    pendingCount,
    unclaimedCount,
    totalUsd,
  };
}
