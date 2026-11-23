// « Avant / Maintenant » : les prières qui passent sans qu’on les voie venir. Aucun texte religieux dit.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, Scene, Flash, Phone, Surligne, Check, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/avant.json";

const T = minutage(voix);
const { L, mot } = T;
type Z = { x: number; y: number; w: number; h: number };
const union = (a: Z, b: Z): Z => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };
const BASCULE = L[2];

// ---------- Le fond « avant » : gris, terne, qui se déchire à la bascule ----------
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

// ---------- 1. Avant : l’horloge qui file ----------
const Horloge: React.FC<{ vite: number }> = ({ vite }) => {
  const f = useCurrentFrame();
  const m = f * vite * 6, h = m / 12;
  return (
    <svg width={520} height={520} viewBox="-130 -130 260 260" style={{ position: "absolute", left: 540 - 260, top: 380 }}>
      <circle r={120} fill="#2A2A32" stroke="rgba(255,255,255,0.35)" strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-104} x2={0} y2={-92} stroke="rgba(255,255,255,0.4)" strokeWidth={5} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-60} stroke="rgba(255,255,255,0.75)" strokeWidth={9} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={0} x2={0} y2={-92} stroke="rgba(255,255,255,0.9)" strokeWidth={5} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={9} fill="#fff" />
    </svg>
  );
};
const Avant1: React.FC = () => {
  const f = useCurrentFrame();
  const fuit = interpolate(f, [mot(/^voies/), mot(/^venir/) + 10], [0, 1], C);
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={2} />
      <Horloge vite={1 + fuit * 6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 56, color: "rgba(255,255,255,0.55)",
        opacity: 1 - fuit * 0.7, transform: `translateX(${fuit * 500}px)`, filter: `blur(${fuit * 6}px)` }}>la prière</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Avant : le travail, le téléphone, les courses s’empilent ----------
