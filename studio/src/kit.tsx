// Les briques du motion design Sabab : ciel, étoiles, texte animé, téléphone.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";

export const GOLD = "#E9C46A";
export const FONT = '"DM Sans", system-ui, sans-serif';

export function starPoints(cx: number, cy: number, R: number) {
  const r = (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8), pts: string[] = [];
  for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 8, k = i % 2 === 0 ? R : r; pts.push(`${(cx + k * Math.cos(a)).toFixed(1)},${(cy + k * Math.sin(a)).toFixed(1)}`); }
  return pts.join(" ");
}

/** Le ciel prune : dégradé, lueur dorée qui respire, grandes étoiles en filigrane qui tournent. */
export const Sky: React.FC<{ drift?: number }> = ({ drift = 0 }) => {
  const f = useCurrentFrame();
  const stars: [number, number, number, number][] = [[140, 260, 230, 0.6], [960, 160, 150, -0.9], [900, 1250, 330, 0.4], [110, 1500, 170, -0.7], [560, 1800, 260, 0.5], [620, 700, 90, -1.2]];
  const glow = 0.75 + 0.25 * Math.sin(f / 28);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(130% 90% at 50% 8%, #8B3A6E 0%, #5B1E47 46%, #24091D 100%)" }}>
      <div style={{ position: "absolute", left: "50%", top: 520 + drift, width: 1500, height: 1500, marginLeft: -750, marginTop: -750, borderRadius: "50%", opacity: glow,
        background: "radial-gradient(circle, rgba(233,196,106,0.30), rgba(233,196,106,0) 62%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {stars.map(([x, y, r, s], i) => (
          <polygon key={i} points={starPoints(x, y + drift * (0.4 + i * 0.1), r)} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={3}
            style={{ transformOrigin: `${x}px ${y + drift * (0.4 + i * 0.1)}px`, transform: `rotate(${f * s * 0.35}deg)` }} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Une étoile pleine (logo), qui se remplit d’or. */
export const Star: React.FC<{ size: number; fill?: number; style?: React.CSSProperties }> = ({ size, fill = 1, style }) => {
  const P = starPoints(50, 50, 46), id = "s" + size + Math.round(fill * 100);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <defs><clipPath id={id}><polygon points={P} /></clipPath></defs>
      <polygon points={P} fill="rgba(255,255,255,0.14)" />
      <g clipPath={`url(#${id})`}><rect x={0} y={100 * (1 - fill)} width={100} height={100} fill={GOLD} /></g>
    </svg>
  );
};

/** Un texte qui apparaît mot à mot (montée, flou, fondu). Les mots entre *astérisques* passent en or. */
export const Words: React.FC<{ text: string; at?: number; size?: number; weight?: number; stagger?: number; style?: React.CSSProperties; align?: "center" | "left"; out?: number }> = ({ text, at = 0, size = 84, weight = 700, stagger = 4, style, align = "center", out }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const words = text.split(" ");
  let gold = false;
  const sortie = out == null ? 1 : interpolate(f, [out, out + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: 1.12, letterSpacing: "-0.025em", color: "#fff", textAlign: align, opacity: sortie,
      transform: `translateY(${(1 - sortie) * -20}px)`, textShadow: "0 4px 30px rgba(0,0,0,0.25)", ...style }}>
      {words.map((w, i) => {
        const start = w.startsWith("*"), end = w.endsWith("*");
        if (start) gold = true;
        const isGold = gold;
        if (end) gold = false;
        const clean = w.replace(/\*/g, "");
        const s = spring({ frame: f - at - i * stagger, fps, config: { damping: 16, stiffness: 140 } });
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: s, transform: `translateY(${(1 - s) * 40}px)`, filter: `blur(${(1 - s) * 10}px)`, color: isGold ? GOLD : "#fff" }}>
            {clean}{i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/** Une pastille avec une icône, qui arrive en glissant. */
export const Chip: React.FC<{ icon: React.ReactNode; label: string; at: number }> = ({ icon, label, at }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "26px 34px", borderRadius: 36, background: "rgba(255,255,255,0.09)",
      boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.12)", fontFamily: FONT, fontWeight: 600, fontSize: 50, color: "#fff",
      opacity: s, transform: `translateX(${(1 - s) * -120}px) scale(${0.9 + 0.1 * s})` }}>
      <div style={{ width: 84, height: 84, borderRadius: 24, background: "rgba(233,196,106,0.18)", display: "grid", placeItems: "center", color: GOLD }}>{icon}</div>
      {label}
    </div>
  );
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
