// « Apaisant » : allumer son ciel. Le soir, on note un bienfait, une étoile s’allume. Peu de voix, sons doux (pop, tick, shimmer), pas de flash.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 75);
const { L, mot } = T;

// ---------- 1 et 2. Le journal du soir : la question, puis les bienfaits un à un ----------
const E = "ecrans/journal";
const ZQ = zone(E, /^Pour quoi remercies-tu Allah/), ZFAM = zone(E, /^Ma famille$/, 1), ZSAN = zone(E, /^La santé$/), ZREP = zone(E, /^Un bon repas$/);
const Journal: React.FC = () => <Phone ecran={E} from={0} to={L[2] - 4} entree="bas" sortie="recul">
  <Surligne at={mot(/^notes/)} {...ZQ} fin={L[1] - 4} />
  <Surligne at={mot(/^famille/, 1)} {...ZFAM} />
  <Surligne at={mot(/^santé/, 1)} {...ZSAN} />
  <Surligne at={mot(/^repas/, 1)} {...ZREP} />
</Phone>;

// ---------- 3. Le ciel : les étoiles des soirs passés, et celle de ce soir qui s’allume ----------
const ETOILES = Array.from({ length: 11 }, (_, i) => ({ x: 140 + random("cx" + i) * 800, y: 260 + random("cy" + i) * 620, s: 34 + random("cs" + i) * 26 }));
const Ciel: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const at = mot(/^s’allume/, 2) - 4;
  const n = spring({ frame: f - at, fps, config: { damping: 20, stiffness: 50 } });
  return (
    <AbsoluteFill>
      {ETOILES.map((e, i) => {
        const a = interpolate(f, [L[2] - 4 + i * 2, L[2] + 14 + i * 2], [0, 0.55 + 0.15 * Math.sin(f / 12 + i)], C);
        return <div key={i} style={{ position: "absolute", left: e.x - e.s / 2, top: e.y - e.s / 2, opacity: a }}><StarP size={e.s} fill="#F3E3B5" /></div>;
      })}
      <svg width={1080} height={1200} style={{ position: "absolute", inset: 0, opacity: 0.25 * n }}>
        <polyline points={ETOILES.slice(0, 5).map((e) => `${e.x},${e.y}`).join(" ") + ` 540,640`} fill="none" stroke="#F3E3B5" strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: 540 - 70, top: 640 - 70, transform: `scale(${n})`, opacity: n }}><StarP size={140} glow={50 * n} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 52, color: GOLD, opacity: interpolate(f, [at + 10, at + 30], [0, 1], C) }}>une étoile de plus</div>
    </AbsoluteFill>
  );
};

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2] - 10, L[2] + 20, L[3], T.DUREE]} />
    <Journal />
    <Scene from={L[2] - 6} to={L[3] - 4} zin={0.05} zout={0.05}><Ciel /></Scene>
    <Scene from={L[3] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[3]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(soir|bienfait|famille|santé|repas|étoile|ciel|Sabab|fois)/i} grandsDes={3} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["shimmer", 4, 0.35], ["tick", mot(/^notes/) + 6, 0.25],
  ["pop", mot(/^famille/, 1) + 10, 0.3], ["pop", mot(/^santé/, 1) + 10, 0.3], ["pop", mot(/^repas/, 1) + 12, 0.3],
  ["tick", L[2] - 4, 0.2], ["shimmer", mot(/^s’allume/, 2) + 2, 0.45],
  ["shimmer", L[3] + 2, 0.4], ["tick", L[3] + 40, 0.2],
];
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
