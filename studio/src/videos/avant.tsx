// « Avant / Maintenant » : ne pas savoir quelle du’â faire pour son besoin. Aucun texte religieux dit.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/avant.json";

const T = minutage(voix);
const { L, mot } = T;
type Z = { x: number; y: number; w: number; h: number };
const union = (a: Z, b: Z): Z => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };
const BASCULE = L[2];

// ---------- Le fond « avant » : gris, qui se déchire à la bascule ----------
const Gris: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [BASCULE - 6, BASCULE + 10], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  if (p >= 1) return null;
  return <AbsoluteFill style={{ background: "linear-gradient(180deg,#1A1A20,#24242C 60%,#2E2E36)", clipPath: `polygon(${p * 130}% 0, 100% 0, 100% 100%, ${p * 130 - 30}% 100%)` }} />;
};
const Etiquette: React.FC<{ texte: string; at: number; or?: boolean; top?: number; taille?: number }> = ({ texte, at, or, top = 150, taille = 52 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", transform: `scale(${s})` }}>
    <span style={{ display: "inline-block", padding: "14px 44px", borderRadius: 999, background: or ? GOLD : "#3A3A44", color: or ? PLUM : "rgba(255,255,255,0.75)", fontFamily: FONT, fontWeight: 800, fontSize: taille, letterSpacing: "0.1em",
      boxShadow: or ? "0 0 60px rgba(233,196,106,0.7)" : "none" }}>{texte}</span>
  </div>;
};

// ---------- 1. Avant : la recherche qu’on tape et retape ----------
const REQUETES: [number, string][] = [[0, "quelle invocation pour mon travail ?"], [0, "quelle invocation pour ma dette ?"]];
const Recherche: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = mot(/^invocation/), t2 = mot(/^Pour$/);
  const tape = (txt: string, a: number, b: number) => txt.slice(0, Math.round(interpolate(f, [a, b], [0, txt.length], C)));
  const second = f >= t2 - 4;
  const txt = second ? tape(REQUETES[1][1], t2 - 4, t2 + 16) : tape(REQUETES[0][1], t1 - 6, t1 + 18);
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={2} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 520, height: 130, borderRadius: 999, background: "#3A3A44", display: "flex", alignItems: "center", gap: 26, padding: "0 46px",
        fontFamily: FONT, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.85)" }}>
        <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2.2}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
        <span>{txt}<span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span></span>
      </div>
      {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: 120, right: 120 + i * 90, top: 700 + i * 70, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.12)",
        opacity: interpolate(f, [t1 + 20 + i * 4, t1 + 28 + i * 4], [0, 1], C) }} />)}
    </AbsoluteFill>
  );
};

