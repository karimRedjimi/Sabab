// « Commente ton souci » : les études et les examens. L’invocation de Moïse avant de parler (Coran, Tâ-Hâ 20:25-28, programme.ts · sharh)
// et le parcours « Études et examens » (PARCOURS.etudes, titre et action 1).
// Textes religieux : public/voix/souci.textes.json (copiés par programme depuis content/programme.ts).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const LIEN = mot(/^lien/, 8);

// ---------- 1. L’accroche : le souci, écrit comme une carte ----------
const Souci: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const c = spring({ frame: f - 2, fps, config: { damping: 11, stiffness: 150 } });
  const txt = "« Mon examen approche, et je n’arrive plus à me concentrer. »";
  const n = Math.round(interpolate(f, [6, L[1] - 14], [0, txt.length], C));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: c }}>
        <span style={{ display: "inline-block", padding: "14px 36px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: "0.08em" }}>UN SOUCI FRÉQUENT</span>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 420, padding: "60px 56px", borderRadius: 48, background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        transform: `translateY(${(1 - c) * 300}px) rotate(${(1 - c) * 6 - 1.5}deg)`, opacity: c, minHeight: 440 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 68, lineHeight: 1.2, color: PLUM }}>{txt.slice(0, n)}<span style={{ opacity: f % 20 < 10 ? 1 : 0, color: GOLD }}>|</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Tu n’es pas seul : une étoile, puis beaucoup d’autres autour ----------
const AUTRES = Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * Math.PI * 2 + random("a" + i) * 0.3, r: 230 + random("r" + i) * 190, s: 34 + random("s" + i) * 26 }));
const PasSeul: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[1], fps, config: { damping: 12, stiffness: 130 } });
  const seul = mot(/^seul/, 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 80, top: 680 - 80, transform: `scale(${a})` }}><StarP size={160} glow={40} /></div>
      {AUTRES.map((e, i) => {
        const s = spring({ frame: f - (mot(/^pas/, 1) + i * 1.5), fps, config: { damping: 12, stiffness: 160 } });
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(e.a) * e.r - e.s / 2, top: 680 + Math.sin(e.a) * e.r * 0.8 - e.s / 2, transform: `scale(${s})`, opacity: 0.8 }}><StarP size={e.s} fill="#F3E3B5" /></div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 74, color: "#fff", opacity: a }}>c’est <span style={{ color: GOLD }}>normal</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: GOLD, opacity: interpolate(f, [seul - 6, seul + 8], [0, 1], C) }}>tu n’es pas seul</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Moïse, avant de parler à Pharaon ----------
const Moise: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const m = spring({ frame: f - mot(/^Moïse/, 2), fps, config: { damping: 12, stiffness: 150 } });
  const p = spring({ frame: f - mot(/^Pharaon/, 2), fps, config: { damping: 12, stiffness: 150 } });
  const ondes = interpolate(f, [mot(/^parler/, 2), mot(/^Pharaon/, 2) + 10], [0, 1], C);
  const pill = (x: number, s: number, t: string, or: boolean) => (
    <div style={{ position: "absolute", left: x, top: 560, width: 380, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
      <span style={{ display: "inline-block", padding: "26px 44px", borderRadius: 40, background: or ? GOLD : "rgba(42,12,34,0.92)", color: or ? PLUM : "#fff", boxShadow: or ? "0 0 50px rgba(233,196,106,0.7)" : `0 0 0 3px ${GOLD}`, fontFamily: FONT, fontWeight: 800, fontSize: 62 }}>{t}</span>
    </div>
  );
  return (
    <AbsoluteFill>
      {pill(40, m, "Moïse", true)}
      {pill(660, p, "Pharaon", false)}
      <svg width={300} height={200} viewBox="0 0 150 100" style={{ position: "absolute", left: 390, top: 540 }}>
        {[0, 1, 2].map((i) => <path key={i} d={`M${30 + i * 30} 20 Q${50 + i * 30} 50 ${30 + i * 30} 80`} fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={Math.max(0, Math.min(1, ondes * 3 - i))} />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 52, color: "#fff", opacity: interpolate(f, [mot(/^demandé/, 2), mot(/^demandé/, 2) + 12], [0, 1], C) }}>il a d’abord demandé à Allah</div>
    </AbsoluteFill>
  );
};

// ---------- 4. L’invocation : l’arabe entier et la phonétique (la traduction est dite et sous-titrée) ----------
const Invocation: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 14, stiffness: 130 } });
  const ph = interpolate(f, [L[3] + 14, L[3] + 30], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", opacity: a }}>
        <span style={{ display: "inline-block", padding: "10px 30px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 34, letterSpacing: "0.08em" }}>{D.title.toUpperCase()}</span>
      </div>
      <div dir="rtl" lang="ar" style={{ position: "absolute", left: 60, right: 60, top: 290, textAlign: "center", fontFamily: AR, fontSize: 76, lineHeight: 1.75, color: "#fff", opacity: a,
        transform: `translateY(${(1 - a) * 40}px)`, textShadow: "0 0 30px rgba(233,196,106,0.45)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 790, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 44, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", opacity: ph }}>{D.ph}</div>
    </AbsoluteFill>
  );
};

// ---------- 5. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 560, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1600px) rotateY(${(1 - s) * 70}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.12em" }}>SOURCE</div>
        <div style={{ fontFamily: FONT, fontSize: 62, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 20 }}>{D.src}</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 50, top: 410, transform: `scale(${s}) rotate(${f}deg)` }}><StarP size={100} glow={30} /></div>
    </AbsoluteFill>
  );
};

