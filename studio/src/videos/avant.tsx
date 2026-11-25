// « Avant / Maintenant » : ne pas voir ses progrès. Aucun texte religieux dit.
// Avant (graphisme, gris) : des efforts sans trace, un jour manqué qui cache tout. Maintenant : le suivi, la régularité sur 30 jours, le bilan de la semaine.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/avant.json";

const T = minutage(voix);
const { L, mot } = T;
const BASCULE = L[3];
const LIEN = mot(/^lien/, 7);

// ---------- Le fond « avant » : gris, qui s’efface en diagonale à la bascule ----------
const Gris: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [BASCULE - 6, BASCULE + 10], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  if (p >= 1) return null;
  return <AbsoluteFill style={{ background: "linear-gradient(180deg,#1A1A20,#24242C 60%,#2E2E36)", clipPath: `polygon(0 ${p * 130}%, 100% ${p * 130 - 30}%, 100% 100%, 0 100%)` }} />;
};
const Etiquette: React.FC<{ texte: string; at: number; or?: boolean; top?: number; taille?: number }> = ({ texte, at, or, top = 150, taille = 52 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${s})` }}>
    <span style={{ display: "inline-block", padding: "14px 44px", borderRadius: 999, background: or ? GOLD : "#3A3A44", color: or ? PLUM : "rgba(255,255,255,0.75)", fontFamily: FONT, fontWeight: 800, fontSize: taille, letterSpacing: "0.1em",
      boxShadow: or ? "0 0 60px rgba(233,196,106,0.7)" : "none" }}>{texte}</span>
  </div>;
};

// ---------- 1. Avant : une courbe plate, et un point d’interrogation ----------
const Plat: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const trace = interpolate(f, [8, mot(/^avancer/)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const q = spring({ frame: f - mot(/^avancer/), fps, config: { damping: 7, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={2} />
      <svg width={900} height={700} style={{ position: "absolute", left: 90, top: 400 }}>
        <path d="M60 40 V620 H860" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={8} strokeLinecap="round" />
        <path d="M60 470 C200 440 260 500 380 460 S600 490 840 470" fill="none" stroke="#9A9AA6" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${trace} 1`} />
      </svg>
      <div style={{ position: "absolute", left: 540 - 70, top: 560, width: 140, height: 140, borderRadius: "50%", background: "#3A3A44", display: "grid", placeItems: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 96, color: "#fff", transform: `scale(${q}) rotate(${(1 - q) * -30}deg)` }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Avant : des efforts qui s’effacent ----------
const SansTrace: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const efface = mot(/^aucune/, 1);
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[1] - 6} />
      {Array.from({ length: 7 }, (_, i) => {
        const s = spring({ frame: f - L[1] - i * 3, fps, config: { damping: 12, stiffness: 180 } });
        const o = interpolate(f, [efface - 4 + i * 2, efface + 12 + i * 2], [1, 0], C);
        return <div key={i} style={{ position: "absolute", left: 125 + i * 120, top: 640, width: 90, height: 90, borderRadius: "50%", background: "#9A9AA6", transform: `scale(${s})`, opacity: o, filter: `blur(${(1 - o) * 12}px)` }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "rgba(255,255,255,0.8)", opacity: interpolate(f, [efface + 6, efface + 16], [0, 1], C) }}>aucune trace</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Avant : un jour manqué qui cache tout ----------
const Manque: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const m = mot(/^manqué/, 2), grand = spring({ frame: f - mot(/^voyais/, 2), fps, config: { damping: 14, stiffness: 90 } });
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[2] - 6} />
      {Array.from({ length: 7 }, (_, i) => {
        const s = spring({ frame: f - L[2] - i * 2, fps, config: { damping: 12, stiffness: 180 } });
        const x = i === 3;
        const sc = x ? 1 + 2.6 * grand : 1;
        return <div key={i} style={{ position: "absolute", left: 125 + i * 120, top: 640, width: 90, height: 90, borderRadius: "50%", transform: `scale(${s * sc})`, zIndex: x ? 2 : 1,
          background: x && f >= m ? "#2E2E36" : "#9A9AA6", border: x && f >= m ? "5px solid #E07A5F" : "none", opacity: x ? 1 : 1 - 0.75 * grand,
          display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#E07A5F" }}>{x && f >= m ? "✕" : ""}</div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- 4. Maintenant : le suivi ----------
const ES = "ecrans/suivi";
const ZTI = zone(ES, /^Ton suivi$/), ZR = englobe(zone(ES, /^Prières$/), zone(ES, /^Coran$/), zone(ES, /^100 %$/)), ZM = englobe(zone(ES, /^Matin : 2 sur 6/), zone(ES, /^C’est ton moment le plus fragile/));
const Suivi: React.FC = () => <Phone ecran={ES} from={BASCULE + 16} to={L[4] - 2} entree="zoom" sortie="gauche">
  <Surligne at={mot(/^trace/, 3)} {...ZTI} fin={mot(/^chaque/, 3) + 4} />
  <Surligne at={mot(/^journée/, 3)} {...ZR} fin={mot(/^matin/, 3) - 2} />
  <Surligne at={mot(/^matin/, 3)} {...ZM} />
</Phone>;

// ---------- 5. Maintenant : la régularité sur 30 jours ----------
const E2 = "ecrans/suivi2";
const ZREG = englobe(zone(E2, /^Ta régularité$/), zone(E2, /^30 derniers jours$/)), ZCAL = englobe(zone(E2, /^28$/), zone(E2, /^26$/)), Z24 = englobe(zone(E2, /^24$/, 1), zone(E2, /^jours tenus$/));
const Regularite: React.FC = () => <Phone ecran={E2} from={L[4] - 4} to={L[5] - 2} entree="droite" sortie="traverse" focus={[{ at: L[4] + 6, px: 0.5, py: 0.55, s: 1.06 }]}>
  <Surligne at={mot(/^30/, 4)} {...ZREG} fin={mot(/^régularité/, 4) - 2} />
  <Surligne at={mot(/^régularité/, 4)} {...{ ...ZCAL, x: ZCAL.x, w: zone(E2, /^3$/).x + zone(E2, /^3$/).w - ZCAL.x }} fin={mot(/^24/, 4) - 2} />
  <Surligne at={mot(/^24/, 4)} {...Z24} />
</Phone>;

// ---------- 6. Maintenant : le bilan de la semaine ----------
const EB = "ecrans/bilan";
const ZB = englobe(zone(EB, /^3 \/ 4$/), zone(EB, /^Aussi régulier/)), ZBT = zone(EB, /^Mon bilan$/);
const Bilan: React.FC = () => <Phone ecran={EB} from={L[5] - 4} to={L[6] - 2} entree="bascule" sortie="recul">
  <Surligne at={mot(/^bilan/, 5)} {...ZBT} fin={mot(/^simple/, 5) + 2} />
  <Surligne at={mot(/^simple/, 5) + 4} {...ZB} />
  <Pastille at={mot(/^jugement/, 5)} x={W * 0.5} y={H * 0.262} gold>Sans jugement</Pastille>
</Phone>;

// ---------- 7. Pas de classement : le podium s’efface, un seul chemin reste ----------
const Chemin: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pod = spring({ frame: f - L[6], fps, config: { damping: 12, stiffness: 160 } });
  const barre = interpolate(f, [mot(/^classement/, 6), mot(/^classement/, 6) + 10], [0, 1], C);
  const out = interpolate(f, [mot(/^Juste/, 6) - 6, mot(/^Juste/, 6) + 6], [1, 0], C);
  const ch = interpolate(f, [mot(/^Juste/, 6), mot(/^chemin/, 6) + 14], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div style={{ opacity: pod * out }}>
        {[[1, 340, 260], [0, 470, 380], [2, 600, 200]].map(([k, x, h]) => (
          <div key={k} style={{ position: "absolute", left: x - 60, top: 900 - h, width: 120, height: h, borderRadius: 18, background: "rgba(255,255,255,0.2)", transform: `scaleY(${pod})`, transformOrigin: "bottom" }} />
        ))}
        <svg width={600} height={600} style={{ position: "absolute", left: 240, top: 360 }}>
          <path d="M60 60 L540 540" stroke="#E07A5F" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${barre} 1`} />
        </svg>
      </div>
      <svg width={1080} height={1000} style={{ position: "absolute", left: 0, top: 260 }}>
        <path d="M540 900 C 300 760, 820 600, 540 460 S 420 200, 540 120" fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${ch} 1`} style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: 540 - 50, top: 260 + 120 - 50, transform: `scale(${ch > 0.95 ? 1 : 0})` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["whoosh", 2, 0.4], ["pop", mot(/^avancer/) + 10, 0.45],
  ["pop", L[1] + 6, 0.3], ["tick", mot(/^trace/, 1) + 10, 0.35],
  ["tick", mot(/^manqué/, 2) + 8, 0.45], ["vibration", mot(/^celui-là/, 2) + 8, 0.3],
  ["impact", BASCULE + 2, 0.55], ["shimmer", BASCULE + 4, 0.35], ["tick", mot(/^journée/, 3) + 10, 0.35],
  ["whoosh", L[4] - 16, 0.45], ["tick", mot(/^régularité/, 4) + 12, 0.35], ["ding", L[5] - 14, 0.35],
  ["whoosh", L[5] - 16, 0.45], ["pop", mot(/^jugement/, 5) + 12, 0.4],
  ["whoosh", L[6] - 16, 0.4], ["tap", mot(/^classement/, 6) + 10, 0.35], ["shimmer", mot(/^Juste/, 6) + 4, 0.35],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, BASCULE - 2, BASCULE + 14, L[6] - 6, L[7] + 10, T.DUREE]} />
    <Gris />
    <Scene from={0} to={L[1] - 2} zin={0}><Plat /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><SansTrace /></Scene>
    <Scene from={L[2] - 4} to={BASCULE - 2}><Manque /></Scene>
    <Scene from={BASCULE - 2} to={BASCULE + 22} zin={0.1} zout={0.6}><Etiquette texte="MAINTENANT" at={BASCULE} or top={620} taille={78} /></Scene>
    <Suivi />
    <Regularite />
    <Bilan />
    <Scene from={L[6] - 4} to={LIEN - 2}><Chemin /></Scene>
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Voir le chemin parcouru" /></Scene>
    <Flash at={BASCULE} />
    <Voile />
    <SousTitres T={T} or={/^(avancer|trace|manqué|Maintenant|journée|30|régularité|24|bilan|jugement|classement|chemin|Sabab)/i} grandsDes={99} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "avant", component: Video, duree: T.DUREE };
