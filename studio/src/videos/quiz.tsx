// « Quiz » : ce qu’on dit quand il pleut (Hisn al-Muslim, hm-188 « Invocation lorsque la pluie tombe » et hm-189 « Évocation après la pluie »).
// Textes religieux : public/voix/quiz.textes.json (copiés par programme depuis content/citadelle.json · hm-188, hm-189).
// Ces deux fiches n’ont que la note de source du livre arabe (srcAr) : elle est affichée telle quelle, comme dans l’appli.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/quiz.json";
import tx from "../../public/voix/quiz.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D1 = tx.dua, D2 = tx.apres;
const DECOMPTE = [mot(/^Trois/, 1), mot(/^deux/, 1), mot(/^un/, 1)];
const LIEN = mot(/^lien/, 6);

// Les gouttes : des traits dorés qui tombent (toujours les mêmes, tirées au sort une fois).
const GOUTTES = Array.from({ length: 70 }, (_, i) => ({ x: random("gx" + i) * 1080, v: 14 + random("gv" + i) * 12, d: random("gd" + i) * 1920, l: 30 + random("gl" + i) * 40 }));
const Pluie: React.FC<{ force: number; haut?: number }> = ({ force, haut = 0 }) => {
  const f = useCurrentFrame();
  return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {GOUTTES.map((g, i) => { const y = (g.d + f * g.v) % 1920; return y < haut ? null : <line key={i} x1={g.x} y1={y} x2={g.x - 6} y2={y + g.l} stroke={i % 3 ? "rgba(255,255,255,0.5)" : GOLD} strokeWidth={4} strokeLinecap="round" opacity={force * (i % 3 ? 0.5 : 0.8)} />; })}
  </svg>;
};
const Nuage: React.FC<{ p: number; size: number }> = ({ p, size }) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 100 62" style={{ overflow: "visible", filter: "drop-shadow(0 0 24px rgba(233,196,106,0.55))" }}>
    <path d="M22 56 H80 C92 56 98 46 96 37 C94 27 84 22 76 25 C73 12 61 5 49 8 C38 10 31 19 30 28 C20 26 10 33 10 43 C10 51 15 56 22 56 Z" fill="rgba(42,12,34,0.92)" stroke={GOLD} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />
  </svg>
);

// ---------- 1. L’accroche : « QUIZ », le nuage se dessine, la pluie commence ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const quiz = spring({ frame: f - 3, fps, config: { damping: 7, stiffness: 200 } });
  const p = interpolate(f, [6, mot(/^pleut/) + 2], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const t = spring({ frame: f - mot(/^pleut/), fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <Pluie force={t} haut={700} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", transform: `scale(${quiz}) rotate(${(1 - quiz) * -12}deg)` }}>
        <span style={{ display: "inline-block", padding: "20px 60px", borderRadius: 30, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: "0.08em", boxShadow: "0 0 80px rgba(233,196,106,0.7)" }}>QUIZ</span>
      </div>
      <div style={{ position: "absolute", left: 540 - 230, top: 440 }}><Nuage p={p} size={460} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 980, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 82, lineHeight: 1.2, color: "#fff", opacity: t, transform: `translateY(${(1 - t) * 30}px)`, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
        quand il <span style={{ color: GOLD }}>pleut</span> ?
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
      <Pluie force={0.5} />
      <svg width={1080} height={1440} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={700} r={300} fill="rgba(42,12,34,0.88)" stroke="rgba(255,255,255,0.15)" strokeWidth={18} />
        <circle cx={540} cy={700} r={300} fill="none" stroke={GOLD} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={`${1 - p} 1`} transform="rotate(-90 540 700)" style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700 - 190, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 340, lineHeight: 1.1, color: "#fff", transform: `scale(${s})`, textShadow: "0 0 60px rgba(233,196,106,0.7)" }}>{3 - i}</div>
    </AbsoluteFill>
  );
};

// La carte d’une réponse : arabe, phonétique, traduction (copiés à l’identique).
const Carte: React.FC<{ at: number; ar: string; ph: string; fr: string; top: number; etiquette: string }> = ({ at, ar, ph, fr, top, etiquette }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120 } });
  const b = interpolate(f, [at + 12, at + 28], [0, 1], C);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 120, textAlign: "center", transform: `scale(${a})` }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em" }}>{etiquette}</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top, padding: "50px 40px", borderRadius: 48, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 3px rgba(233,196,106,0.55), 0 40px 100px rgba(0,0,0,0.5)", textAlign: "center",
        opacity: a, transform: `translateY(${(1 - a) * 80}px)` }}>
        <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 120, lineHeight: 1.6, color: GOLD, textShadow: "0 0 30px rgba(233,196,106,0.45)" }}>{ar}</div>
        <div style={{ fontFamily: FONT, fontStyle: "italic", fontSize: 44, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 14, opacity: b }}>{ph}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 54, lineHeight: 1.3, color: "#fff", marginTop: 22, opacity: b }}>{fr}</div>
      </div>
    </>
  );
};

