// « Apaisant » : remplir sa journée moment par moment. Peu de voix, sons doux (pop, tick, shimmer), pas de flash. Aucun texte religieux.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Phone, Surligne, Pastille, Logo, Son, starPoints, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 70);
const { L, mot } = T;

// ---------- 1. Le matin : l’aube douce, les invocations qui s’allument une à une ----------
const Matin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const sol = interpolate(f, [0, L[1]], [0, 1], { ...C, easing: Easing.out(Easing.quad) });
  const titre = spring({ frame: f - 4, fps, config: { damping: 20, stiffness: 60 } });
  const at = [mot(/^invocation/), mot(/^autre/), mot(/^presser/)];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 260, top: 1060 - 220 * sol, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,241,196,0.9), rgba(233,196,106,0.35) 45%, rgba(233,196,106,0) 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 110, color: "#fff", opacity: titre, transform: `translateY(${(1 - titre) * 30}px)`, letterSpacing: "0.02em" }}>Le matin</div>
      {at.map((a, i) => {
        const s = spring({ frame: f - a, fps, config: { damping: 22, stiffness: 70 } });
        return <div key={i} style={{ position: "absolute", left: 540 - 270 + i * 210, top: 560, width: 120, height: 120, borderRadius: "50%", border: `4px solid rgba(233,196,106,${0.35 + 0.65 * s})`,
          background: `rgba(233,196,106,${0.9 * s})`, boxShadow: `0 0 ${50 * s}px rgba(233,196,106,0.7)`, display: "grid", placeItems: "center" }}>
          <svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={PLUM} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: s }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- 2. Dans la journée : les moments se remplissent, la barre avance ----------
const J = "ecrans/journee";
// Les cartes entières : la largeur vient de la carte « Clôturer ta journée », la hauteur de chaque ligne (positions du manifeste).
const CARTE = zone(J, /^Clôturer ta journée 3 questions/);
const ligne = (re: RegExp) => { const z = zone(J, re); return { x: CARTE.x, y: z.y, w: CARTE.w, h: z.h }; };
const ZM = ligne(/^Le matin 3 sur 6/), ZJ = ligne(/^Dans la journée 1 sur 2/), ZS = ligne(/^Le soir 2 sur 5/);
const ZBARRE = (() => { const a = zone(J, /^Ta journée$/), b = zone(J, /^6 sur 13 · encore 7$/), c = zone(J, /^%$/), d = zone(J, /^46$/); const y = Math.min(a.y, d.y); return { x: a.x, y, w: c.x + c.w - a.x, h: b.y + b.h - y }; })();
const Journee: React.FC = () => {
  const barre = mot(/^barre/, 1);
  return <Phone ecran={J} from={L[1] - 8} to={L[2] + 4} entree="bas" sortie="recul" focus={[{ at: L[1] + 10, px: 0.5, py: 0.42, s: 1.06 }]}>
    <Surligne at={mot(/^journée/, 1)} {...ZM} fin={mot(/^après/, 1)} />
    <Surligne at={mot(/^moment/, 1)} {...ZJ} fin={mot(/^l’autre/, 1) + 4} />
    <Surligne at={mot(/^l’autre/, 1)} {...ZS} fin={barre - 2} />
    <Surligne at={barre} {...ZBARRE} />
  </Phone>;
};

// ---------- 3. Le soir : le ciel s’allume, étoile après étoile ----------
const ETOILES = Array.from({ length: 22 }, (_, i) => ({ x: 140 + random("sx" + i) * 800, y: 220 + random("sy" + i) * 700, r: 14 + random("sr" + i) * 18 }));
const Soir: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[2], tout = mot(/^tout/, 2);
  const lune = spring({ frame: f - a, fps, config: { damping: 22, stiffness: 50 } });
  const halo = interpolate(f, [tout, tout + 30], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 300, top: 470 - 300, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(233,196,106,${0.35 * halo}), rgba(233,196,106,0) 65%)` }} />
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {ETOILES.map((e, i) => { const s = spring({ frame: f - a - 6 - i * 3.2, fps, config: { damping: 18, stiffness: 90 } });
          return <polygon key={i} points={starPoints(e.x, e.y, e.r * s)} fill={GOLD} opacity={0.6 + 0.4 * Math.sin(f / 14 + i)} style={{ filter: "drop-shadow(0 0 10px rgba(233,196,106,0.9))" }} />; })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 90, top: 1000, transform: `scale(${lune})`, opacity: lune }}><StarP size={180} glow={30 + 30 * halo} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1220, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 64, color: GOLD, opacity: halo }}>tout est là</div>
    </AbsoluteFill>
  );
};

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 10, L[1] + 30, L[2] - 10, L[2] + 30, T.DUREE]} />
    <Scene from={0} to={L[1] - 4} zin={0} zout={0.05}><Matin /></Scene>
    <Journee />
    <Scene from={L[2] - 2} to={L[3] - 4} zin={0.05} zout={0.05}><Soir /></Scene>
    <Scene from={L[3] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[3]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(matin|invocation|journée|doucement|soir|tout|Sabab|fois)/i} grandsDes={3} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["shimmer", 4, 0.4], ["pop", mot(/^invocation/), 0.35], ["pop", mot(/^autre/), 0.35], ["pop", mot(/^presser/), 0.35],
  ["tick", mot(/^journée/, 1), 0.3], ["tick", mot(/^moment/, 1), 0.3], ["tick", mot(/^l’autre/, 1), 0.3], ["shimmer", mot(/^barre/, 1), 0.35],
  ...Array.from({ length: 6 }, (_, i) => ["tick", L[2] + 8 + i * 12, 0.2] as Sfx), ["shimmer", mot(/^tout/, 2), 0.45],
  ["shimmer", L[3], 0.5], ["pop", L[3] + 4, 0.3],
];
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
