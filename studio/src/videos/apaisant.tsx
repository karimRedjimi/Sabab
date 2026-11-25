// « Apaisant » : réciter le verset du jour. « Un jour, un verset » du jeudi 26 novembre 2026 (Ghâfir 40:60, affiché par l’appli, non dit par la voix).
// Peu de voix, sons doux (pop, tick, shimmer), pas de flash. Texte du verset : public/voix/apaisant.textes.json (copié par programme, versetDuJour).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/apaisant.json";

const T = minutage(voix, 6, 90);
const { L, mot } = T;
const MICRO = mot(/^sans/, 2);

// Des ondes douces autour d’un point (en pixels de l’écran du téléphone), une par instant donné.
const Ondes: React.FC<{ x: number; y: number; at: number[] }> = ({ x, y, at }) => {
  const f = useCurrentFrame();
  return <>{at.map((a, i) => {
    const k = interpolate(f, [a, a + 50], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
    if (f < a) return null;
    return <div key={i} style={{ position: "absolute", left: x - 40 - 120 * k, top: y - 40 - 120 * k, width: 80 + 240 * k, height: 80 + 240 * k, borderRadius: "50%", border: `4px solid ${GOLD}`, opacity: 0.8 * (1 - k) }} />;
  })}</>;
};

// ---------- 1 à 3. Le verset du jour : la date, écouter, puis réciter ----------
const E = "ecrans/verset-jour";
const ZT = zone(E, /^Un jour, un verset$/, 1), ZD = zone(E, /^26 novembre 2026$/), ZE = zone(E, /^Écouter$/), ZR = zone(E, /^Réciter le verset$/);
const Verset: React.FC = () => <Phone ecran={E} from={0} to={MICRO} entree="bas" sortie="recul" focus={[{ at: L[1] - 10, px: 0.6, py: 0.45, s: 1.05 }]}>
  <Surligne at={mot(/^verset/)} {...ZT} fin={mot(/^Coran/) + 14} />
  <Surligne at={mot(/^Coran/) + 4} {...ZD} fin={L[1] - 6} />
  <Surligne at={mot(/écoutes/, 1)} {...ZE} fin={L[2] - 6} />
  <Ondes x={(ZE.x + ZE.w * 0.15) * W} y={(ZE.y + ZE.h / 2) * H} at={[mot(/^fois/, 1), mot(/^autre/, 1)]} />
  <Surligne at={mot(/^récites/, 2)} {...englobe(ZR, zone(E, /^Une minute au plus/))} />
</Phone>;

// ---------- 4. À ta voix, sans te presser : le micro et des ondes lentes ----------
const Micro: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - MICRO, fps, config: { damping: 20, stiffness: 60 } });
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3].map((i) => {
        const k = ((f - MICRO + i * 22) % 88) / 88;
        return <div key={i} style={{ position: "absolute", left: 540 - 130 - 260 * k, top: 640 - 130 - 260 * k, width: 260 + 520 * k, height: 260 + 520 * k, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: s * 0.6 * (1 - k) }} />;
      })}
      <div style={{ position: "absolute", left: 540 - 130, top: 640 - 130, width: 260, height: 260, borderRadius: "50%", background: "rgba(42,12,34,0.95)", boxShadow: `0 0 0 4px ${GOLD}, 0 0 60px rgba(233,196,106,0.5)`, display: "grid", placeItems: "center", transform: `scale(${s})`, opacity: s }}>
        <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x={9} y={3} width={6} height={11} rx={3} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 52, color: GOLD, opacity: interpolate(f, [mot(/^presser/, 2) - 6, mot(/^presser/, 2) + 14], [0, 1], C) }}>à ton rythme</div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["shimmer", 4, 0.35], ["tick", mot(/^verset/) + 10, 0.25], ["tick", mot(/^Coran/) + 14, 0.2],
  ["pop", mot(/^fois/, 1) + 8, 0.25], ["pop", mot(/^autre/, 1) + 12, 0.25],
  ["tick", mot(/^récites/, 2) + 14, 0.25], ["shimmer", MICRO + 4, 0.3],
  ["shimmer", L[3] - 22, 0.3], ["tick", L[3] + 46, 0.2],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1], L[2], MICRO + 10, L[3], T.DUREE]} />
    <Verset />
    <Scene from={MICRO - 4} to={L[3] - 4} zin={0.05} zout={0.05}><Micro /></Scene>
    <Scene from={L[3] - 6} to={T.DUREE + 10} zin={0.05}><Logo at={L[3]} phrase="Une journée à la fois" /></Scene>
    <Voile />
    <SousTitres T={T} or={/^(verset|Coran|l’écoutes|autre|récites|voix|presser|Sabab|fois)/i} grandsDes={3} />
    <Son voix="apaisant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "apaisant", component: Video, duree: T.DUREE };
