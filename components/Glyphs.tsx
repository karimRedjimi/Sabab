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
};

export type GlyphName = keyof typeof P;

export function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

/** Tuile colorée douce, pour les prières et les moments. */
export const TONES: Record<string, { icon: string; tone: string }> = {
  fajr: { icon: "dawn", tone: "t-dawn" }, dhuhr: { icon: "sun", tone: "t-sun" }, asr: { icon: "cloud", tone: "t-cloud" },
  maghrib: { icon: "sunset", tone: "t-sunset" }, isha: { icon: "moon", tone: "t-night" },
  matin: { icon: "dawn", tone: "t-dawn" }, jour: { icon: "sun", tone: "t-sun" }, soir: { icon: "sunset", tone: "t-sunset" }, actions: { icon: "hand", tone: "t-act" },
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
