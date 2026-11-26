// « Quiz » : ce qu’on dit juste après la prière (Hisn al-Muslim, hm-82 ; Muslim 1/414).
// Textes religieux : public/voix/quiz.textes.json (copiés par programme depuis content/citadelle.json · hm-82).
// L’arabe, la phonétique et la traduction sont seulement COUPÉS en deux (après « trois fois »), jamais modifiés.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/quiz.json";
import tx from "../../public/voix/quiz.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const coupe = (s: string, apres: string) => { const i = s.indexOf(apres) + apres.length; return [s.slice(0, i).trim(), s.slice(i).trim()]; };
const AR2 = coupe(D.ar, "(ثَلَاثًا)،"), PH2 = coupe(D.ph, "(3x)."), FR2 = coupe(D.fr, "(3 fois).");
const DECOMPTE = [mot(/^Trois/, 1), mot(/^deux/, 1), mot(/^un/, 1)];
const LIEN = mot(/^lien/, 6);

// L’arche d’un mihrab (la prière), dessinée trait par trait.
const Arche: React.FC<{ p: number; size: number; lueur?: number }> = ({ p, size, lueur = 0 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${12 + 30 * lueur}px rgba(233,196,106,${0.4 + 0.5 * lueur}))` }}>
    <path d="M14 116 V56 C14 30 34 12 50 4 C66 12 86 30 86 56 V116" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />
    <path d="M28 116 V62 C28 44 40 30 50 24 C60 30 72 44 72 62 V116" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.max(0, p * 1.3 - 0.3)} 1`} />
    <path d="M4 116 H96" stroke={GOLD} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
  </svg>
);

// ---------- 1. L’accroche : « QUIZ » et l’arche qui se dessine ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const quiz = spring({ frame: f - 3, fps, config: { damping: 7, stiffness: 200 } });
  const p = interpolate(f, [6, mot(/^prière/) + 4], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const t = spring({ frame: f - mot(/^après/), fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", transform: `scale(${quiz}) rotate(${(1 - quiz) * -12}deg)` }}>
        <span style={{ display: "inline-block", padding: "20px 60px", borderRadius: 30, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: "0.08em", boxShadow: "0 0 80px rgba(233,196,106,0.7)" }}>QUIZ</span>
      </div>
      <div style={{ position: "absolute", left: 540 - 170, top: 420 }}><Arche p={p} size={340} lueur={t} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 900, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 78, lineHeight: 1.2, color: "#fff", opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
        juste <span style={{ color: GOLD }}>après</span> la prière ?
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

// La carte d’une partie de la réponse : arabe, phonétique, traduction.
const Carte: React.FC<{ at: number; ar: string; ph: string; fr: string; taille: number; top: number }> = ({ at, ar, ph, fr, taille, top }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120 } });
  const b = interpolate(f, [at + 12, at + 28], [0, 1], C);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, padding: "44px 40px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.55), 0 40px 100px rgba(0,0,0,0.5)", textAlign: "center",
      opacity: a, transform: `translateY(${(1 - a) * 80}px)` }}>
      <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: taille, lineHeight: 1.75, color: GOLD, unicodeBidi: "plaintext", textShadow: "0 0 30px rgba(233,196,106,0.45)" }}>{ar}</div>
      <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 40, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 14, opacity: b }}>{ph}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, lineHeight: 1.3, color: "#fff", marginTop: 20, opacity: b }}>{fr}</div>
    </div>
  );
};