// ---------- 2. Avant : vidéos, listes, captures… et la source introuvable ----------
const PILE: [string, string][] = [["vidéos", "Vidéo · 2 M de vues"], ["listes", "Liste : 40 du’â à faire"], ["sources", "Capture d’écran sans source"]];
const Pile: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const j = mot(/^jamais/, 1);
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[1] - 6} />
      {PILE.map(([k, t], i) => {
        const s = spring({ frame: f - mot(new RegExp("^" + k), 1), fps, config: { damping: 10, stiffness: 190 } });
        const r = (random("p" + i) - 0.5) * 12;
        return <div key={k} style={{ position: "absolute", left: 110, right: 110, top: 330 + i * 200, padding: "34px 40px", borderRadius: 30, background: "#34343E", boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - s) * -500}px) rotate(${r * s}deg)`, opacity: s * (1 - 0.6 * interpolate(f, [j, j + 10], [0, 1], C)), fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "rgba(255,255,255,0.85)" }}>{t}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 90, color: "rgba(255,255,255,0.8)", opacity: interpolate(f, [j - 2, j + 6], [0, 1], C) }}>source ?</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Maintenant : dire son besoin ----------
const O = "ecrans/emploi-objectif";
const ZOBJ = (() => { const a = zone(O, /^Ce que je veux atteindre$/), b = zone(O, /^Domaine$/); return { x: a.x, y: a.y, w: a.w, h: b.y - 0.012 - a.y }; })();
const ZDOM = (() => { const a = zone(O, /^Domaine$/), b = zone(O, /^Pourquoi c’est important pour moi$/); return { x: a.x, y: a.y, w: a.w, h: b.y - 0.012 - a.y }; })();
const Objectif: React.FC = () => <Phone ecran={O} from={L[2] + 14} to={L[3] + 2} entree="iris" sortie="gauche" focus={[{ at: L[2] + 22, px: 0.5, py: 0.35, s: 1.08 }]}>
  <Surligne at={mot(/^dis/, 2)} {...ZOBJ} fin={mot(/^besoin/, 2) - 2} />
  <Surligne at={mot(/^besoin/, 2)} {...ZDOM} />
</Phone>;

// ---------- 4. Le parcours : des invocations sourcées et un geste par jour ----------
const P = "ecrans/emploi-parcours";
const ZCARTE = union(zone(P, /^Ouvrir les portes du rizq$/), zone(P, /^Pour une recherche d’emploi/));
const ZINV = zone(P, /^Demander de la grâce d’Allah · L’invocation de Moïse/);
const Parcours: React.FC = () => <Phone ecran={P} from={L[3] - 4} to={L[4] + 2} entree="droite" sortie="bas" focus={[{ at: L[3] + 6, px: 0.5, py: 0.4, s: 1.08 }]}>
  <Surligne at={mot(/^parcours/, 3)} {...ZCARTE} fin={mot(/^invocations/, 3) - 2} />
  <Surligne at={mot(/^invocations/, 3)} {...ZINV} />
  <Pastille at={mot(/^geste/, 3)} x={W * 0.5} y={H * 0.75} gold>Un geste concret par jour</Pastille>
</Phone>;

// ---------- 5. Chaque jour : quoi réciter, et à quel moment ----------
const A = "ecrans/emploi-accueil";
const ZCONT = zone(A, /^Continuer · Le matin$/), ZMOM = zone(A, /^Moment favorable · à l’appel/);
const Accueil: React.FC = () => <Phone ecran={A} from={L[4] - 4} to={L[5] + 2} entree="bascule" sortie="traverse" focus={[{ at: L[4] + 6, px: 0.5, py: 0.45, s: 1.08 }]}>
  <Surligne at={mot(/^réciter/, 4)} {...ZCONT} fin={mot(/^moment/, 4) - 2} />
  <Surligne at={mot(/^moment/, 4)} {...ZMOM} />
</Phone>;

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 4, L[2] + 10, L[5] - 6, L[5] + 14, T.DUREE]} />
    <Gris />
    <Scene from={0} to={L[1] - 2} zin={0}><Recherche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Pile /></Scene>
    <Scene from={L[2] - 4} to={L[2] + 18} zin={0}><Etiquette texte="MAINTENANT" at={L[2]} or top={650} taille={70} /></Scene>
    <Objectif />
    <Parcours />
    <Accueil />
    <Scene from={L[5] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[5]} phrase="Ton besoin, tes invocations" /></Scene>
    <Flash at={BASCULE} />
    <Voile />
    <SousTitres T={T} or={/^(Avant|invocation|travail|dette|vidéos|listes|sources|jamais|Maintenant|besoin|parcours|sourcées|geste|réciter|moment|Sabab|endroit)/i} grandsDes={5} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["clavier", mot(/^invocation/) - 6, 0.35], ["clavier", mot(/^Pour$/) - 4, 0.35],
  ["pop", mot(/^vidéos/, 1) + 4, 0.4], ["pop", mot(/^listes/, 1) + 4, 0.4], ["pop", mot(/^sources/, 1) + 4, 0.4], ["vibration", mot(/^jamais/, 1) + 10, 0.3],
  ["riser", BASCULE - 14, 0.3], ["impact", BASCULE, 0.55], ["shimmer", BASCULE + 3, 0.5],
  ["whoosh", L[2] + 12, 0.5], ["tick", mot(/^dis/, 2) + 6, 0.4], ["tick", mot(/^besoin/, 2) + 8, 0.4],
  ["whoosh", L[3] - 6, 0.5], ["ding", mot(/^invocations/, 3) + 10, 0.4], ["pop", mot(/^geste/, 3) + 8, 0.4],
  ["whoosh", L[4] - 6, 0.5], ["tick", mot(/^réciter/, 4) + 8, 0.4], ["tick", mot(/^moment/, 4) + 8, 0.4],
  ["impact", L[5], 0.6], ["shimmer", L[5] + 2, 0.6],
];
export const video = { id: "avant", component: Video, duree: T.DUREE };
