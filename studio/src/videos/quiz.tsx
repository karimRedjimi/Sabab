// Quiz : « Tu sais ce qu’on dit avant de dormir ? » (citadelle.json · hm-115, Al-Bukhârî).
// Textes religieux : public/voix/quiz.textes.json, copiés par programme depuis content/ (voix/textes.ts).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { AR, C, FONT, GOLD, PLUM, H, W, minutage, motDe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, Logo, zone, type Sfx } from "../moteur";
import voix from "../../public/voix/quiz.json";
import tx from "../../public/voix/quiz.textes.json";

const T = minutage(voix, 6, 75);
const { L, mot } = T;
const D = tx.dua;

const Lune: React.FC<{ x: number; y: number; r: number; k?: number }> = ({ x, y, r, k = 1 }) => {
  const R = r * k;
  return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <path d={`M ${x} ${y - R} A ${R} ${R} 0 1 0 ${x} ${y + R} A ${R * 0.72} ${R} 0 1 1 ${x} ${y - R} Z`} fill="#FFF1C4" transform={`rotate(-20 ${x} ${y})`} style={{ filter: "drop-shadow(0 0 40px rgba(255,241,196,0.8))" }} />
  </svg>;
};

// ---------- 1. L’accroche : QUIZ, la lune, les « z » qui montent ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const q = spring({ frame: f - 1, fps, config: { damping: 7, stiffness: 220 } });
  const dormir = spring({ frame: f - mot(/^dormir/), fps, config: { damping: 9, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", transform: `scale(${q}) rotate(${(1 - q) * -12}deg)` }}>
        <span style={{ display: "inline-block", padding: "16px 60px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: "0.1em", boxShadow: "0 0 80px rgba(233,196,106,0.7)" }}>QUIZ</span>
      </div>
      <Lune x={540} y={720} r={220} k={spring({ frame: f - 4, fps, config: { damping: 12 } })} />
      {[0, 1, 2].map((i) => { const k = ((f + i * 18) % 54) / 54; return (
        <div key={i} style={{ position: "absolute", left: 760 + k * 120, top: 600 - k * 260, fontFamily: FONT, fontWeight: 800, fontSize: 70 + i * 16, color: "#fff", opacity: Math.sin(k * Math.PI) }}>z</div>); })}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1060, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: "#fff", transform: `scale(${dormir})`, opacity: dormir }}>
        Avant de dormir, <span style={{ color: GOLD }}>on dit quoi ?</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Le compte à rebours, calé sur « trois, deux, un » ----------
const Rebours: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = [mot(/^Trois/, 1), mot(/^deux/, 1), mot(/^un/, 1)];
  const idx = f >= t[2] ? 2 : f >= t[1] ? 1 : f >= t[0] ? 0 : -1;
  const s = idx >= 0 ? spring({ frame: f - t[idx], fps, config: { damping: 7, stiffness: 260 } }) : 0;
  const p = interpolate(f, [L[1], L[2] - 2], [1, 0], C);
  const R = 300, CIRC = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={700} r={R} fill="rgba(42,12,34,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth={26} />
        <circle cx={540} cy={700} r={R} fill="none" stroke={GOLD} strokeWidth={26} strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - p)} transform="rotate(-90 540 700)" style={{ filter: "drop-shadow(0 0 18px rgba(233,196,106,0.9))" }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700 - 200, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 340, lineHeight: "400px", color: "#fff", transform: `scale(${0.4 + 0.6 * s})`, opacity: idx >= 0 ? 1 : 0, textShadow: "0 0 60px rgba(233,196,106,0.8)" }}>{["3", "2", "1"][Math.max(0, idx)]}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 56, color: GOLD, opacity: interpolate(f, [L[1], L[1] + 8], [0, 1], C) }}>Réfléchis…</div>
    </AbsoluteFill>
  );
};

