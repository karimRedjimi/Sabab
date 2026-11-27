// « Apaisant » : clôturer sa journée (le soir tombe, un bienfait noté, un pas vers son besoin, une étoile, la journée close). Aucun texte religieux dit.
// Peu de voix, sons doux (pop, tick, shimmer), pas de flash, rythme lent. Écrans : journal, geste, ciel (rituel du soir).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, GOLD, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Phone, Surligne, Check, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 90);
const { L, mot } = T;

// ---------- 1. Le soir tombe : le soleil descend derrière l’horizon, les étoiles paraissent ----------
const Soir: React.FC = () => {
  const f = useCurrentFrame();
  const d = interpolate(f, [0, L[1] + 4], [0, 1], { ...C, easing: Easing.inOut(Easing.sin) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1920, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(196,86,44,${0.35 * (1 - d)}) 0%, rgba(91,30,71,${0.3 * (1 - d)}) 45%, rgba(0,0,0,0) 60%)` }} />
        <div style={{ position: "absolute", left: 540 - 160, top: 380 + 460 * d, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,#F4D58D,#C4562C)", boxShadow: `0 0 ${140 - 80 * d}px rgba(196,86,44,0.7)` }} />
        <svg width={1080} height={1920} viewBox="0 -200 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <path d="M0 700 C180 660 300 690 420 670 C560 645 700 690 840 660 C930 642 1010 655 1080 650 V1720 H0 Z" fill="#14050F" />
          <path d="M470 670 V610 C470 585 490 568 510 560 C530 568 550 585 550 610 V670 Z M505 548 V530" fill="#14050F" stroke="#14050F" strokeWidth={4} />
        </svg>
        {[[200, 140], [820, 110], [660, 260], [330, 300], [930, 330]].map(([x, y], i) => {
          const o = interpolate(d, [0.35 + i * 0.1, 0.6 + i * 0.1], [0, 1], C);
          return <div key={i} style={{ position: "absolute", left: x - 18, top: y + 182, opacity: o }}><StarP size={36} glow={12} /></div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Un bienfait du jour, noté (le journal du soir) ----------
const EJ = "ecrans/journal";
const ZF = zone(EJ, /^Ma famille$/, 1), ZQ = zone(EJ, /^Pour quoi remercies-tu/);
const Journal: React.FC = () => <Phone ecran={EJ} from={L[1] - 6} to={L[2] - 4} entree="bas" sortie="recul" focus={[{ at: L[1] + 10, px: 0.5, py: 0.3, s: 1.05 }]}>
  <Surligne at={mot(/^bienfait/, 1)} {...ZQ} fin={mot(/^noté/, 1) - 4} />
  <Surligne at={mot(/^noté/, 1) - 2} {...ZF} />
  <Check at={mot(/^noté/, 1) + 6} x={(ZF.x + ZF.w) * W + 6} y={ZF.y * H} size={50} />
</Phone>;

// ---------- 3. Un petit pas vers ton besoin (le geste du jour) ----------
const EG = "ecrans/geste";
const ZG = zone(EG, /^LE GESTE DU JOUR/i);
const Geste: React.FC = () => <Phone ecran={EG} from={L[2] - 6} to={L[3] - 4} entree="iris" sortie="recul" focus={[{ at: L[2] + 10, px: 0.5, py: 0.3, s: 1.05 }]}>
  <Surligne at={mot(/^pas/, 2)} {...ZG} />
</Phone>;

// ---------- 4 et 5. Une étoile s’allume dans le ciel, la journée se referme ----------
const EC = "ecrans/ciel";
const ZC = zone(EC, /^TON CIEL/i), ZJ = englobe(zone(EC, /^Ta journée est close$/), zone(EC, /^11 étoiles dans ton ciel$/));
const Ciel: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - mot(/allume/, 3), fps, config: { damping: 16, stiffness: 70 } });
  return <Phone ecran={EC} from={L[3] - 6} to={L[5] - 4} entree="bas" sortie="recul" focus={[{ at: L[3] + 10, px: 0.5, py: 0.5, s: 1.05 }]}>
    <Surligne at={mot(/^étoile/, 3)} {...ZC} fin={L[4] - 4} />
    <div style={{ position: "absolute", left: (ZC.x + ZC.w * 0.5) * W - 30, top: (ZC.y + ZC.h * 0.62) * H - 30, opacity: s, transform: `scale(${0.4 + 0.6 * s})` }}><StarP size={60} glow={26 * s} /></div>
    <Surligne at={mot(/^journée/, 4)} {...ZJ} />
  </Phone>;
};

const SFX: Sfx[] = [
  ["shimmer", 4, 0.3], ["tick", 50, 0.15], ["tick", 70, 0.15],
  ["pop", L[1] + 2, 0.3], ["tick", mot(/^noté/, 1) + 14, 0.25],
  ["pop", L[2] + 2, 0.3], ["tick", mot(/^besoin/, 2) + 16, 0.25],
  ["pop", L[3] + 2, 0.3], ["shimmer", mot(/^ciel/, 3) + 12, 0.25],
  ["tick", mot(/^referme/, 4) + 16, 0.25],
  // Les sons longs finissent avant « Sabab » (sinon « Sabab » est entendu « Ça va »).
  ["shimmer", T.FIN + 4, 0.3], ["pop", T.FIN + 2, 0.25],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], L[4], L[5], T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0} zout={0.05}><Soir /></Scene>
    <Journal />
    <Geste />
    <Ciel />
    <Scene from={L[5] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[5]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(soir|doucement|bienfait|noté|pas|besoin|étoile|ciel|referme|Sabab|fois)/i} grandsDes={5} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
