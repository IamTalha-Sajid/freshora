import type { SVGProps } from "react";

// 24x24 stroke icons. Names double as the values admins pick for categories and trust items.
const PATHS: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: <><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L20.5 8H6.2" /><circle cx="10" cy="20.5" r="1.2" /><circle cx="17" cy="20.5" r="1.2" /></>,
  heart: <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
  alert: <path d="M12 4 2.5 20h19zM12 10v4.5M12 17.5h.01" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
  "arrow-up": <path d="M12 19V5M6 11l6-6 6 6" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  bank: <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  pause: <path d="M6 4h4v16H6zM14 4h4v16h-4z" />,
  play: <path d="M7 4.5v15l12-7.5z" />,
  home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  track: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
  truck: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
  shield: <path d="M12 3 5 6v5.5c0 4.3 2.8 8 7 9.5 4.2-1.5 7-5.2 7-9.5V6z" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  box: <><path d="m3 7.5 9-4.5 9 4.5v9L12 21l-9-4.5z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" /></>,
  cash: <><rect x="3" y="6.5" width="18" height="11" rx="2" /><circle cx="12" cy="12" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 9h18v-2.5H3zM12 6.5V20M12 6.5C10 3 6.5 4 7.5 6.5M12 6.5C14 3 17.5 4 16.5 6.5" /></>,
  phone: <path d="M6 3h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />,
  // concern icons
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />,
  tooth: <path d="M7.5 3.5c-2.3 0-4 1.8-4 4.4 0 2 .8 3.4 1.4 5.4.7 2.4.9 6.7 2.6 6.7 1.5 0 1.3-4 2.5-4s1 4 2.5 4c1.7 0 1.9-4.300 2.600-6.700.6-2 1.400-3.400 1.400-5.400 0-2.600-1.700-4.400-4-4.400-1.600 0-2.200.8-3 .8s-2-.8-4-.8z" />,
  smile: <><circle cx="12" cy="12" r="8.5" /><path d="M8.5 14c1 1.600 2.100 2.200 3.500 2.200s2.500-.6 3.500-2.200M9 9.500h.01M15 9.500h.01" /></>,
  leaf: <path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19c3-5 6-8 10-10" />,
  drop: <path d="M12 3s6 6.200 6 11a6 6 0 0 1-12 0c0-4.800 6-11 6-11z" />,
  brush: <path d="M17 3l4 4-8 8-4-4zM9 11l-3.500 3.500c-1.300 1.300-.6 3.500-2.500 4.500 3.500 1 6-.2 7-1.500L13 15" />,
  wind: <path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7" />,
  "gum-care": <path d="M12 20.500s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 7.600a4.300 4.300 0 0 1 7.500 2.700c0 5.600-7.500 10.200-7.500 10.200zM9.500 12h5M12 9.500v5" />,
};

export const ICON_NAMES = ["sparkle", "tooth", "shield", "gum-care", "smile", "wind", "leaf", "drop", "brush", "truck", "cash", "lock", "box", "clock", "gift", "heart", "star", "phone"] as const;

export function Icon({ name, size = 20, ...rest }: { name: string; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      {PATHS[name] ?? PATHS.sparkle}
    </svg>
  );
}