// ---------- 3. La réponse : le texte arabe exact, la phonétique, la source ----------
const Reponse: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2] + 2, fps, config: { damping: 12, stiffness: 140 } });
  const src = spring({ frame: f - L[3], fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Lune x={860} y={260} r={90} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 99, background: "rgba(42,12,34,0.9)", border: `3px solid ${GOLD}`, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: GOLD, letterSpacing: "0.08em", opacity: s }}>LA RÉPONSE</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, textAlign: "center", direction: "rtl", whiteSpace: "nowrap", fontFamily: AR, fontSize: 96, lineHeight: 1.5, color: GOLD,
        transform: `scale(${0.85 + 0.15 * s})`, opacity: s, textShadow: "0 0 50px rgba(233,196,106,0.7)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 680, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 50, color: "rgba(255,255,255,0.9)", opacity: interpolate(f, [L[2] + 8, L[2] + 20], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 810, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 50, lineHeight: 1.3, color: "#fff", opacity: interpolate(f, [L[2] + 14, L[2] + 26], [0, 1], C) }}>{D.fr}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", transform: `scale(${src})`, opacity: src }}>
        <span style={{ display: "inline-block", padding: "12px 30px", borderRadius: 99, background: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: PLUM }}>{D.src}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. « Tu avais trouvé ? » : les bulles de commentaires ----------
const Commentaires: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  // Deux réponses possibles (pas de faux commentaires) : on invite à répondre.
  const bulles: [string, number, boolean][] = [["Oui, trouvé ✓", 0, true], ["Pas cette fois", 1, false]];
  const t0 = L[4];
  return (
    <AbsoluteFill>
      {bulles.map(([txt, i, droite]) => {
        const s = spring({ frame: f - t0 - 4 - i * 9, fps, config: { damping: 11, stiffness: 200 } });
        return <div key={i} style={{ position: "absolute", top: 380 + i * 240, [droite ? "right" : "left"]: 90, maxWidth: 760, padding: "34px 46px", borderRadius: 50, background: droite ? GOLD : "rgba(255,255,255,0.95)",
          borderBottomRightRadius: droite ? 10 : 50, borderBottomLeftRadius: droite ? 50 : 10, fontFamily: FONT, fontWeight: 700, fontSize: 52, color: PLUM,
          transform: `scale(${s}) translateY(${(1 - s) * 60}px)`, transformOrigin: droite ? "right bottom" : "left bottom", opacity: s, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>{txt}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", opacity: interpolate(f, [mot(/^commentaire/, 4), mot(/^commentaire/, 4) + 8], [0, 1], C) }}>
        <span style={{ display: "inline-block", padding: "18px 44px", borderRadius: 99, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 4px ${GOLD}`, fontFamily: FONT, fontWeight: 800, fontSize: 50, color: "#fff" }}>Dis-le en commentaire</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Dans l’appli : la bibliothèque ----------
const E = "ecrans/biblio";
const Biblio: React.FC = () => (
  <Phone ecran={E} from={L[5] - 4} to={T.FIN + 14} entree="iris" sortie="recul">
    <Surligne at={mot(/^Sabab/, 5) + 6} {...zone(E, /^Sommeil et réveil 24/)} />
    <Pastille at={mot(/^24/, 5)} x={W * 0.5} y={H * 0.135} gold>24 invocations : sommeil et réveil</Pastille>
  </Phone>
);

const SFX: Sfx[] = [
  ["impact", 1, 0.7], ["shimmer", 8, 0.4], ["pop", mot(/^dormir/), 0.6],
  ["whoosh", L[1] - 4, 0.5], ["tick", mot(/^Trois/, 1), 0.8], ["tick", mot(/^deux/, 1), 0.8], ["tick", mot(/^un/, 1), 0.8],
  ["riser", L[2] - 14, 0.3], ["ding", L[2] - 2, 0.7], ["shimmer", L[2] + 2, 0.4], ["pop", L[3], 0.5],
  ["whoosh", L[4] - 4, 0.5], ["message", L[4] + 4, 0.5], ["message", L[4] + 13, 0.5], 
  ["whoosh", L[5] - 4, 0.6], ["tick", mot(/^Sabab/, 5) + 6, 0.5], ["pop", mot(/^24/, 5), 0.5],
  ["impact", T.FIN + 8, 0.6], ["shimmer", T.FIN + 10, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 8, L[2] + 6, L[5] - 6, L[5] + 10, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Rebours /></Scene>
    <Scene from={L[2] - 4} to={L[4] - 2}><Reponse /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Commentaires /></Scene>
    <Biblio />
    <Scene from={T.FIN + 8} to={T.DUREE + 10} zin={0}><Logo at={T.FIN + 8} phrase="Les invocations du quotidien" /></Scene>
    <Flash at={L[2] - 2} />
    <Voile />
    <SousTitres T={T} or={/^(dormir|Trois|deux|un|Nom|meurs|vis|Bukhârî|trouvé|commentaire|Sabab|24|sommeil)/i} grandsDes={99} />
    <Son voix="quiz.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "quiz", component: Video, duree: T.DUREE };
