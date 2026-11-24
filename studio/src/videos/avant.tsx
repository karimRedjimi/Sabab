// « Avant / Maintenant » : commencer fort puis tout lâcher. Aucun texte religieux dit.
// Maintenant : la bannière bienveillante après un jour manqué, le minimum du jour, « Journée chargée ? », reprendre sa journée.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
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

// ---------- 1. Avant : jour 1 plein, jour 2 plein, jour 3 vide ----------
const Jours: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const at = [mot(/^premier/), mot(/^fais/) + 6, mot(/^troisième/)];
  const crash = spring({ frame: f - mot(/^lâches/), fps, config: { damping: 8, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={2} />
      {[0, 1, 2].map((i) => {
        const s = spring({ frame: f - at[i], fps, config: { damping: 12, stiffness: 160 } });
        const haut = i < 2 ? 520 * s : 520 * s * (1 - crash);
        return (
          <div key={i} style={{ position: "absolute", left: 180 + i * 260, top: 400, width: 200, height: 640, opacity: Math.min(1, s * 2) }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 80, height: 540, borderRadius: 30, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 90, height: haut, borderRadius: 24, background: i < 2 ? "linear-gradient(180deg,#9A9AA6,#6A6A76)" : "#7A7A86" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: "rgba(255,255,255,0.75)" }}>jour {i + 1}</div>
            {i === 2 && <div style={{ position: "absolute", left: 40, top: 160, fontFamily: FONT, fontWeight: 800, fontSize: 140, color: "#E07A5F", opacity: crash, transform: `scale(${crash})` }}>✕</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 2. Avant : un seul jour manqué, et tout semble perdu ----------
const Perdu: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const manque = mot(/^manqué/, 1), perdu = mot(/^perdu/, 1);
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[1] - 6} />
      {Array.from({ length: 7 }, (_, i) => {
        const s = spring({ frame: f - L[1] - i * 2, fps, config: { damping: 12, stiffness: 180 } });
        const trou = i === 4 ? interpolate(f, [manque, manque + 6], [1, 0], C) : 1;
        const chute = interpolate(f, [perdu - 4 + i * 2, perdu + 16 + i * 2], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
        return <div key={i} style={{ position: "absolute", left: 125 + i * 120, top: 640 + chute * 700, width: 90, height: 90, borderRadius: "50%", transform: `scale(${s}) rotate(${chute * 90}deg)`,
          background: trou < 1 && i === 4 ? `rgba(224,122,95,${1 - trou})` : "#8A8A96", border: i === 4 && trou < 1 ? "4px dashed #E07A5F" : "none", opacity: (1 - chute) }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "rgba(255,255,255,0.8)", opacity: interpolate(f, [perdu, perdu + 8], [0, 1], C) }}>tout perdu ?</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Avant : on arrête tout ----------
const Arret: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2], fps, config: { damping: 12, stiffness: 160 } });
  const off = interpolate(f, [mot(/^arrête/, 2), mot(/^tout/, 2) + 10], [0, 1], C);
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[2] - 6} />
      <div style={{ position: "absolute", left: 540 - 160, top: 480, width: 320, height: 320, borderRadius: "50%", border: "16px solid #8A8A96", transform: `scale(${s})`, opacity: 1 - 0.6 * off }}>
        <div style={{ position: "absolute", left: 128, top: -40, width: 32, height: 170, borderRadius: 16, background: "#8A8A96", boxShadow: "0 0 0 16px #24242C" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "rgba(255,255,255,0.75)", opacity: off }}>on arrête</div>
    </AbsoluteFill>
  );
};

// ---------- 4 et 5. Maintenant : la bannière bienveillante, puis le minimum ----------
const EM = "ecrans/manque";
const ZHIER = englobe(zone(EM, /^Hier n’a pas été tenu\.$/), zone(EM, /^Ce n’est pas grave/)), ZBTN = zone(EM, /^Commencer par le minimum$/);
const Manque: React.FC = () => <Phone ecran={EM} from={BASCULE + 18} to={L[5] - 2} entree="zoom" sortie="gauche" focus={[{ at: BASCULE + 30, px: 0.5, py: 0.42, s: 1.08 }]}>
  <Surligne at={mot(/^grave/, 3) - 6} {...ZHIER} fin={mot(/^bouton/, 4) - 2} />
  <Surligne at={mot(/^bouton/, 4)} {...ZBTN} />
</Phone>;
const EJ = "ecrans/journee";
const ZCH = zone(EJ, /^Journée chargée \?$/);
const Chargee: React.FC = () => <Phone ecran={EJ} from={L[5] - 4} to={L[6] - 2} entree="droite" sortie="bas" focus={[{ at: L[5] + 6, px: 0.6, py: 0.75, s: 1.08 }]}>
  <Surligne at={mot(/^chargée/, 5)} {...ZCH} />
  <Pastille at={mot(/^minimum/, 5)} x={W * 0.62} y={H * 0.885} gold>Minimum du jour</Pastille>
</Phone>;
const EN = "ecrans/minimum";
const ZMIN = englobe(zone(EN, /^Minimum du jour$/), zone(EN, /^Trois invocations courtes/)), ZREP = zone(EN, /^Reprendre ma journée$/);
const Minimum: React.FC = () => <Phone ecran={EN} from={L[6] - 4} to={LIEN - 2} entree="bas" sortie="recul" focus={[{ at: L[6] + 6, px: 0.5, py: 0.42, s: 1.08 }]}>
  <Surligne at={L[6] + 4} {...ZMIN} fin={mot(/^reprends/, 6) - 2} />
  <Surligne at={mot(/^reprends/, 6)} {...ZREP} />
</Phone>;

const SFX: Sfx[] = [
  ["whoosh", 2, 0.4], ["pop", mot(/^premier/) + 4, 0.4], ["pop", mot(/^fais/) + 10, 0.4], ["pop", mot(/^troisième/) + 4, 0.4], ["impact", mot(/^lâches/) + 6, 0.5],
  ["whoosh", L[1] - 6, 0.4], ["tick", mot(/^manqué/, 1) + 2, 0.5], ["vibration", mot(/^perdu/, 1) + 4, 0.4],
  ["whoosh", L[2] - 6, 0.4], ["tap", mot(/^arrête/, 2) + 4, 0.4],
  ["riser", BASCULE - 24, 0.3], ["impact", BASCULE + 2, 0.6], ["shimmer", BASCULE + 4, 0.4], ["ding", mot(/^grave/, 3) + 4, 0.4],
  ["tap", mot(/^bouton/, 4) + 2, 0.5],
  ["whoosh", L[5] - 6, 0.5], ["tick", mot(/^chargée/, 5) + 4, 0.4], ["pop", mot(/^minimum/, 5) + 6, 0.4],
  ["whoosh", L[6] - 6, 0.5], ["tick", mot(/^reprends/, 6) + 4, 0.4],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, BASCULE - 2, BASCULE + 14, L[6] - 6, L[7] + 10, T.DUREE]} />
    <Gris />
    <Scene from={0} to={L[1] - 2} zin={0}><Jours /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Perdu /></Scene>
    <Scene from={L[2] - 4} to={BASCULE - 2}><Arret /></Scene>
    <Scene from={BASCULE - 2} to={BASCULE + 22} zin={0.1} zout={0.6}><Etiquette texte="MAINTENANT" at={BASCULE} or top={620} taille={78} /></Scene>
    <Manque />
    <Chargee />
    <Minimum />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Reprendre, sans culpabiliser" /></Scene>
    <Flash at={BASCULE} />
    <Voile />
    <SousTitres T={T} or={/^(tout|manqué|perdu|arrête|Maintenant|grave|reprendre|minimum|chargée|reprends|Sabab)/i} grandsDes={99} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "avant", component: Video, duree: T.DUREE };
