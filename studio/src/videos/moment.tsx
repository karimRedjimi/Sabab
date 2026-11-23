// « Le moment du calendrier » : cette nuit (mardi), le dernier tiers de la nuit (Al-Bukhârî n° 1145).
// Textes religieux : public/voix/moment.textes.json (copiés par programme depuis content/textes.ts · MOMENTS_FAVORABLES.nuit).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/moment.json";
import tx from "../../public/voix/moment.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const N = tx.nuit;

// ---------- 1. L’accroche : la nuit tombe, un moment que beaucoup laissent passer ----------
const ETOILES = Array.from({ length: 50 }, (_, i) => ({ x: random("x" + i) * 1080, y: 160 + random("y" + i) * 900, r: 2 + random("r" + i) * 4 }));
const Nuit: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const lune = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 100 } });
  const p = interpolate(f, [mot(/^passer/), mot(/^passer/) + 24], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0 }}>
        {ETOILES.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={e.r * lune} fill="#fff" opacity={0.4 + 0.4 * Math.sin(f / 9 + i)} />)}
        <defs><mask id="croissant"><rect width={1080} height={1440} fill="#fff" /><circle cx={640} cy={440} r={190} fill="#000" /></mask></defs>
        <defs><radialGradient id="halo"><stop offset="0%" stopColor="rgba(233,196,106,0.45)" /><stop offset="100%" stopColor="rgba(233,196,106,0)" /></radialGradient></defs>
        <circle cx={540} cy={520} r={360 * lune} fill="url(#halo)" />
        <circle cx={540} cy={520} r={210 * lune} fill="#FFF1C4" mask="url(#croissant)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 96, color: "#fff", opacity: lune, letterSpacing: "0.04em" }}>Cette nuit</div>
      {/* une étoile filante : le moment qui passe */}
      <div style={{ position: "absolute", left: 1000 - 900 * p, top: 220 + 380 * p, width: 160, height: 6, borderRadius: 99, background: "linear-gradient(90deg,#FFF1C4,rgba(233,196,106,0))", transform: "rotate(-23deg)", opacity: p > 0 && p < 1 ? 1 : 0 }} />
    </AbsoluteFill>
  );
};

// ---------- 2. La nuit en trois : le dernier tiers s’allume ----------
const Tiers: React.FC<{ a: number; minutes?: number }> = ({ a, minutes }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const g = spring({ frame: f - a, fps, config: { damping: 14, stiffness: 120 } });
  const t = interpolate(f, [a + 8, a + 24], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const m = minutes === undefined ? 0 : spring({ frame: f - minutes, fps, config: { damping: 10, stiffness: 160 } });
  const X = 100, Lg = 880, Y = 760;
  return (
    <>
      {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: X + (Lg / 3) * i + 6, top: Y, width: Lg / 3 - 12, height: 70, borderRadius: 22, opacity: g,
        background: i === 2 ? `rgba(233,196,106,${0.25 + 0.75 * t})` : "rgba(255,255,255,0.14)", boxShadow: i === 2 ? `0 0 ${60 * t}px rgba(233,196,106,0.9)` : "none" }} />)}
      <div style={{ position: "absolute", left: X - 60, width: 160, top: Y + 100, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "rgba(255,255,255,0.8)", opacity: g }}>Maghreb</div>
      <div style={{ position: "absolute", left: X + Lg - 100, width: 200, top: Y + 100, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: GOLD, opacity: g }}>Fajr</div>
      <div style={{ position: "absolute", left: X + (Lg * 2) / 3, width: Lg / 3, top: Y - 90, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: GOLD, opacity: t }}>1/3</div>
      {minutes !== undefined && <div style={{ position: "absolute", left: X + Lg - 120, top: Y - 14, width: 110, height: 98, borderRadius: 26, border: "6px solid #fff", transform: `scale(${m})`, opacity: m,
        boxShadow: "0 0 40px rgba(255,255,255,0.8)" }} />}
    </>
  );
};
const Dernier: React.FC = () => <AbsoluteFill><Tiers a={L[1] - 2} /></AbsoluteFill>;

// ---------- 3. Un moment favorable, avec sa source ----------
const Carte: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/^moment/, 2), fps, config: { damping: 12, stiffness: 150 } });
  const src = spring({ frame: f - mot(/Bukhârî/, 2), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Tiers a={L[1] - 60} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 250, padding: "44px 40px", borderRadius: 40, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.45)`,
        textAlign: "center", transform: `translateY(${(1 - s) * -80}px)`, opacity: s }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, letterSpacing: "0.1em", color: GOLD }}>MOMENT FAVORABLE</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.3, color: "#fff", marginTop: 14 }}>{N.label}</div>
        <div style={{ display: "inline-block", marginTop: 22, padding: "10px 30px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 40, transform: `scale(${src})` }}>{N.source}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Même quelques minutes avant le Fajr ----------
const Minutes: React.FC = () => <AbsoluteFill><Tiers a={L[1] - 60} minutes={mot(/^minutes/, 3)} /></AbsoluteFill>;

// ---------- 5. Dans Sabab : l’heure du dernier tiers, pour ta ville ----------
const M = "ecrans/moments";
const ZNUIT = (() => { const a = zone(M, /^Le dernier tiers de la nuit$/), b = zone(M, /^Cette nuit, de/); return { x: a.x, y: a.y, w: a.w, h: b.y + b.h - a.y }; })();
const ZHEURE = zone(M, /^Cette nuit, de/);
const ZMOM = zone(M, /^Moment favorable · à l’appel/);
const Accueil: React.FC = () => <Phone ecran={M} from={L[4] - 4} to={L[5] + 2} entree="zoom" sortie="traverse" focus={[{ at: L[4] + 6, px: 0.5, py: 0.45, s: 1.08 }]}>
  <Surligne at={mot(/^l’accueil/, 4)} {...ZMOM} fin={mot(/^heure/, 4) - 4} />
  <Surligne at={mot(/^heure/, 4) - 2} {...ZNUIT} fin={mot(/^ville/, 4) - 2} />
  <Surligne at={mot(/^ville/, 4)} {...ZHEURE} />
</Phone>;

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[4] - 6, L[5] + 4, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Nuit /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Dernier /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2} zin={0}><Carte /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2} zin={0}><Minutes /></Scene>
    <Accueil />
    <Scene from={L[5] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[5]} phrase="Le bon moment, chaque jour" /></Scene>
    <Flash at={L[5]} />
    <Voile />
    <SousTitres T={T} or={/^(nuit|passer|dernier|tiers|favorable|invoquer|Bukhârî|minutes|Fajr|heure|ville|Sabab|bio)/i} grandsDes={5} />
    <Son voix="moment.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["shimmer", 2, 0.5], ["whoosh", mot(/^passer/) + 8, 0.3],
  ["riser", L[1] - 6, 0.25], ["ding", L[1] + 24, 0.4],
  ["shimmer", mot(/^moment/, 2) + 4, 0.4], ["pop", mot(/Bukhârî/, 2) + 12, 0.4],
  ["tick", mot(/^minutes/, 3) + 8, 0.4],
  ["whoosh", L[4] - 6, 0.5], ["tick", mot(/^l’accueil/, 4) + 8, 0.4], ["ding", mot(/^ville/, 4) + 8, 0.4],
  ["impact", L[5], 0.55], ["shimmer", L[5] + 2, 0.5],
];
export const video = { id: "moment", component: Video, duree: T.DUREE };
