// « Commente ton souci » : chercher un conjoint depuis longtemps (programme.ts · azwaj, Coran Al-Furqân 25:74).
// Textes religieux et actions du parcours : public/voix/souci.textes.json, copiés par programme depuis content/ (voix/textes.ts).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { AR, C, FONT, GOLD, PLUM, H, W, minutage, motDe, SousTitres, Voile, Fond, StarP, Scene, Flash, Phone, Pastille, Surligne, Son, Logo, Check, zone, starPoints, type Sfx } from "../moteur";
import voix from "../../public/voix/souci.json";
import tx from "../../public/voix/souci.textes.json";

const T = minutage(voix);
const { L, mot } = T;
const D = tx.dua;

// ---------- 1. Le souci, posé comme un message ----------
const Souci: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 12, stiffness: 170 } });
  const txt = "Je cherche un conjoint depuis longtemps… et je commence à me décourager.";
  const n = Math.floor(interpolate(f, [6, L[1] - 20], [0, txt.length], C));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: s }}>
        <span style={{ display: "inline-block", padding: "12px 36px", borderRadius: 99, background: GOLD, color: PLUM, fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: "0.06em" }}>UN SOUCI QU’ON NOUS CONFIE</span>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 420, padding: "50px 56px", borderRadius: 48, borderBottomLeftRadius: 12, background: "rgba(255,255,255,0.96)",
        transform: `scale(${s}) translateY(${(1 - s) * 80}px)`, transformOrigin: "left bottom", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", minHeight: 320 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: 1.3, color: PLUM }}>{txt.slice(0, n)}<span style={{ opacity: f % 20 < 10 ? 1 : 0 }}>|</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Beaucoup vivent cette attente : un champ d’étoiles, chacune un sablier ----------
const PTS = Array.from({ length: 36 }, (_, i) => ({ x: 120 + (i % 6) * 168 + random("ax" + i) * 40, y: 280 + Math.floor(i / 6) * 150 + random("ay" + i) * 40, d: Math.floor(random("ad" + i) * 30) }));
const Attente: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = L[1];
  const coeur = spring({ frame: f - mot(/^normal/, 1), fps, config: { damping: 9, stiffness: 180 } });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {PTS.map((p, i) => { const s = spring({ frame: f - a - p.d, fps, config: { damping: 10, stiffness: 180 } });
          return <polygon key={i} points={starPoints(p.x, p.y, 20 * s)} fill={GOLD} opacity={0.35 + 0.5 * (0.5 + 0.5 * Math.sin(f / 10 + i))} />; })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 160, top: 1080 - 160, width: 320, height: 320, borderRadius: "50%", background: "rgba(42,12,34,0.92)", boxShadow: `0 0 0 5px ${GOLD}, 0 0 60px rgba(233,196,106,0.6)`,
        display: "grid", placeItems: "center", transform: `scale(${coeur})` }}>
        <svg width={160} height={150} viewBox="0 0 24 22"><path d="M12 21s-8-5.2-10.4-10C-0.2 6.6 3.4 1.5 7.6 2.6 9.6 3.1 11 4.6 12 6c1-1.4 2.4-2.9 4.4-3.4 4.2-1.1 7.8 4 6 8.4C20 15.8 12 21 12 21z" fill={GOLD} /></svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. Les serviteurs du Tout Miséricordieux ----------
const Serviteurs: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[2], fps, config: { damping: 13, stiffness: 140 } });
  const r = interpolate(f, [L[2], L[3]], [0, 1], C);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 18 }, (_, i) => { const a = -Math.PI / 2 + (i - 8.5) * 0.12; return <line key={i} x1={540} y1={720} x2={540 + Math.cos(a) * 900} y2={720 + Math.sin(a) * 900} stroke={GOLD} strokeWidth={6} opacity={0.16 * s * (0.6 + 0.4 * Math.sin(f / 8 + i))} />; })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 230, top: 560, width: 460, height: 300, transform: `scale(${s}) translateY(${(1 - s) * 200}px)`, opacity: s }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 228, height: 300, borderRadius: "28px 6px 6px 28px", background: "#F6EBDD", transform: "skewY(4deg)", boxShadow: "inset -18px 0 30px rgba(0,0,0,0.12)" }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: 228, height: 300, borderRadius: "6px 28px 28px 6px", background: "#FBF4EA", transform: "skewY(-4deg)", boxShadow: "inset 18px 0 30px rgba(0,0,0,0.1)" }} />
        <div style={{ position: "absolute", left: 230 - 45, top: 105 }}><StarP size={90} glow={20} /></div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 960, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.25, color: "#fff", opacity: interpolate(f, [mot(/^serviteurs/, 2) - 4, mot(/^serviteurs/, 2) + 8], [0, 1], C) }}>
        « serviteurs du <span style={{ color: GOLD }}>Tout Miséricordieux</span> »
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: GOLD, letterSpacing: "0.12em", opacity: s * (1 - r * 0) }}>DANS LE CORAN</div>
    </AbsoluteFill>
  );
};

