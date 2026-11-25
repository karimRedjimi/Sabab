// « Quiz » : ce qu’on dit quand l’angoisse serre le cœur (Hisn al-Muslim, hm-138 ; Abû Dâwûd, Ibn Mâjah).
// Textes religieux : public/voix/quiz.textes.json (copiés par programme depuis content/citadelle.json · hm-138).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, AR, FONT, GOLD, PLUM, W, H, minutage, zone, englobe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Logo, Son, type Sfx } from "../moteur";
import voix from "../../public/voix/quiz.json";
import tx from "../../public/voix/quiz.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;
const DECOMPTE = [mot(/^Trois/, 1), mot(/^deux/, 1), mot(/^un/, 1)];
const LIEN = mot(/^lien/, 6);

// Un cœur, serré par un nœud (k = 1) qui se desserre (k = 0).
const Coeur: React.FC<{ serre: number; size: number; lueur?: number }> = ({ serre, size, lueur = 0 }) => (
  <svg width={size} height={size * 0.92} viewBox="0 0 100 92" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${10 + 30 * lueur}px rgba(233,196,106,${0.4 + 0.5 * lueur}))` }}>
    <g transform={`translate(50 46) scale(${1 - 0.14 * serre} 1) translate(-50 -46)`}>
      <path d="M50 86 C10 58 4 36 14 20 C24 4 44 8 50 24 C56 8 76 4 86 20 C96 36 90 58 50 86z" fill={lueur > 0 ? GOLD : "rgba(42,12,34,0.9)"} fillOpacity={0.2 + 0.8 * lueur} stroke={GOLD} strokeWidth={4} strokeLinejoin="round" />
    </g>
    {/* Deux flèches qui pressent le cœur des deux côtés (l’angoisse) ; elles s’écartent quand il se desserre. */}
    <g opacity={serre} stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M${-34 + 10 * serre} 46 H${-4 + 10 * serre} M${-14 + 10 * serre} 34 L${-2 + 10 * serre} 46 L${-14 + 10 * serre} 58`} />
      <path d={`M${134 - 10 * serre} 46 H${104 - 10 * serre} M${114 - 10 * serre} 34 L${102 - 10 * serre} 46 L${114 - 10 * serre} 58`} />
    </g>
  </svg>
);

// ---------- 1. L’accroche : « QUIZ » et le cœur qui se serre ----------
const Accroche: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const quiz = spring({ frame: f - 4, fps, config: { damping: 7, stiffness: 200 } });
  const c = spring({ frame: f - mot(/angoisse/), fps, config: { damping: 12, stiffness: 140 } });
  const serre = interpolate(f, [mot(/^serre/), mot(/^cœur/) + 6], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const tremble = serre * Math.sin(f * 1.7) * 4;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", transform: `scale(${quiz}) rotate(${(1 - quiz) * -12}deg)` }}>
        <span style={{ display: "inline-block", padding: "20px 60px", borderRadius: 30, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 110, letterSpacing: "0.08em", boxShadow: "0 0 80px rgba(233,196,106,0.7)" }}>QUIZ</span>
      </div>
      <div style={{ position: "absolute", left: 540 - 180 + tremble, top: 500, transform: `scale(${c})`, opacity: c }}><Coeur serre={serre} size={360} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.2, color: "#fff", opacity: c }}>
        quand l’<span style={{ color: GOLD }}>angoisse</span> serre le cœur ?
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
        <rect x={240} y={400} width={600} height={600} rx={140} fill="rgba(42,12,34,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth={18} />
        <rect x={240} y={400} width={600} height={600} rx={140} fill="none" stroke={GOLD} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray={`${1 - p} 1`} style={{ filter: "drop-shadow(0 0 16px rgba(233,196,106,0.8))" }} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700 - 190, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 340, lineHeight: 1.1, color: "#fff", transform: `scale(${s})`, textShadow: "0 0 60px rgba(233,196,106,0.7)" }}>{3 - i}</div>
    </AbsoluteFill>
  );
};

