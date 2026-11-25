// « Une fonction à fond » : la bibliothèque de plus de 300 invocations sourcées (thèmes, recherche, fiche, apprendre par cœur).
// Aucun texte religieux dit. Les écrans montrent des invocations de la bibliothèque (recherche « dormir », Tâ-Hâ 20:25-28).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/fonction.json";

const T = minutage(voix);
const { L, mot } = T;
const LIEN = mot(/^lien/, 6);

// ---------- 1. L’accroche : une loupe qui cherche parmi des cartes vides ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const cartes = [0, 1, 2, 3, 4, 5];
  const lx = 540 + Math.sin(f / 11) * 260, ly = 700 + Math.cos(f / 15) * 200;
  const q = spring({ frame: f - mot(/^trouver/), fps, config: { damping: 7, stiffness: 200 } });
  const l = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <AbsoluteFill>
      {cartes.map((i) => {
        const s = spring({ frame: f - 2 - i * 3, fps, config: { damping: 13, stiffness: 160 } });
        const x = 130 + (i % 2) * 430, y = 300 + Math.floor(i / 2) * 300;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 390, height: 250, borderRadius: 36, background: "rgba(42,12,34,0.85)", boxShadow: "0 0 0 2px rgba(255,255,255,0.15)", opacity: s, transform: `scale(${s}) rotate(${(i % 2 ? 1 : -1) * (1 - s) * 10}deg)` }}>
            <div style={{ position: "absolute", left: 36, top: 44, width: 200, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", left: 36, top: 96, width: 300, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.18)" }} />
            <div style={{ position: "absolute", left: 36, top: 132, width: 250, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.18)" }} />
          </div>
        );
      })}
      <svg width={260} height={260} viewBox="0 0 100 100" style={{ position: "absolute", left: lx - 100, top: ly - 100, opacity: l, filter: "drop-shadow(0 0 24px rgba(233,196,106,0.7))" }}>
        <circle cx={40} cy={40} r={28} fill="rgba(233,196,106,0.15)" stroke={GOLD} strokeWidth={7} />
        <path d="M61 61 L90 90" stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 540 - 70, top: 1150, width: 140, height: 140, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center",
        fontFamily: FONT, fontWeight: 800, fontSize: 96, color: PLUM, transform: `scale(${q}) rotate(${(1 - q) * -30}deg)`, boxShadow: "0 0 40px rgba(233,196,106,0.7)" }}>?</div>
    </AbsoluteFill>
  );
};

// ---------- 2 et 3. La bibliothèque : 304 invocations, rangées par thème ----------
const EB = "ecrans/biblio";
const ZN = zone(EB, /^304 invocations$/), ZM = zone(EB, /^Matin et soir 17/), ZS = zone(EB, /^Sommeil et réveil 24/), ZP = zone(EB, /^Prière et mosquée 68/), ZPR = zone(EB, /^Protection 9/);
const Biblio: React.FC = () => <Phone ecran={EB} from={L[1] - 6} to={L[3] - 2} entree="droite" sortie="gauche" focus={[{ at: L[1] + 8, px: 0.5, py: 0.35, s: 1.05 }]}>
  <Surligne at={mot(/^300/, 1)} {...ZN} fin={L[2] - 2} />
  <Pastille at={mot(/^sourcées/, 1)} x={W * 0.66} y={H * 0.118} gold>Toutes sourcées</Pastille>
  <Surligne at={mot(/^matin/, 2)} {...ZM} />
  <Surligne at={mot(/^sommeil/, 2)} {...ZS} />
  <Surligne at={mot(/^prière/, 2)} {...ZP} />
  <Surligne at={mot(/^protection/, 2)} {...ZPR} />
</Phone>;

// ---------- 4. La recherche : « dormir », 13 résultats ----------
const ER = "ecrans/biblio-recherche";
const ZRN = zone(ER, /^13 résultats$/), ZRC = englobe(zone(ER, /^Évocations avant de dormir Joindre/), zone(ER, /^Évocations avant de dormir Réciter les deux/));
const Recherche: React.FC = () => <Phone ecran={ER} from={L[3] - 4} to={L[4] - 2} entree="bascule" sortie="traverse">
  <Pastille at={mot(/^chercher/, 3)} x={W * 0.72} y={H * 0.075} gold>Chercher un mot</Pastille>
  <Surligne at={mot(/^dormir/, 3)} {...ZRN} />
  <Surligne at={mot(/^dormir/, 3) + 6} {...ZRC} />
