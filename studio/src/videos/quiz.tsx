// « Quiz » : ce qu’on dit avant de dormir (Hisn al-Muslim, hm-115 ; Al-Bukhârî).
// Textes religieux : public/voix/quiz.textes.json (copiés par programme depuis content/citadelle.json · hm-115).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/quiz.json";
import tx from "../../public/voix/quiz.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const DECOMPTE = [mot(/^Trois/, 1), mot(/^deux/, 1), mot(/^un/, 1)];
const LIEN = mot(/^lien/, 5);

// ---------- 1. L’accroche : « QUIZ », la lune et la nuit ----------
const Nuit: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const lune = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 120 } });
  const quiz = spring({ frame: f - 8, fps, config: { damping: 7, stiffness: 200 } });
  const zz = (i: number) => interpolate((f + i * 20) % 60, [0, 60], [0, 1]);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", transform: `scale(${quiz}) rotate(${(1 - quiz) * -12}deg)` }}>
        <span style={{ display: "inline-block", padding: "20px 60px", borderRadius: 30, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: "0.08em", boxShadow: "0 0 80px rgba(233,196,106,0.7)" }}>QUIZ</span>
      </div>
      {/* le croissant de lune (un disque masqué par un autre) */}
      <svg width={440} height={440} viewBox="0 0 440 440" style={{ position: "absolute", left: 540 - 220, top: 520, overflow: "visible", transform: `scale(${lune}) rotate(${-20 + Math.sin(f / 20) * 4}deg)`, opacity: lune, filter: "drop-shadow(0 0 50px rgba(233,196,106,0.7))" }}>
        <defs>
          <radialGradient id="lune" cx="40%" cy="40%"><stop offset="0%" stopColor="#FFF6DC" /><stop offset="100%" stopColor="#E9C46A" /></radialGradient>
          <mask id="croissant"><rect width={440} height={440} fill="#fff" /><circle cx={320} cy={160} r={200} fill="#000" /></mask>
        </defs>
        <circle cx={220} cy={220} r={220} fill="url(#lune)" mask="url(#croissant)" />
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 700 + i * 50 + zz(i) * 40, top: 640 - i * 70 - zz(i) * 120, fontFamily: FONT, fontWeight: 800, fontSize: 60 + i * 16, color: "#fff", opacity: lune * Math.sin(zz(i) * Math.PI) }}>z</div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 76, color: "#fff", opacity: interpolate(f, [mot(/^dormir/), mot(/^dormir/) + 8], [0, 1], C) }}>
        avant de <span style={{ color: GOLD }}>dormir</span> ?
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Le compte à rebours ----------
const Decompte: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let i = DECOMPTE.filter((a) => f >= a).length - 1;
  if (i < 0) i = 0;
  const s = spring({ frame: f - DECOMPTE[i], fps, config: { damping: 8, stiffness: 220 } });
  const p = interpolate(f, [L[1], L[2]], [0, 1], C);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={700} r={300} fill="rgba(42,12,34,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth={18} />
        <circle cx={540} cy={700} r={300} fill="none" stroke={GOLD} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={`${1 - p} 1`} transform="rotate(-90 540 700)" style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700 - 190, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 340, lineHeight: 1.1, color: "#fff", transform: `scale(${s})`, textShadow: "0 0 60px rgba(233,196,106,0.7)" }}>{3 - i}</div>
    </AbsoluteFill>
  );
};

// ---------- 3. La réponse : l’arabe, la phonétique, la traduction ----------
const Reponse: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[2], fps, config: { damping: 13, stiffness: 140 } });
  const ph = interpolate(f, [L[2] + 10, L[2] + 24], [0, 1], C);
  const fr = interpolate(f, [L[2] + 18, L[2] + 32], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em", transform: `scale(${a})` }}>LA RÉPONSE</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 400, textAlign: "center", direction: "rtl", fontFamily: AR, fontSize: 86, lineHeight: 1.5, color: GOLD, opacity: a, transform: `scale(${0.85 + 0.15 * a})`,
        textShadow: "0 0 50px rgba(233,196,106,0.7)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 640, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 48, color: "rgba(255,255,255,0.85)", opacity: ph }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 820, padding: "34px 40px", borderRadius: 36, background: "rgba(42,12,34,0.88)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6)",
        textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 58, lineHeight: 1.3, color: "#fff", opacity: fr, transform: `translateY(${(1 - fr) * 40}px)` }}>{D.fr}</div>
    </AbsoluteFill>
  );
};

