import { useId } from "react";

export function starPoints(cx: number, cy: number, R: number) {
  const r = (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8), pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 8, k = i % 2 === 0 ? R : r;
    pts.push(`${(cx + k * Math.cos(a)).toFixed(2)},${(cy + k * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}
const PTS = starPoints(50, 50, 46);

/** L’étoile à huit branches qui se remplit selon la progression. */
export function Star({ pct }: { pct: number }) {
  const id = "st" + useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><clipPath id={id}><polygon points={PTS} /></clipPath></defs>
      <polygon className="star-base" points={PTS} />
      <g clipPath={`url(#${id})`}>
        <rect className="star-fill" x="0" y="0" width="100" height="100" style={{ transform: `translate(0px,${(100 * (1 - pct)).toFixed(1)}px)` }} />
      </g>
      <polygon className="star-outline" points={PTS} />
    </svg>
  );
}
