export function TokenLogo({ symbol, color, size = 36 }) {
  const letter = symbol[0];
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `${color}22`,
      border: `1.5px solid ${color}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: size * 0.38,
        fontWeight: 700,
        color: color,
        letterSpacing: '-0.5px',
      }}>{letter}</span>
    </div>
  );
}