// ---------- 4. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 150 } });
  const b = spring({ frame: f - mot(/Bukhârî/, 3), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 380, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 160}px)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>HISN AL-MUSLIM · {D.chapitre.toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontSize: 56, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 24, transform: `scale(${0.9 + 0.1 * b})` }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 250, transform: `scale(${b}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 5. Tu avais trouvé ? La bulle de commentaire ----------
const Commentaire: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const b = spring({ frame: f - L[4], fps, config: { damping: 10, stiffness: 160 } });
  const c = spring({ frame: f - mot(/^commentaire/, 4), fps, config: { damping: 8, stiffness: 220 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 140, right: 140, top: 420, height: 380, borderRadius: 60, background: "#fff", transform: `scale(${b})`, transformOrigin: "20% 100%", boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        display: "grid", placeItems: "center" }}>
        <div style={{ display: "flex", gap: 34 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 54, height: 54, borderRadius: "50%", background: PLUM, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(f / 5 - i * 0.9)) }} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 200, top: 780, width: 0, height: 0, borderLeft: "40px solid transparent", borderRight: "40px solid transparent", borderTop: "70px solid #fff", transform: `scale(${b})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", gap: 40, transform: `scale(${c})`, opacity: c }}>
        <span style={{ padding: "20px 46px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Trouvé ✓</span>
        <span style={{ padding: "20px 46px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Pas trouvé</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans Sabab : la fiche, entière ----------
const E = "ecrans/fiche-dormir";
const ZCARTE = zone(E, /^Évocations avant de dormir$/, 0), ZTR = zone(E, /^En Ton Nom, ô Allah/), ZAPP = zone(E, /^Apprendre par cœur$/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[5] - 4} to={LIEN - 2} entree="iris" sortie="recul" focus={[{ at: L[5] + 6, px: 0.5, py: 0.45, s: 1.1 }]}>
  <Surligne at={mot(/^Sabab/, 5)} {...ZTR} fin={mot(/^apprendre/, 5) - 2} />
  <Surligne at={mot(/^apprendre/, 5)} {...ZAPP} />
  <Pastille at={mot(/^Sabab/, 5) + 4} x={W * 0.5} y={H * 0.84} gold>Avant de dormir</Pastille>
</Phone>;

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 6, L[2] + 12, L[5] - 6, L[5] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Nuit /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Decompte /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Reponse /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Source /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Commentaire /></Scene>
    <Fiche />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(dormir|Trois|deux|un…|Nom|meurs|vis|Al-Bukhârî|trouvé|commentaire|Sabab|cœur|bio)/i} grandsDes={99} />
    <Son voix="quiz.mp3" sfx={SFX} />
  </AbsoluteFill>
);
const SFX: Sfx[] = [
  ["pop", 4, 0.6], ["impact", 10, 0.6], ["ding", mot(/^dormir/), 0.5],
  ...DECOMPTE.map((a) => ["tick", a, 0.8] as Sfx), ["riser", L[1], 0.3],
  ["shimmer", L[2] - 2, 0.7],
  ["whoosh", L[3] - 4, 0.5], ["pop", mot(/Bukhârî/, 3), 0.5],
  ["whoosh", L[4] - 12, 0.4], ["message", L[4] - 6, 0.4], ["pop", mot(/^commentaire/, 4) + 16, 0.4],
  ["whoosh", L[5] - 4, 0.7], ["tick", mot(/^Sabab/, 5), 0.5], ["ding", mot(/^apprendre/, 5), 0.6],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];
export const video = { id: "quiz", component: Video, duree: T.DUREE };
