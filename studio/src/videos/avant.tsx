// « Avant / Maintenant » : le soir sans prendre de recul. Aucun texte religieux dit.
// Avant (graphisme, gris) : l’écran jusqu’à minuit, les journées qui défilent. Maintenant : clôturer sa journée (bienfait, geste, ciel).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/avant.json";

const T = minutage(voix);
const { L, mot } = T;
const BASCULE = L[3];

// ---------- Le fond « avant » : gris, qui se retire vers le haut à la bascule ----------
const Gris: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [BASCULE - 6, BASCULE + 12], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  if (p >= 1) return null;
  return <AbsoluteFill style={{ background: "linear-gradient(180deg,#17171C,#22222A 60%,#2B2B33)", clipPath: `inset(0 0 ${p * 100}% 0)` }} />;
};
const Etiquette: React.FC<{ texte: string; at: number; or?: boolean; top?: number; taille?: number }> = ({ texte, at, or, top = 150, taille = 52 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${s})` }}>
    <span style={{ display: "inline-block", padding: "14px 44px", borderRadius: 999, background: or ? GOLD : "#3A3A44", color: or ? PLUM : "rgba(255,255,255,0.75)", fontFamily: FONT, fontWeight: 800, fontSize: taille, letterSpacing: "0.1em", boxShadow: or ? "0 0 60px rgba(233,196,106,0.7)" : "none" }}>{texte}</span>
  </div>;
};

// ---------- 1. L’accroche : le soleil se couche, la journée s’efface ----------
const Coucher: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const d = interpolate(f, [0, mot(/^termine/)], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const q = spring({ frame: f - mot(/^apporté/), fps, config: { damping: 7, stiffness: 190 } });
  const efface = interpolate(f, [mot(/^sais/), mot(/^apporté/)], [1, 0.15], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 160, height: 700, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 540 - 170, top: 160 + 380 * d, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,#F4D58D,#C4562C)", boxShadow: "0 0 120px rgba(196,86,44,0.7)" }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 560, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.4)" }} />
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 940, display: "flex", gap: 22, justifyContent: "center", opacity: efface, filter: `blur(${(1 - efface) * 10}px)` }}>
        {["Matin", "Midi", "Soir"].map((m) => <span key={m} style={{ padding: "16px 34px", borderRadius: 999, background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 44 }}>{m}</span>)}
      </div>
      <div style={{ position: "absolute", left: 540 - 80, top: 1090, width: 160, height: 160, borderRadius: "50%", background: "#3A3A44", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 104, color: "#fff", transform: `scale(${q}) rotate(${(1 - q) * -30}deg)` }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Avant : l’écran jusqu’à minuit ----------
const Minuit: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[1], fps, config: { damping: 14, stiffness: 140 } });
  const m = f >= mot(/^minuit/, 1);
  const defile = (f - L[1]) * 14;
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[1] - 6} />
      <div style={{ position: "absolute", left: 540 - 190, top: 330, width: 380, height: 720, borderRadius: 54, background: "#101014", boxShadow: "0 0 0 8px #3A3A44, 0 0 120px rgba(140,160,255,0.35)", overflow: "hidden", transform: `scale(${s})` }}>
        {Array.from({ length: 12 }, (_, i) => {
          const y = ((i * 170 - defile) % 2040 + 2040) % 2040 - 170;
          return <div key={i} style={{ position: "absolute", left: 26, right: 26, top: y, height: 140, borderRadius: 22, background: i % 3 === 0 ? "#3B3F5C" : i % 3 === 1 ? "#2E3248" : "#454A6A" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, color: m ? "#E07A5F" : "rgba(255,255,255,0.85)", transform: `scale(${m ? 1.06 : 1})`, fontVariantNumeric: "tabular-nums" }}>{m ? "00:00" : "23:58"}</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Avant : les journées qui défilent ----------
const Defile: React.FC = () => {
  const f = useCurrentFrame();
  const v = interpolate(f, [L[2], L[3]], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[2] - 6} />
      {Array.from({ length: 14 }, (_, i) => {
        const x = 540 + (i - 3) * 300 - v * 2400 - (f - L[2]) * 6;
        return <div key={i} style={{ position: "absolute", left: x - 120, top: 520, width: 240, height: 300, borderRadius: 34, background: "#33333C", boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.12)",
          filter: `blur(${v * 10}px)`, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.6)" }}>{jours[i % 7]}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.8)", opacity: interpolate(f, [mot(/^instant/, 2) - 4, mot(/^instant/, 2) + 8], [0, 1], C) }}>sans s’arrêter</div>
    </AbsoluteFill>
  );
};

// ---------- 4. Maintenant : « Clôturer ta journée », 3 questions, 30 secondes ----------
const EJ = "ecrans/journee";
const ZC = englobe(zone(EJ, /^Clôturer ta journée$/), zone(EJ, /^3 questions · 30 secondes$/));
const Journee: React.FC = () => <Phone ecran={EJ} from={L[3] + 18} to={L[4] - 2} entree="bas" sortie="gauche" focus={[{ at: L[3] + 30, px: 0.5, py: 0.65, s: 1.08 }]}>
  <Surligne at={mot(/^questions/, 3) - 6} {...ZC} />
</Phone>;

// ---------- 5. Le bienfait du jour ----------
const EB = "ecrans/journal";
const ZF = zone(EB, /^Ma famille$/, 1), ZS = zone(EB, /^La santé$/), ZR = zone(EB, /^Un bon repas$/), ZQ = zone(EB, /^Pour quoi remercies-tu/);
const Journal: React.FC = () => <Phone ecran={EB} from={L[4] - 4} to={L[5] - 2} entree="droite" sortie="bas" focus={[{ at: L[4] + 6, px: 0.5, py: 0.3, s: 1.06 }]}>
  <Surligne at={mot(/^bienfait/, 4)} {...ZQ} fin={mot(/^famille/, 4) - 4} />
  <Surligne at={mot(/^famille/, 4)} {...ZF} />
  <Surligne at={mot(/^santé/, 4)} {...ZS} />
  <Surligne at={mot(/^repas/, 4)} {...ZR} />
</Phone>;

// ---------- 6. Le geste vers son besoin ----------
const EG = "ecrans/geste";
const ZG = englobe(zone(EG, /^Le geste du jour$/), zone(EG, /^Mets de côté une petite somme/));
const Geste: React.FC = () => <Phone ecran={EG} from={L[5] - 4} to={L[6] - 2} entree="bascule" sortie="recul">
  <Surligne at={mot(/^geste/, 5)} {...ZG} />
</Phone>;

// ---------- 7. Le ciel : chaque bienfait devient une étoile ----------
const EC = "ecrans/ciel";
const ZE = englobe(zone(EC, /^Ta journée est close$/), zone(EC, /^11 étoiles dans ton ciel$/));
const ZK = zone(EC, /^Ton ciel · Cycle 2$/);
const Ciel: React.FC = () => <Phone ecran={EC} from={L[6] - 4} to={L[7] - 2} entree="iris" sortie="traverse" focus={[{ at: L[6] + 6, px: 0.5, py: 0.45, s: 1.06 }]}>
  <Surligne at={mot(/^étoile/, 6)} {...ZE} fin={mot(/^ciel/, 6) - 2} />
  <Surligne at={mot(/^ciel/, 6)} {...englobe(ZK, { x: 0.04, y: 0.5, w: 0.92, h: 0.3 })} />
</Phone>;

const SFX: Sfx[] = [
  ["whoosh", 4, 0.35], ["tick", mot(/^termine/) + 6, 0.3], ["pop", mot(/^apporté/) + 10, 0.5],
  ["whoosh", L[1] - 18, 0.4], ["pop", L[1] - 4, 0.4], ["alarme", mot(/^minuit/, 1) + 12, 0.25],
  ["whoosh", L[2] - 18, 0.4],
  ["impact", BASCULE - 2, 0.6],
  ["tick", mot(/^questions/, 3) + 4, 0.4],
  ["whoosh", L[4] - 18, 0.45], ["tap", mot(/^famille/, 4) + 10, 0.4], ["tap", mot(/^santé/, 4) + 10, 0.35], ["tap", mot(/^repas/, 4) + 10, 0.35],
  ["whoosh", L[5] - 18, 0.4], ["pop", mot(/^geste/, 5) + 12, 0.4],
  ["shimmer", L[6] - 8, 0.4], ["ding", mot(/^ciel/, 6) + 12, 0.4],
  ["whoosh", L[7] - 18, 0.4], ["impact", L[7] - 2, 0.5], ["shimmer", mot(/^lien/, 7) + 12, 0.4],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, BASCULE, BASCULE + 20, L[6], L[7], T.DUREE]} />
    <Gris />
    <Scene from={0} to={L[1] - 2} zin={0}><Coucher /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Minuit /></Scene>
    <Scene from={L[2] - 4} to={BASCULE - 2}><Defile /></Scene>
    <Scene from={BASCULE - 2} to={L[3] + 22}><Etiquette texte="MAINTENANT" at={BASCULE} or top={760} taille={90} /></Scene>
    <Journee />
    <Journal />
    <Geste />
    <Ciel />
    <Scene from={L[7] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[7]} phrase="Prendre le temps, chaque soir" /></Scene>
    <Flash at={BASCULE} />
    <Voile />
    <SousTitres T={T} or={/^(soir|apporté|Avant|minuit|défilaient|arrêter|Maintenant|questions|bienfait|famille|santé|repas|geste|besoin|étoile|ciel|Sabab)/i} grandsDes={7} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "avant", component: Video, duree: T.DUREE };