// ---------- 4. L’invocation : le texte arabe exact, coupé en deux lignes ----------
const PARTS = D.ar.split(/ (?=وَذُرِّيَّاتِنَا|وَاجْعَلْنَا)/); // texte inchangé, seulement coupé en trois lignes
const Dua: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const seuils = [L[3], motDe(T, 3, /^descendants/), L[4]];
  const src = spring({ frame: f - L[5], fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, right: 40, top: 250, textAlign: "center", direction: "rtl" }}>
        {PARTS.map((p, i) => {
          const s = spring({ frame: f - seuils[i] + 4, fps, config: { damping: 14, stiffness: 160 } });
          const actif = f >= seuils[i] - 4 && (i === PARTS.length - 1 ? f < L[5] : f < seuils[i + 1] - 4);
          return <div key={i} style={{ fontFamily: AR, fontSize: 88, lineHeight: 1.6, color: actif ? GOLD : "#fff", opacity: 0.18 + 0.82 * s, textShadow: actif ? "0 0 40px rgba(233,196,106,0.8)" : "none" }}>{p}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 820, textAlign: "center", fontFamily: FONT, fontStyle: "italic", fontSize: 38, lineHeight: 1.45, color: "rgba(255,255,255,0.85)", opacity: interpolate(f, [L[3] + 10, L[3] + 24], [0, 1], C) }}>{D.ph}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", transform: `scale(${src})`, opacity: src }}>
        <span style={{ display: "inline-block", padding: "16px 40px", borderRadius: 99, background: GOLD, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: PLUM }}>{D.src}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Un foyer qui apaise ----------
const Foyer: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const s = spring({ frame: f - L[6], fps, config: { damping: 12, stiffness: 150 } });
  const lum = interpolate(f, [mot(/^apaise/, 6) - 6, mot(/^apaise/, 6) + 10], [0, 1], C);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 500, top: 650 - 500, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,196,106,0.45), rgba(233,196,106,0) 60%)", opacity: lum }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: "540px 700px" }}>
        <path d="M290 640 L540 420 L790 640" fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={350} y={620} width={380} height={320} rx={20} fill="rgba(42,12,34,0.95)" stroke="#fff" strokeWidth={14} />
        <rect x={495} y={790} width={90} height={150} rx={12} fill={lum > 0.5 ? GOLD : "rgba(255,255,255,0.2)"} />
        <rect x={400} y={680} width={80} height={80} rx={10} fill={GOLD} opacity={0.3 + 0.7 * lum} />
        <rect x={600} y={680} width={80} height={80} rx={10} fill={GOLD} opacity={0.3 + 0.7 * lum} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 78, color: "#fff", opacity: lum }}>un foyer <span style={{ color: GOLD }}>qui apaise</span></div>
    </AbsoluteFill>
  );
};

// ---------- 6. Dans l’appli : le besoin « Me marier » ----------
const EA = "ecrans/mariage-accueil";
const Besoin: React.FC = () => (
  <Phone ecran={EA} from={L[7] - 4} to={L[8] + 2} entree="droite" sortie="gauche">
    <Surligne at={mot(/^mariage/, 7)} {...zone(EA, /^7 TON OBJECTIF Me marier/)} />
  </Phone>
);
const EL = "ecrans/mariage-lecture";
const Lecture: React.FC = () => (
  <Phone ecran={EL} from={L[8] - 4} to={L[9] + 2} entree="bascule" sortie="traverse">
    <Surligne at={mot(/^invocation/, 8)} {...zone(EL, /^Pour un foyer qui réjouit le cœur$/)} />
    <Pastille at={mot(/^geste/, 8)} x={W * 0.5} y={H * 0.05} gold>+ un geste concret chaque jour</Pastille>
  </Phone>
);

