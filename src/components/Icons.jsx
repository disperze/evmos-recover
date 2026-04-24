export function CheckIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.5 12L13 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalletIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="13" r="1.5" fill="currentColor" />
      <path d="M6 5V4a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChevronDown({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RefreshIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M12 7A5 5 0 112 7a5 5 0 014-4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 2l2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetaMaskIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 35 33" fill="none">
      <path d="M32.96 1L19.38 10.9l2.45-5.8L32.96 1z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.04 1l13.46 10-2.33-5.9L2.04 1z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28.23 23.53l-3.61 5.53 7.72 2.13 2.22-7.54-6.33-.12z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M.44 23.65l2.2 7.54 7.71-2.13-3.6-5.53-6.31.12z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.97 14.7l-2.15 3.25 7.66.34-.26-8.23-5.25 4.64z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.03 14.7l-5.34-4.74-.17 8.33 7.65-.34-2.14-3.25z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.35 29.06l4.6-2.23-3.97-3.1-.63 5.33z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.05 26.83l4.6 2.23-.62-5.33-3.98 3.1z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.65 29.06l-4.6-2.23.37 3.02-.04 1.27 4.27-2.06z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.35 29.06l4.28 2.06-.03-1.27.36-3.02-4.61 2.23z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 21.86l-3.83-1.13 2.7-1.24 1.13 2.37z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.3 21.86l1.13-2.37 2.71 1.24-3.84 1.13z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.35 29.06l.65-5.53-4.26.12 3.61 5.41z" fill="#CC6116" stroke="#CC6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 23.53l.65 5.53 3.6-5.41-4.25-.12z" fill="#CC6116" stroke="#CC6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.17 17.95l-7.65.34.71 3.57 1.13-2.37 2.71 1.24 3.1-2.78z" fill="#CC6116" stroke="#CC6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.87 20.73l2.71-1.24 1.12 2.37.72-3.57-7.66-.34 3.11 2.78z" fill="#CC6116" stroke="#CC6116" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.82 17.95l3.21 6.28-.1-3.5-3.11-2.78z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24.07 20.73l-.11 3.5 3.21-6.28-3.1 2.78z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.48 18.29l-.72 3.57.9 4.65.2-6.13-.38-2.09z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.52 18.29l-.37 2.08.19 6.14.9-4.65-.72-3.57z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.3 21.86l-.9 4.65.65.45 3.97-3.1.11-3.5-3.83 1.5z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 21.86l-3.83-1.5.1 3.5 3.97 3.1.65-.45-.89-4.65z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.38 31.12l.04-1.27-.34-.3h-5.16l-.33.3.03 1.27-4.27-2.06 1.49 1.22 3.02 2.09h5.2l3.03-2.09 1.48-1.22-4.19 2.06z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.05 26.83l-.65-.45h-3.8l-.65.45-.36 3.02.33-.3h5.16l.34.3-.37-3.02z" fill="#161616" stroke="#161616" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33.52 11.3l1.14-5.5L32.96 1 20.05 10.55l4.98 4.21 7.04 2.06 1.56-1.82-.67-.49 1.07-.98-.82-.64 1.07-.83-.76-.76z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M.34 5.8l1.15 5.5-.73.58 1.08.83-.82.64 1.07.98-.68.49 1.56 1.82 7.04-2.06 4.98-4.21L2.04 1 .34 5.8z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32.07 16.82l-7.04-2.06 2.14 3.25-3.21 6.28 4.24-.05h6.31l-2.44-7.42z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.97 14.76l-7.04 2.06-2.44 7.42h6.31l4.24.05-3.21-6.28 2.14-3.25z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.52 18.29l.45-7.74 2.03-5.49h-9l2.03 5.49.45 7.74.17 2.1.01 6.12h3.8l.02-6.12.04-2.1z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KeplrLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#2B2F4E" />
      <path d="M12 10h4v8.5l8-8.5h5.5L19.5 21 30 30h-5.5l-8.5-9V30H12V10z" fill="white" />
    </svg>
  );
}
