// « Quiz » : ce qu’on dit en entrant à la mosquée (Hisn al-Muslim, hm-36 ; Abû Dâwûd, Muslim, At-Tirmidhî).
// Textes religieux : public/voix/quiz.textes.json (copiés par programme depuis content/citadelle.json · hm-36).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/quiz.json";
import tx from "../../public/voix/quiz.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const DECOMPTE = [mot(/^Trois/, 1), mot(/^deux/, 1), mot(/^un/, 1)];
const LIEN = mot(/^lien/, 6);
const OUVRE = mot(/^ouvre/, 3);

// La porte de la mosquée : un arc dont les deux battants s’ouvrent (k de 0 à 1), la lumière passe.
const Porte: React.FC<{ k: number; size: number }> = ({ k, size }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ overflow: "visible" }}>
    <defs><clipPath id="arc"><path d="M10 130 V55 Q10 12 50 4 Q90 12 90 55 V130z" /></clipPath></defs>
    <path d="M10 130 V55 Q10 12 50 4 Q90 12 90 55 V130z" fill="#FFF1C4" opacity={0.25 + 0.75 * k} style={{ filter: `drop-shadow(0 0 ${30 * k}px rgba(233,196,106,0.9))` }} />
    <g clipPath="url(#arc)">
      <rect x={10} y={0} width={40} height={130} fill="#3A1236" stroke={GOLD} strokeWidth={2} transform={`translate(10 0) scale(${1 - 0.85 * k} 1) translate(-10 0)`} />
      <rect x={50} y={0} width={40} height={130} fill="#3A1236" stroke={GOLD} strokeWidth={2} transform={`translate(90 0) scale(${1 - 0.85 * k} 1) translate(-90 0)`} />
    </g>
    <path d="M10 130 V55 Q10 12 50 4 Q90 12 90 55 V130" fill="none" stroke={GOLD} strokeWidth={4} />
  </svg>
);

// ---------- 1. L’accroche : « QUIZ » et la porte de la mosquée ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const quiz = spring({ frame: f - 4, fps, config: { damping: 7, stiffness: 200 } });
  const p = spring({ frame: f - mot(/^entrant/), fps, config: { damping: 12, stiffness: 140 } });
  const m = spring({ frame: f - mot(/^mosquée/), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", transform: `scale(${quiz}) rotate(${(1 - quiz) * -12}deg)` }}>
        <span style={{ display: "inline-block", padding: "20px 60px", borderRadius: 30, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: "0.08em", boxShadow: "0 0 80px rgba(233,196,106,0.7)" }}>QUIZ</span>
      </div>
      <div style={{ position: "absolute", left: 540 - 170, top: 480, transform: `translateY(${(1 - p) * 300}px)`, opacity: p }}><Porte k={0} size={340} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 980, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 72, lineHeight: 1.2, color: "#fff", transform: `scale(${m})`, opacity: m }}>
        en entrant à la <span style={{ color: GOLD }}>mosquée</span> ?
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

// ---------- 3. Le pied droit d’abord ----------
const Pied: React.FC<{ droit?: boolean }> = ({ droit }) => (
  <svg width={150} height={230} viewBox="0 0 60 92" style={{ transform: droit ? undefined : "scaleX(-1)" }}>
    <ellipse cx={32} cy={56} rx={20} ry={32} fill="currentColor" />
    {[[18, 14, 7], [30, 9, 6], [40, 11, 5.5], [48, 17, 5], [53, 25, 4.5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="currentColor" />)}
  </svg>
);
const PiedDroit: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const g = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 120 } });
  const d = spring({ frame: f - mot(/^droit/, 2), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 180, top: 330, transform: `scale(${0.75 + 0.25 * g})`, opacity: g }}><Porte k={0.15} size={360} /></div>
      <div style={{ position: "absolute", left: 380, top: 1010, color: "rgba(255,255,255,0.3)", opacity: g }}><Pied /></div>
      <div style={{ position: "absolute", left: 560, top: 980 + (1 - d) * 120, color: GOLD, opacity: d, transform: `scale(${d})`, filter: "drop-shadow(0 0 24px rgba(233,196,106,0.8))" }}><Pied droit /></div>
      <div style={{ position: "absolute", left: 730, top: 1120, fontFamily: FONT, fontWeight: 800, fontSize: 56, color: GOLD, opacity: d }}>droit</div>
    </AbsoluteFill>
  );
};