// ---------- 6. Demander, et faire sa part ----------
const DeuxParts: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - mot(/^demandes/, 5), fps, config: { damping: 11, stiffness: 160 } });
  const b = spring({ frame: f - mot(/^part/, 5) + 4, fps, config: { damping: 11, stiffness: 160 } });
  const carte = (x: number, s: number, ico: React.ReactNode, t: string) => (
    <div style={{ position: "absolute", left: x, top: 520, width: 380, padding: "50px 0", borderRadius: 44, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.4)`,
      textAlign: "center", transform: `scale(${s}) translateY(${(1 - s) * 60}px)`, opacity: s }}>
      {ico}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: "#fff", marginTop: 18 }}>{t}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {carte(110, a, <StarP size={120} glow={30} />, "demander")}
      {carte(590, b, <svg width={120} height={120} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinejoin="round"><path d="M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z" /></svg>, "faire sa part")}
      <div style={{ position: "absolute", left: 540 - 40, top: 600, fontFamily: FONT, fontWeight: 800, fontSize: 80, color: GOLD, opacity: b }}>+</div>
    </AbsoluteFill>
  );
};

// ---------- 7. Le parcours « Études et examens » ----------
const EP = "ecrans/etudes-parcours";
const ZPT = zone(EP, /^Études et examens$/), ZPD = zone(EP, /^Accroître sa science · L’invocation avant/), ZPI = zone(EP, /^Pour réviser avec régularité/);
const Parcours: React.FC = () => <Phone ecran={EP} from={L[6] - 4} to={L[7] - 2} entree="droite" sortie="gauche" focus={[{ at: L[6] + 8, px: 0.5, py: 0.35, s: 1.06 }]}>
  <Surligne at={mot(/^parcours/, 6)} {...englobe(ZPT, ZPI)} fin={L[7] - 8} />
  <Surligne at={mot(/^Études/, 6) + 6} {...ZPD} />
</Phone>;

// ---------- 8. Chaque jour : l’invocation et le geste (le geste copié du parcours) ----------
const EA = "ecrans/etudes-journee";
const ZJ = zone(EA, /^Le matin 3 sur 5/), ZJ2 = zone(EA, /^Dans la journée 1 sur 3/), ZOB = zone(EA, /^Réussir mon examen$/), ZCARTE = zone(EA, /^Clôturer ta journée 3 questions/);
// Les cartes « Le matin » et « Dans la journée » entières : leur hauteur, et la largeur des cartes de la liste (celle de « Clôturer ta journée »).
const ZMOM = { ...englobe(ZJ, ZJ2), x: ZCARTE.x, w: ZCARTE.w };
const Journee: React.FC = () => <Phone ecran={EA} from={L[7] - 4} to={LIEN - 2} entree="bas" sortie="recul">
  <Surligne at={L[7] + 2} {...ZOB} fin={mot(/^invocation/, 7) - 2} />
  <Surligne at={mot(/^invocation/, 7)} {...ZMOM} />
  <Pastille at={mot(/^geste/, 7)} x={W * 0.5} y={H * 0.79} gold size={30}>{tx.geste.texte}</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["pop", 4, 0.5], ["clavier", 10, 0.3],
  ["whoosh", L[1] - 16, 0.45], ["shimmer", L[1] + 2, 0.35], ["pop", mot(/^pas/, 1) + 10, 0.35],
  ["whoosh", L[2] - 16, 0.45], ["pop", mot(/^Moïse/, 2) + 8, 0.4], ["pop", mot(/^Pharaon/, 2) + 12, 0.35],
  ["shimmer", L[3] - 4, 0.45],
  ["whoosh", L[4] - 16, 0.4],
  ["whoosh", L[5] - 16, 0.4], ["pop", mot(/^part/, 5) + 8, 0.4],
  ["whoosh", L[6] - 16, 0.5], ["tick", mot(/^Études/, 6) + 12, 0.35],
  ["whoosh", L[7] - 16, 0.45], ["tick", mot(/^invocation/, 7) + 10, 0.35], ["pop", mot(/^geste/, 7) + 10, 0.4],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.5],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[1] - 8, L[3] + 10, L[6] - 6, L[8] - 10, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Souci /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><PasSeul /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Moise /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Invocation /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><DeuxParts /></Scene>
    <Parcours />
    <Journee />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Une étape à la fois" /></Scene>
    <Flash at={L[3]} />
    <Voile />
    <SousTitres T={T} or={/^(examen|normal|seul|Moïse|Pharaon|Seigneur|poitrine|facilite|Coran|part|Études|geste|Sabab|bio)/i} grandsDes={99} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "souci", component: Video, duree: T.DUREE };