const ICONES: Record<string, React.ReactNode> = {
  travail: <path d="M4 8h16v11H4zM9 8V5h6v3" />,
  telephone: <path d="M8 3h8v18H8zM11 18h2" />,
  courses: <path d="M4 6h2l2 10h10l2-7H7M10 20h.01M17 20h.01" />,
};
const PILE: [string, RegExp, string][] = [["travail", /^travail/, "Réunion qui déborde"], ["telephone", /^téléphone/, "12 notifications"], ["courses", /^courses/, "Liste de courses"]];
const Avant2: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const fil = mot(/^filait/, 1);
  const fuit = interpolate(f, [fil, fil + 16], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Etiquette texte="AVANT" at={L[1] - 6} />
      {PILE.map(([k, re, txt], i) => {
        const s = spring({ frame: f - mot(re, 1), fps, config: { damping: 10, stiffness: 190 } });
        const r = (random("r" + i) - 0.5) * 10;
        return <div key={k} style={{ position: "absolute", left: 120, right: 120, top: 330 + i * 190, padding: "30px 36px", borderRadius: 32, background: "#34343E", boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", gap: 30, transform: `translateY(${(1 - s) * -500}px) rotate(${r * s}deg) translateX(${fuit * (i % 2 ? 900 : -900)}px)`, opacity: s,
          fontFamily: FONT, fontWeight: 700, fontSize: 50, color: "rgba(255,255,255,0.85)" }}>
          <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{ICONES[k]}</svg>
          {txt}
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 140, color: "rgba(255,255,255,0.8)",
        opacity: interpolate(f, [fil - 4, fil + 4], [0, 1], C) }}>
        {String(13 + Math.floor(interpolate(f, [fil, L[2]], [0, 4], C))).padStart(2, "0")}:{String(Math.floor(interpolate(f, [fil, L[2]], [5, 59 * 4], C)) % 60).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Maintenant : la prochaine prière et le temps qui reste ----------
const A = "ecrans/accueil";
const ZPROCH = zone(A, /^Prochaine prière : Maghreb$/), ZRESTE = zone(A, /^dans 1 h 56$/);
const ZHEURES = union(zone(A, /^06:58 Fajr$/), zone(A, /^18:16 ʿIchâ$/));
const Maintenant: React.FC = () => <Phone ecran={A} from={L[2] + 14} to={L[4] + 2} entree="iris" sortie="droite" focus={[{ at: L[2] + 22, px: 0.5, py: 0.4, s: 1.08 }]}>
  <Surligne at={mot(/^prochaine/, 2)} {...ZPROCH} fin={mot(/^reste/, 2) - 2} />
  <Surligne at={mot(/^reste/, 2)} {...ZRESTE} fin={L[3] + 4} />
  <Surligne at={mot(/^horaires/, 3)} {...ZHEURES} />
  <Check at={mot(/^téléphone/, 3)} x={W * 0.5} y={(ZHEURES.y - 0.03) * H} size={56} />
</Phone>;

// ---------- 4. Le rappel doux quand le temps d’une prière se termine ----------
const M = "ecrans/moments";
const ZCARTE = union(zone(M, /^Tu as prié le Maghreb \?$/), zone(M, /^Son temps court jusqu’à 18:16/));
const Rappel: React.FC = () => <Phone ecran={M} from={L[4] - 4} to={L[5] + 2} entree="gauche" sortie="bas" focus={[{ at: L[4] + 6, px: 0.5, py: 0.35, s: 1.1 }]}>
  <Surligne at={mot(/^termine/, 4)} {...ZCARTE} />
</Phone>;

// ---------- 5. Le suivi, sans jugement ----------
const S = "ecrans/suivi";
const ZPRI = union(zone(S, /^Prières$/), zone(S, /^100 %$/));
const ZHEURE = zone(S, /^À l’heure 23$/);
const Suivi: React.FC = () => <Phone ecran={S} from={L[5] - 4} to={L[6] + 2} entree="bascule" sortie="traverse" focus={[{ at: L[5] + 6, px: 0.5, py: 0.42, s: 1.08 }]}>
  <Surligne at={mot(/^progrès/, 5)} {...ZPRI} />
  <Surligne at={mot(/^juger/, 5)} {...ZHEURE} />
</Phone>;

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 4, L[2] + 10, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Gris />
    <Scene from={0} to={L[1] - 2} zin={0}><Avant1 /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Avant2 /></Scene>
    <Scene from={L[2] - 4} to={L[2] + 18} zin={0}><Etiquette texte="MAINTENANT" at={L[2]} or top={650} taille={70} /></Scene>
    <Maintenant />
    <Rappel />
    <Suivi />
    <Scene from={L[6] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[6]} phrase="Une prière après l’autre" /></Scene>
    <Flash at={BASCULE} />
    <Voile />
    <SousTitres T={T} or={/^(Avant|travail|téléphone|courses|filait|Maintenant|prochaine|reste|ville|doucement|progrès|juger|Sabab|l’autre)/i} grandsDes={6} />
    <Son voix="avant.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["tick", 2, 0.5], ["tick", 22, 0.4], ["tick", 42, 0.4], ["whoosh", mot(/^voies/), 0.4],
  ["vibration", mot(/^travail/, 1), 0.5], ["message", mot(/^téléphone/, 1), 0.5], ["pop", mot(/^courses/, 1), 0.5], ["whoosh", mot(/^filait/, 1), 0.6],
  ["riser", BASCULE - 14, 0.35], ["impact", BASCULE, 0.6], ["shimmer", BASCULE + 3, 0.6],
  ["tick", mot(/^prochaine/, 2), 0.5], ["ding", mot(/^reste/, 2), 0.5], ["tick", mot(/^horaires/, 3), 0.5], ["pop", mot(/^téléphone/, 3), 0.5],
  ["whoosh", L[4] - 4, 0.6], ["ding", mot(/^termine/, 4), 0.5],
  ["whoosh", L[5] - 4, 0.6], ["tick", mot(/^progrès/, 5), 0.5], ["pop", mot(/^juger/, 5), 0.5],
  ["impact", L[6], 0.6], ["shimmer", L[6] + 2, 0.6],
];
export const video = { id: "avant", component: Video, duree: T.DUREE };