// ---------- 3. D’abord : trois fois ----------
const Dabord: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const e = spring({ frame: f - L[2], fps, config: { damping: 10, stiffness: 180 } });
  const t3 = mot(/^trois/, 2);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", transform: `scale(${e})` }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em" }}>LA RÉPONSE · 1</span>
      </div>
      <Carte at={L[2] + 2} ar={AR2[0]} ph={PH2[0]} fr={FR2[0]} taille={110} top={340} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 940, display: "flex", justifyContent: "center", gap: 50 }}>
        {[0, 1, 2].map((i) => {
          const s = spring({ frame: f - t3 - i * 6, fps, config: { damping: 8, stiffness: 220 } });
          return <div key={i} style={{ width: 120, height: 120, borderRadius: "50%", background: GOLD, color: PLUM, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, transform: `scale(${s})`, boxShadow: "0 0 40px rgba(233,196,106,0.7)" }}>{i + 1}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Puis : la suite, entière ----------
const Puis: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const e = spring({ frame: f - L[3], fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", transform: `scale(${e})` }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em" }}>LA RÉPONSE · 2</span>
      </div>
      <Carte at={L[3] + 2} ar={AR2[1]} ph={PH2[1]} fr={FR2[1]} taille={84} top={280} />
    </AbsoluteFill>
  );
};

// ---------- 5. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 150 } });
  const b = spring({ frame: f - mot(/^Muslim/, 4), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 520, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1600px) rotateY(${(1 - s) * 70}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 32, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.1em", lineHeight: 1.4 }}>HISN AL-MUSLIM · {D.chapitre.toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontSize: 64, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 24, transform: `scale(${0.92 + 0.08 * b})` }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 370, transform: `scale(${b}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
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
      <div style={{ position: "absolute", left: 140, right: 140, top: 420, height: 380, borderRadius: 60, background: "#fff", transform: `scale(${b})`, transformOrigin: "20% 100%", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", display: "grid", placeItems: "center" }}>
        <div style={{ display: "flex", gap: 34 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 54, height: 54, borderRadius: "50%", background: PLUM, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(f / 5 - i * 0.9)) }} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 780, width: 0, height: 0, borderLeft: "40px solid transparent", borderRight: "40px solid transparent", borderTop: "70px solid #fff", transform: `scale(${b})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", gap: 40, transform: `scale(${c})`, opacity: c }}>
        <span style={{ padding: "20px 46px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Trouvé ✓</span>
        <span style={{ padding: "20px 46px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Pas cette fois</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Dans Sabab : la fiche, entière ----------
const E = "ecrans/fiche-salam";
const ZT = zone(E, /^Évocations après le salut final de la prière$/, 1), ZA = englobe(zone(E, /^«أَسْتَغْفِرُ/), zone(E, /^Je demande pardon à Allah \(3 fois\)/)), ZS = zone(E, /^Source : Muslim 1\/414$/);
const Fiche: React.FC = () => <Phone ecran={E} from={L[6] - 4} to={LIEN - 2} entree="gauche" sortie="recul" focus={[{ at: L[6] + 6, px: 0.5, py: 0.45, s: 1.05 }]}>
  <Surligne at={mot(/^bibliothèque/, 6)} {...ZT} fin={mot(/^Sabab/, 6) - 2} />
  <Surligne at={mot(/^Sabab/, 6)} {...ZA} />
  <Surligne at={mot(/^Sabab/, 6) + 8} {...ZS} />
</Phone>;

const SFX: Sfx[] = [
  ["pop", 3, 0.6], ["impact", 9, 0.6], ["whoosh", mot(/^après/) - 18, 0.35],
  ...DECOMPTE.map((a) => ["tick", a, 0.8] as Sfx),
  ["whoosh", L[2] - 18, 0.45], ...[0, 1, 2].map((i) => ["pop", mot(/^trois/, 2) + i * 6 + 6, 0.35] as Sfx),
  ["shimmer", L[3] - 8, 0.4],
  ["whoosh", L[4] - 18, 0.45], ["pop", mot(/^Muslim/, 4) + 14, 0.45],
  ["whoosh", L[5] - 18, 0.4], ["message", L[5] - 6, 0.4], ["pop", mot(/^commentaire/, 5) + 16, 0.4],
  ["whoosh", L[6] - 18, 0.5], ["tick", mot(/^bibliothèque/, 6) + 10, 0.4], ["ding", mot(/^Sabab/, 6) + 12, 0.45],
  ["impact", LIEN - 2, 0.6], ["shimmer", LIEN + 12, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 6, L[2] + 12, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Decompte /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Dabord /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Puis /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><Commentaire /></Scene>
    <Fiche />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(prière|Trois|deux|un…|pardon|fois|Paix|Béni|majesté|générosité|Muslim|trouvé|commentaire|Sabab|bio)/i} grandsDes={99} />
    <Son voix="quiz.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "quiz", component: Video, duree: T.DUREE };
