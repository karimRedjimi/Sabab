// « Apaisant » : terminer ses 5 du’â pour les autres. Peu de voix, sons doux (pop, tick, shimmer), pas de flash.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 70);
const { L, mot } = T;

// ---------- 1 et 3. Cinq lumières, qui s’allument une à une ----------
const Lumieres: React.FC<{ allume: number[] }> = ({ allume }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = spring({ frame: f - 4 - i * 5, fps, config: { damping: 22, stiffness: 70 } });
        const s = allume[i] === undefined ? 0 : spring({ frame: f - allume[i], fps, config: { damping: 22, stiffness: 60 } });
        return <div key={i} style={{ position: "absolute", left: 120 + i * 180 - 60 + 60, top: 620, width: 120, height: 120, borderRadius: "50%", transform: `scale(${0.8 + 0.2 * a})`, opacity: a,
          border: `4px solid rgba(233,196,106,${0.35 + 0.65 * s})`, background: `radial-gradient(circle, rgba(255,241,196,${s}), rgba(233,196,106,${0.8 * s}))`, boxShadow: `0 0 ${70 * s}px rgba(233,196,106,0.8)` }} />;
      })}
    </>
  );
};
const Cinq: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 90, color: "#fff", opacity: interpolate(f, [4, 30], [0, 1], C) }}>
        5 <span style={{ color: GOLD }}>personnes</span>
      </div>
      <Lumieres allume={[]} />
    </AbsoluteFill>
  );
};
const UneAUne: React.FC = () => {
  const f = useCurrentFrame();
  const at = [mot(/^Une/, 2), mot(/^puis/, 2) + 4, mot(/^autre/, 2) + 2, mot(/^jusqu/, 2) + 2, mot(/^cinquième/, 2)];
  const fin = interpolate(f, [mot(/^cinquième/, 2) + 10, mot(/^cinquième/, 2) + 40], [0, 1], C);
  return (
    <AbsoluteFill>
      <Lumieres allume={at} />
      <div style={{ position: "absolute", left: 540 - 70, top: 330, transform: `scale(${fin})`, opacity: fin }}><StarP size={140} glow={40} /></div>
    </AbsoluteFill>
  );
};

// ---------- 2. Lire la demande, invoquer ----------
const E = "ecrans/communaute-demande-haut";
const ZDEM = zone(E, /^Mon commerce ne tourne plus/), ZAMIN = zone(E, /^Âmîn, j’ai invoqué pour elle$/);
const Demande: React.FC = () => <Phone ecran={E} from={L[1] - 8} to={L[2] + 4} entree="bas" sortie="recul" focus={[{ at: L[1] + 10, px: 0.5, py: 0.42, s: 1.06 }]}>
  <Surligne at={mot(/^lis/, 1)} {...ZDEM} fin={mot(/^invoques/, 1) - 2} />
  <Surligne at={mot(/^invoques/, 1)} {...ZAMIN} />
</Phone>;

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 10, L[1] + 30, L[2] - 10, L[2] + 30, T.DUREE]} />
    <Scene from={0} to={L[1] - 4} zin={0} zout={0.05}><Cinq /></Scene>
    <Demande />
    <Scene from={L[2] - 2} to={L[3] - 4} zin={0.05} zout={0.05}><UneAUne /></Scene>
    <Scene from={L[3] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[3]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(Cinq|du’â|demande|doucement|invoques|chacune|cinquième|Sabab|fois)/i} grandsDes={3} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["shimmer", 4, 0.35], ...[0, 1, 2, 3, 4].map((i) => ["tick", 8 + i * 5, 0.15] as Sfx),
  ["pop", mot(/^lis/, 1) + 8, 0.3], ["tick", mot(/^invoques/, 1) + 8, 0.3],
  ["pop", mot(/^Une/, 2) + 6, 0.3], ["pop", mot(/^puis/, 2) + 4, 0.3], ["pop", mot(/^autre/, 2) + 2, 0.3], ["pop", mot(/^jusqu/, 2) + 2, 0.3], ["pop", mot(/^cinquième/, 2) + 12, 0.3],
  ["shimmer", mot(/^cinquième/, 2) + 14, 0.4], ["shimmer", L[3] + 2, 0.4],
];
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
