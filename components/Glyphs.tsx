// Icônes fines de l’application (traits de 1,7 px, 24 × 24).
import type { ReactNode } from "react";

const P: Record<string, ReactNode> = {
  dawn: <><path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 7v3M5.6 10.6l1.4 1.4M18.4 10.6 17 12" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
  cloud: <><circle cx="9" cy="9" r="3" /><path d="M9 3.5v1M3.5 9h1M5.1 5.1l.7.7M12.9 5.1l-.7.7" /><path d="M8 19h9a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.6 1.2A2.4 2.4 0 0 0 8 19z" /></>,
  sunset: <><path d="M4 17h16M7 17a5 5 0 0 1 10 0M12 4v5M9.5 6.5 12 9l2.5-2.5M5 20h14" /></>,
  moon: <path d="M15.5 3.2a8.5 8.5 0 1 0 5.3 12.6 7 7 0 0 1-5.3-12.6z" fill="currentColor" stroke="none" />,
  hand: <><path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0v7c0 3.6-2.4 6.5-6 6.5-2.4 0-3.9-1.1-5.1-3L4 13.5a1.4 1.4 0 0 1 2.3-1.6L8 14" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  path: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16" /></>,
  cal: <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  chart: <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 15v-3M12 15V9M15 15v-5" /></>,
  rhythm: <><path d="M3 12h3l2.5-5 4 10 2.5-5H21" /></>,
  book: <><path d="M4 5.5c2.8-1 5.5-1 8 .8 2.5-1.8 5.2-1.8 8-.8V19c-2.8-1-5.5-1-8 .8-2.5-1.8-5.2-1.8-8-.8z" /><path d="M12 6.3v13.5" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  people: <><circle cx="8" cy="9" r="3" /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M2.8 19c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6M13.8 15.2c.8-.6 1.7-.9 2.7-.9 2.2 0 3.9 1.4 4.4 4.2" /></>,
  pair: <><circle cx="9" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5 1.4 0 2.6.4 3.5 1.3M12 19c.6-3.2 2.8-5 4-5s3.9 1.8 4.5 5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  half: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" /></>,
  download: <><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14" /></>,
  shield: <path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z" />,
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />,
  pen: <><path d="M14.5 5.5l4 4L9 19H5v-4z" /><path d="M12.5 7.5l4 4" /></>,
  share: <><path d="M12 4v11M7.5 8.5 12 4l4.5 4.5M5 14v5h14v-5" /></>,
  briefcase: <><rect x="3.5" y="7" width="17" height="12.5" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" /></>,
  store: <><path d="M4 9.5 5.5 5h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 11.5V20h13v-8.5M10 20v-4.5h4V20" /></>,
  coins: <><ellipse cx="9" cy="7" rx="5" ry="2.5" /><path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7" /><path d="M10 15.5c.6 1.2 2.6 2 5 2 2.8 0 5-1.1 5-2.5v-4c0-1.4-2.2-2.5-5-2.5" /><path d="M10 19.3c.7 1 2.6 1.7 5 1.7 2.8 0 5-1.1 5-2.5V15" /></>,
  rings: <><circle cx="9" cy="14" r="5" /><circle cx="15" cy="14" r="5" /><path d="M10.5 5.5 12 4l1.5 1.5L12 7z" /></>,
  cap: <><path d="M2.5 9.5 12 5l9.5 4.5L12 14z" /><path d="M6.5 11.6V16c1.6 1.4 3.4 2 5.5 2s3.9-.6 5.5-2v-4.4M21.5 9.5v5" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19c3-4 6-6.5 10-8.5" /></>,
  sparkle: <><path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5z" /><path d="M18.5 15.5c.3 1.8.9 2.4 2.7 2.7-1.8.3-2.4.9-2.7 2.7-.3-1.8-.9-2.4-2.7-2.7 1.8-.3 2.4-.9 2.7-2.7z" /></>,
  seed: <><path d="M12 20v-7" /><path d="M12 13c0-3.5-2.5-6-6.5-6 0 3.5 2.5 6 6.5 6zM12 13c0-3 2-5.5 6-5.5 0 3-2 5.5-6 5.5z" /></>,
  climb: <><path d="M4 18 9.5 12.5l3.5 3.5L20 9" /><path d="M15 9h5v5" /></>,
  feather: <><path d="M20 4c-7 0-12 4.5-13 12l-2 4" /><path d="M7 16c4.5-.5 8.5-3.5 10-8" /><path d="M10.5 9.5H16" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  locate: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  arrowleft: <path d="M15 5l-7 7 7 7" />,
};

export type GlyphName = keyof typeof P;

/** Recentrage des dessins qui ne sont pas exactement au milieu de leur cadre (mesuré sur leur contour). */
const SHIFT: Record<string, [number, number]> = { dawn: [0, -0.5], cloud: [0.25, 0.75], moon: [-0.9, 0.54] };

export function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SHIFT[name] ? <g transform={`translate(${SHIFT[name][0]} ${SHIFT[name][1]})`}>{P[name]}</g> : P[name]}
    </svg>
  );
}

/** Tuile colorée douce, pour les prières et les moments. */
export const TONES: Record<string, { icon: string; tone: string }> = {
  fajr: { icon: "dawn", tone: "t-dawn" }, dhuhr: { icon: "sun", tone: "t-sun" }, asr: { icon: "cloud", tone: "t-cloud" },
  maghrib: { icon: "sunset", tone: "t-sunset" }, isha: { icon: "moon", tone: "t-night" },
  matin: { icon: "dawn", tone: "t-dawn" }, jour: { icon: "sun", tone: "t-sun" }, soir: { icon: "sunset", tone: "t-sunset" }, actions: { icon: "hand", tone: "t-act" },
  objectif: { icon: "target", tone: "t-act" }, geste: { icon: "climb", tone: "t-geste" },
  coran: { icon: "book", tone: "t-coran" },
};
export function Tile({ k, size = 40 }: { k: string; size?: number }) {
  const t = TONES[k];
  return <span className={`gtile ${t.tone}`} style={{ width: size, height: size }}><Glyph name={t.icon} /></span>;
}

/** En-tête de marque des écrans principaux. */
export function Brand({ right }: { right?: ReactNode }) {
  return (
    <div className="brand">
      <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50.00,4.00 63.47,17.47 82.53,17.47 82.53,36.53 96.00,50.00 82.53,63.47 82.53,82.53 63.47,82.53 50.00,96.00 36.53,82.53 17.47,82.53 17.47,63.47 4.00,50.00 17.47,36.53 17.47,17.47 36.53,17.47" /></svg>
      <b>Sabab</b>
      {right && <span className="brandr">{right}</span>}
    </div>
  );
}