// ---------- 3 et 4. Les deux réponses ----------
const Reponse1: React.FC = () => <AbsoluteFill><Pluie force={0.35} /><Carte at={L[2] + 2} ar={D1.ar} ph={D1.ph} fr={D1.fr} top={420} etiquette="QUAND LA PLUIE TOMBE" /></AbsoluteFill>;
const Reponse2: React.FC = () => <AbsoluteFill><Carte at={mot(/^pluie/, 3) + 4} ar={D2.ar} ph={D2.ph} fr={D2.fr} top={420} etiquette="APRÈS LA PLUIE" /></AbsoluteFill>;

// ---------- 5. La source : les notes du livre arabe, telles quelles ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 150 } });
  const b = spring({ frame: f - L[4] - 8, fps, config: { damping: 9, stiffness: 200 } });
  const Ligne: React.FC<{ titre: string; src: string }> = ({ titre, src }) => <div style={{ marginTop: 26 }}>
    <div style={{ fontFamily: FONT, fontSize: 32, color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.06em" }}>{titre.toUpperCase()}</div>
    <div dir="rtl" lang="ar" style={{ fontFamily: AR, fontSize: 66, color: "#fff", lineHeight: 1.5, unicodeBidi: "plaintext" }}>{src}</div>
  </div>;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, right: 90, top: 470, padding: "40px 50px 50px", borderRadius: 48, background: "rgba(42,12,34,0.92)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1600px) rotateY(${(1 - s) * 70}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: GOLD, fontWeight: 700, letterSpacing: "0.08em" }}>HISN AL-MUSLIM · NOTE DU LIVRE ARABE</div>
        <Ligne titre={D1.chapitre} src={D1.srcAr} />
        <Ligne titre={D2.chapitre} src={D2.srcAr} />
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 320, transform: `scale(${b}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
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
const E = "ecrans/fiche-pluie";
const ZT = zone(E, /^Invocation lorsque la pluie tombe$/, 1), ZA = englobe(zone(E, new RegExp("^" + D1.ar.slice(0, 9))), zone(E, /^Ô Allah, fais que ce soit une pluie bénéfique\.$/)), ZS = englobe(zone(E, /^Source \(note du livre arabe\)/), zone(E, new RegExp("^" + D1.srcAr.slice(0, 7))));
const Fiche: React.FC = () => <Phone ecran={E} from={L[6] - 4} to={LIEN - 2} entree="zoom" sortie="recul" focus={[{ at: L[6] + 6, px: 0.5, py: 0.5, s: 1.05 }]}>
  <Surligne at={mot(/^bibliothèque/, 6)} {...ZT} fin={mot(/^Sabab/, 6) - 2} />
  <Surligne at={mot(/^Sabab/, 6)} {...ZA} />
  <Surligne at={mot(/^Sabab/, 6) + 8} {...ZS} />
</Phone>;

const SFX: Sfx[] = [
  ["pop", 3, 0.6], ["impact", 9, 0.55], ["whoosh", mot(/^pleut/) - 18, 0.35],
  ...DECOMPTE.map((a) => ["tick", a, 0.8] as Sfx),
  ["whoosh", L[2] - 18, 0.45], ["shimmer", L[2] + 2, 0.3],
  ["whoosh", L[3] - 18, 0.4],
  ["whoosh", L[4] - 18, 0.45], ["pop", L[5] - 10, 0.4],
  ["message", L[5] - 4, 0.4], ["pop", mot(/^commentaire/, 5) + 16, 0.4],
  ["whoosh", L[6] - 18, 0.5], ["tick", mot(/^bibliothèque/, 6) + 10, 0.4], ["ding", mot(/^Sabab/, 6) + 12, 0.45],
  ["impact", LIEN - 2, 0.6], ["shimmer", LIEN + 12, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 6, L[2] + 12, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Decompte /></Scene>
    <Scene from={L[2] - 4} to={mot(/^pluie/, 3)}><Reponse1 /></Scene>
    <Scene from={mot(/^pluie/, 3) - 2} to={L[4] - 2}><Reponse2 /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><Commentaire /></Scene>
    <Fiche />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[2]} />
    <Voile />
    <SousTitres T={T} or={/^(pleut|Trois|deux|un…|Allah|bénéfique|pluie|grâce|miséricorde|Al-Bukhârî|trouvé|commentaire|Sabab|bio)/i} grandsDes={99} />
    <Son voix="quiz.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "quiz", component: Video, duree: T.DUREE };
