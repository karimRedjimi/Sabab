// « Apaisant » : remplir sa journée moment par moment (matin, journée, soir), la barre qui se remplit. Aucun texte religieux.
// Peu de voix, sons doux (pop, tick, shimmer), pas de flash, rythme lent.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Phone, Surligne, Check, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 90);
const { L, mot } = T;

// ---------- 1 à 3. La journée par moments : chaque moment se coche, un à un ----------
const E = "ecrans/journee";
const MOMENTS = [
  { re: /^Le matin$/, info: /^3 sur 5 · à rattraper$/, n: 0, at: () => mot(/^invocation/, 0) },
  { re: /^Dans la journée$/, info: /^1 sur 5 · à rattraper$/, n: 0, at: () => mot(/^journée/, 1) },
  { re: /^Le soir$/, info: /^2 sur 5 · maintenant$/, n: 0, at: () => mot(/^dernière/, 2) },
].map((m) => { const z = zone(E, m.re, m.n); return { z, carte: englobe(z, zone(E, m.info)), at: m.at() }; });
const Journee: React.FC = () => <Phone ecran={E} from={0} to={L[3] - 4} entree="bas" sortie="recul" focus={[{ at: 20, px: 0.5, py: 0.5, s: 1.05 }]}>
  {MOMENTS.map((m, i) => <React.Fragment key={i}>
    <Surligne at={m.at - 4} {...m.carte} fin={i < 2 ? MOMENTS[i + 1].at - 8 : undefined} />
    <Check at={m.at + 2} x={W * 0.085} y={(m.z.y + m.z.h / 2) * H} size={44} />
  </React.Fragment>)}
</Phone>;

// ---------- 4 et 5. La barre qui se remplit, doucement, puis la journée complète ----------
const Barre: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 20, stiffness: 60 } });
  const p = interpolate(f, [mot(/^remplit/, 3) - 6, L[4] + 6], [0.4, 1], { ...C, easing: Easing.inOut(Easing.sin) });
  const c = spring({ frame: f - mot(/^complète/, 4), fps, config: { damping: 18, stiffness: 70 } });
  const X0 = 140, X1 = 940;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em" }}>TA JOURNÉE</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 150, color: GOLD, fontVariantNumeric: "tabular-nums", textShadow: `0 0 ${30 + 40 * c}px rgba(233,196,106,0.6)` }}>{Math.round(p * 100)} %</div>
      <div style={{ position: "absolute", left: X0, width: X1 - X0, top: 720, height: 48, borderRadius: 24, background: "rgba(255,255,255,0.14)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: 24, background: GOLD, boxShadow: `0 0 ${20 + 30 * c}px rgba(233,196,106,0.8)` }} />
      </div>
      {["Matin", "Journée", "Soir"].map((n, i) => {
        const x = X0 + (X1 - X0) * (i + 0.5) / 3;
        return <div key={n} style={{ position: "absolute", left: x - 120, width: 240, top: 800, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: p >= (i + 1) / 3 - 0.01 ? GOLD : "rgba(255,255,255,0.6)" }}>{n}</div>;
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        const s = spring({ frame: f - mot(/^complète/, 4) - i * 5, fps, config: { damping: 14, stiffness: 90 } });
        const x = 540 + (i - 2) * 150, y = 1000 + Math.abs(i - 2) * 30;
        return <div key={i} style={{ position: "absolute", left: x - 40, top: y - 40, transform: `scale(${s})`, opacity: s }}><StarP size={80} glow={20} /></div>;
      })}
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["shimmer", 4, 0.3],
  ...MOMENTS.map((m) => ["pop", m.at + 10, 0.35] as Sfx),
  ...MOMENTS.map((m) => ["tick", m.at + 18, 0.2] as Sfx),
  ["shimmer", L[3] - 16, 0.3], ["tick", mot(/^doucement/, 3) + 16, 0.2],
  // Le shimmer dure 1,5 s : il doit finir avant « Sabab » (sinon « Sabab » est entendu « Ça va »).
  ["pop", mot(/^complète/, 4) + 14, 0.25],
  ["shimmer", T.FIN + 4, 0.3], ["pop", T.FIN + 2, 0.25],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[3], L[4], L[5], T.DUREE]} />
    <Journee />
    <Scene from={L[3] - 6} to={L[5] - 4} zin={0.05} zout={0.05}><Barre /></Scene>
    <Scene from={L[5] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[5]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(matin|invocation|journée|soir|dernière|barre|doucement|complète|Sabab|fois)/i} grandsDes={5} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
