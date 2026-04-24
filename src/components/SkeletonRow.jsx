export function SkeletonRow({ delay = 0 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '18px 24px',
      borderBottom: '1px solid var(--border)',
      opacity: 0,
      animation: `fadeUp 0.4s ease ${delay}s forwards`,
    }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div className="skeleton" style={{ width: 80, height: 14 }} />
        <div className="skeleton" style={{ width: 50, height: 11 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
        <div className="skeleton" style={{ width: 100, height: 14 }} />
        <div className="skeleton" style={{ width: 65, height: 11 }} />
      </div>
      <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 8, flexShrink: 0 }} />
    </div>
  );
}