// ---------- 3. Très courte : une jauge de longueur presque vide ----------
const Courte: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[2], fps, config: { damping: 14, stiffness: 140 } });
  const g = interpolate(f, [mot(/^très/, 2), mot(/^courte/, 2) + 8], [1, 0.22], { ...C, easing: Easing.out(Easing.back(1.6)) });
  const d = spring({ frame: f - mot(/^détresse/, 2), fps, config: { damping: 10, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 140, right: 140, top: 520, height: 110, borderRadius: 55, background: "rgba(42,12,34,0.9)", boxShadow: `0 0 0 3px rgba(255,255,255,0.18)`, opacity: a }}>
        <div style={{ position: "absolute", left: 14, top: 14, bottom: 14, width: `calc(${g * 100}% - 28px)`, borderRadius: 42, background: GOLD, boxShadow: "0 0 30px rgba(233,196,106,0.7)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", opacity: a }}>très courte</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", opacity: d, transform: `scale(${d})` }}>
        <span style={{ display: "inline-block", padding: "14px 36px", borderRadius: 999, border: `3px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: "0.06em" }}>{D.chapitre.toUpperCase()}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. La réponse : l’arabe entier, la phonétique, et le cœur qui se desserre ----------
const Reponse: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = spring({ frame: f - L[3], fps, config: { damping: 13, stiffness: 140 } });
  const ph = interpolate(f, [L[3] + 14, L[3] + 30], [0, 1], C);
  const libre = interpolate(f, [mot(/^Seigneur/, 3), mot(/^rien/, 3) + 10], [1, 0], { ...C, easing: Easing.inOut(Easing.cubic) });
  const p = spring({ frame: f - L[3] - 6, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "12px 34px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: "0.06em", transform: `scale(${a})` }}>LA RÉPONSE</span>
      </div>
      <div dir="rtl" lang="ar" style={{ position: "absolute", left: 50, right: 50, top: 300, textAlign: "center", unicodeBidi: "plaintext", fontFamily: AR, fontSize: 92, lineHeight: 1.7, color: GOLD, opacity: a,
        transform: `scale(${0.9 + 0.1 * a})`, textShadow: "0 0 40px rgba(233,196,106,0.5)" }}>{D.ar}</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 560, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 46, lineHeight: 1.45, color: "rgba(255,255,255,0.85)", opacity: ph }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 540 - 140, top: 760, transform: `scale(${p})`, opacity: p }}><Coeur serre={libre} size={280} lueur={1 - libre} /></div>
    </AbsoluteFill>
  );
};

// ---------- 5. La source ----------
const Source: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[4], fps, config: { damping: 14, stiffness: 150 } });
  const b = spring({ frame: f - mot(/^Ibn/, 4), fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 520, padding: "56px 50px", borderRadius: 48, background: "rgba(42,12,34,0.9)", boxShadow: "0 0 0 3px rgba(233,196,106,0.6), 0 40px 100px rgba(0,0,0,0.5)",
        transform: `perspective(1600px) rotateX(${(1 - s) * 70}deg)`, opacity: s, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontSize: 32, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.1em", lineHeight: 1.4 }}>HISN AL-MUSLIM · {D.chapitre.toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontSize: 54, color: "#fff", fontWeight: 800, lineHeight: 1.3, marginTop: 24, transform: `scale(${0.92 + 0.08 * b})` }}>{D.src}</div>
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
      <div style={{ position: "absolute", left: 140, right: 140, top: 420, height: 380, borderRadius: 60, background: "#fff", transform: `scale(${b})`, transformOrigin: "80% 100%", boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        display: "grid", placeItems: "center" }}>
        <div style={{ display: "flex", gap: 34 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 54, height: 54, borderRadius: "50%", background: PLUM, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(f / 5 - i * 0.9)) }} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 800, top: 780, width: 0, height: 0, borderLeft: "40px solid transparent", borderRight: "40px solid transparent", borderTop: "70px solid #fff", transform: `scale(${b})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", gap: 40, transform: `scale(${c})`, opacity: c }}>
        <span style={{ padding: "20px 46px", borderRadius: 999, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Trouvé ✓</span>
        <span style={{ padding: "20px 46px", borderRadius: 999, background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 3px ${GOLD}`, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 56 }}>Pas cette fois</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Dans Sabab : la fiche, entière ----------
const E = "ecrans/fiche-inquiet";
const ZT = zone(E, /^Invocation de la grande détresse$/, 1), ZA = englobe(zone(E, /^«اللهُ/), zone(E, /^Allah, Allah est mon Seigneur/));
const Fiche: React.FC = () => <Phone ecran={E} from={L[6] - 4} to={LIEN - 2} entree="bas" sortie="recul" focus={[{ at: L[6] + 6, px: 0.5, py: 0.3, s: 1.06 }]}>
  <Surligne at={mot(/^bibliothèque/, 6)} {...ZT} fin={mot(/^Sabab/, 6) - 2} />
  <Surligne at={mot(/^Sabab/, 6)} {...ZA} />
  <Pastille at={mot(/^Sabab/, 6) + 6} x={W * 0.5} y={H * 0.6} gold>Apprends-la par cœur</Pastille>
</Phone>;

const SFX: Sfx[] = [
  ["pop", 4, 0.6], ["impact", 10, 0.6], ["whoosh", mot(/angoisse/) - 16, 0.4], ["coeur", mot(/^serre/) + 2, 0.5],
  ...DECOMPTE.map((a) => ["tick", a, 0.8] as Sfx), ["riser", L[1], 0.3],
  ["whoosh", L[2] - 16, 0.45], ["pop", mot(/^courte/, 2) + 8, 0.4], ["tick", mot(/^détresse/, 2) + 10, 0.35],
  ["shimmer", L[3] - 2, 0.45], ["shimmer", mot(/^rien/, 3) + 8, 0.3],
  ["whoosh", L[4] - 16, 0.45], ["pop", mot(/^Ibn/, 4) + 12, 0.45],
  ["whoosh", L[5] - 16, 0.4], ["message", L[5] - 4, 0.4], ["pop", mot(/^commentaire/, 5) + 14, 0.4],
  ["whoosh", L[6] - 16, 0.5], ["tick", mot(/^bibliothèque/, 6) + 8, 0.4], ["ding", mot(/^Sabab/, 6) + 10, 0.45],
  ["impact", LIEN, 0.6], ["shimmer", LIEN + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[3] - 6, L[3] + 12, L[6] - 6, L[6] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Accroche /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Decompte /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Courte /></Scene>
    <Scene from={L[3] - 4} to={L[4] - 2}><Reponse /></Scene>
    <Scene from={L[4] - 4} to={L[5] - 2}><Source /></Scene>
    <Scene from={L[5] - 4} to={L[6] - 2}><Commentaire /></Scene>
    <Fiche />
    <Scene from={LIEN - 4} to={T.DUREE + 10} zin={0}><Logo at={LIEN} phrase="Le lien est en bio" /></Scene>
    <Flash at={L[3]} />
    <Voile />
    <SousTitres T={T} or={/^(angoisse|cœur|Trois|deux|un…|courte|détresse|Seigneur|associe|Abû|Ibn|trouvé|commentaire|Sabab|bio)/i} grandsDes={99} />
    <Son voix="quiz.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "quiz", component: Video, duree: T.DUREE };