</Phone>;

// ---------- 5. La fiche ouverte : l’arabe, la phonétique, la traduction, la source ----------
const EF = "ecrans/fiche-recherche";
const ZA = zone(EF, /^«يَجْمَعُ/), ZPH = zone(EF, /^Yajma'u/), ZTR = zone(EF, /^Joindre les mains/), ZSO = zone(EF, /^Source : Al-Bukhârî/);
const Fiche: React.FC = () => <Phone ecran={EF} from={L[4] - 4} to={L[5] - 2} entree="zoom" sortie="gauche">
  <Surligne at={mot(/^l’arabe/, 4)} {...ZA} fin={mot(/^phonétique/, 4) - 2} />
  <Surligne at={mot(/^phonétique/, 4)} {...ZPH} fin={mot(/^traduction/, 4) - 2} />
  <Surligne at={mot(/^traduction/, 4)} {...ZTR} fin={mot(/^source/, 4) - 2} />
  <Surligne at={mot(/^source/, 4)} {...ZSO} />
</Phone>;

// ---------- 6. Apprendre par cœur : le bouton ----------
const EA = "ecrans/fiche-sharh";
const ZBT = zone(EA, /^Apprendre par cœur$/), ZTI = zone(EA, /^L’invocation avant l’épreuve orale$/, 1);
const Apprendre: React.FC = () => <Phone ecran={EA} from={L[5] - 4} to={L[6] - 2} entree="droite" sortie="recul" focus={[{ at: L[5] + 6, px: 0.5, py: 0.35, s: 1.06 }]}>
  <Surligne at={L[5] + 4} {...ZTI} fin={mot(/^bouton/, 5) - 2} />
  <Surligne at={mot(/^bouton/, 5)} {...ZBT} />
</Phone>;

// ---------- 7. La fin : le nombre qui défile ----------
const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [L[6], mot(/^invocations/, 6)], [0, 300], { ...C, easing: Easing.out(Easing.cubic) }));
  const o = interpolate(f, [LIEN - 2, LIEN + 6], [1, 0], C);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 260, color: "#fff", textShadow: "0 0 60px rgba(233,196,106,0.6)" }}>+{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 56, color: GOLD }}>invocations sourcées</div>
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["whoosh", 2, 0.5], ["tap", 14, 0.35], ["pop", mot(/^trouver/) + 6, 0.5],
  ["whoosh", L[1] - 18, 0.55], ["tick", mot(/^300/, 1) + 8, 0.4], ["pop", mot(/^sourcées/, 1) + 8, 0.4],
  ["tick", mot(/^matin/, 2) + 4, 0.35], ["tick", mot(/^sommeil/, 2) + 6, 0.35], ["tick", mot(/^prière/, 2) + 6, 0.35], ["tick", mot(/^protection/, 2) + 10, 0.35],
  ["whoosh", L[3] - 16, 0.5], ["clavier", mot(/^chercher/, 3) + 6, 0.35], ["pop", mot(/^dormir/, 3) + 10, 0.4],
  ["whoosh", L[4] - 16, 0.5], ["tick", mot(/^phonétique/, 4) - 4, 0.35], ["tick", mot(/^traduction/, 4) - 4, 0.35], ["tick", mot(/^source/, 4) + 8, 0.35],
  ["whoosh", L[5] - 16, 0.5], ["tap", mot(/^bouton/, 5) + 8, 0.45], ["ding", mot(/^cœur/, 5) + 10, 0.4],
  ["whoosh", L[6] - 16, 0.45], ["riser", L[6], 0.25],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[1] + 10, L[6] - 6, L[6] + 10, T.DUREE]} />
    <Scene from={0} to={L[1] - 4} zin={0}><Accroche /></Scene>
    <Biblio />
    <Recherche />
    <Fiche />
    <Apprendre />
    <Scene from={L[6] - 4} to={LIEN + 2}><Fin /></Scene>
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Plus de 300 invocations sourcées" /></Scene>
    <Flash at={L[1]} />
    <Voile />
    <SousTitres T={T} or={/^(du’â|trouver|300|sourcées|thème|chercher|dormir|l’arabe|source|retenir|cœur|Sabab|poche)/i} grandsDes={99} />
    <Son voix="fonction.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "fonction", component: Video, duree: T.DUREE };