// ---------- 4. La réponse : l’arabe entier, la phonétique, et la porte qui s’ouvre ----------
const Reponse: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 13, stiffness: 140 } });
  const ph = interpolate(f, [L[3] + 14, L[3] + 30], [0, 1], C);
  const k = interpolate(f, [OUVRE, mot(/^portes/, 3) + 16], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const p = spring({ frame: f - mot(/^Ô/, 3), fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em", transform: `scale(${a})` }}>LA RÉPONSE</span>
      </div>
      <div dir="rtl" lang="ar" style={{ position: "absolute", left: 50, right: 50, top: 250, textAlign: "center", unicodeBidi: "plaintext", fontFamily: AR, fontSize: 62, lineHeight: 1.7, color: GOLD, opacity: a,
        transform: `scale(${0.9 + 0.1 * a})`, textShadow: "0 0 40px rgba(233,196,106,0.5)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 820, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 36, lineHeight: 1.45, color: "rgba(255,255,255,0.85)", opacity: ph }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 540 - 100, top: 1110, transform: `scale(${p}) translateY(${(1 - p) * 80}px)`, opacity: p }}><Porte k={k} size={200} /></div>
    </AbsoluteFill>
  );
};

// ---------- 5. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 150 } });
  const b = spring({ frame: f - mot(/^At-Tirmidhî/, 4), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 440, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - s) * 160}px)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 32, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.1em", lineHeight: 1.4 }}>HISN AL-MUSLIM · {D.chapitre.toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontSize: 52, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 24, transform: `scale(${0.92 + 0.08 * b})` }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 300, transform: `scale(${b}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 6. Tu avais trouvé ? Deux réponses à choisir (pas de faux commentaires) ----------
const Commentaire: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const b = spring({ frame: f - L[5], fps, config: { damping: 10, stiffness: 160 } });
  const c = spring({ frame: f - mot(/^commentaire/, 5), fps, config: { damping: 8, stiffness: 220 } });
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
        <span style={{ padding: "20px 46px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Pas cette fois</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Dans Sabab : la fiche, entière ----------
const E = "ecrans/fiche-mosquee";
const ZT = zone(E, /^Invocation en entrant dans la mosquée$/, 1), ZA = zone(E, /^«\(يَبْدَأُ/), ZF = zone(E, /^\(Il commence par le pied droit\)/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[6] - 4} to={LIEN - 2} entree="gauche" sortie="recul" focus={[{ at: L[6] + 6, px: 0.5, py: 0.42, s: 1.06 }]}>
  <Surligne at={mot(/^bibliothèque/, 6)} {...ZT} fin={mot(/^Sabab/, 6) - 2} />
  <Surligne at={mot(/^Sabab/, 6)} {...ZA} />
  <Pastille at={mot(/^bibliothèque/, 6) + 4} x={W * 0.5} y={H * 0.075} gold>À la mosquée</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["pop", 4, 0.6], ["impact", 10, 0.6], ["whoosh", mot(/^entrant/) - 4, 0.4], ["ding", mot(/^mosquée/) + 4, 0.4],
  ...DECOMPTE.map((a) => ["tick", a, 0.8] as Sfx), ["riser", L[1], 0.3],
  ["whoosh", L[2] - 6, 0.5], ["tap", mot(/^droit/, 2) + 2, 0.5],
  ["shimmer", L[3] - 2, 0.6], ["shimmer", OUVRE + 4, 0.35],
  ["whoosh", L[4] - 6, 0.5], ["pop", mot(/^At-Tirmidhî/, 4) + 10, 0.5],
  ["whoosh", L[5] - 10, 0.4], ["message", L[5] - 4, 0.4], ["pop", mot(/^commentaire/, 5) + 14, 0.4],
  ["whoosh", L[6] - 6, 0.7], ["tick", mot(/^bibliothèque/, 6) + 6, 0.4], ["ding", mot(/^Sabab/, 6) + 6, 0.5],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[3] - 6, L[3] + 12, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Decompte /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><PiedDroit /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Reponse /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><Commentaire /></Scene>
    <Fiche />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(mosquée|Trois|deux|un…|droit|protection|miséricorde|portes|Abû|Muslim|trouvé|commentaire|Sabab|bio)/i} grandsDes={99} />
    <Son voix="quiz.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "quiz", component: Video, duree: T.DUREE };