// ---------- 7. Les gestes du parcours « Le mariage » (copiés de content/programme.ts) ----------
const Gestes: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const items: [string, number][] = [[tx.a1.texte, mot(/^qualités/, 9)], [tx.a2.texte, mot(/^famille/, 9)]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 46, color: GOLD, letterSpacing: "0.1em" }}>LE GESTE DU JOUR</div>
      {items.map(([t, at], i) => {
        const s = spring({ frame: f - at + 8, fps, config: { damping: 12, stiffness: 170 } });
        return <div key={i} style={{ position: "absolute", left: 90, right: 90, top: 380 + i * 330, padding: "40px 40px 40px 140px", borderRadius: 36, background: "#FBF4EA", fontFamily: FONT, fontWeight: 700, fontSize: 50, lineHeight: 1.3, color: PLUM,
          transform: `translateX(${(1 - s) * (i ? -900 : 900)}px)`, opacity: s, boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ position: "absolute", left: 70, top: "50%" }}><Check at={at + 6} x={0} y={0} size={70} /></div>
          {t}
        </div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- 8. Demander, agir, confier ----------
const Trois: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const mots: [string, number][] = [["Demander", mot(/^demandes/, 10)], ["Agir", mot(/^agis/, 10)], ["Confier", mot(/^confies/, 10)]];
  return (
    <AbsoluteFill>
      {mots.map(([t, at], i) => { const s = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 190 } });
        return <div key={t} style={{ position: "absolute", left: 0, right: 0, top: 330 + i * 250, textAlign: "center", transform: `scale(${s})`, opacity: s }}>
          <span style={{ display: "inline-block", padding: "26px 70px", borderRadius: 99, background: i === 2 ? GOLD : "rgba(42,12,34,0.95)", boxShadow: `0 0 0 4px ${GOLD}, 0 0 50px rgba(233,196,106,0.5)`, fontFamily: FONT, fontWeight: 800, fontSize: 84, color: i === 2 ? PLUM : "#fff" }}>{t}</span>
        </div>; })}
    </AbsoluteFill>
  );
};

const SFX: Sfx[] = [
  ["pop", 2, 0.6], ["clavier", 8, 0.35], ["message", L[1] - 24, 0.4],
  ["whoosh", L[1] - 4, 0.5], ["shimmer", L[1] + 6, 0.4], ["coeur", mot(/^normal/, 1), 0.6],
  ["whoosh", L[2] - 4, 0.5], ["riser", L[2], 0.25], ["shimmer", mot(/^serviteurs/, 2), 0.5],
  ["shimmer", L[3] - 2, 0.5], ["shimmer", L[4] - 2, 0.3], ["pop", L[5], 0.5],
  ["whoosh", L[6] - 4, 0.5], ["ding", mot(/^apaise/, 6), 0.5],
  ["whoosh", L[7] - 4, 0.6], ["ding", mot(/^mariage/, 7), 0.5],
  ["whoosh", L[8] - 4, 0.6], ["tick", mot(/^invocation/, 8), 0.4], ["pop", mot(/^geste/, 8), 0.5],
  ["whoosh", L[9] - 4, 0.5], ["ding", mot(/^qualités/, 9) - 2, 0.5], ["ding", mot(/^famille/, 9) - 2, 0.5],
  ["whoosh", L[10] - 4, 0.5], ["pop", mot(/^demandes/, 10), 0.5], ["pop", mot(/^agis/, 10), 0.5], ["shimmer", mot(/^confies/, 10), 0.5],
  ["impact", L[11], 0.7], ["shimmer", L[11] + 2, 0.6],
];

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0208" }}>
    <Fond T={T} k={[0, L[2] - 8, L[3], L[7] - 6, L[7] + 14, T.DUREE]} />
    <Scene from={0} to={L[1] - 2} zin={0}><Souci /></Scene>
    <Scene from={L[1] - 4} to={L[2] - 2}><Attente /></Scene>
    <Scene from={L[2] - 4} to={L[3] - 2}><Serviteurs /></Scene>
    <Scene from={L[3] - 4} to={L[6] - 2}><Dua /></Scene>
    <Scene from={L[6] - 4} to={L[7] - 2}><Foyer /></Scene>
    <Besoin /><Lecture />
    <Scene from={L[9] - 4} to={L[10] - 2}><Gestes /></Scene>
    <Scene from={L[10] - 4} to={L[11] - 2}><Trois /></Scene>
    <Scene from={L[11] - 4} to={T.DUREE + 10} zin={0}><Logo at={L[11]} phrase="Pour ton besoin, chaque jour" /></Scene>
    <Flash at={L[11]} />
    <Voile />
    <SousTitres T={T} or={/^(conjoint|longtemps|attente|normal|Miséricordieux|joie|yeux|modèle|Al-Furqân|apaise|mariage|geste|qualités|famille|confies|Sabab)/i} grandsDes={11} />
    <Son voix="souci.mp3" sfx={SFX} />
  </AbsoluteFill>
);
export const video = { id: "souci", component: Video, duree: T.DUREE };
